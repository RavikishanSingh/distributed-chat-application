"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = void 0;
const pubsub_1 = require("../services/pubsub");
const store_1 = require("../services/store");
const setupSocketHandlers = (io) => {
    // Listen to PubSub events from other server instances / nodes
    pubsub_1.pubSubService.on('CHAT_CHANNEL', (payload) => {
        if (payload.type === 'NEW_MESSAGE') {
            io.to(payload.conversationId).emit('receive_message', payload.message);
        }
        else if (payload.type === 'TYPING') {
            io.to(payload.conversationId).emit('user_typing', payload);
        }
        else if (payload.type === 'REACTION') {
            io.to(payload.conversationId).emit('message_reaction_updated', payload);
        }
    });
    pubsub_1.pubSubService.on('PRESENCE_CHANNEL', (payload) => {
        io.emit('user_presence_changed', payload);
    });
    io.on('connection', (socket) => {
        console.log(`[Socket.IO] New client connected: ${socket.id}`);
        // Authenticate / identify connected user
        socket.on('user_connected', async (userId) => {
            if (!userId)
                return;
            socket.userId = userId;
            console.log(`[Socket.IO] User ${userId} identified on socket ${socket.id}`);
            await store_1.StoreService.updateUser(userId, { status: 'online' });
            // Broadcast online presence via PubSub across all servers
            pubsub_1.pubSubService.publish('PRESENCE_CHANNEL', {
                userId,
                status: 'online',
                serverNode: process.env.SERVER_ID || 'server-node-1',
            });
        });
        // Room joining
        socket.on('join_conversation', (conversationId) => {
            if (conversationId) {
                socket.join(conversationId);
                console.log(`[Socket.IO] Socket ${socket.id} joined conversation: ${conversationId}`);
            }
        });
        socket.on('leave_conversation', (conversationId) => {
            if (conversationId) {
                socket.leave(conversationId);
            }
        });
        // Send Message Event
        socket.on('send_message', async (data) => {
            try {
                if (!socket.userId || !data.conversationId)
                    return;
                const newMsg = await store_1.StoreService.createMessage({
                    conversationId: data.conversationId,
                    sender: socket.userId,
                    text: data.text || '',
                    attachments: data.attachments || [],
                });
                // Publish to PubSub channel to update all cluster nodes
                pubsub_1.pubSubService.publish('CHAT_CHANNEL', {
                    type: 'NEW_MESSAGE',
                    conversationId: data.conversationId,
                    message: newMsg,
                    originNode: process.env.SERVER_ID || 'server-node-1',
                });
            }
            catch (err) {
                console.error('[Socket.IO] send_message error:', err.message);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });
        // Typing Indicators
        socket.on('typing_start', (data) => {
            pubsub_1.pubSubService.publish('CHAT_CHANNEL', {
                type: 'TYPING',
                conversationId: data.conversationId,
                userId: socket.userId,
                username: data.username,
                isTyping: true,
            });
        });
        socket.on('typing_stop', (data) => {
            pubsub_1.pubSubService.publish('CHAT_CHANNEL', {
                type: 'TYPING',
                conversationId: data.conversationId,
                userId: socket.userId,
                username: data.username,
                isTyping: false,
            });
        });
        // Reactions
        socket.on('add_reaction', async (data) => {
            if (!socket.userId)
                return;
            const updatedMsg = await store_1.StoreService.addReaction(data.messageId, socket.userId, data.emoji);
            if (updatedMsg) {
                pubsub_1.pubSubService.publish('CHAT_CHANNEL', {
                    type: 'REACTION',
                    conversationId: data.conversationId,
                    messageId: data.messageId,
                    message: updatedMsg,
                });
            }
        });
        // Disconnection
        socket.on('disconnect', async () => {
            console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
            if (socket.userId) {
                await store_1.StoreService.updateUser(socket.userId, { status: 'offline' });
                pubsub_1.pubSubService.publish('PRESENCE_CHANNEL', {
                    userId: socket.userId,
                    status: 'offline',
                    serverNode: process.env.SERVER_ID || 'server-node-1',
                });
            }
        });
    });
};
exports.setupSocketHandlers = setupSocketHandlers;
