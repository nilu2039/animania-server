"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const explore_route_1 = __importDefault(require("./routes/explore-route"));
const streaming_routes_1 = __importDefault(require("./routes/streaming-routes"));
const fastify = (0, fastify_1.default)({
    logger: true,
});
fastify.register(async (fastify) => {
    fastify.register(explore_route_1.default);
    fastify.register(streaming_routes_1.default);
}, { prefix: "/api/v1" });
const start = async () => {
    try {
        await fastify.listen({ port: 4000, host: "0.0.0.0" });
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=index.js.map