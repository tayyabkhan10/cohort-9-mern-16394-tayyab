"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAvatar = exports.uploadAvatar = exports.updateProfile = exports.googleLogin = exports.getMe = exports.login = exports.signup = void 0;
const tslib_1 = require("tslib");
const catchAsync_1 = tslib_1.__importDefault(require("../utils/catchAsync"));
const authService = tslib_1.__importStar(require("../services/authService"));
const AppError_1 = tslib_1.__importDefault(require("../utils/AppError"));
const cloudinary_1 = tslib_1.__importDefault(require("../config/cloudinary"));
const streamifier = require('streamifier');
exports.signup = (0, catchAsync_1.default)(async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return next(new AppError_1.default('Name, email and password are required', 400));
    }
    const { user, token } = await authService.signup({ name, email, password });
    res.status(201).json({ success: true, data: { user, token } });
});
exports.login = (0, catchAsync_1.default)(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError_1.default('Email and password are required', 400));
    }
    const { user, token } = await authService.login({ email, password });
    res.status(200).json({ success: true, data: { user, token } });
});
exports.getMe = (0, catchAsync_1.default)(async (req, res, next) => {
    const user = await authService.getProfile(req.user.id);
    res.status(200).json({ success: true, data: user });
});
exports.googleLogin = (0, catchAsync_1.default)(async (req, res, next) => {
    const { idToken } = req.body;
    if (!idToken) {
        return next(new AppError_1.default('Google idToken is required', 400));
    }
    const { user, token } = await authService.googleLogin(idToken);
    res.status(200).json({ success: true, data: { user, token } });
});
exports.updateProfile = (0, catchAsync_1.default)(async (req, res, next) => {
    const { name, bio } = req.body;
    const user = await authService.updateProfile(req.user.id, { name, bio });
    res.status(200).json({ success: true, data: user });
});
exports.uploadAvatar = (0, catchAsync_1.default)(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError_1.default('No image file provided', 400));
    }
    const uploadStream = () => new Promise((resolve, reject) => {
        const stream = cloudinary_1.default.uploader.upload_stream({ folder: 'marginalia/avatars', transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }] }, (error, result) => {
            if (error || !result)
                return reject(error);
            resolve(result.secure_url);
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
    const avatarUrl = await uploadStream();
    const user = await authService.updateAvatar(req.user.id, avatarUrl);
    res.status(200).json({ success: true, data: user });
});
exports.removeAvatar = (0, catchAsync_1.default)(async (req, res, next) => {
    const user = await authService.removeAvatar(req.user.id);
    res.status(200).json({ success: true, data: user });
});
