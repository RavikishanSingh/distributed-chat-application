import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  isGroup: boolean;
  groupName?: string;
  groupAdmin?: mongoose.Types.ObjectId;
  groupAvatar?: string;
  participants: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    isGroup: { type: Boolean, default: false },
    groupName: { type: String, trim: true },
    groupAdmin: { type: Schema.Types.ObjectId, ref: 'User' },
    groupAvatar: { type: String, default: '' },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  },
  { timestamps: true }
);

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
