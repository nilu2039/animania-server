import jwt from "jsonwebtoken"
import { Socket } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import { PrismaInstance } from "../types/prisma-type"

type SocketVideoData = {
  animeId: string
  episodeId: string
  timeStamp: string
  sessionToken: string | null
}

let data: SocketVideoData

export const socketHandler = ({
  socket,
  prisma,
}: {
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
  prisma: PrismaInstance
}) => {
  socket.on("video-time-stamp", (_data: SocketVideoData) => {
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
        await prisma.videoTimeStamp.update({
          where: {
            key: `${decoded.sub}*${data.animeId}*${data.episodeId}`,
          },
          data: {
            timeStamp: parseFloat(data.timeStamp),
          },
        })
        // console.log("db updated")
      } catch (error) {
        console.log("db update error")
      }

      try {
        await prisma.videoTimeStamp.create({
          data: {
            animeId: data.animeId,
            episodeId: data.episodeId,
            userId: decoded.sub as string,
            timeStamp: parseFloat(data.timeStamp),
            key: `${decoded.sub}*${data.animeId}*${data.episodeId}`,
          },
        })
        // console.log("db create done")
      } catch (error) {
        console.log("db error")
      }
    } catch (error) {
      console.log(error)
    }
  })
}
