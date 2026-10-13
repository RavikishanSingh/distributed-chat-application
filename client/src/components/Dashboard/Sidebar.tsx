import React, { useState } from 'react';
import { User, Conversation } from '../../types';
import {
  Search,
  PlusCircle,
  Users,
  MessageSquare,
  Settings,
  Shield,
  LogOut,
  X,
  Radio,
  UserPlus,
  CheckCheck,
} from 'lucide-react';

interface SidebarProps {
  currentUser: User;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onSelectConversation: (conv: Conversation) => void;
  onOpenGroupModal: () => void;
  onOpenNewChatModal: () => void;
  onOpenProfileModal: () => void;
  onOpenAdminDashboard: () => void;
  onLogout: () => void;
  searchResults: User[];
  onSearchUsers: (query: string) => void;
  onStartDirectChat: (user: User) => void;
  isConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  conversations,
  activeConversation,
  onSelectConversation,
  onOpenGroupModal,
  onOpenNewChatModal,
  onOpenProfileModal,
  onOpenAdminDashboard,
  onLogout,
  searchResults,
  onSearchUsers,
  onStartDirectChat,
  isConnected,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTab, setFilterTab] = useState<'all' | 'groups' | 'direct'>('all');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    onSearchUsers(q);
  };

  const filteredConversations = conversations.filter((conv) => {
    if (filterTab === 'groups') return conv.isGroup;
    if (filterTab === 'direct') return !conv.isGroup;
    return true;
  });

  return (
    <aside className="w-80 md:w-96 h-full bg-[#111b21] border-r border-[#222d34] flex flex-col shrink-0 select-none font-sans">
      {/* WhatsApp Sidebar Top Header Bar */}
      <div className="h-16 px-4 bg-[#202c33] flex items-center justify-between border-b border-[#222d34] shrink-0">
        <div
          onClick={onOpenProfileModal}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <img
              src={
                currentUser.avatar ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.username)}`
              }
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#202c33] ${
                isConnected ? 'bg-[#00a884]' : 'bg-amber-400'
              }`}
            ></span>
          </div>
          <div className="overflow-hidden">
            <h3 className="text-sm font-semibold text-[#e9edef] truncate group-hover:text-[#00a884] transition-colors">
              {currentUser.name}
            </h3>
            <p className="text-[11px] text-[#8696a0] truncate">@{currentUser.username}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 text-[#8696a0]">
          <button
            onClick={onOpenNewChatModal}
            title="Start Direct Chat"
            className="p-2 text-[#00a884] hover:text-white hover:bg-[#374248] rounded-full transition-colors cursor-pointer"
          >
            <UserPlus className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenGroupModal}
            title="Create New Group"
            className="p-2 hover:text-[#e9edef] hover:bg-[#374248] rounded-full transition-colors cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
          </button>

          {currentUser.role === 'admin' && (
            <button
              onClick={onOpenAdminDashboard}
              title="Admin Dashboard"
              className="p-2 hover:text-[#e9edef] hover:bg-[#374248] rounded-full transition-colors cursor-pointer"
            >
              <Shield className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={onOpenProfileModal}
            title="Profile & Settings"
            className="p-2 hover:text-[#e9edef] hover:bg-[#374248] rounded-full transition-colors cursor-pointer"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-2 hover:text-red-400 hover:bg-[#374248] rounded-full transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Network Connection Bar */}
      <div className="px-4 py-2 bg-[#111b21] border-b border-[#222d34] flex items-center justify-between text-xs text-[#8696a0]">
        <span className="flex items-center gap-2 text-[#00a884] font-medium">
          <Radio className="w-3.5 h-3.5 animate-pulse" /> Realtime Connected
        </span>
        <span className="text-[10px] text-[#8696a0] uppercase font-mono">
          {isConnected ? 'ONLINE' : 'CONNECTING'}
        </span>
      </div>

      {/* WhatsApp Search Input Bar */}
      <div className="p-2.5 bg-[#111b21] border-b border-[#222d34] relative">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8696a0] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search or start new chat"
            className="w-full pl-10 pr-8 py-2 bg-[#202c33] rounded-lg text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                onSearchUsers('');
              }}
              className="absolute right-2.5 top-2.5 text-[#8696a0] hover:text-[#e9edef]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Live User Search Popup */}
        {searchQuery.trim().length > 0 && (
          <div className="absolute left-2.5 right-2.5 top-14 z-40 bg-[#202c33] border border-[#222d34] rounded-lg shadow-2xl p-2 max-h-64 overflow-y-auto space-y-1 animate-slide-up">
            <div className="text-[10px] uppercase font-semibold text-[#00a884] px-2 py-1 flex items-center gap-1">
              <UserPlus className="w-3 h-3 text-[#00a884]" /> Directory Results
            </div>
            {searchResults.length === 0 ? (
              <p className="text-xs text-[#8696a0] p-3 text-center">No matching contacts</p>
            ) : (
              searchResults.map((u) => (
                <div
                  key={u._id}
                  onClick={() => {
                    onStartDirectChat(u);
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-3 p-2 hover:bg-[#111b21] rounded-lg cursor-pointer transition-colors"
                >
                  <img
                    src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`}
                    alt={u.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs font-semibold text-[#e9edef] truncate">{u.name}</p>
                    <p className="text-[11px] text-[#8696a0] truncate">@{u.username}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="px-3 py-2 bg-[#111b21] border-b border-[#222d34] flex gap-2">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${
            filterTab === 'all'
              ? 'bg-[#202c33] text-[#00a884]'
              : 'text-[#8696a0] hover:text-[#e9edef]'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterTab('direct')}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${
            filterTab === 'direct'
              ? 'bg-[#202c33] text-[#00a884]'
              : 'text-[#8696a0] hover:text-[#e9edef]'
          }`}
        >
          Direct
        </button>
        <button
          onClick={() => setFilterTab('groups')}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${
            filterTab === 'groups'
              ? 'bg-[#202c33] text-[#00a884]'
              : 'text-[#8696a0] hover:text-[#e9edef]'
          }`}
        >
          Groups
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#222d34]/40">
        {filteredConversations.length === 0 ? (
          <div className="text-center p-8 text-[#8696a0] text-xs space-y-3">
            <MessageSquare className="w-10 h-10 mx-auto opacity-30 text-[#00a884]" />
            <div>
              <p className="font-semibold text-[#e9edef] mb-1">No Conversations Yet</p>
              <p className="text-[11px] max-w-[200px] mx-auto text-[#8696a0]">
                Select a team member to start messaging.
              </p>
            </div>
            <button
              onClick={onOpenNewChatModal}
              className="px-4 py-2 bg-[#00a884] hover:bg-[#008f6f] text-white font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Start Direct Chat
            </button>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isActive = activeConversation?._id === conv._id;

            let name = conv.groupName || 'Group Chat';
            let avatar = conv.groupAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${conv._id}`;
            let isOnline = false;

            if (!conv.isGroup) {
              const otherUser = conv.participants.find((p) => p._id !== currentUser._id);
              if (otherUser) {
                name = otherUser.name;
                avatar = otherUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${otherUser.name}`;
                isOnline = otherUser.status === 'online';
              }
            }

            return (
              <div
                key={conv._id}
                onClick={() => onSelectConversation(conv)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors relative ${
                  isActive ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'
                }`}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00a884]"></div>}

                <div className="relative shrink-0">
                  <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
                  {conv.isGroup ? (
                    <span className="absolute -bottom-1 -right-1 p-1 bg-[#202c33] text-[#00a884] rounded-full text-[9px] border border-[#222d34]">
                      <Users className="w-3 h-3" />
                    </span>
                  ) : (
                    isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00a884] border-2 border-[#111b21]"></span>
                    )
                  )}
                </div>

                <div className="overflow-hidden flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-[#e9edef] truncate">{name}</h4>
                  </div>

                  <p className="text-xs text-[#8696a0] truncate mt-1 flex items-center gap-1">
                    {conv.lastMessage?.text ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-[#8696a0] shrink-0" />
                        <span className="truncate">{conv.lastMessage.text}</span>
                      </>
                    ) : (
                      'No messages yet'
                    )}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
