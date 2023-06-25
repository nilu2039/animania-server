"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exploreHandlers_1 = require("../handlers/exploreHandlers");
const exploreRoutes = async (fastify) => {
    fastify.get("/top-airing", exploreHandlers_1.topAiring);
    fastify.get("/recent-episodes", exploreHandlers_1.recentEpisodes);
    fastify.get("/search", exploreHandlers_1.search);
    fastify.get("/get-info", exploreHandlers_1.getInfo);
    fastify.get("/popular-anime", exploreHandlers_1.popularAnime);
};
exports.default = exploreRoutes;
//# sourceMappingURL=explore-route.js.map