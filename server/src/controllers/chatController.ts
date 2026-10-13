import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { StoreService } from '../services/store';

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const conversations = await StoreService.getUserConversations(userId);
    res.json({ conversations });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    if (!conversationId) return res.status(400).json({ error: 'Conversation ID required' });

    const messages = await StoreService.getMessagesByConversation(conversationId);
    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createDirectChat = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const { targetUserId } = req.body;
    if (!currentUserId || !targetUserId) {
      return res.status(400).json({ error: 'Target user ID required' });
    }

    const conversation = await StoreService.findOrCreateDirectConversation(currentUserId, targetUserId);
    res.json({ conversation });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createGroupChat = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const { groupName, memberIds } = req.body;
    if (!currentUserId || !groupName || !Array.isArray(memberIds)) {
      return res.status(400).json({ error: 'Group name and members required' });
    }

    const conversation = await StoreService.createGroupConversation(groupName, currentUserId, memberIds);
    res.json({ conversation });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const q = (req.query.q as string) || '';
    if (!currentUserId) return res.status(401).json({ error: 'Unauthorized' });

    const users = await StoreService.searchUsers(q, currentUserId);
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadAttachment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      url: fileUrl,
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
