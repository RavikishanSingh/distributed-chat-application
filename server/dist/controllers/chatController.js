"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAttachment = exports.searchUsers = exports.createGroupChat = exports.createDirectChat = exports.getMessages = exports.getConversations = void 0;
const store_1 = require("../services/store");
const getConversations = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const conversations = await store_1.StoreService.getUserConversations(userId);
        res.json({ conversations });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getConversations = getConversations;
const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        if (!conversationId)
            return res.status(400).json({ error: 'Conversation ID required' });
        const messages = await store_1.StoreService.getMessagesByConversation(conversationId);
        res.json({ messages });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMessages = getMessages;
const createDirectChat = async (req, res) => {
    try {
        const currentUserId = req.user?.id;
        const { targetUserId } = req.body;
        if (!currentUserId || !targetUserId) {
            return res.status(400).json({ error: 'Target user ID required' });
        }
        const conversation = await store_1.StoreService.findOrCreateDirectConversation(currentUserId, targetUserId);
        res.json({ conversation });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createDirectChat = createDirectChat;
const createGroupChat = async (req, res) => {
    try {
        const currentUserId = req.user?.id;
        const { groupName, memberIds } = req.body;
        if (!currentUserId || !groupName || !Array.isArray(memberIds)) {
            return res.status(400).json({ error: 'Group name and members required' });
        }
        const conversation = await store_1.StoreService.createGroupConversation(groupName, currentUserId, memberIds);
        res.json({ conversation });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createGroupChat = createGroupChat;
const searchUsers = async (req, res) => {
    try {
        const currentUserId = req.user?.id;
        const q = req.query.q || '';
        if (!currentUserId)
            return res.status(401).json({ error: 'Unauthorized' });
        const users = await store_1.StoreService.searchUsers(q, currentUserId);
        res.json({ users });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.searchUsers = searchUsers;
const uploadAttachment = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.uploadAttachment = uploadAttachment;
