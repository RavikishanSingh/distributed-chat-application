import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { StoreService } from '../services/store';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_distributed_chat_jwt_key_2026!';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, username, email, password, avatar, bio } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: 'Name, username, email, and password are required' });
    }

    const existingEmail = await StoreService.findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const existingUsername = await StoreService.findUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultAvatar = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;

    const user = await StoreService.createUser({
      name,
      username,
      email,
      password: hashedPassword,
      avatar: defaultAvatar,
      bio: bio || 'Hey there! I am using Distributed Chat.',
    });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await StoreService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await StoreService.updateUser(user._id, { status: 'online' });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        status: 'online',
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error during login' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await StoreService.findUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, bio, avatar, password } = req.body;
    const updateData: any = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar) updateData.avatar = avatar;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await StoreService.updateUser(userId, updateData);
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
