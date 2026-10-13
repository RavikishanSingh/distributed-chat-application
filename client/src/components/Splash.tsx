import React from 'react';
import { MessageSquare, Shield, Cpu, Zap, ArrowRight, Radio, Sparkles, Server } from 'lucide-react';

interface SplashProps {
  onStart: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070A12] p-6 overflow-hidden select-none">
      {/* Dynamic Ambient Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-gradient-to-br from-indigo-500/15 to-cyan-500/15 rounded-full blur-[100px] pointer-events-none animate-float"></div>
      <div className="absolute top-10 left-10 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[90px] pointer-events-none"></div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d0f_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0f_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

      <div className="relative z-10 text-center max-w-3xl mx-auto space-y-8">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full backdrop-blur-md text-xs font-semibold text-indigo-300 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Distributed Real-Time Messaging Platform</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-3xl backdrop-blur-xl shadow-2xl mb-2 animate-float">
            <MessageSquare className="w-14 h-14 text-indigo-400" />
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Seamless Real-Time <br />
            <span className="gradient-text">Distributed Chat</span>
          </h1>

          <p className="text-base md:text-lg text-chat-muted leading-relaxed max-w-xl mx-auto font-normal">
            Serverless architecture powered by Supabase PostgreSQL, Real-Time WebSockets, Supabase Storage, and instantaneous multi-client synchronization.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-2">
          <div className="p-5 rounded-2xl glass-card border border-indigo-500/20 hover:border-indigo-500/40 transition-all hover:scale-[1.02] shadow-lg group">
            <div className="p-2.5 w-fit rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Instant Messaging</h3>
            <p className="text-xs text-chat-muted leading-relaxed">Sub-100ms message delivery via Postgres Realtime subscriptions.</p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-purple-500/20 hover:border-purple-500/40 transition-all hover:scale-[1.02] shadow-lg group">
            <div className="p-2.5 w-fit rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors mb-3">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Netlify 1-Click Host</h3>
            <p className="text-xs text-chat-muted leading-relaxed">Zero backend server management or Docker container costs.</p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover:scale-[1.02] shadow-lg group">
            <div className="p-2.5 w-fit rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Enterprise Auth</h3>
            <p className="text-xs text-chat-muted leading-relaxed">Secure authentication, profile state, and media attachments.</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base rounded-2xl transition-all shadow-xl glow-button cursor-pointer"
          >
            <span>Launch Chat Workspace</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
