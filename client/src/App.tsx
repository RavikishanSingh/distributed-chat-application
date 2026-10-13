import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useSocket } from './context/SocketContext';
import { Conversation, User } from './types';
import { Splash } from './components/Splash';
import { AuthModal } from './components/Auth/AuthModal';
import { Sidebar } from './components/Dashboard/Sidebar';
import { ChatWindow } from './components/Dashboard/ChatWindow';
import { GroupModal } from './components/Dashboard/GroupModal';
import { ProfileModal } from './components/Dashboard/ProfileModal';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { NewChatModal } from './components/Dashboard/NewChatModal';
import { MessageSquare, UserPlus } from 'lucide-react';
import {
  getConversationsForUser,
  searchUsersInSupabase,
  getOrCreateDirectChat,
  getDirectChannelUuid,
} from './services/supabaseServices';

export const AppContent: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const { isConnected } = useSocket();

  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const [showGroupModal, setShowGroupModal] = useState<boolean>(false);
  const [showNewChatModal, setShowNewChatModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Fetch active conversations when logged in
  const fetchConversations = async () => {
    if (!user) return;
    try {
      const convs = await getConversationsForUser(user._id);
      setConversations(convs);
      if (convs.length > 0 && !activeConversation) {
        setActiveConversation(convs[0]);
      }
    } catch (err) {
      console.error('[Supabase] Failed to fetch conversations:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const handleSearchUsers = async (query: string) => {
    if (!query.trim() || !user) {
      setSearchResults([]);
      return;
    }
    try {
      const users = await searchUsersInSupabase(query, user._id);
      setSearchResults(users);
    } catch (err) {
      console.error('[Supabase] User search failed:', err);
    }
  };

  const handleStartDirectChat = async (targetUser: User) => {
    if (!user) return;
    try {
      const channelUuid = getDirectChannelUuid(user._id, targetUser._id);

      // 1. Create immediate direct conversation object with valid UUID so chat window opens INSTANTLY
      const directConv: Conversation = {
        _id: channelUuid,
        isGroup: false,
        groupName: targetUser.name,
        participants: [user, targetUser],
        updatedAt: new Date().toISOString(),
      };

      setActiveConversation(directConv);
      setConversations((prev) => {
        const exists = prev.some(
          (c) => c._id === directConv._id || (!c.isGroup && c.participants.some((p) => p._id === targetUser._id))
        );
        if (exists) {
          const match = prev.find(
            (c) => c._id === directConv._id || (!c.isGroup && c.participants.some((p) => p._id === targetUser._id))
          );
          if (match) setActiveConversation(match);
          return prev;
        }
        return [directConv, ...prev];
      });

      // 2. Sync / create in Supabase database asynchronously
      const conv = await getOrCreateDirectChat(user._id, targetUser._id);
      if (conv) {
        setActiveConversation(conv);
        setConversations((prev) => {
          const filtered = prev.filter(
            (c) => c._id !== directConv._id && c._id !== conv._id
          );
          return [conv, ...filtered];
        });
      }
    } catch (err) {
      console.error('[Supabase] Failed to start direct chat:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0b141a] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-[#8696a0]">Loading Chat Platform...</span>
        </div>
      </div>
    );
  }

  if (showSplash) {
    return <Splash onStart={() => setShowSplash(false)} />;
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <div className="flex h-screen w-screen bg-[#0b141a] overflow-hidden select-none relative font-sans">
      {/* Sidebar Navigation (Responsive Drawer on Mobile) */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:relative md:translate-x-0 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <Sidebar
          currentUser={user}
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={(conv) => {
            setActiveConversation(conv);
            setMobileSidebarOpen(false);
          }}
          onOpenGroupModal={() => setShowGroupModal(true)}
          onOpenNewChatModal={() => setShowNewChatModal(true)}
          onOpenProfileModal={() => setShowProfileModal(true)}
          onOpenAdminDashboard={() => setShowAdminDashboard(true)}
          onLogout={logout}
          searchResults={searchResults}
          onSearchUsers={handleSearchUsers}
          onStartDirectChat={(targetUser) => {
            handleStartDirectChat(targetUser);
            setMobileSidebarOpen(false);
          }}
          isConnected={isConnected}
        />
      </div>

      {/* Backdrop for Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        ></div>
      )}

      {/* Main Workspace / Active Chat Window */}
      {activeConversation ? (
        <ChatWindow
          conversation={activeConversation}
          currentUser={user}
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
      ) : (
        <div className="flex-1 h-full flex flex-col items-center justify-center p-6 text-center text-[#8696a0] bg-[#0b141a] space-y-4">
          <div className="p-5 bg-[#202c33] rounded-full border border-[#222d34]">
            <MessageSquare className="w-12 h-12 text-[#00a884]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#e9edef] mb-1">WhatsApp Web for Realtime Messaging</h2>
            <p className="text-xs max-w-sm text-[#8696a0] mx-auto">
              Select a conversation from the sidebar or click below to start a direct 1-on-1 chat with any team member.
            </p>
          </div>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="px-5 py-2.5 bg-[#00a884] hover:bg-[#008f6f] text-white font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <UserPlus className="w-4 h-4" /> Start Direct Chat Now
          </button>
        </div>
      )}

      {/* Modals */}
      {showNewChatModal && (
        <NewChatModal
          currentUser={user}
          onClose={() => setShowNewChatModal(false)}
          onSelectUser={(targetUser) => {
            handleStartDirectChat(targetUser);
          }}
        />
      )}

      {showGroupModal && (
        <GroupModal
          currentUser={user}
          onClose={() => setShowGroupModal(false)}
          onGroupCreated={(newConv) => {
            fetchConversations();
            if (newConv) setActiveConversation(newConv);
          }}
        />
      )}

      {showProfileModal && (
        <ProfileModal currentUser={user} onClose={() => setShowProfileModal(false)} />
      )}

      {showAdminDashboard && (
        <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
      )}
    </div>
  );
};
