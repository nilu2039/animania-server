import { getAuth } from "@clerk/fastify"
import { FastifyReply, FastifyRequest } from "fastify"
import { PrismaInstance } from "src/types/prisma-type"
import { ZodError, z } from "zod"

const GetHistorySchema = z.object({
  page: z.string(),
})

const GetHistoryByIdSchema = z.object({
  id: z.string(),
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

export const getHistoryById = async (
  request: FastifyRequest,
  reply: FastifyReply,
  prisma: PrismaInstance
) => {
  try {
    // const userId = "user_2RmMDcwptIEMR5UtwuGQdmE5v5y"
    // const userId = "user_2RmyoucUwmB4Tw16TLgvujurntG"

    const { userId } = getAuth(request)

    if (!userId) {
      return reply.status(401).send({ error: "not authenticated" })
    }

    const validParams = GetHistoryByIdSchema.parse(request.query)
    const { id } = validParams

    const history = await prisma.history.findUnique({
      where: {
        userId_animeId: {
          userId,
          animeId: id,
        },
      },
      include: {
        episodes: true,
      },
    })

    reply.status(200).send(history)
  } catch (error) {
    if (error instanceof ZodError) {
      reply.send({ message: "invalid params" })
    }
    reply.status(404)
  }
}

const SaveHistorySchema = z.object({
  animeId: z.string(),
  animeImg: z.string(),
  animeTitle: z.string(),
  episodeId: z.string(),
  timeStamp: z.string(),
})

export const saveHistory = async (
  request: FastifyRequest,
  reply: FastifyReply,
  prisma: PrismaInstance
) => {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return reply.status(501).send({ message: "unauthorized access" })
    }

    const validBody = SaveHistorySchema.parse(request.body)

    const { animeId, animeImg, animeTitle, episodeId, timeStamp } = validBody

    const history = await prisma.history.findUnique({
      where: {
        userId_animeId: {
          userId,
          animeId: animeId,
        },
      },
    })

    if (!history) {
      try {
        await prisma.history.create({
          data: {
            animeId,
            userId,
            animeImg,
            animeTitle,
            episodes: {
              create: {
                queryKey: `${userId}*${animeId}*${episodeId}`,
                episodeId,
                timeStamp: parseFloat(timeStamp),
              },
            },
          },
        })
        return reply.status(200)
      } catch (error) {
        console.log("history creation error", error)
      }
    } else {
      try {
        // await prisma.history.update({
        //   where: {
        //     userId_animeId: {
        //       userId,
        //       animeId,
        //     },
        //   },
        //   data: {
        //     updatedAt: new Date(),
        //     episodes: {
        //       update: {
        //         where: {
        //           queryKey: `${userId}*${animeId}*${episodeId}`,
        //         },
        //         data: {
        //           timeStamp: parseFloat(timeStamp),
        //         },
        //       },
        //     },
        //   },
        // })

        await prisma.history.update({
          where: {
            userId_animeId: {
              userId,
              animeId,
            },
          },
          data: {
            updatedAt: new Date(),
            episodes: {
              upsert: {
                where: {
                  queryKey: `${userId}*${animeId}*${episodeId}`,
                },
                update: {
                  timeStamp: parseFloat(timeStamp),
                },
                create: {
                  queryKey: `${userId}*${animeId}*${episodeId}`,
                  episodeId,
                  timeStamp: parseFloat(timeStamp),
                },
              },
            },
          },
        })

        reply.status(200)
      } catch (error) {
        console.log("history update error", error)
      }
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return reply.status(500).send({ message: "invalid body" })
    }
  }
}
