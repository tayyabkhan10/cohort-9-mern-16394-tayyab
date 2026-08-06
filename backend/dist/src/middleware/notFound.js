"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const AppError_1 = tslib_1.__importDefault(require("../utils/AppError"));
const notFound = (req, res, next) => {
    next(new AppError_1.default(`Route ${req.originalUrl} not found`, 404));
};
exports.default = notFound;
