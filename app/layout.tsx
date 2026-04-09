import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Metawurks Chat UI',
  description: 'Internship Task 1 - Chat UI Interface',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
