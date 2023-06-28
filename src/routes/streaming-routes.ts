import type { FastifyInstance } from "fastify"
import {
  getEpisodeTimestamp,
  getStreamingLinks,
} from "../handlers/streamingHandlers"
import { PrismaInstance } from "../types/prisma-type"

const streamingRoutes = async (
  fastify: FastifyInstance,
  prisma: PrismaInstance
) => {
  fastify.get("/streaming-links", getStreamingLinks)
  fastify.get("/get-timestamp", (request, reply) =>
    getEpisodeTimestamp(request, reply, prisma)
  )
}

export default streamingRoutes
