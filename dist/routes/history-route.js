"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const historyHandler_1 = require("../handlers/historyHandler");
const historyRoutes = async (fastify, prisma) => {
    fastify.get("/get-history", (request, reply) => (0, historyHandler_1.getHistory)(request, reply, prisma));
};
exports.default = historyRoutes;
//# sourceMappingURL=history-route.js.map