import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password?: string;
  avatar: string;
  bio: string;
  status: 'online' | 'offline';
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '' },
    bio: { type: String, default: 'Hey there! I am using Distributed Chat.' },
    status: { type: String, enum: ['online', 'offline'], default: 'offline' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
