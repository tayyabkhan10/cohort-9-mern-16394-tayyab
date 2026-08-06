"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFolder = exports.updateFolder = exports.createFolder = exports.getFolders = void 0;
const tslib_1 = require("tslib");
const db_1 = tslib_1.__importDefault(require("../config/db"));
const AppError_1 = tslib_1.__importDefault(require("../utils/AppError"));
const getFolders = async (userId) => {
    const result = await db_1.default.query(`SELECT f.*, COUNT(n.id)::int AS note_count
     FROM folders f
     LEFT JOIN notes n ON n.folder_id = f.id
     WHERE f.user_id = $1
     GROUP BY f.id
     ORDER BY f.created_at DESC`, [userId]);
    return result.rows;
};
exports.getFolders = getFolders;
const createFolder = async (userId, name) => {
    const result = await db_1.default.query('INSERT INTO folders (user_id, name) VALUES ($1, $2) RETURNING *', [userId, name]);
    return result.rows[0];
};
exports.createFolder = createFolder;
const updateFolder = async (userId, folderId, name) => {
    const result = await db_1.default.query('UPDATE folders SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *', [name, folderId, userId]);
    if (result.rows.length === 0) {
        throw new AppError_1.default('Folder not found', 404);
    }
    return result.rows[0];
};
exports.updateFolder = updateFolder;
const deleteFolder = async (userId, folderId) => {
    const result = await db_1.default.query('DELETE FROM folders WHERE id = $1 AND user_id = $2 RETURNING id', [
        folderId,
        userId
    ]);
    if (result.rows.length === 0) {
        throw new AppError_1.default('Folder not found', 404);
    }
    return result.rows[0];
};
exports.deleteFolder = deleteFolder;
