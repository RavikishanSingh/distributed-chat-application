import React, { useState } from 'react';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Settings, X, Save, UserCheck } from 'lucide-react';

interface ProfileModalProps {
  onClose: () => void;
  currentUser: User;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, currentUser }) => {
  const { updateUser } = useAuth();
  const [name, setName] = useState<string>(currentUser.name);
  const [bio, setBio] = useState<string>(currentUser.bio || '');
  const [avatar, setAvatar] = useState<string>(currentUser.avatar || '');
  const [msg, setMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      await updateUser({
        name,
        bio,
        avatar,
      });
      setMsg('Profile updated successfully!');
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      setMsg('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#202c33] rounded-2xl p-6 border border-[#222d34] shadow-2xl relative space-y-4 font-sans">
        <div className="flex items-center justify-between border-b border-[#222d34] pb-3">
          <h3 className="text-base font-semibold text-[#e9edef] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#00a884]" /> Profile Settings
          </h3>
          <button onClick={onClose} className="p-1 text-[#8696a0] hover:text-[#e9edef] rounded-full cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {msg && (
          <div className="p-2.5 bg-[#00a884]/20 border border-[#00a884]/40 rounded-lg text-[#00a884] text-xs text-center font-medium flex items-center justify-center gap-2">
            <UserCheck className="w-4 h-4" /> {msg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex justify-center">
            <img src={avatar || currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-[#00a884]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8696a0] mb-1">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#111b21] border border-[#222d34] rounded-lg text-sm text-[#e9edef] focus:outline-none focus:border-[#00a884]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8696a0] mb-1">Profile Photo URL</label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 bg-[#111b21] border border-[#222d34] rounded-lg text-sm text-[#e9edef] focus:outline-none focus:border-[#00a884]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8696a0] mb-1">About</label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#111b21] border border-[#222d34] rounded-lg text-sm text-[#e9edef] focus:outline-none focus:border-[#00a884]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#00a884] hover:bg-[#008f6f] text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
          >
            <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};
