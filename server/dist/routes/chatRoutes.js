"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const chatController_1 = require("../controllers/chatController");
const auth_1 = require("../middleware/auth");
const uploadsDir = path_1.default.join(process.cwd(), 'public', 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage });
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/conversations', chatController_1.getConversations);
router.get('/messages/:conversationId', chatController_1.getMessages);
router.post('/direct', chatController_1.createDirectChat);
router.post('/group', chatController_1.createGroupChat);
router.get('/users/search', chatController_1.searchUsers);
router.post('/upload', upload.single('file'), chatController_1.uploadAttachment);
exports.default = router;
