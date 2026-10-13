import { Server, Socket } from 'socket.io';
import { pubSubService } from '../services/pubsub';
import { StoreService } from '../services/store';

interface SocketWithUser extends Socket {
  userId?: string;
}

export const setupSocketHandlers = (io: Server) => {
  // Listen to PubSub events from other server instances / nodes
  pubSubService.on('CHAT_CHANNEL', (payload: any) => {
    if (payload.type === 'NEW_MESSAGE') {
      io.to(payload.conversationId).emit('receive_message', payload.message);
    } else if (payload.type === 'TYPING') {
      io.to(payload.conversationId).emit('user_typing', payload);
    } else if (payload.type === 'REACTION') {
      io.to(payload.conversationId).emit('message_reaction_updated', payload);
    }
  });

  pubSubService.on('PRESENCE_CHANNEL', (payload: any) => {
    io.emit('user_presence_changed', payload);
  });

  io.on('connection', (socket: SocketWithUser) => {
    console.log(`[Socket.IO] New client connected: ${socket.id}`);

    // Authenticate / identify connected user
    socket.on('user_connected', async (userId: string) => {
      if (!userId) return;
      socket.userId = userId;
      console.log(`[Socket.IO] User ${userId} identified on socket ${socket.id}`);

      await StoreService.updateUser(userId, { status: 'online' });

      // Broadcast online presence via PubSub across all servers
      pubSubService.publish('PRESENCE_CHANNEL', {
        userId,
        status: 'online',
        serverNode: process.env.SERVER_ID || 'server-node-1',
      });
    });

    // Room joining
    socket.on('join_conversation', (conversationId: string) => {
      if (conversationId) {
        socket.join(conversationId);
        console.log(`[Socket.IO] Socket ${socket.id} joined conversation: ${conversationId}`);
      }
    });

    socket.on('leave_conversation', (conversationId: string) => {
      if (conversationId) {
        socket.leave(conversationId);
      }
    });

    // Send Message Event
    socket.on('send_message', async (data: { conversationId: string; text: string; attachments?: any[] }) => {
      try {
        if (!socket.userId || !data.conversationId) return;

        const newMsg = await StoreService.createMessage({
          conversationId: data.conversationId,
          sender: socket.userId,
          text: data.text || '',
          attachments: data.attachments || [],
        });

        // Publish to PubSub channel to update all cluster nodes
        pubSubService.publish('CHAT_CHANNEL', {
          type: 'NEW_MESSAGE',
          conversationId: data.conversationId,
          message: newMsg,
          originNode: process.env.SERVER_ID || 'server-node-1',
        });
      } catch (err: any) {
        console.error('[Socket.IO] send_message error:', err.message);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing Indicators
    socket.on('typing_start', (data: { conversationId: string; username: string }) => {
      pubSubService.publish('CHAT_CHANNEL', {
        type: 'TYPING',
        conversationId: data.conversationId,
        userId: socket.userId,
        username: data.username,
        isTyping: true,
      });
    });

    socket.on('typing_stop', (data: { conversationId: string; username: string }) => {
      pubSubService.publish('CHAT_CHANNEL', {
        type: 'TYPING',
        conversationId: data.conversationId,
        userId: socket.userId,
        username: data.username,
        isTyping: false,
      });
    });

    // Reactions
    socket.on('add_reaction', async (data: { messageId: string; conversationId: string; emoji: string }) => {
      if (!socket.userId) return;
      const updatedMsg = await StoreService.addReaction(data.messageId, socket.userId, data.emoji);

      if (updatedMsg) {
        pubSubService.publish('CHAT_CHANNEL', {
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
        await StoreService.updateUser(socket.userId, { status: 'offline' });
        pubSubService.publish('PRESENCE_CHANNEL', {
          userId: socket.userId,
          status: 'offline',
          serverNode: process.env.SERVER_ID || 'server-node-1',
        });
      }
    });
  });
};
