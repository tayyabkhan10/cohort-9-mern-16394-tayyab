"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const multer_1 = tslib_1.__importDefault(require("multer"));
const uploadController = tslib_1.__importStar(require("../controllers/uploadController"));
const auth_1 = tslib_1.__importDefault(require("../middleware/auth"));
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'));
        }
        cb(null, true);
    }
});
const router = (0, express_1.Router)();
router.use(auth_1.default);
router.post('/', upload.single('image'), uploadController.uploadImage);
exports.default = router;
