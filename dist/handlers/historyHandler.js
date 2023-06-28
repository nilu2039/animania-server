"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = void 0;
const zod_1 = require("zod");
const GetHistorySchema = zod_1.z.object({
    page: zod_1.z.string(),
});
const getHistory = async (request, reply, prisma) => {
    try {
        const userId = "user_2RmMDcwptIEMR5UtwuGQdmE5v5y";
        const validParams = GetHistorySchema.parse(request.query);
        const { page } = validParams;
        const CURRENT_PAGE = parseInt(page);
        const ITEMS_PER_PAGE = 5;
        const totalCount = await prisma.videoTimeStamp.count({ where: { userId } });
        const offset = (CURRENT_PAGE - 1) * ITEMS_PER_PAGE;
        const history = await prisma.videoTimeStamp.findMany({
            skip: offset,
            take: ITEMS_PER_PAGE,
            where: {
                userId,
            },
            orderBy: {
                updatedAt: "desc",
            },
        });
        const hasNextPage = offset + ITEMS_PER_PAGE < totalCount;
        const result = { currentPAge: CURRENT_PAGE, hasNextPage, result: history };
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