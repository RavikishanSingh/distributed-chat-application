import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, User } from '../../types';
import { useSocket } from '../../context/SocketContext';
import {
  fetchChannelMessages,
  sendMessageToSupabase,
  uploadAttachmentToSupabase,
} from '../../services/supabaseServices';
import {
  Send,
  Paperclip,
  Smile,
  Users,
  CheckCheck,
  FileText,
  Phone,
  Video,
  Info,
  Download,
  Image as ImageIcon,
  Search,
  X,
  Copy,
  Check,
  Maximize2,
  Menu,
  MoreVertical,
  Mic,
  Shield,
} from 'lucide-react';
import { format } from 'date-fns';

interface ChatWindowProps {
  conversation: Conversation;
  currentUser: User;
  onToggleSidebar?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, currentUser, onToggleSidebar }) => {
  const { subscribeToMessages } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  // UI States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [showInfoDrawer, setShowInfoDrawer] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isOtherTyping, setIsOtherTyping] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isGroup = conversation.isGroup;
  let title = conversation.groupName || 'Group Chat';
  let avatar = conversation.groupAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${conversation._id}`;
  let otherUser: User | undefined;

  if (!isGroup) {
    otherUser = conversation.participants.find((p) => p._id !== currentUser._id);
    if (otherUser) {
      title = otherUser.name;
      avatar = otherUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${otherUser.name}`;
    }
  }

  // Load message history & setup Realtime + 3s sync interval
  useEffect(() => {
    const loadMessages = () => {
      fetchChannelMessages(conversation._id).then((msgs) => {
        setMessages((prev) => {
          if (msgs.length === prev.length && (msgs.length === 0 || msgs[msgs.length - 1]?._id === prev[prev.length - 1]?._id)) {
            return prev;
          }
          return msgs;
        });
      });
    };

    loadMessages();

    // WebSocket Realtime subscription
    const unsubscribe = subscribeToMessages(conversation._id, (newMsg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });
      setIsOtherTyping(false);
    });

    // 3-second polling fallback for guaranteed instant delivery
    const pollInterval = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [conversation._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOtherTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    let attachments: any[] = [];
    if (selectedFile) {
      setUploading(true);
      const uploaded = await uploadAttachmentToSupabase(selectedFile);
      if (uploaded) {
        attachments.push(uploaded);
      }
      setUploading(false);
      setSelectedFile(null);
    }

    const content = inputText.trim();
    setInputText('');

    const newMsg = await sendMessageToSupabase(conversation._id, currentUser._id, content, attachments);
    if (newMsg) {
      setMessages((prev) => {
        if (prev.some((m) => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMessages = searchQuery.trim()
    ? messages.filter((m) => m.text?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div className="flex-1 h-full flex bg-[#0b141a] relative overflow-hidden select-none font-sans">
      {/* Main Chat Workspace */}
      <div className="flex-1 h-full flex flex-col relative z-10 overflow-hidden">
        {/* WhatsApp Top Header Bar */}
        <div className="h-16 px-4 bg-[#202c33] border-b border-[#222d34] flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="md:hidden p-2 text-[#8696a0] hover:text-[#e9edef] rounded-full hover:bg-[#374248] transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="relative cursor-pointer" onClick={() => setShowInfoDrawer(!showInfoDrawer)}>
              <img
                src={avatar}
                alt={title}
                className="w-10 h-10 rounded-full object-cover"
              />
              {!isGroup && otherUser?.status === 'online' && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00a884] border-2 border-[#202c33]"></span>
              )}
            </div>

            <div>
              <h3
                className="text-sm font-semibold text-[#e9edef] flex items-center gap-2 cursor-pointer hover:underline"
                onClick={() => setShowInfoDrawer(!showInfoDrawer)}
              >
                {title}
              </h3>
              <p className="text-xs text-[#8696a0] truncate">
                {isGroup ? (
                  `Group with ${conversation.participants.length} members`
                ) : otherUser?.status === 'online' ? (
                  <span className="text-[#00a884] font-medium">online</span>
                ) : (
                  'offline'
                )}
              </p>
            </div>
          </div>

          {/* Action Header Icons */}
          <div className="flex items-center gap-1 text-[#8696a0]">
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              title="Search Messages"
              className={`p-2.5 rounded-full hover:bg-[#374248] transition-colors cursor-pointer ${
                showSearchInput ? 'text-[#00a884]' : 'hover:text-[#e9edef]'
              }`}
            >
              <Search className="w-5 h-5" />
            </button>
            <button title="Voice Call" className="p-2.5 hover:bg-[#374248] hover:text-[#e9edef] rounded-full transition-colors cursor-pointer">
              <Phone className="w-5 h-5" />
            </button>
            <button title="Video Call" className="p-2.5 hover:bg-[#374248] hover:text-[#e9edef] rounded-full transition-colors cursor-pointer">
              <Video className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowInfoDrawer(!showInfoDrawer)}
              title="Contact Info"
              className={`p-2.5 rounded-full hover:bg-[#374248] transition-colors cursor-pointer ${
                showInfoDrawer ? 'text-[#00a884]' : 'hover:text-[#e9edef]'
              }`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar Popup */}
        {showSearchInput && (
          <div className="px-4 py-2.5 bg-[#111b21] border-b border-[#222d34] flex items-center gap-3 animate-slide-up">
            <Search className="w-4 h-4 text-[#8696a0] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in chat..."
              className="flex-1 bg-transparent text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
              autoFocus
            />
            {searchQuery && (
              <span className="text-[11px] text-[#00a884] font-medium">
                {filteredMessages.length} matches
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSearchInput(false);
              }}
              className="text-[#8696a0] hover:text-[#e9edef]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* WhatsApp Chat Wallpaper Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 whatsapp-chat-wallpaper">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#8696a0]">
              <div className="p-4 bg-[#202c33] rounded-full mb-3 border border-[#222d34]">
                <Shield className="w-8 h-8 text-[#00a884]" />
              </div>
              <h4 className="text-sm font-semibold text-[#e9edef] mb-1">End-to-End Encrypted</h4>
              <p className="text-xs max-w-xs text-[#8696a0]">
                {searchQuery ? `No messages found matching "${searchQuery}"` : 'Send a message to start direct real-time communication.'}
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const senderObj = typeof msg.sender === 'object' ? msg.sender : null;
              const senderId = senderObj ? senderObj._id : (msg.sender as string);
              const isOwn = senderId === currentUser._id;
              const senderName = senderObj ? senderObj.name : 'User';

              return (
                <div
                  key={msg._id}
                  className={`flex flex-col max-w-[85%] md:max-w-[65%] ${isOwn ? 'ml-auto items-end' : 'items-start'}`}
                >
                  <div
                    className={`relative px-3.5 py-2 rounded-lg text-sm leading-relaxed transition-all group ${
                      isOwn ? 'whatsapp-bubble-own rounded-tr-none' : 'whatsapp-bubble-other rounded-tl-none'
                    }`}
                  >
                    {!isOwn && isGroup && (
                      <p className="text-[11px] text-[#00a884] font-semibold mb-0.5">{senderName}</p>
                    )}

                    {/* Text Message */}
                    {msg.text && <p className="whitespace-pre-wrap font-normal text-[#e9edef] pr-12">{msg.text}</p>}

                    {/* File / Image Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {msg.attachments.map((att, idx) => (
                          <div key={idx} className="rounded-lg overflow-hidden border border-white/10 bg-black/20 p-1.5">
                            {att.type?.startsWith('image/') || att.url?.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                              <div className="relative group/img cursor-pointer" onClick={() => setPreviewImage(att.url)}>
                                <img src={att.url} alt={att.name} className="max-w-xs max-h-60 rounded-md object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                                  <Maximize2 className="w-5 h-5 text-white" />
                                </div>
                              </div>
                            ) : (
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-xs text-[#00a884] hover:underline p-1 font-medium"
                              >
                                <FileText className="w-4 h-4 shrink-0" />
                                <span className="truncate max-w-[180px]">{att.name}</span>
                                <Download className="w-3.5 h-3.5 ml-auto" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer: Timestamp & Blue Tick Read Receipts */}
                    <div className="flex items-center justify-end gap-1 text-[10px] text-[#8696a0] mt-1 text-right float-right ml-2 -mb-1">
                      <span>{format(new Date(msg.createdAt || Date.now()), 'HH:mm')}</span>
                      {isOwn && <CheckCheck className="w-3.5 h-3.5 whatsapp-tick-read" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isOtherTyping && (
            <div className="flex items-center gap-2 text-xs text-[#8696a0] bg-[#202c33] px-3 py-1.5 rounded-lg w-fit">
              <span className="w-2 h-2 rounded-full bg-[#00a884] animate-ping"></span>
              <span>typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Attached File Preview Badge */}
        {selectedFile && (
          <div className="px-4 py-2 bg-[#202c33] border-t border-[#222d34] flex items-center justify-between text-xs text-[#e9edef]">
            <span className="flex items-center gap-2 font-medium">
              <ImageIcon className="w-4 h-4 text-[#00a884]" /> Attached: <strong>{selectedFile.name}</strong>
            </span>
            <button onClick={() => setSelectedFile(null)} className="text-red-400 font-semibold hover:underline">
              Remove
            </button>
          </div>
        )}

        {/* WhatsApp Input Bar */}
        <form onSubmit={handleSendMessage} className="h-16 px-4 bg-[#202c33] flex items-center gap-2 z-20 shrink-0">
          <label className="p-2.5 text-[#8696a0] hover:text-[#e9edef] rounded-full transition-colors cursor-pointer">
            <Paperclip className="w-5 h-5" />
            <input
              type="file"
              onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
              className="hidden"
            />
          </label>

          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message"
              className="w-full px-4 py-2.5 bg-[#2a3942] rounded-lg text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={uploading || (!inputText.trim() && !selectedFile)}
            className="p-2.5 bg-[#00a884] hover:bg-[#008f6f] text-white rounded-full transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Info Drawer */}
      {showInfoDrawer && (
        <div className="w-80 h-full bg-[#111b21] border-l border-[#222d34] flex flex-col shrink-0 z-20 animate-slide-up">
          <div className="h-16 px-4 bg-[#202c33] flex items-center justify-between border-b border-[#222d34]">
            <h4 className="text-sm font-semibold text-[#e9edef] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#00a884]" /> Contact Details
            </h4>
            <button onClick={() => setShowInfoDrawer(false)} className="text-[#8696a0] hover:text-[#e9edef]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 flex flex-col items-center border-b border-[#222d34] text-center">
            <img src={avatar} alt={title} className="w-24 h-24 rounded-full object-cover mb-3" />
            <h3 className="text-base font-semibold text-[#e9edef]">{title}</h3>
            <p className="text-xs text-[#8696a0] mt-0.5">
              {conversation.groupName ? 'Group Conversation' : 'Direct Conversation'}
            </p>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            <div>
              <h5 className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-3">
                Members ({conversation.participants.length})
              </h5>
              <div className="space-y-2">
                {conversation.participants.map((member) => (
                  <div key={member._id} className="flex items-center gap-3 p-2 rounded-lg bg-[#202c33]">
                    <img
                      src={member.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${member.name}`}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="overflow-hidden flex-1">
                      <p className="text-xs font-semibold text-[#e9edef] truncate">{member.name}</p>
                      <p className="text-[11px] text-[#8696a0] truncate">@{member.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6">
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 p-2 text-white hover:text-[#00a884] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] rounded-lg object-contain" />
        </div>
      )}
    </div>
  );
};
