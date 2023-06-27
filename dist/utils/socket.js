"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketHandler = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
let data;
const socketHandler = ({ socket, }) => {
    socket.on("video-time-stamp", (_data) => {
        data = _data;
    });
    socket.on("disconnect", () => {
        console.log("disconnected");
        const splitPem = process.env.CLERK_JWT_VERIFICATION_KEY.match(/.{1,64}/g);
        const publicKey = "-----BEGIN PUBLIC KEY-----\n" +
            splitPem.join("\n") +
            "\n-----END PUBLIC KEY-----";
        if (!(data === null || data === void 0 ? void 0 : data.sessionToken)) {
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(data.sessionToken, publicKey);
            fs_1.default.writeFile("test.json", JSON.stringify(data), "utf8", (err) => {
                if (!err) {
                    console.log("written");
                }
            });
            console.log(data.animeId, data.episodeId, decoded.sub);
        }
        catch (error) {
            console.log(error);
        }
    });
};
exports.socketHandler = socketHandler;
//# sourceMappingURL=socket.js.map