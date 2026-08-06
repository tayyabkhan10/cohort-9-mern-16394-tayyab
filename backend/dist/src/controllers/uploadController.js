"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const tslib_1 = require("tslib");
const cloudinary_1 = tslib_1.__importDefault(require("../config/cloudinary"));
const catchAsync_1 = tslib_1.__importDefault(require("../utils/catchAsync"));
const AppError_1 = tslib_1.__importDefault(require("../utils/AppError"));
const logger_1 = tslib_1.__importDefault(require("../config/logger"));
exports.uploadImage = (0, catchAsync_1.default)(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError_1.default('No image file provided', 400));
    }
    const stream = cloudinary_1.default.uploader.upload_stream({ folder: 'notes-app', resource_type: 'image' }, (error, result) => {
        if (error || !result) {
            logger_1.default.error({ err: error }, 'Cloudinary upload failed');
            return next(new AppError_1.default('Image upload failed', 502));
        }
        res.status(201).json({
            success: true,
            data: { url: result.secure_url, publicId: result.public_id }
        });
    });
    stream.end(req.file.buffer);
});
