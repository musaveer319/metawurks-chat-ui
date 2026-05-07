import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import connectToDatabase from '../../../../lib/mongodb';
import Conversation from '../../../../lib/models/Conversation';

// GET /api/conversations/[id] — load a single conversation
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const convo = await Conversation.findOne({ _id: id, userEmail: session.user.email }).lean();
    
    if (!convo) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ conversation: convo });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'DB error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH /api/conversations/[id] — append messages / update title
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const update: Record<string, unknown> = {};
    if (body.messages) update.messages = body.messages;
    if (body.title)    update.title    = body.title;

    const convo = await Conversation.findOneAndUpdate({ _id: id, userEmail: session.user.email }, update, { new: true }).lean();

    if (!convo) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ conversation: convo });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'DB error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/conversations/[id] — remove a conversation
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    await Conversation.findOneAndDelete({ _id: id, userEmail: session.user.email });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'DB error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
