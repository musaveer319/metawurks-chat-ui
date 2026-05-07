
export interface ChatMessagePayload {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Forward the request to the Python Agno backend
    const response = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(`Backend Error: ${errorText}`, { status: response.status });
    }

    // The FastAPI backend returns a chunked text stream.
    // We pipe this directly back to the Next.js frontend client.
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });

  } catch (error: any) {
    console.error("Fetch Error:", error, error.cause);
    const msg = error instanceof Error ? (error.cause ? `${error.message} (Cause: ${error.cause})` : error.message) : 'Unknown error occurred.';
    return new Response(`Failed to connect to Python backend: ${msg}`, { status: 500 });
  }
}

