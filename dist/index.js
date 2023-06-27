"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const fastify_socket_io_1 = __importDefault(require("fastify-socket.io"));
require("dotenv/config");
const fastify_2 = require("@clerk/fastify");
const explore_route_1 = __importDefault(require("./routes/explore-route"));
const streaming_routes_1 = __importDefault(require("./routes/streaming-routes"));
const socket_1 = require("./utils/socket");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const fastify = (0, fastify_1.default)({
    logger: true,
});
fastify.register(fastify_2.clerkPlugin);
fastify.register(fastify_socket_io_1.default);
fastify.register(async (fastify) => {
    fastify.register(explore_route_1.default);
    fastify.register(() => (0, streaming_routes_1.default)(fastify, prisma));
}, { prefix: "/api/v1" });
const start = async () => {
    try {
        fastify.ready().then(() => {
            fastify.io.on("connect", (socket) => {
                console.log("connected", socket.id);
                (0, socket_1.socketHandler)({ socket, prisma });
            });
        });
        await fastify.listen({ port: 4000, host: "0.0.0.0" });
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.log(e);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=index.js.map