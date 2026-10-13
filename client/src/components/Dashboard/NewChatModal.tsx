import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { UserPlus, X, Search, MessageSquare, Check } from 'lucide-react';
import { searchUsersInSupabase } from '../../services/supabaseServices';

interface NewChatModalProps {
  onClose: () => void;
  onSelectUser: (user: User) => void;
  currentUser: User;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ onClose, onSelectUser, currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    searchUsersInSupabase(searchQuery, currentUser._id).then((res) => {
      setUsers(res);
      setLoading(false);
    });
  }, [searchQuery, currentUser._id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#202c33] rounded-2xl p-6 border border-[#222d34] shadow-2xl relative space-y-4 font-sans">
        <div className="flex items-center justify-between border-b border-[#222d34] pb-3">
          <h3 className="text-base font-semibold text-[#e9edef] flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#00a884]" /> Start Direct Chat
          </h3>
          <button onClick={onClose} className="p-1 text-[#8696a0] hover:text-[#e9edef] rounded-full cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contact Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8696a0] absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or username..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#111b21] border border-[#222d34] rounded-lg text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
            autoFocus
          />
        </div>

        {/* Contacts Directory List */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider px-1">Select Contact</p>
          <div className="max-h-64 overflow-y-auto space-y-1.5 border border-[#222d34] p-2 rounded-lg bg-[#111b21]">
            {loading ? (
              <div className="p-6 text-center text-xs text-[#8696a0]">Loading contacts...</div>
            ) : users.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#8696a0]">No contacts found</div>
            ) : (
              users.map((u) => (
                <div
                  key={u._id}
                  onClick={() => {
                    onSelectUser(u);
                    onClose();
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#202c33] cursor-pointer transition-colors group"
                >
                  <div className="relative">
                    <img
                      src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {u.status === 'online' && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00a884] border-2 border-[#111b21]"></span>
                    )}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-sm font-semibold text-[#e9edef] group-hover:text-[#00a884] transition-colors truncate">
                      {u.name}
                    </p>
                    <p className="text-xs text-[#8696a0] truncate">@{u.username} • {u.bio || 'Hey there! I am using Chat'}</p>
                  </div>
                  <div className="px-3 py-1 bg-[#00a884]/20 text-[#00a884] text-xs font-semibold rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    Chat
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
