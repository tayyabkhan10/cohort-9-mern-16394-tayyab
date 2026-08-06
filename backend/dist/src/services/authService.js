"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAvatar = exports.googleLogin = exports.updateAvatar = exports.updateProfile = exports.getProfile = exports.login = exports.signup = void 0;
const tslib_1 = require("tslib");
const bcryptjs_1 = tslib_1.__importDefault(require("bcryptjs"));
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const db_1 = tslib_1.__importDefault(require("../config/db"));
const AppError_1 = tslib_1.__importDefault(require("../utils/AppError"));
const google_auth_library_1 = require("google-auth-library");
const generateToken = (user) => {
    const options = {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d')
    };
    return jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, options);
};
const sanitizeUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url,
    bio: user.bio,
    created_at: user.created_at
});
const signup = async ({ name, email, password }) => {
    const existing = await db_1.default.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
        throw new AppError_1.default('Email already registered', 409);
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const result = await db_1.default.query('INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, avatar_url, bio, created_at', [name, email, hashedPassword]);
    const user = result.rows[0];
    const token = generateToken(user);
    return { user: sanitizeUser(user), token };
};
exports.signup = signup;
const login = async ({ email, password }) => {
    const result = await db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
        throw new AppError_1.default('Invalid email or password', 401);
    }
    const isMatch = await bcryptjs_1.default.compare(password, user.password_hash);
    if (!isMatch) {
        throw new AppError_1.default('Invalid email or password', 401);
    }
    const token = generateToken(user);
    return { user: sanitizeUser(user), token };
};
exports.login = login;
const getProfile = async (userId) => {
    const result = await db_1.default.query('SELECT id, name, email, avatar_url, bio, created_at FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];
    if (!user) {
        throw new AppError_1.default('User not found', 404);
    }
    return user;
};
exports.getProfile = getProfile;
const updateProfile = async (userId, data) => {
    const fields = [];
    const values = [];
    let idx = 1;
    if (data.name !== undefined) {
        fields.push(`name = $${idx++}`);
        values.push(data.name);
    }
    if (data.bio !== undefined) {
        fields.push(`bio = $${idx++}`);
        values.push(data.bio);
    }
    if (fields.length === 0) {
        throw new AppError_1.default('Nothing to update', 400);
    }
    values.push(userId);
    const result = await db_1.default.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, avatar_url, bio, created_at`, values);
    return sanitizeUser(result.rows[0]);
};
exports.updateProfile = updateProfile;
const updateAvatar = async (userId, avatarUrl) => {
    const result = await db_1.default.query('UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, name, email, avatar_url, bio, created_at', [avatarUrl, userId]);
    return sanitizeUser(result.rows[0]);
};
exports.updateAvatar = updateAvatar;
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const googleLogin = async (idToken) => {
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
        throw new AppError_1.default('Invalid Google token', 401);
    }
    const { email, name, sub: googleId, picture } = payload;
    let result = await db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = result.rows[0];
    if (!user) {
        const insertResult = await db_1.default.query('INSERT INTO users (name, email, google_id, avatar_url) VALUES ($1, $2, $3, $4) RETURNING id, name, email, avatar_url, bio, created_at', [name, email, googleId, picture]);
        user = insertResult.rows[0];
    }
    else if (!user.google_id) {
        await db_1.default.query('UPDATE users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2) WHERE id = $3', [googleId, picture, user.id]);
        result = await db_1.default.query('SELECT * FROM users WHERE id = $1', [user.id]);
        user = result.rows[0];
    }
    const token = generateToken(user);
    return { user: sanitizeUser(user), token };
};
exports.googleLogin = googleLogin;
const removeAvatar = async (userId) => {
    const result = await db_1.default.query('UPDATE users SET avatar_url = NULL WHERE id = $1 RETURNING id, name, email, avatar_url, bio, created_at', [userId]);
    return sanitizeUser(result.rows[0]);
};
exports.removeAvatar = removeAvatar;
