import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NexusChat — Multi-AI Assistant',
  description: 'Chat with Gemini, Llama, GPT-4, and Claude in one beautiful interface.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
