"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
dotenv_1.default.config();
const http_1 = tslib_1.__importDefault(require("http"));
const app_1 = tslib_1.__importDefault(require("./app"));
const logger_1 = tslib_1.__importDefault(require("./config/logger"));
const socket_1 = require("./config/socket");
const PORT = process.env.PORT || 5000;
const httpServer = http_1.default.createServer(app_1.default);
(0, socket_1.initSocket)(httpServer);
httpServer.listen(PORT, () => {
    logger_1.default.info(`Server running on port ${PORT}`);
});
