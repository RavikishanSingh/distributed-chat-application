-- ==============================================================================
-- DISTRIBUTED CHAT APPLICATION - WHATSAPP STYLE DEMO SEED SCRIPT
-- ==============================================================================
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- It seeds auth.users, profiles, channels, memberships, and real-time chat messages.
-- ==============================================================================

DO $$
DECLARE
    -- Fixed UUIDs for predictable references
    admin_id  UUID := '65000000-0000-0000-0000-000000000001';
    madhav_id UUID := '65000000-0000-0000-0000-000000000002';
    priya_id  UUID := '65000000-0000-0000-0000-000000000003';
    swati_id  UUID := '65000000-0000-0000-0000-000000000004';
    rajesh_id UUID := '65000000-0000-0000-0000-000000000005';

    group1_id  UUID := '75000000-0000-0000-0000-000000000010';
    group2_id  UUID := '75000000-0000-0000-0000-000000000020';
    direct1_id UUID := '75000000-0000-0000-0000-000000000030';
BEGIN

    -- 1. CLEANUP PREVIOUS MOCK DATA IF IT EXISTS
    DELETE FROM public.messages WHERE channel_id IN (group1_id, group2_id, direct1_id);
    DELETE FROM public.channel_members WHERE channel_id IN (group1_id, group2_id, direct1_id);
    DELETE FROM public.channels WHERE id IN (group1_id, group2_id, direct1_id);
    DELETE FROM public.profiles WHERE email IN ('admin@chat.com', 'madhav@chat.com', 'priya@chat.com', 'swati@chat.com', 'rajesh@chat.com');
    DELETE FROM auth.users WHERE email IN ('admin@chat.com', 'madhav@chat.com', 'priya@chat.com', 'swati@chat.com', 'rajesh@chat.com');

    -- 2. SEED AUTH USERS
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, recovery_sent_at, last_sign_in_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, email_change, email_change_token_new, recovery_token
    )
    VALUES
    (
        '00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated',
        'admin@chat.com', crypt('admin123', gen_salt('bf')), now(), now(), now(),
        '{"provider":"email","providers":["email"]}', '{"name":"Ravikishan Singh (Admin)","username":"ravikishan"}',
        now(), now(), '', '', '', ''
    ),
    (
        '00000000-0000-0000-0000-000000000000', madhav_id, 'authenticated', 'authenticated',
        'madhav@chat.com', crypt('user123', gen_salt('bf')), now(), now(), now(),
        '{"provider":"email","providers":["email"]}', '{"name":"Madhav Pisal","username":"madhav"}',
        now(), now(), '', '', '', ''
    ),
    (
        '00000000-0000-0000-0000-000000000000', priya_id, 'authenticated', 'authenticated',
        'priya@chat.com', crypt('user123', gen_salt('bf')), now(), now(), now(),
        '{"provider":"email","providers":["email"]}', '{"name":"Priya Gorai","username":"priya"}',
        now(), now(), '', '', '', ''
    ),
    (
        '00000000-0000-0000-0000-000000000000', swati_id, 'authenticated', 'authenticated',
        'swati@chat.com', crypt('user123', gen_salt('bf')), now(), now(), now(),
        '{"provider":"email","providers":["email"]}', '{"name":"Swati Thakur","username":"swati"}',
        now(), now(), '', '', '', ''
    ),
    (
        '00000000-0000-0000-0000-000000000000', rajesh_id, 'authenticated', 'authenticated',
        'rajesh@chat.com', crypt('user123', gen_salt('bf')), now(), now(), now(),
        '{"provider":"email","providers":["email"]}', '{"name":"Rajesh Gurjar","username":"rajesh"}',
        now(), now(), '', '', '', ''
    )
    ON CONFLICT (id) DO NOTHING;

    -- 3. SEED PROFILES
    INSERT INTO public.profiles (id, username, name, email, avatar_url, bio, status, role)
    VALUES 
    (
        admin_id,
        'ravikishan',
        'Ravikishan Singh (Admin)',
        'admin@chat.com',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        'System Administrator & Distributed Systems Lead',
        'online',
        'admin'
    ),
    (
        madhav_id,
        'madhav',
        'Madhav Pisal',
        'madhav@chat.com',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        'Backend & Distributed Systems Engineer',
        'online',
        'user'
    ),
    (
        priya_id,
        'priya',
        'Priya Gorai',
        'priya@chat.com',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        'Frontend Lead & UI Specialist',
        'online',
        'user'
    ),
    (
        swati_id,
        'swati',
        'Swati Thakur',
        'swati@chat.com',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        'DevOps & Cloud Infrastructure Engineer',
        'offline',
        'user'
    ),
    (
        rajesh_id,
        'rajesh',
        'Rajesh Gurjar',
        'rajesh@chat.com',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        'Database Administrator & Data Architect',
        'online',
        'user'
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        username = EXCLUDED.username,
        email = EXCLUDED.email,
        avatar_url = EXCLUDED.avatar_url,
        bio = EXCLUDED.bio,
        status = EXCLUDED.status;

    -- 4. SEED CHANNELS
    INSERT INTO public.channels (id, name, description, type, avatar_url, created_by)
    VALUES
    (
        group1_id,
        'Distributed Core Team',
        'Main group chat for engineering updates and announcements',
        'group',
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
        admin_id
    ),
    (
        group2_id,
        'DevOps & Cloud Scale',
        'Redis Pub/Sub cluster monitoring and Nginx load balancing',
        'group',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150&auto=format&fit=crop&q=80',
        swati_id
    ),
    (
        direct1_id,
        'direct_admin_madhav',
        'Direct Chat between Ravikishan & Madhav',
        'direct',
        '',
        admin_id
    )
    ON CONFLICT (id) DO NOTHING;

    -- 5. SEED CHANNEL MEMBERS
    INSERT INTO public.channel_members (channel_id, user_id)
    VALUES
    (group1_id, admin_id), (group1_id, madhav_id), (group1_id, priya_id), (group1_id, swati_id), (group1_id, rajesh_id),
    (group2_id, admin_id), (group2_id, swati_id), (group2_id, madhav_id), (group2_id, rajesh_id),
    (direct1_id, admin_id), (direct1_id, madhav_id)
    ON CONFLICT (channel_id, user_id) DO NOTHING;

    -- 6. SEED MESSAGES
    INSERT INTO public.messages (id, channel_id, sender_id, content, attachments, reactions, created_at)
    VALUES
    (
        '85000000-0000-0000-0000-000000000101',
        group1_id,
        admin_id,
        'Welcome everyone to the Distributed Real-Time Chat Platform.',
        '[]'::jsonb,
        '[]'::jsonb,
        now() - INTERVAL '2 hours'
    ),
    (
        '85000000-0000-0000-0000-000000000102',
        group1_id,
        madhav_id,
        'Hey Ravikishan! The multi-node backend with Redis Pub/Sub is running smoothly.',
        '[]'::jsonb,
        '[]'::jsonb,
        now() - INTERVAL '1 hour 45 minutes'
    ),
    (
        '85000000-0000-0000-0000-000000000103',
        group1_id,
        priya_id,
        'Awesome! The React WhatsApp Web dark mode UI and sub-100ms real-time latency look super clean.',
        '[]'::jsonb,
        '[]'::jsonb,
        now() - INTERVAL '1 hour 30 minutes'
    ),
    (
        '85000000-0000-0000-0000-000000000104',
        group1_id,
        swati_id,
        'Nginx reverse proxy and Docker container healthchecks are passing on all ports.',
        '[]'::jsonb,
        '[]'::jsonb,
        now() - INTERVAL '45 minutes'
    ),
    (
        '85000000-0000-0000-0000-000000000105',
        group1_id,
        rajesh_id,
        'Here are the MongoDB & Supabase PostgreSQL query indexing benchmarks.',
        '[{"url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80", "name": "system_architecture_benchmark.png", "type": "image/png"}]'::jsonb,
        '[]'::jsonb,
        now() - INTERVAL '20 minutes'
    ),
    (
        '85000000-0000-0000-0000-000000000201',
        group2_id,
        swati_id,
        'Nginx load balancer has been configured for round-robin across port 5000 and 5001.',
        '[]'::jsonb,
        '[]'::jsonb,
        now() - INTERVAL '3 hours'
    ),
    (
        '85000000-0000-0000-0000-000000000202',
        group2_id,
        admin_id,
        'Great work Swati! Docker Compose orchestration will spin up all 6 services with docker-compose up.',
        '[]'::jsonb,
        '[]'::jsonb,
        now() - INTERVAL '2 hours 15 minutes'
    ),
    (
        '85000000-0000-0000-0000-000000000301',
        direct1_id,
        madhav_id,
        'Hi Ravikishan, do you want to review the admin dashboard analytics panel today?',
        '[]'::jsonb,
        '[]'::jsonb,
        now() - INTERVAL '50 minutes'
    ),
    (
        '85000000-0000-0000-0000-000000000302',
        direct1_id,
        admin_id,
        'Yes! Everything looks great. All server nodes, active users, and message counts are streaming live.',
        '[]'::jsonb,
        '[]'::jsonb,
        now() - INTERVAL '15 minutes'
    )
    ON CONFLICT (id) DO NOTHING;

END $$;
