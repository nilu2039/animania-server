"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEpisodeTimestamp = exports.getStreamingLinks = void 0;
const fastify_1 = require("@clerk/fastify");
const axios_1 = __importDefault(require("axios"));
const zod_1 = require("zod");
const EpisodeIdSchema = zod_1.z.object({
    episodeId: zod_1.z.string(),
});
const getStreamingLinks = async (request, reply) => {
    try {
        const validEpisodeId = EpisodeIdSchema.parse(request.query);
        const { episodeId } = validEpisodeId;
        const { data } = await axios_1.default.get(`https://api.consumet.org/anime/gogoanime/watch/${episodeId}`);
        reply.status(200).send(data);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            reply.send('message: "invalid id"');
        }
        console.log(error);
        reply.status(404);
    }
};
exports.getStreamingLinks = getStreamingLinks;
const TimeStampSchema = zod_1.z.object({
    key: zod_1.z.string(),
});
const getEpisodeTimestamp = async (request, reply, prisma) => {
    try {
        const validParams = TimeStampSchema.parse(request.query);
        const { key } = validParams;
        const { userId } = (0, fastify_1.getAuth)(request);
        if (!userId) {
            return reply.status(500).send({ error: "not authenticated" });
        }
        const data = await prisma.videoTimeStamp.findFirst({
            where: {
                key,
            },
        });
        reply.status(200).send(data);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            reply.status(500).send({ message: "invalid key" });
        }
        console.log(error);
        reply.status(404);
    }
};
exports.getEpisodeTimestamp = getEpisodeTimestamp;
//# sourceMappingURL=streamingHandlers.js.map