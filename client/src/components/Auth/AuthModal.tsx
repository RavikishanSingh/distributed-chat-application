import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogIn, UserPlus, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { login, signUp } = useAuth();
  const [isRegister, setIsRegister] = useState<boolean>(false);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const res = await signUp(email, password, username, name);
        if (res.error) {
          setError(res.error);
        }
      } else {
        const res = await login(email, password);
        if (res.error) {
          setError(res.error);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoAdmin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await login('admin@chat.com', 'admin123');
      if (res.error) {
        const signUpRes = await signUp('admin@chat.com', 'admin123', 'admin', 'Ravikishan (Admin)');
        if (signUpRes.error) setError(signUpRes.error);
      }
    } catch (err: any) {
      setError('Quick Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoUser = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await login('madhav@chat.com', 'user123');
      if (res.error) {
        const signUpRes = await signUp('madhav@chat.com', 'user123', 'madhav', 'Madhav Pisal');
        if (signUpRes.error) setError(signUpRes.error);
      }
    } catch (err: any) {
      setError('Quick Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl select-none">
      {/* Background Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-modal rounded-3xl p-8 border border-indigo-500/30 shadow-2xl relative">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-3">
            <MessageSquare className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            {isRegister ? <UserPlus className="w-5 h-5 text-indigo-400" /> : <LogIn className="w-5 h-5 text-indigo-400" />}
            {isRegister ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-chat-muted mt-1">
            {isRegister ? 'Join the Supabase real-time messaging network' : 'Sign in to access your serverless chat workspace'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-chat-muted mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ravikishan Singh"
                  className="w-full px-4 py-2.5 bg-[#070A12] border border-indigo-500/20 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-chat-muted mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. ravikishan"
                  className="w-full px-4 py-2.5 bg-[#070A12] border border-indigo-500/20 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-chat-muted mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-4 py-2.5 bg-[#070A12] border border-indigo-500/20 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-chat-muted mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-[#070A12] border border-indigo-500/20 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-chat-muted mb-1">About / Bio</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Short bio..."
                className="w-full px-4 py-2.5 bg-[#070A12] border border-indigo-500/20 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg glow-button cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-indigo-500/15">
          <div className="text-center mb-3">
            <span className="text-xs text-chat-muted flex items-center justify-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Fast Demo Access
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleQuickDemoAdmin}
              className="py-2.5 px-3 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-200 border border-indigo-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer hover:scale-[1.02]"
            >
              Demo Admin (Ravikishan)
            </button>
            <button
              onClick={handleQuickDemoUser}
              className="py-2.5 px-3 bg-[#202c33] hover:bg-[#374248] text-[#00a884] border border-[#222d34] rounded-xl text-xs font-semibold transition-all cursor-pointer hover:scale-[1.02]"
            >
              Demo User (Madhav)
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register Now"}
          </button>
        </div>
      </div>
    </div>
  );
};
