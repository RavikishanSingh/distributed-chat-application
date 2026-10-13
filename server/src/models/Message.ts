import mongoose, { Schema, Document } from 'mongoose';

export interface IReaction {
  emoji: string;
  userId: mongoose.Types.ObjectId;
}

export interface IAttachment {
  url: string;
  type: string;
  name: string;
  size?: number;
}

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
  attachments: IAttachment[];
  reactions: IReaction[];
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, default: '' },
    attachments: [
      {
        url: { type: String, required: true },
        type: { type: String, required: true },
        name: { type: String, required: true },
        size: { type: Number },
      },
    ],
    reactions: [
      {
        emoji: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      },
    ],
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
