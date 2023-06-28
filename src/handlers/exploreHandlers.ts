import { getAuth } from "@clerk/fastify"
import { META } from "@consumet/extensions"
import axios from "axios"
import { FastifyReply, FastifyRequest } from "fastify"
import { ZodError, z } from "zod"

// const gogoanime = new ANIME.Gogoanime({})
const anilist = new META.Anilist()

const pageSchema = z.object({
  page: z.string(),
})

const searchQuerySchema = z.object({
  name: z.string(),
  page: z.string(),
})

const animeInfoSchema = z.object({
  id: z.string(),
})

export const topAiring = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const validParams = pageSchema.parse(request.query)
    const { page } = validParams
    const data = await anilist.fetchTrendingAnime(parseInt(page))
    const { userId } = getAuth(request)
    console.log(userId)

    return reply.status(200).send(data)
  } catch (error) {
    if (error instanceof ZodError) {
      reply.send({ message: "invalid params" })
    }
    reply.status(404)
  }
}

export const popularAnime = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const validParams = pageSchema.parse(request.query)
    const { page } = validParams
    const data = await anilist.fetchPopularAnime(parseInt(page))

    return reply.status(200).send(data)
  } catch (error) {
    if (error instanceof ZodError) {
      reply.send({ message: "invalid params" })
    }
    reply.status(404)
  }
}

export const recentEpisodes = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const validParams = pageSchema.parse(request.query)
    const { page } = validParams
    // const data = await gogoanime.fetchRecentEpisodes(parseFloat(page))
    const { data } = await axios.get(
      "https://api.consumet.org/anime/gogoanime/recent-episodes",
      { params: { page: parseInt(page), type: 1 } }
    )
    reply.status(200).send(data)
  } catch (error) {
    if (error instanceof ZodError) {
      reply.send('message: "invalid params"')
    }
    reply.status(404)
  }
}

export const search = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const validQuery = searchQuerySchema.parse(request.query)
    const { name, page } = validQuery
    // const { data } = await axios.get(
    //   `https://api.consumet.org/anime/gogoanime/${name}?page=${page}`
    // )
    const data = await anilist.search(name, parseInt(page))
    reply.status(200).send(data)
  } catch (error) {
    if (error instanceof ZodError) {
      reply.send({ message: "invalid name or page" })
    }
    reply.status(404)
  }
}

export const getInfo = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const validId = animeInfoSchema.parse(request.query)
    const { id } = validId
    // const { data } = await axios.get(
    //   `https://api.consumet.org/anime/gogoanime/info/${id}`
    // )
    const data = await anilist.fetchAnimeInfo(id)

    reply.status(200).send(data)
  } catch (error) {
    if (error instanceof ZodError) {
      reply.send({ message: "invalid id" })
    }
    console.log(error)
    reply.status(404)
  }
}
