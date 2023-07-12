import type { FastifyInstance } from "fastify"

import { PrismaInstance } from "../types/prisma-type"
import {
  getHistory,
  getHistoryById,
  saveHistory,
} from "../handlers/historyHandler"

const historyRoutes = async (
  fastify: FastifyInstance,
  prisma: PrismaInstance
) => {
  fastify.get("/get-history", (request, reply) =>
    getHistory(request, reply, prisma)
  )
  fastify.get("/get-history-by-id", (request, reply) =>
    getHistoryById(request, reply, prisma)
  )
  fastify.post("/save-history", (request, reply) =>
    saveHistory(request, reply, prisma)
  )
}

export default historyRoutes
