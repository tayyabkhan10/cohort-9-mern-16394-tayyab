"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNote = exports.updateNote = exports.createNote = exports.getNote = exports.getNotes = void 0;
const tslib_1 = require("tslib");
const catchAsync_1 = tslib_1.__importDefault(require("../utils/catchAsync"));
const notesService = tslib_1.__importStar(require("../services/notesService"));
const AppError_1 = tslib_1.__importDefault(require("../utils/AppError"));
const socket_1 = require("../config/socket");
exports.getNotes = (0, catchAsync_1.default)(async (req, res, next) => {
    const { search, page, limit, folder_id } = req.query;
    const result = await notesService.getNotes(req.user.id, {
        search: search,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
        folder_id: folder_id
    });
    res.status(200).json({ success: true, data: result });
});
exports.getNote = (0, catchAsync_1.default)(async (req, res, next) => {
    const note = await notesService.getNoteById(req.user.id, req.params.id);
    res.status(200).json({ success: true, data: note });
});
exports.createNote = (0, catchAsync_1.default)(async (req, res, next) => {
    const { title, content, folder_id, color } = req.body;
    if (!title) {
        return next(new AppError_1.default('Title is required', 400));
    }
    const note = await notesService.createNote(req.user.id, { title, content, folder_id });
    (0, socket_1.emitToUser)(req.user.id, 'note:created', note);
    res.status(201).json({ success: true, data: note });
});
exports.updateNote = (0, catchAsync_1.default)(async (req, res, next) => {
    const { title, content, folder_id, color } = req.body;
    if (!title) {
        return next(new AppError_1.default('Title is required', 400));
    }
    const note = await notesService.updateNote(req.user.id, req.params.id, { title, content, folder_id });
    (0, socket_1.emitToUser)(req.user.id, 'note:updated', note);
    res.status(200).json({ success: true, data: note });
});
exports.deleteNote = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await notesService.deleteNote(req.user.id, req.params.id);
    (0, socket_1.emitToUser)(req.user.id, 'note:deleted', result);
    res.status(200).json({ success: true, message: 'Note deleted successfully' });
});
