import type { Metadata } from 'next';
import './globals.css';
import { NextAuthProvider } from '../components/NextAuthProvider';

export const metadata: Metadata = {
  title: 'Chat Ai — Multi-AI Assistant',
  description: 'Chat with Gemini, Llama, GPT-4, and Claude in one beautiful interface.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
