"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNote = exports.updateNote = exports.createNote = exports.getNoteById = exports.getNotes = void 0;
const tslib_1 = require("tslib");
const db_1 = tslib_1.__importDefault(require("../config/db"));
const AppError_1 = tslib_1.__importDefault(require("../utils/AppError"));
const getNotes = async (userId, options = {}) => {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const offset = (page - 1) * limit;
    const params = [userId];
    let whereClause = 'WHERE user_id = $1';
    if (options.search) {
        params.push(`%${options.search}%`);
        whereClause += ` AND (title ILIKE $${params.length} OR content ILIKE $${params.length})`;
    }
    if (options.folder_id) {
        params.push(options.folder_id);
        whereClause += ` AND folder_id = $${params.length}`;
    }
    const countResult = await db_1.default.query(`SELECT COUNT(*) FROM notes ${whereClause}`, params);
    const total = Number.parseInt(countResult.rows[0].count, 10); // SonarQube compliant
    params.push(limit, offset);
    const dataResult = await db_1.default.query(`SELECT * FROM notes ${whereClause} ORDER BY updated_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
    return {
        notes: dataResult.rows,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    };
};
exports.getNotes = getNotes;
const getNoteById = async (userId, noteId) => {
    const result = await db_1.default.query('SELECT * FROM notes WHERE id = $1 AND user_id = $2', [noteId, userId]);
    if (result.rows.length === 0) {
        throw new AppError_1.default('Note not found', 404);
    }
    return result.rows[0];
};
exports.getNoteById = getNoteById;
const createNote = async (userId, { title, content, folder_id }) => {
    const result = await db_1.default.query('INSERT INTO notes (user_id, title, content, folder_id) VALUES ($1, $2, $3, $4) RETURNING *', [userId, title, content || null, folder_id || null]);
    return result.rows[0];
};
exports.createNote = createNote;
const updateNote = async (userId, noteId, { title, content, folder_id }) => {
    const result = await db_1.default.query(`UPDATE notes SET title = $1, content = $2, folder_id = $3, updated_at = now()
     WHERE id = $4 AND user_id = $5 RETURNING *`, [title, content || null, folder_id || null, noteId, userId]);
    if (result.rows.length === 0) {
        throw new AppError_1.default('Note not found', 404);
    }
    return result.rows[0];
};
exports.updateNote = updateNote;
const deleteNote = async (userId, noteId) => {
    const result = await db_1.default.query('DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id', [noteId, userId]);
    if (result.rows.length === 0) {
        throw new AppError_1.default('Note not found', 404);
    }
    return result.rows[0];
};
exports.deleteNote = deleteNote;
