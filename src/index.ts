import Fastify, { FastifyInstance } from "fastify"
import exploreRoutes from "./routes/explore-route"
import streamingRoutes from "./routes/streaming-routes"

const fastify = Fastify({
  logger: true,
})

fastify.register(
  async (fastify: FastifyInstance) => {
    fastify.register(exploreRoutes)
    fastify.register(streamingRoutes)
  },
  { prefix: "/api/v1" }
)

const start = async () => {
  try {
    await fastify.listen({ port: 4000, host: "0.0.0.0" })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
