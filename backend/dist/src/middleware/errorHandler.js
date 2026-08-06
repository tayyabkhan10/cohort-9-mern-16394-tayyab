"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const logger_1 = tslib_1.__importDefault(require("../config/logger"));
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const isOperational = err.isOperational || false;
    logger_1.default.error({ err }, err.message);
    res.status(statusCode).json({
        success: false,
        message: isOperational ? err.message : 'Something went wrong'
    });
};
exports.default = errorHandler;
