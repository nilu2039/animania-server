"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStreamingLinks = void 0;
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
//# sourceMappingURL=streamingHandlers.js.map