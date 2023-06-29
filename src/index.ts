import Fastify, { FastifyInstance } from "fastify"
import fastifyIO from "fastify-socket.io"
import "dotenv/config"
import { clerkPlugin } from "@clerk/fastify"

import exploreRoutes from "./routes/explore-route"
import streamingRoutes from "./routes/streaming-routes"
import { socketHandler } from "./utils/socket"
import { PrismaClient } from "@prisma/client"
import historyRoutes from "./routes/history-route"

const prisma = new PrismaClient()

const fastify = Fastify({
  logger:
    {
      transport: {
        target: "pino-pretty",
      },
    } && false,
})

fastify.register(clerkPlugin)
fastify.register(fastifyIO)

fastify.register(
  async (fastify: FastifyInstance) => {
    fastify.register(exploreRoutes)
    fastify.register(() => streamingRoutes(fastify, prisma))
    fastify.register(() => historyRoutes(fastify, prisma))
  },
  { prefix: "/api/v1" }
)

const start = async () => {
  try {
    fastify.ready().then(() => {
      fastify.io.on("connect", (socket) => {
        console.log("connected", socket.id)
        socketHandler({ socket, prisma })
      })
    })

    await fastify.listen({ port: 4000, host: "0.0.0.0" })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.log(e)
    await prisma.$disconnect()
    process.exit(1)
  })
