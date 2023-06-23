import axios from "axios"
import { FastifyRequest, FastifyReply } from "fastify"
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
