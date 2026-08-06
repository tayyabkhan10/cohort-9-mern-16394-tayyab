"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToUser = exports.getIo = exports.initSocket = void 0;
const tslib_1 = require("tslib");
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const logger_1 = tslib_1.__importDefault(require("./logger"));
let io = null;
const initSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: { origin: '*' }
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            socket.data.user = decoded;
            next();
        }
        catch (err) {
            next(new Error('Invalid or expired token'));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.data.user.id;
        socket.join(`user:${userId}`);
        logger_1.default.info(`Socket connected for user ${userId}`);
        socket.on('disconnect', () => {
            logger_1.default.info(`Socket disconnected for user ${userId}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};
exports.getIo = getIo;
const emitToUser = (userId, event, payload) => {
    if (!io)
        return;
    io.to(`user:${userId}`).emit(event, payload);
};
exports.emitToUser = emitToUser;
