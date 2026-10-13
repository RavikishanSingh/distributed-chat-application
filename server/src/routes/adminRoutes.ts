import { Router } from 'express';
import { getStats, getAllUsersAdmin } from '../controllers/adminController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.get('/stats', getStats);
router.get('/users', getAllUsersAdmin);

export default router;
