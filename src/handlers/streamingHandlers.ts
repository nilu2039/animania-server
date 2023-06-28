import { getAuth } from "@clerk/fastify"
import axios from "axios"
import { FastifyRequest, FastifyReply } from "fastify"
import { PrismaInstance } from "../types/prisma-type"
import { z, ZodError } from "zod"

const EpisodeIdSchema = z.object({
  episodeId: z.string(),
})

export const getStreamingLinks = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const validEpisodeId = EpisodeIdSchema.parse(request.query)
    const { episodeId } = validEpisodeId
    const { data } = await axios.get(
      `https://api.consumet.org/anime/gogoanime/watch/${episodeId}`
    )
    reply.status(200).send(data)
  } catch (error) {
    if (error instanceof ZodError) {
      reply.send('message: "invalid id"')
    }
    console.log(error)
    reply.status(404)
  }
}

const TimeStampSchema = z.object({
  key: z.string(),
})

export const getEpisodeTimestamp = async (
  request: FastifyRequest,
  reply: FastifyReply,
  prisma: PrismaInstance
) => {
  try {
    const validParams = TimeStampSchema.parse(request.query)
    const { key } = validParams

    const { userId } = getAuth(request)
    if (!userId) {
      return reply.status(401).send({ error: "not authenticated" })
    }
    const data = await prisma.videoTimeStamp.findFirst({
      where: {
        key,
      },
    })
    console.log(data)

    reply.status(200).send(data)
  } catch (error) {
    if (error instanceof ZodError) {
      reply.status(100).send({ message: "invalid key" })
    }
    console.log(error)
    reply.status(404)
  }
}
