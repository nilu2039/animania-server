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
                await prisma.videoTimeStamp.update({
                    where: {
                        key: `${decoded.sub}*${data.animeId}*${data.episodeId}`,
                    },
                    data: {
                        timeStamp: parseFloat(data.timeStamp),
                    },
                });
            }
            catch (error) {
                console.log("db update error");
            }
            try {
                await prisma.videoTimeStamp.create({
                    data: {
                        animeId: data.animeId,
                        episodeID: data.episodeId,
                        userId: decoded.sub,
                        timeStamp: parseFloat(data.timeStamp),
                        key: `${decoded.sub}*${data.animeId}*${data.episodeId}`,
                    },
                });
            }
            catch (error) {
                console.log("db error");
            }
        }
        catch (error) {
            console.log(error);
        }
    });
};
exports.socketHandler = socketHandler;
//# sourceMappingURL=socket.js.map