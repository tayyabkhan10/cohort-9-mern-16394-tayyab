"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("./types/express");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = tslib_1.__importDefault(require("express"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const helmet_1 = tslib_1.__importDefault(require("helmet"));
const pino_http_1 = tslib_1.__importDefault(require("pino-http"));
const logger_1 = tslib_1.__importDefault(require("./config/logger"));
const authRoutes_1 = tslib_1.__importDefault(require("./routes/authRoutes"));
const notesRoutes_1 = tslib_1.__importDefault(require("./routes/notesRoutes"));
const uploadRoutes_1 = tslib_1.__importDefault(require("./routes/uploadRoutes"));
const folderRoutes_1 = tslib_1.__importDefault(require("./routes/folderRoutes"));
const notFound_1 = tslib_1.__importDefault(require("./middleware/notFound"));
const errorHandler_1 = tslib_1.__importDefault(require("./middleware/errorHandler"));
const app = (0, express_1.default)();
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
app.use((0, pino_http_1.default)({ logger: logger_1.default }));
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is running' });
});
app.use('/api/auth', authRoutes_1.default);
app.use('/api/notes', notesRoutes_1.default);
app.use('/api/uploads', uploadRoutes_1.default);
app.use('/api/folders', folderRoutes_1.default);
app.use(notFound_1.default);
app.use(errorHandler_1.default);
exports.default = app;
