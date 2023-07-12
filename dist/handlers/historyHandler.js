"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveHistory = exports.getHistoryById = exports.getHistory = void 0;
const fastify_1 = require("@clerk/fastify");
const zod_1 = require("zod");
const GetHistorySchema = zod_1.z.object({
    page: zod_1.z.string(),
});
const GetHistoryByIdSchema = zod_1.z.object({
    id: zod_1.z.string(),
});
const getHistory = async (request, reply, prisma) => {
    try {
        const { userId } = (0, fastify_1.getAuth)(request);
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
const getHistoryById = async (request, reply, prisma) => {
    try {
        const { userId } = (0, fastify_1.getAuth)(request);
        if (!userId) {
            return reply.status(401).send({ error: "not authenticated" });
        }
        const validParams = GetHistoryByIdSchema.parse(request.query);
        const { id } = validParams;
        const history = await prisma.history.findUnique({
            where: {
                userId_animeId: {
                    userId,
                    animeId: id,
                },
            },
            include: {
                episodes: true,
            },
        });
        reply.status(200).send(history);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            reply.send({ message: "invalid params" });
        }
        reply.status(404);
    }
};
exports.getHistoryById = getHistoryById;
const SaveHistorySchema = zod_1.z.object({
    animeId: zod_1.z.string(),
    animeImg: zod_1.z.string(),
    animeTitle: zod_1.z.string(),
    episodeId: zod_1.z.string(),
    timeStamp: zod_1.z.string(),
});
const saveHistory = async (request, reply, prisma) => {
    try {
        const { userId } = (0, fastify_1.getAuth)(request);
        if (!userId) {
            return reply.status(501).send({ message: "unauthorized access" });
        }
        const validBody = SaveHistorySchema.parse(request.body);
        const { animeId, animeImg, animeTitle, episodeId, timeStamp } = validBody;
        const history = await prisma.history.findUnique({
            where: {
                userId_animeId: {
                    userId,
                    animeId: animeId,
                },
            },
        });
        if (!history) {
            try {
                await prisma.history.create({
                    data: {
                        animeId,
                        userId,
                        animeImg,
                        animeTitle,
                        episodes: {
                            create: {
                                queryKey: `${userId}*${animeId}*${episodeId}`,
                                episodeId,
                                timeStamp: parseFloat(timeStamp),
                            },
                        },
                    },
                });
                return reply.status(200);
            }
            catch (error) {
                console.log("history creation error", error);
            }
        }
        else {
            try {
                await prisma.history.update({
                    where: {
                        userId_animeId: {
                            userId,
                            animeId,
                        },
                    },
                    data: {
                        updatedAt: new Date(),
                        episodes: {
                            upsert: {
                                where: {
                                    queryKey: `${userId}*${animeId}*${episodeId}`,
                                },
                                update: {
                                    timeStamp: parseFloat(timeStamp),
                                },
                                create: {
                                    queryKey: `${userId}*${animeId}*${episodeId}`,
                                    episodeId,
                                    timeStamp: parseFloat(timeStamp),
                                },
                            },
                        },
                    },
                });
                reply.status(200);
            }
            catch (error) {
                console.log("history update error", error);
            }
        }
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return reply.status(500).send({ message: "invalid body" });
        }
    }
};
exports.saveHistory = saveHistory;
//# sourceMappingURL=historyHandler.js.map