export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Forward the formData to the Python backend
    const response = await fetch('http://localhost:8000/upload', {
      method: 'POST',
      body: formData, // fetch will automatically set the correct multipart/form-data boundary
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `Backend Error: ${errorText}` }), { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error occurred.';
    return new Response(JSON.stringify({ error: `Failed to connect to Python backend: ${msg}` }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
