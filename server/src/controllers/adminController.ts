import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { StoreService } from '../services/store';
import { pubSubService } from '../services/pubsub';

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await StoreService.getAdminStats();
    const pubSubStatus = pubSubService.getStatus();
    res.json({
      ...stats,
      pubSubStatus,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsersAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const users = await StoreService.getAllUsers();
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
