"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInfo = exports.search = exports.recentEpisodes = exports.popularAnime = exports.topAiring = void 0;
const fastify_1 = require("@clerk/fastify");
const axios_1 = __importDefault(require("axios"));
const zod_1 = require("zod");
const pageSchema = zod_1.z.object({
    page: zod_1.z.string(),
});
const searchQuerySchema = zod_1.z.object({
    name: zod_1.z.string(),
    page: zod_1.z.string(),
});
const animeInfoSchema = zod_1.z.object({
    id: zod_1.z.string(),
});
const topAiring = async (request, reply) => {
    try {
        const validParams = pageSchema.parse(request.query);
        const { page } = validParams;
        const URL = `https://api.consumet.org/meta/anilist/trending?page=${page}`;
        const { data } = await axios_1.default.get(URL);
        const {} = (0, fastify_1.getAuth)(request);
        return reply.status(200).send(data);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            reply.send({ message: "invalid params" });
        }
        reply.status(404);
    }
};
exports.topAiring = topAiring;
const popularAnime = async (request, reply) => {
    try {
        const validParams = pageSchema.parse(request.query);
        const { page } = validParams;
        const URL = `https://api.consumet.org/meta/anilist/popular?page=${page}`;
        const { data } = await axios_1.default.get(URL);
        return reply.status(200).send(data);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            reply.send({ message: "invalid params" });
        }
        reply.status(404);
    }
};
exports.popularAnime = popularAnime;
const recentEpisodes = async (request, reply) => {
    try {
        const validParams = pageSchema.parse(request.query);
        const { page } = validParams;
        const { data } = await axios_1.default.get("https://api.consumet.org/anime/gogoanime/recent-episodes", { params: { page: parseInt(page), type: 1 } });
        reply.status(200).send(data);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            reply.send('message: "invalid params"');
        }
        reply.status(404);
    }
};
exports.recentEpisodes = recentEpisodes;
const search = async (request, reply) => {
    try {
        const validQuery = searchQuerySchema.parse(request.query);
        const { name, page } = validQuery;
        const URL = `https://api.consumet.org/meta/anilist/${name}?page=${page}`;
        const { data } = await axios_1.default.get(URL);
        reply.status(200).send(data);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            reply.send({ message: "invalid name or page" });
        }
        reply.status(404);
    }
};
exports.search = search;
const getInfo = async (request, reply) => {
    try {
        const validId = animeInfoSchema.parse(request.query);
        const { id } = validId;
        const URL = `https://api.consumet.org/meta/anilist/info/${id}?provider=gogoanime`;
        const { data } = await axios_1.default.get(URL);
        reply.status(200).send(data);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            reply.send({ message: "invalid id" });
        }
        console.log(error);
        reply.status(404);
    }
};
exports.getInfo = getInfo;
//# sourceMappingURL=exploreHandlers.js.map