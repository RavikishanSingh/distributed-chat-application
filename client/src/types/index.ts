export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  status: 'online' | 'offline';
  role: 'user' | 'admin';
}

export interface Attachment {
  url: string;
  type: string;
  name: string;
  size?: number;
}

export interface Reaction {
  emoji: string;
  userId: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: User | string;
  text: string;
  attachments?: Attachment[];
  reactions?: Reaction[];
  readBy?: string[];
  createdAt: string;
}

export interface Conversation {
  _id: string;
  isGroup: boolean;
  groupName?: string;
  groupAdmin?: string;
  groupAvatar?: string;
  participants: User[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  onlineUsers: number;
  totalConversations: number;
  totalMessages: number;
  serverNode: string;
  uptime: number;
  dbStatus: string;
  pubSubStatus?: {
    redisConnected: boolean;
    mode: string;
  };
}
