import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getApiBackend } from '../../../lib/providers';

export interface ChatMessagePayload {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(req: Request) {
  try {
    const { messages, provider, model, systemPrompt } = await req.json() as {
      messages: ChatMessagePayload[];
      provider: string;
      model: string;
      systemPrompt?: string;
    };

    const backend = getApiBackend(provider);

    const builtMessages: ChatMessagePayload[] = [];
    if (systemPrompt) {
      builtMessages.push({ role: 'system', content: systemPrompt });
    }
    builtMessages.push(...messages);

    if (backend === 'groq') {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) return new Response('GROQ_API_KEY is not configured.', { status: 500 });
      
      const groq = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });
      const completion = await groq.chat.completions.create({
        model,
        messages: builtMessages.map((m) => ({ role: m.role, content: m.content })),
        max_tokens: 2048,
        temperature: 0.7,
        stream: true,
      });

      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
          } catch (e) {
            console.error('Groq streaming error:', e);
          } finally {
            controller.close();
          }
        }
      });
      return new Response(stream, { headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-cache' } });
    }

    if (backend === 'mistral') {
      const apiKey = process.env.MISTRAL_API_KEY;
      if (!apiKey) return new Response('MISTRAL_API_KEY is not configured.', { status: 500 });

      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: builtMessages.map((m) => ({ role: m.role, content: m.content })),
          max_tokens: 2048,
          temperature: 0.7,
          stream: true,
        }),
      });

      if (!res.ok || !res.body) {
        const errorText = await res.text();
        return new Response(`Mistral API error: ${res.status} - ${errorText}`, { status: res.status });
      }

      const stream = new ReadableStream({
        async start(controller) {
          const reader = res.body!.getReader();
          const decoder = new TextDecoder("utf-8");
          let buffer = "";

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';
              
              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
                  try {
                    const data = JSON.parse(trimmed.slice(6));
                    const content = data.choices[0]?.delta?.content || '';
                    if (content) {
                      controller.enqueue(new TextEncoder().encode(content));
                    }
                  } catch(e) {}
                }
              }
            }
          } catch (e) {
            console.error('Mistral streaming error:', e);
          } finally {
            controller.close();
          }
        }
      });
      return new Response(stream, { headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-cache' } });
    }

    return new Response('Unknown provider.', { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error occurred.';
    return new Response(msg, { status: 500 });
  }
}
