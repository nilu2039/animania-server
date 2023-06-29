import { getAuth } from "@clerk/fastify"
import { FastifyReply, FastifyRequest } from "fastify"
import { PrismaInstance } from "src/types/prisma-type"
import { ZodError, z } from "zod"

const GetHistorySchema = z.object({
  page: z.string(),
})

export const getHistory = async (
  request: FastifyRequest,
  reply: FastifyReply,
  prisma: PrismaInstance
) => {
  try {
    // const userId = "user_2RmMDcwptIEMR5UtwuGQdmE5v5y"

    const { userId } = getAuth(request)

    if (!userId) {
      return reply.status(401).send({ error: "not authenticated" })
    }

    const validParams = GetHistorySchema.parse(request.query)
    const { page } = validParams

    const CURRENT_PAGE = parseInt(page)
    const ITEMS_PER_PAGE = 10

    const totalCount = await prisma.videoTimeStamp.count({ where: { userId } })

    const offset = (CURRENT_PAGE - 1) * ITEMS_PER_PAGE

    const history = await prisma.history.findMany({
      skip: offset,
      take: ITEMS_PER_PAGE,
      where: {
        userId,
      },
      include: {
        episodes: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    const hasNextPage = offset + ITEMS_PER_PAGE < totalCount

    const result = { currentPage: CURRENT_PAGE, hasNextPage, result: history }

    reply.status(200).send(result)
  } catch (error) {
    if (error instanceof ZodError) {
      reply.send({ message: "invalid params" })
    }
    reply.status(404)
  }
}
