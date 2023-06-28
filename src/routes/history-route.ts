import type { FastifyInstance } from "fastify"

import { PrismaInstance } from "../types/prisma-type"
import { getHistory } from "../handlers/historyHandler"

const historyRoutes = async (
  fastify: FastifyInstance,
  prisma: PrismaInstance
) => {
  fastify.get("/get-history", (request, reply) =>
    getHistory(request, reply, prisma)
  )
}

export default historyRoutes
