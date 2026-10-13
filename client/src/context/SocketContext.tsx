import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';
import { Message } from '../types';

interface SocketContextType {
  socket: any;
  isConnected: boolean;
  subscribeToMessages: (channelId: string, onNewMessage: (msg: any) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      setIsConnected(false);
      return;
    }

    // Presence / connectivity channel
    const presenceChannel = supabase.channel('online-users');

    presenceChannel
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [user]);

  const subscribeToMessages = (channelId: string, onNewMessage: (msg: any) => void) => {
    const channel = supabase
      .channel(`chat-room-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          // Fetch sender info for complete message object
          const newMsgRow = payload.new;
          const { data: senderData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newMsgRow.sender_id)
            .single();

          const formattedMessage: Message = {
            _id: newMsgRow.id,
            conversationId: newMsgRow.channel_id,
            sender: {
              _id: senderData?.id || newMsgRow.sender_id,
              name: senderData?.name || senderData?.username || 'User',
              username: senderData?.username || 'user',
              email: senderData?.email || '',
              avatar: senderData?.avatar_url || '',
              bio: senderData?.bio || '',
              status: senderData?.status || 'online',
              role: senderData?.role || 'user',
            },
            text: newMsgRow.content,
            attachments: newMsgRow.attachments || [],
            reactions: newMsgRow.reactions || [],
            createdAt: newMsgRow.created_at,
          };

          onNewMessage(formattedMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return (
    <SocketContext.Provider value={{ socket: supabase, isConnected, subscribeToMessages }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};
