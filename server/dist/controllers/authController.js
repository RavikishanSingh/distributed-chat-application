"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const store_1 = require("../services/store");
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_distributed_chat_jwt_key_2026!';
const register = async (req, res) => {
    try {
        const { name, username, email, password, avatar, bio } = req.body;
        if (!name || !username || !email || !password) {
            return res.status(400).json({ error: 'Name, username, email, and password are required' });
        }
        const existingEmail = await store_1.StoreService.findUserByEmail(email);
        if (existingEmail) {
            return res.status(400).json({ error: 'Email is already registered' });
        }
        const existingUsername = await store_1.StoreService.findUserByUsername(username);
        if (existingUsername) {
            return res.status(400).json({ error: 'Username is already taken' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const defaultAvatar = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;
        const user = await store_1.StoreService.createUser({
            name,
            username,
            email,
            password: hashedPassword,
            avatar: defaultAvatar,
            bio: bio || 'Hey there! I am using Distributed Chat.',
        });
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Server error during registration' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await store_1.StoreService.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        await store_1.StoreService.updateUser(user._id, { status: 'online' });
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Server error during login' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const user = await store_1.StoreService.findUserById(userId);
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { name, bio, avatar, password } = req.body;
        const updateData = {};
        if (name)
            updateData.name = name;
        if (bio !== undefined)
            updateData.bio = bio;
        if (avatar)
            updateData.avatar = avatar;
        if (password) {
            updateData.password = await bcryptjs_1.default.hash(password, 10);
        }
        const updatedUser = await store_1.StoreService.updateUser(userId, updateData);
        res.json({ message: 'Profile updated successfully', user: updatedUser });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateProfile = updateProfile;
