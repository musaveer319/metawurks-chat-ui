import ChatWindow from '../components/ChatWindow';

export default function Home() {
  return (
    <main className="flex h-screen w-screen overflow-hidden">
      <div className="animated-bg" />
      <ChatWindow />
    </main>
  );
}
