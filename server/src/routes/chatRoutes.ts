import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getConversations,
  getMessages,
  createDirectChat,
  createGroupChat,
  searchUsers,
  uploadAttachment,
} from '../controllers/chatController';
import { authenticateToken } from '../middleware/auth';

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const router = Router();

router.use(authenticateToken);

router.get('/conversations', getConversations);
router.get('/messages/:conversationId', getMessages);
router.post('/direct', createDirectChat);
router.post('/group', createGroupChat);
router.get('/users/search', searchUsers);
router.post('/upload', upload.single('file'), uploadAttachment);

export default router;
