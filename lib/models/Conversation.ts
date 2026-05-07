import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  modelId?: string;
  provider?: string;
}

export interface IConversation extends Document {
  title: string;
  provider: string;
  modelId: string;
  persona: string;
  messages: IMessage[];
  userEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: String, required: true },
  modelId: { type: String },
  provider: { type: String }
});

const ConversationSchema = new Schema<IConversation>(
  {
    title: { type: String, required: true, default: 'New Chat' },
    provider: { type: String, required: true },
    modelId: { type: String, required: true },
    persona: { type: String, required: true, default: 'default' },
    messages: { type: [MessageSchema], default: [] },
    userEmail: { type: String, required: true },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

if (mongoose.models.Conversation) {
  delete mongoose.models.Conversation;
}
export default mongoose.model<IConversation>('Conversation', ConversationSchema);
