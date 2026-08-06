"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFolder = exports.updateFolder = exports.createFolder = exports.getFolders = void 0;
const tslib_1 = require("tslib");
const catchAsync_1 = tslib_1.__importDefault(require("../utils/catchAsync"));
const folderService = tslib_1.__importStar(require("../services/folderService"));
const AppError_1 = tslib_1.__importDefault(require("../utils/AppError"));
exports.getFolders = (0, catchAsync_1.default)(async (req, res) => {
    const folders = await folderService.getFolders(req.user.id);
    res.status(200).json({ success: true, data: folders });
});
exports.createFolder = (0, catchAsync_1.default)(async (req, res, next) => {
    const { name } = req.body;
    if (!name) {
        return next(new AppError_1.default('Folder name is required', 400));
    }
    const folder = await folderService.createFolder(req.user.id, name);
    res.status(201).json({ success: true, data: folder });
});
exports.updateFolder = (0, catchAsync_1.default)(async (req, res, next) => {
    const { name } = req.body;
    if (!name) {
        return next(new AppError_1.default('Folder name is required', 400));
    }
    const folder = await folderService.updateFolder(req.user.id, req.params.id, name);
    res.status(200).json({ success: true, data: folder });
});
exports.deleteFolder = (0, catchAsync_1.default)(async (req, res) => {
    const result = await folderService.deleteFolder(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: 'Folder deleted', data: result });
});
