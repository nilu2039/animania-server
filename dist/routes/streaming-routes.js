"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const streamingHandlers_1 = require("../handlers/streamingHandlers");
const streamingRoutes = async (fastify) => {
    fastify.get("/streaming-links", streamingHandlers_1.getStreamingLinks);
};
exports.default = streamingRoutes;
//# sourceMappingURL=streaming-routes.js.map