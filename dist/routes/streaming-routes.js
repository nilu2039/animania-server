"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const streamingHandlers_1 = require("../handlers/streamingHandlers");
const streamingRoutes = async (fastify, prisma) => {
    fastify.get("/streaming-links", streamingHandlers_1.getStreamingLinks);
    fastify.get("/get-timestamp", (request, reply) => (0, streamingHandlers_1.getEpisodeTimestamp)(request, reply, prisma));
};
exports.default = streamingRoutes;
//# sourceMappingURL=streaming-routes.js.map