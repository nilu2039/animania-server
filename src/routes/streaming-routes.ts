import type { FastifyInstance } from "fastify"
import { getStreamingLinks } from "../handlers/streamingHandlers"

const streamingRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/streaming-links", getStreamingLinks)
}

export default streamingRoutes
