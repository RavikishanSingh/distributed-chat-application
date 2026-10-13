import mongoose from 'mongoose';
import { User, IUser } from '../models/User';
import { Conversation, IConversation } from '../models/Conversation';
import { Message, IMessage } from '../models/Message';
import bcrypt from 'bcryptjs';

// In-memory collections as zero-config fallback
const memoryUsers: Map<string, any> = new Map();
const memoryConversations: Map<string, any> = new Map();
const memoryMessages: any[] = [];

// Seed default admin and initial demo users into memory and MongoDB
export const seedDefaults = async () => {
  try {
    const adminHash = await bcrypt.hash('admin123', 10);
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

    const userHash = await bcrypt.hash('user123', 10);
    const defaultUser2 = {
      _id: '650000000000000000000002',
      name: 'Madhav Pisal',
      username: 'madhav',
      email: 'madhav@chat.com',
      password: userHash,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'Backend & Distributed Systems Engineer',
      status: 'online',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const defaultUser3 = {
      _id: '650000000000000000000003',
      name: 'Priya Gorai',
      username: 'priya',
      email: 'priya@chat.com',
      password: userHash,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      bio: 'Frontend Lead & UI Specialist',
      status: 'online',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const defaultUser4 = {
      _id: '650000000000000000000004',
      name: 'Swati Thakur',
      username: 'swati',
      email: 'swati@chat.com',
      password: userHash,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      bio: 'DevOps & Cloud Infrastructure Engineer',
      status: 'offline',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const defaultUser5 = {
      _id: '650000000000000000000005',
      name: 'Rajesh Gurjar',
      username: 'rajesh',
      email: 'rajesh@chat.com',
      password: userHash,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      bio: 'Database Administrator & Data Architect',
      status: 'online',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryUsers.set(defaultAdmin._id, defaultAdmin);
    memoryUsers.set(defaultUser2._id, defaultUser2);
    memoryUsers.set(defaultUser3._id, defaultUser3);
    memoryUsers.set(defaultUser4._id, defaultUser4);
    memoryUsers.set(defaultUser5._id, defaultUser5);

    // Seed default demo group conversation
    const demoGroup = {
      _id: '650000000000000000000010',
      isGroup: true,
      groupName: 'Distributed Core Team',
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
    if (mongoose.connection.readyState === 1) {
      const existingAdmin = await User.findOne({ email: 'admin@chat.com' });
      if (!existingAdmin) {
        await User.create(defaultAdmin);
        await User.create(defaultUser2);
        await User.create(defaultUser3);

        const conv = await Conversation.create(demoGroup);
        await Message.create({
          _id: '650000000000000000000100',
          conversationId: conv._id,
          sender: defaultAdmin._id,
          text: 'Welcome everyone to the Distributed Real-Time Chat Platform!',
          attachments: [],
          reactions: [{ emoji: '🚀', userId: defaultUser2._id }],
          readBy: [defaultAdmin._id, defaultUser2._id],
        });
        await Conversation.findByIdAndUpdate(conv._id, { lastMessage: '650000000000000000000100' });
        console.log('[MongoDB] Seeded default demo users and conversations');
      }
    }
  } catch (err: any) {
    console.error('[StoreService] Seeding error:', err.message);
  }
};

seedDefaults();

export const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

export const StoreService = {
  // USER METHODS
  async findUserByEmail(email: string) {
    if (isDbConnected()) {
      return await User.findOne({ email: email.toLowerCase() });
    }
    return Array.from(memoryUsers.values()).find((u) => u.email === email.toLowerCase()) || null;
  },

  async findUserByUsername(username: string) {
    if (isDbConnected()) {
      return await User.findOne({ username: username.toLowerCase() });
    }
    return Array.from(memoryUsers.values()).find((u) => u.username === username.toLowerCase()) || null;
  },

  async findUserById(id: string) {
    if (isDbConnected()) {
      return await User.findById(id).select('-password');
    }
    const user = memoryUsers.get(id?.toString());
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
  },

  async createUser(userData: any) {
    if (isDbConnected()) {
      const newUser = new User(userData);
      return await newUser.save();
    }
    const id = new mongoose.Types.ObjectId().toString();
    const newUser = { _id: id, ...userData, status: 'offline', role: 'user', createdAt: new Date(), updatedAt: new Date() };
    memoryUsers.set(id, newUser);
    return newUser;
  },

  async updateUser(id: string, updateData: any) {
    if (isDbConnected()) {
      return await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    }
    const user = memoryUsers.get(id?.toString());
    if (!user) return null;
    const updated = { ...user, ...updateData, updatedAt: new Date() };
    memoryUsers.set(id?.toString(), updated);
    const { password, ...rest } = updated;
    return rest;
  },

  async searchUsers(query: string, currentUserId: string) {
    if (isDbConnected()) {
      return await User.find({
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
      .filter(
        (u) =>
          u._id.toString() !== currentUserId.toString() &&
          (u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      )
      .map(({ password, ...rest }) => rest);
  },

  async getAllUsers() {
    if (isDbConnected()) {
      return await User.find().select('-password');
    }
    return Array.from(memoryUsers.values()).map(({ password, ...rest }) => rest);
  },

  // CONVERSATION METHODS
  async getUserConversations(userId: string) {
    if (isDbConnected()) {
      return await Conversation.find({ participants: userId })
        .populate('participants', '-password')
        .populate({
          path: 'lastMessage',
          populate: { path: 'sender', select: 'name username avatar' },
        })
        .sort({ updatedAt: -1 });
    }
    const convs = Array.from(memoryConversations.values()).filter((c) =>
      c.participants.map((p: any) => p.toString()).includes(userId.toString())
    );

    return convs.map((c) => {
      const populatedParticipants = c.participants
        .map((pId: any) => {
          const u = memoryUsers.get(pId.toString());
          if (!u) return null;
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

  async findOrCreateDirectConversation(userId1: string, userId2: string) {
    if (isDbConnected()) {
      let conv = await Conversation.findOne({
        isGroup: false,
        participants: { $all: [userId1, userId2] },
      });
      if (!conv) {
        conv = new Conversation({
          isGroup: false,
          participants: [userId1, userId2],
        });
        await conv.save();
      }
      return conv;
    }

    const existing = Array.from(memoryConversations.values()).find(
      (c) =>
        !c.isGroup &&
        c.participants.map((p: any) => p.toString()).includes(userId1.toString()) &&
        c.participants.map((p: any) => p.toString()).includes(userId2.toString())
    );

    if (existing) return existing;

    const newId = new mongoose.Types.ObjectId().toString();
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

  async createGroupConversation(groupName: string, adminId: string, participantIds: string[]) {
    const allParticipants = Array.from(new Set([adminId, ...participantIds]));
    if (isDbConnected()) {
      const conv = new Conversation({
        isGroup: true,
        groupName,
        groupAdmin: adminId,
        participants: allParticipants,
      });
      return await conv.save();
    }

    const newId = new mongoose.Types.ObjectId().toString();
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
  async getMessagesByConversation(conversationId: string) {
    if (isDbConnected()) {
      return await Message.find({ conversationId })
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

  async createMessage(msgData: any) {
    if (isDbConnected()) {
      const msg = new Message(msgData);
      await msg.save();
      await Conversation.findByIdAndUpdate(msgData.conversationId, { lastMessage: msg._id, updatedAt: new Date() });
      return await Message.findById(msg._id).populate('sender', 'name username avatar status');
    }

    const msgId = new mongoose.Types.ObjectId().toString();
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

  async addReaction(messageId: string, userId: string, emoji: string) {
    if (isDbConnected()) {
      const msg = await Message.findById(messageId);
      if (!msg) return null;
      msg.reactions = msg.reactions.filter((r) => r.userId.toString() !== userId.toString());
      msg.reactions.push({ emoji, userId: new mongoose.Types.ObjectId(userId) });
      await msg.save();
      return await Message.findById(messageId).populate('sender', 'name username avatar status');
    }

    const msg = memoryMessages.find((m) => m._id.toString() === messageId.toString());
    if (!msg) return null;
    msg.reactions = (msg.reactions || []).filter((r: any) => r.userId.toString() !== userId.toString());
    msg.reactions.push({ emoji, userId });
    return msg;
  },

  async getAdminStats() {
    const allUsers = await this.getAllUsers();
    const totalUsers = allUsers.length;
    const onlineUsers = allUsers.filter((u) => u.status === 'online').length;
    const totalConversations = isDbConnected()
      ? await Conversation.countDocuments()
      : memoryConversations.size;
    const totalMessages = isDbConnected()
      ? await Message.countDocuments()
      : memoryMessages.length;

    return {
      totalUsers,
      onlineUsers,
      totalConversations,
      totalMessages,
      serverNode: process.env.SERVER_ID || 'server-node-1',
      uptime: process.uptime(),
      dbStatus: isDbConnected() ? 'Connected (MongoDB)' : 'Active (Hybrid Store Fallback)',
    };
  },
};
