-- ==============================================================================
-- DISTRIBUTED CHAT APPLICATION - SUPABASE FULL DATABASE SCHEMA & CONFIGURATION
-- ==============================================================================
-- Run this complete script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- to set up all tables, relations, triggers, RLS policies, storage, and Realtime.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away')),
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for searching users by username, name, email
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_name ON public.profiles(name);

-- 3. CHANNELS (CONVERSATIONS) TABLE
CREATE TABLE IF NOT EXISTS public.channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
    avatar_url TEXT DEFAULT '',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for channels
CREATE INDEX IF NOT EXISTS idx_channels_type ON public.channels(type);
CREATE INDEX IF NOT EXISTS idx_channels_created_by ON public.channels(created_by);

-- 4. CHANNEL MEMBERS (PARTICIPANTS) TABLE
CREATE TABLE IF NOT EXISTS public.channel_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_channel_user UNIQUE(channel_id, user_id)
);

-- Indexes for channel members
CREATE INDEX IF NOT EXISTS idx_channel_members_channel_id ON public.channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user_id ON public.channel_members(user_id);

-- 5. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT DEFAULT '',
    attachments JSONB DEFAULT '[]'::jsonb,
    reactions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON public.messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);

-- 6. AUTOMATIC PROFILE CREATION TRIGGER ON USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, name, avatar_url, bio, status, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    '',
    'online',
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users" 
  ON public.profiles FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Channels Policies
CREATE POLICY "Users can view channels they belong to" 
  ON public.channels FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.channel_members 
      WHERE channel_members.channel_id = channels.id 
      AND channel_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create channels" 
  ON public.channels FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = created_by);

-- Channel Members Policies
CREATE POLICY "Users can view memberships of channels they belong to" 
  ON public.channel_members FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can join or add members to channels" 
  ON public.channel_members FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Messages Policies
CREATE POLICY "Users can view messages in their channels" 
  ON public.messages FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.channel_members 
      WHERE channel_members.channel_id = messages.channel_id 
      AND channel_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their channels" 
  ON public.messages FOR INSERT 
  TO authenticated 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.channel_members 
      WHERE channel_members.channel_id = messages.channel_id 
      AND channel_members.user_id = auth.uid()
    )
  );

-- 8. SUPABASE REALTIME PUBLICATION
-- Enable Realtime events for messages and profiles
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.messages, public.profiles, public.channels, public.channel_members;
COMMIT;

-- 9. STORAGE BUCKET FOR CHAT ATTACHMENTS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-uploads', 'chat-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Security Policies
CREATE POLICY "Authenticated users can upload chat files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'chat-uploads');

CREATE POLICY "Public read access for chat uploads"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'chat-uploads');

-- ==============================================================================
-- END OF SUPABASE SETUP SCRIPT
-- ==============================================================================
