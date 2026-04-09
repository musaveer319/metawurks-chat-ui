import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const mockResponses = [
      "That's an interesting point. Could you elaborate?",
      "I am a mock backend. I hear you loud and clear!",
      `You said: "${message}". I agree wholeheartedly.`,
      "As an AI developed for this Metawurks task, I'm here to simulate a chat response.",
      "Could you tell me more about that?",
      "Next.js App Router integrates backend APIs seamlessly."
    ];

    const randomReply = mockResponses[Math.floor(Math.random() * mockResponses.length)];

    // Simulate network latency (1-2 seconds)
    const delay = Math.floor(Math.random() * 1000) + 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    return NextResponse.json({ reply: randomReply });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process the request" },
      { status: 500 }
    );
  }
}
