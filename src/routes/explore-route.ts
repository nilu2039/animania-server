import type { FastifyInstance } from "fastify"
import {
  getInfo,
  popularAnime,
  recentEpisodes,
  search,
  topAiring,
} from "../handlers/exploreHandlers"

const exploreRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/top-airing", topAiring)
  fastify.get("/recent-episodes", recentEpisodes)
  fastify.get("/search", search)
  fastify.get("/get-info", getInfo)
  fastify.get("/popular-anime", popularAnime)
}

export default exploreRoutes
