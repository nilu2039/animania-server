"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketHandler = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
let data;
const socketHandler = ({ socket, prisma, }) => {
    socket.on("video-time-stamp", (_data) => {
        data = _data;
    });
    socket.on("disconnect", async () => {
        const splitPem = process.env.CLERK_JWT_VERIFICATION_KEY.match(/.{1,64}/g);
        const publicKey = "-----BEGIN PUBLIC KEY-----\n" +
            splitPem.join("\n") +
            "\n-----END PUBLIC KEY-----";
        if (!(data === null || data === void 0 ? void 0 : data.sessionToken)) {
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(data.sessionToken, publicKey);
            try {
                await prisma.history.update({
                    where: {
                        userId_animeId: {
                            userId: decoded.sub,
                            animeId: data.animeId,
                        },
                    },
                    data: {
                        updatedAt: new Date(),
                        episodes: {
                            update: {
                                where: {
                                    queryKey: `${decoded.sub}*${data.animeId}*${data.episodeId}`,
                                },
                                data: {
                                    timeStamp: parseFloat(data.timeStamp),
                                },
                            },
                        },
                    },
                });
                console.log("db updated");
                return;
            }
            catch (error) {
                console.log("history_per_episode update error");
            }
            try {
                const res = await prisma.history.create({
                    data: {
                        userId: decoded.sub,
                        animeId: data.animeId,
                        animeImg: data.animeImg,
                        animeTitle: data.animeTitle,
                    },
                });
                console.log("history db created");
                try {
                    await prisma.history_per_episode.create({
                        data: {
                            queryKey: `${decoded.sub}*${data.animeId}*${data.episodeId}`,
                            episodeId: data.episodeId,
                            timeStamp: parseFloat(data.timeStamp),
                            historyId: res.id,
                        },
                    });
                    console.log("history per_episode db create done");
                }
                catch (error) {
                    console.log("history_per_episode create error");
                }
            }
            catch (error) {
                console.log("history create error");
                if (error.code === "P2002") {
                    try {
                        const res = await prisma.history.findUnique({
                            where: {
                                userId_animeId: {
                                    userId: decoded.sub,
                                    animeId: data.animeId,
                                },
                            },
                        });
                        if (res) {
                            try {
                                await prisma.history_per_episode.create({
                                    data: {
                                        queryKey: `${decoded.sub}*${data.animeId}*${data.episodeId}`,
                                        episodeId: data.episodeId,
                                        timeStamp: parseFloat(data.timeStamp),
                                        historyId: res.id,
                                    },
                                });
                                console.log("history_per_episode create done using find");
                            }
                            catch (error) {
                                console.log("history_per_episode create error");
                            }
                        }
                    }
                    catch (error) {
                        console.log("anime not found");
                    }
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    });
};
exports.socketHandler = socketHandler;
//# sourceMappingURL=socket.js.map