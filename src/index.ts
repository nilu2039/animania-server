import Fastify, { FastifyInstance } from "fastify"
import fastifyIO from "fastify-socket.io"
import "dotenv/config"
import { clerkPlugin } from "@clerk/fastify"

import exploreRoutes from "./routes/explore-route"
import streamingRoutes from "./routes/streaming-routes"
import { socketHandler } from "./utils/socket"

const fastify = Fastify({
  logger: false,
})

fastify.register(clerkPlugin)
fastify.register(fastifyIO)

fastify.register(
  async (fastify: FastifyInstance) => {
    fastify.register(exploreRoutes)
    fastify.register(streamingRoutes)
  },
  { prefix: "/api/v1" }
)

const start = async () => {
  try {
    fastify.ready().then(() => {
      fastify.io.on("connect", (socket) => {
        console.log("connected", socket.id)
        socketHandler({ socket })
      })
    })

    await fastify.listen({ port: 4000, host: "0.0.0.0" })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
