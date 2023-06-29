import jwt from "jsonwebtoken"
import { Socket } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import { PrismaInstance } from "../types/prisma-type"

type SocketVideoHistoryData = {
  animeId: string
  episodeId: string
  timeStamp: string
  animeImg: string
  animeTitle: string
  sessionToken: string | null
}

let data: SocketVideoHistoryData

export const socketHandler = ({
  socket,
  prisma,
}: {
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
  prisma: PrismaInstance
}) => {
  socket.on("video-time-stamp", (_data: SocketVideoHistoryData) => {
    data = _data
  })
  socket.on("disconnect", async () => {
    // console.log("disconnected")
    const splitPem = process.env.CLERK_JWT_VERIFICATION_KEY!.match(/.{1,64}/g)
    const publicKey =
      "-----BEGIN PUBLIC KEY-----\n" +
      splitPem!.join("\n") +
      "\n-----END PUBLIC KEY-----"

    if (!data?.sessionToken) {
      return
    }

    try {
      const decoded = jwt.verify(data.sessionToken, publicKey)

      try {
        await prisma.history.update({
          where: {
            userId_animeId: {
              userId: decoded.sub as string,
              animeId: data.animeId,
            },
          },
          data: {
            updatedAt: new Date(),
            episodes: {
              update: {
                where: {
                  queryKey: `${decoded.sub}*${data.animeId}*${data.episodeId}`,
                },
                data: {
                  timeStamp: parseFloat(data.timeStamp),
                },
              },
            },
          },
        })
      } catch (error) {
        console.log("history_per_episode update error")
      }

      try {
        const res = await prisma.history.create({
          data: {
            userId: decoded.sub as string,
            animeId: data.animeId,
            animeImg: data.animeImg,
            animeTitle: data.animeTitle,
          },
        })
        try {
          await prisma.history_per_episode.create({
            data: {
              queryKey: `${decoded.sub}*${data.animeId}*${data.episodeId}`,
              episodeId: data.episodeId,
              timeStamp: parseFloat(data.timeStamp),
              historyId: res.id,
            },
          })
          // console.log("db create done")
        } catch (error) {
          console.log("history_per_episode create error")
        }
        // console.log("db create done")
      } catch (error) {
        console.log("history create error", error)
        if (error.code === "P2002") {
          try {
            const res = await prisma.history.findFirst({
              where: { animeId: data.animeId },
            })

            if (res) {
              try {
                await prisma.history_per_episode.create({
                  data: {
                    queryKey: `${decoded.sub}*${data.animeId}*${data.episodeId}`,
                    episodeId: data.episodeId,
                    timeStamp: parseFloat(data.timeStamp),
                    historyId: res.id,
                  },
                })
                // console.log("db create done")
              } catch (error) {
                console.log("history_per_episode create error")
              }
            }
          } catch (error) {
            console.log("anime not found")
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
  })
}
