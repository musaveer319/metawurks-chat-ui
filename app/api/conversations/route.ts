import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import Conversation from '../../../lib/models/Conversation';

// GET /api/conversations — list all conversations (newest first)
export async function GET() {
  try {
    await connectToDatabase();
    const convos = await Conversation.find()
      .sort({ updatedAt: -1 })
      .select('title provider modelId persona createdAt updatedAt messages')
      .lean();
    
    // Only return the last message to save bandwidth for the sidebar
    const formatted = convos.map(c => ({
      ...c,
      messages: c.messages && c.messages.length > 0 ? [c.messages[c.messages.length - 1]] : []
    })).slice(0, 50);

    return NextResponse.json({ conversations: formatted });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'DB error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/conversations — create a new conversation
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    
    const newConvo = await Conversation.create({
      title:    body.title    ?? 'New Chat',
      provider: body.provider,
      modelId:  body.modelId ?? body.model,
      persona:  body.persona  ?? 'default',
      messages: body.messages ?? [],
    });
    
    return NextResponse.json({ conversation: newConvo }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'DB error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
