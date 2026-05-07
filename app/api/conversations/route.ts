import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import connectToDatabase from '../../../lib/mongodb';
import Conversation from '../../../lib/models/Conversation';

// GET /api/conversations — list all conversations (newest first)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const convos = await Conversation.find({ userEmail: session.user.email })
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    
    const newConvo = await Conversation.create({
      title:    body.title    ?? 'New Chat',
      provider: body.provider,
      modelId:  body.modelId ?? body.model,
      persona:  body.persona  ?? 'default',
      messages: body.messages ?? [],
      userEmail: session.user.email,
    });
    
    return NextResponse.json({ conversation: newConvo }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'DB error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
