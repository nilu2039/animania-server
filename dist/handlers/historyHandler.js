"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = void 0;
const fastify_1 = require("@clerk/fastify");
const zod_1 = require("zod");
const GetHistorySchema = zod_1.z.object({
    page: zod_1.z.string(),
});
const getHistory = async (request, reply, prisma) => {
    try {
        const { userId } = (0, fastify_1.getAuth)(request);
        console.log("history user id", userId);
        if (!userId) {
            return reply.status(401).send({ error: "not authenticated" });
        }
        const validParams = GetHistorySchema.parse(request.query);
        const { page } = validParams;
        const CURRENT_PAGE = parseInt(page);
        const ITEMS_PER_PAGE = 10;
        const totalCount = await prisma.videoTimeStamp.count({ where: { userId } });
        const offset = (CURRENT_PAGE - 1) * ITEMS_PER_PAGE;
        const history = await prisma.history.findMany({
            skip: offset,
            take: ITEMS_PER_PAGE,
            where: {
                userId,
            },
            include: {
                episodes: true,
            },
            orderBy: {
                updatedAt: "desc",
            },
        });
        const hasNextPage = offset + ITEMS_PER_PAGE < totalCount;
        const result = { currentPage: CURRENT_PAGE, hasNextPage, result: history };
        reply.status(200).send(result);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            reply.send({ message: "invalid params" });
        }
        reply.status(404);
    }
};
exports.getHistory = getHistory;
//# sourceMappingURL=historyHandler.js.map