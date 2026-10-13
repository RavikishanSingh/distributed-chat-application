"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreService = exports.isDbConnected = exports.seedDefaults = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const Conversation_1 = require("../models/Conversation");
const Message_1 = require("../models/Message");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// In-memory collections as zero-config fallback
const memoryUsers = new Map();
const memoryConversations = new Map();
const memoryMessages = [];
// Seed default admin and initial demo users into memory and MongoDB
const seedDefaults = async () => {
    try {
        const adminHash = await bcryptjs_1.default.hash('admin123', 10);
        const defaultAdmin = {
            _id: '650000000000000000000001',
            name: 'Ravikishan Singh (Admin)',
            username: 'ravikishan',
            email: 'admin@chat.com',
            password: adminHash,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            bio: 'System Administrator & Distributed Systems Dev',
            status: 'online',
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const userHash = await bcryptjs_1.default.hash('user123', 10);
        const defaultUser2 = {
            _id: '650000000000000000000002',
            name: 'Sarah Connor',
            username: 'sarah',
            email: 'sarah@chat.com',
            password: userHash,
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            bio: 'Engineering Lead @ Cyberdyne',
            status: 'online',
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const defaultUser3 = {
            _id: '650000000000000000000003',
            name: 'Alex Rivera',
            username: 'arivera',
            email: 'alex@chat.com',
            password: userHash,
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            bio: 'Fullstack Dev & Distributed Systems Fan',
            status: 'offline',
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        memoryUsers.set(defaultAdmin._id, defaultAdmin);
        memoryUsers.set(defaultUser2._id, defaultUser2);
        memoryUsers.set(defaultUser3._id, defaultUser3);
        // Seed default demo group conversation
        const demoGroup = {
            _id: '650000000000000000000010',
            isGroup: true,
            groupName: 'Distributed Core Team 🚀',
            groupAdmin: defaultAdmin._id,
            groupAvatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
            participants: [defaultAdmin._id, defaultUser2._id, defaultUser3._id],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        memoryConversations.set(demoGroup._id, demoGroup);
        memoryMessages.length = 0;
        memoryMessages.push({
            _id: '650000000000000000000100',
            conversationId: demoGroup._id,
            sender: defaultAdmin._id,
            text: 'Welcome everyone to the Distributed Real-Time Chat Platform!',
            attachments: [],
            reactions: [{ emoji: '🚀', userId: defaultUser2._id }],
            readBy: [defaultAdmin._id, defaultUser2._id],
            createdAt: new Date(Date.now() - 3600000),
        });
        // Also seed MongoDB if connected
        if (mongoose_1.default.connection.readyState === 1) {
            const existingAdmin = await User_1.User.findOne({ email: 'admin@chat.com' });
            if (!existingAdmin) {
                await User_1.User.create(defaultAdmin);
                await User_1.User.create(defaultUser2);
                await User_1.User.create(defaultUser3);
                const conv = await Conversation_1.Conversation.create(demoGroup);
                await Message_1.Message.create({
                    _id: '650000000000000000000100',
                    conversationId: conv._id,
                    sender: defaultAdmin._id,
                    text: 'Welcome everyone to the Distributed Real-Time Chat Platform!',
                    attachments: [],
                    reactions: [{ emoji: '🚀', userId: defaultUser2._id }],
                    readBy: [defaultAdmin._id, defaultUser2._id],
                });
                await Conversation_1.Conversation.findByIdAndUpdate(conv._id, { lastMessage: '650000000000000000000100' });
                console.log('[MongoDB] Seeded default demo users and conversations');
            }
        }
    }
    catch (err) {
        console.error('[StoreService] Seeding error:', err.message);
    }
};
exports.seedDefaults = seedDefaults;
(0, exports.seedDefaults)();
const isDbConnected = () => {
    return mongoose_1.default.connection.readyState === 1;
};
exports.isDbConnected = isDbConnected;
exports.StoreService = {
    // USER METHODS
    async findUserByEmail(email) {
        if ((0, exports.isDbConnected)()) {
            return await User_1.User.findOne({ email: email.toLowerCase() });
        }
        return Array.from(memoryUsers.values()).find((u) => u.email === email.toLowerCase()) || null;
    },
    async findUserByUsername(username) {
        if ((0, exports.isDbConnected)()) {
            return await User_1.User.findOne({ username: username.toLowerCase() });
        }
        return Array.from(memoryUsers.values()).find((u) => u.username === username.toLowerCase()) || null;
    },
    async findUserById(id) {
        if ((0, exports.isDbConnected)()) {
            return await User_1.User.findById(id).select('-password');
        }
        const user = memoryUsers.get(id?.toString());
        if (!user)
            return null;
        const { password, ...rest } = user;
        return rest;
    },
    async createUser(userData) {
        if ((0, exports.isDbConnected)()) {
            const newUser = new User_1.User(userData);
            return await newUser.save();
        }
        const id = new mongoose_1.default.Types.ObjectId().toString();
        const newUser = { _id: id, ...userData, status: 'offline', role: 'user', createdAt: new Date(), updatedAt: new Date() };
        memoryUsers.set(id, newUser);
        return newUser;
    },
    async updateUser(id, updateData) {
        if ((0, exports.isDbConnected)()) {
            return await User_1.User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        }
        const user = memoryUsers.get(id?.toString());
        if (!user)
            return null;
        const updated = { ...user, ...updateData, updatedAt: new Date() };
        memoryUsers.set(id?.toString(), updated);
        const { password, ...rest } = updated;
        return rest;
    },
    async searchUsers(query, currentUserId) {
        if ((0, exports.isDbConnected)()) {
            return await User_1.User.find({
                _id: { $ne: currentUserId },
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { username: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } },
                ],
            }).select('-password');
        }
        const q = query.toLowerCase();
        return Array.from(memoryUsers.values())
            .filter((u) => u._id.toString() !== currentUserId.toString() &&
            (u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)))
            .map(({ password, ...rest }) => rest);
    },
    async getAllUsers() {
        if ((0, exports.isDbConnected)()) {
            return await User_1.User.find().select('-password');
        }
        return Array.from(memoryUsers.values()).map(({ password, ...rest }) => rest);
    },
    // CONVERSATION METHODS
    async getUserConversations(userId) {
        if ((0, exports.isDbConnected)()) {
            return await Conversation_1.Conversation.find({ participants: userId })
                .populate('participants', '-password')
                .populate({
                path: 'lastMessage',
                populate: { path: 'sender', select: 'name username avatar' },
            })
                .sort({ updatedAt: -1 });
        }
        const convs = Array.from(memoryConversations.values()).filter((c) => c.participants.map((p) => p.toString()).includes(userId.toString()));
        return convs.map((c) => {
            const populatedParticipants = c.participants
                .map((pId) => {
                const u = memoryUsers.get(pId.toString());
                if (!u)
                    return null;
                const { password, ...rest } = u;
                return rest;
            })
                .filter(Boolean);
            const msgs = memoryMessages.filter((m) => m.conversationId.toString() === c._id.toString());
            const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
            return {
                ...c,
                participants: populatedParticipants,
                lastMessage: lastMsg,
            };
        });
    },
    async findOrCreateDirectConversation(userId1, userId2) {
        if ((0, exports.isDbConnected)()) {
            let conv = await Conversation_1.Conversation.findOne({
                isGroup: false,
                participants: { $all: [userId1, userId2] },
            });
            if (!conv) {
                conv = new Conversation_1.Conversation({
                    isGroup: false,
                    participants: [userId1, userId2],
                });
                await conv.save();
            }
            return conv;
        }
        const existing = Array.from(memoryConversations.values()).find((c) => !c.isGroup &&
            c.participants.map((p) => p.toString()).includes(userId1.toString()) &&
            c.participants.map((p) => p.toString()).includes(userId2.toString()));
        if (existing)
            return existing;
        const newId = new mongoose_1.default.Types.ObjectId().toString();
        const newConv = {
            _id: newId,
            isGroup: false,
            participants: [userId1, userId2],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        memoryConversations.set(newId, newConv);
        return newConv;
    },
    async createGroupConversation(groupName, adminId, participantIds) {
        const allParticipants = Array.from(new Set([adminId, ...participantIds]));
        if ((0, exports.isDbConnected)()) {
            const conv = new Conversation_1.Conversation({
                isGroup: true,
                groupName,
                groupAdmin: adminId,
                participants: allParticipants,
            });
            return await conv.save();
        }
        const newId = new mongoose_1.default.Types.ObjectId().toString();
        const newConv = {
            _id: newId,
            isGroup: true,
            groupName,
            groupAdmin: adminId,
            participants: allParticipants,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        memoryConversations.set(newId, newConv);
        return newConv;
    },
    // MESSAGE METHODS
    async getMessagesByConversation(conversationId) {
        if ((0, exports.isDbConnected)()) {
            return await Message_1.Message.find({ conversationId })
                .populate('sender', 'name username avatar status')
                .sort({ createdAt: 1 });
        }
        const msgs = memoryMessages.filter((m) => m.conversationId.toString() === conversationId.toString());
        return msgs.map((m) => {
            const senderObj = memoryUsers.get(m.sender.toString());
            return {
                ...m,
                sender: senderObj
                    ? { _id: senderObj._id, name: senderObj.name, username: senderObj.username, avatar: senderObj.avatar, status: senderObj.status }
                    : m.sender,
            };
        });
    },
    async createMessage(msgData) {
        if ((0, exports.isDbConnected)()) {
            const msg = new Message_1.Message(msgData);
            await msg.save();
            await Conversation_1.Conversation.findByIdAndUpdate(msgData.conversationId, { lastMessage: msg._id, updatedAt: new Date() });
            return await Message_1.Message.findById(msg._id).populate('sender', 'name username avatar status');
        }
        const msgId = new mongoose_1.default.Types.ObjectId().toString();
        const newMsg = {
            _id: msgId,
            ...msgData,
            attachments: msgData.attachments || [],
            reactions: [],
            readBy: [msgData.sender],
            createdAt: new Date(),
        };
        memoryMessages.push(newMsg);
        const conv = memoryConversations.get(msgData.conversationId.toString());
        if (conv) {
            conv.lastMessage = msgId;
            conv.updatedAt = new Date();
        }
        const senderObj = memoryUsers.get(msgData.sender.toString());
        return {
            ...newMsg,
            sender: senderObj
                ? { _id: senderObj._id, name: senderObj.name, username: senderObj.username, avatar: senderObj.avatar, status: senderObj.status }
                : newMsg.sender,
        };
    },
    async addReaction(messageId, userId, emoji) {
        if ((0, exports.isDbConnected)()) {
            const msg = await Message_1.Message.findById(messageId);
            if (!msg)
                return null;
            msg.reactions = msg.reactions.filter((r) => r.userId.toString() !== userId.toString());
            msg.reactions.push({ emoji, userId: new mongoose_1.default.Types.ObjectId(userId) });
            await msg.save();
            return await Message_1.Message.findById(messageId).populate('sender', 'name username avatar status');
        }
        const msg = memoryMessages.find((m) => m._id.toString() === messageId.toString());
        if (!msg)
            return null;
        msg.reactions = (msg.reactions || []).filter((r) => r.userId.toString() !== userId.toString());
        msg.reactions.push({ emoji, userId });
        return msg;
    },
    async getAdminStats() {
        const allUsers = await this.getAllUsers();
        const totalUsers = allUsers.length;
        const onlineUsers = allUsers.filter((u) => u.status === 'online').length;
        const totalConversations = (0, exports.isDbConnected)()
            ? await Conversation_1.Conversation.countDocuments()
            : memoryConversations.size;
        const totalMessages = (0, exports.isDbConnected)()
            ? await Message_1.Message.countDocuments()
            : memoryMessages.length;
        return {
            totalUsers,
            onlineUsers,
            totalConversations,
            totalMessages,
            serverNode: process.env.SERVER_ID || 'server-node-1',
            uptime: process.uptime(),
            dbStatus: (0, exports.isDbConnected)() ? 'Connected (MongoDB)' : 'Active (Hybrid Store Fallback)',
        };
    },
};
