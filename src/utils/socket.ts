import { Socket } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import jwt from "jsonwebtoken"
import fs from "fs"

type SocketVideoData = {
  animeId: string
  episodeId: string
  timeStamp: string
  sessionToken: string | null
}

let data: SocketVideoData

export const socketHandler = ({
  socket,
}: {
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
}) => {
  socket.on("video-time-stamp", (_data: SocketVideoData) => {
    // socket.once("disconnect", async () => {
    //   console.log(data, "2")
    //   data = _data
    // })
    data = _data
  })
  socket.on("disconnect", () => {
    console.log("disconnected")

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
      fs.writeFile("test.json", JSON.stringify(data), "utf8", (err) => {
        if (!err) {
          console.log("written")
        }
      })

      console.log(data.animeId, data.episodeId, decoded.sub)
    } catch (error) {
      console.log(error)
    }
  })
}
