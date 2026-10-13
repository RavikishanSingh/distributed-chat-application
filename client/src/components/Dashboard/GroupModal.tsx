import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { Users, X, Check } from 'lucide-react';
import { searchUsersInSupabase, createGroupInSupabase } from '../../services/supabaseServices';

interface GroupModalProps {
  onClose: () => void;
  onGroupCreated: (conv: any) => void;
  currentUser: User;
}

export const GroupModal: React.FC<GroupModalProps> = ({ onClose, onGroupCreated, currentUser }) => {
  const [groupName, setGroupName] = useState<string>('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    searchUsersInSupabase('', currentUser._id).then((users) => {
      setAvailableUsers(users);
    });
  }, [currentUser._id]);

  const toggleSelectUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((uId) => uId !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedUserIds.length === 0) return;

    setLoading(true);
    try {
      const conv = await createGroupInSupabase(currentUser._id, groupName.trim(), '', selectedUserIds);
      if (conv) {
        onGroupCreated(conv);
      }
      onClose();
    } catch (err) {
      console.error('Failed to create group:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#202c33] rounded-2xl p-6 border border-[#222d34] shadow-2xl relative space-y-4 font-sans">
        <div className="flex items-center justify-between border-b border-[#222d34] pb-3">
          <h3 className="text-base font-semibold text-[#e9edef] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00a884]" /> New Group Subject
          </h3>
          <button onClick={onClose} className="p-1 text-[#8696a0] hover:text-[#e9edef] rounded-full cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8696a0] mb-1">Group Name</label>
            <input
              type="text"
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group subject"
              className="w-full px-4 py-2.5 bg-[#111b21] border border-[#222d34] rounded-lg text-sm text-[#e9edef] focus:outline-none focus:border-[#00a884]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8696a0] mb-1">Add Members</label>
            <div className="max-h-48 overflow-y-auto space-y-1.5 border border-[#222d34] p-2 rounded-lg bg-[#111b21]">
              {availableUsers.map((u) => {
                const isSelected = selectedUserIds.includes(u._id);
                return (
                  <div
                    key={u._id}
                    onClick={() => toggleSelectUser(u._id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#00a884]/20 border border-[#00a884]/40' : 'hover:bg-[#202c33]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="text-xs font-semibold text-[#e9edef]">{u.name}</p>
                        <p className="text-[10px] text-[#8696a0]">@{u.username}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#00a884]" />}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !groupName.trim() || selectedUserIds.length === 0}
            className="w-full py-3 bg-[#00a884] hover:bg-[#008f6f] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-40"
          >
            {loading ? 'Creating Group...' : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  );
};
