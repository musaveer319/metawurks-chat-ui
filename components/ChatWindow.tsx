'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Message, { ChatMessage } from './Message';
import InputArea from './InputArea';
import Sidebar from './Sidebar';
import { AI_PROVIDERS, AIProvider, SYSTEM_PROMPTS } from '../lib/providers';

interface ConversationMeta {
  _id: string;
  title: string;
  provider: string;
  model: string;
  persona: string;
  updatedAt: string;
}

export default function ChatWindow() {
  const [messages, setMessages]               = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading]             = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(AI_PROVIDERS[0]);
  const [selectedModel, setSelectedModel]     = useState(AI_PROVIDERS[0].models[0].id);
  const [selectedSystemPrompt, setSelectedSystemPrompt] = useState('default');
  const [sidebarOpen, setSidebarOpen]         = useState(true);
  const [convId, setConvId]                   = useState<string | null>(null);
  const [conversations, setConversations]     = useState<ConversationMeta[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load conversation list on mount
  // Use AbortSignal.timeout so a slow/unreachable MongoDB never freezes the UI
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations');
      const data = await res.json();
      if (data.conversations) setConversations(data.conversations);
    } catch { /* ignore — DB unreachable or timed out */ }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Load a specific past conversation
  const handleLoadConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      const data = await res.json();
      if (!data.conversation) return;
      const c = data.conversation;
      const provider = AI_PROVIDERS.find((p) => p.id === c.provider) ?? AI_PROVIDERS[0];
      setSelectedProvider(provider);
      setSelectedModel(c.model);
      setSelectedSystemPrompt(c.persona);
      setMessages(
        c.messages.map((m: ChatMessage, i: number) => ({
          ...m,
          id: String(i),
          provider: m.role === 'assistant' ? c.provider : undefined,
          model:    m.role === 'assistant' ? c.model    : undefined,
        }))
      );
      setConvId(id);
      setError(null);
    } catch (err) {
      console.error('Failed to load conversation', err);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
    setConversations((prev) => prev.filter((c) => c._id !== id));
    if (convId === id) handleNewChat();
  };

  const handleNewChat = () => {
    setMessages([]);
    setConvId(null);
    setError(null);
  };

  const handleSelectProvider = (provider: AIProvider) => {
    setSelectedProvider(provider);
    setError(null);
  };

  const getSystemPromptText = () =>
    SYSTEM_PROMPTS.find((p) => p.id === selectedSystemPrompt)?.prompt ?? '';

  const handleSendMessage = async (content: string) => {
    setError(null);
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Call AI
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages:    updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          provider:    selectedProvider.id,
          model:       selectedModel,
          systemPrompt: getSystemPromptText(),
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to get a response.');
      }

      // Hide the bouncing dots once we get the first response byte
      setIsLoading(false);

      const botMsgId = (Date.now() + 1).toString();
      const botMsg: ChatMessage = {
        id: botMsgId,
        content: '',
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: selectedProvider.id,
        model: selectedModel,
      };

      setMessages((prev) => [...prev, botMsg]);

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Stream not available");
      const decoder = new TextDecoder("utf-8");
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunkStr = decoder.decode(value, { stream: true });
        fullContent += chunkStr;
        
        // Progressive UI update
        setMessages((prev) => prev.map((m) => m.id === botMsgId ? { ...m, content: fullContent } : m));
      }

      botMsg.content = fullContent;
      const finalMessages = [...updatedMessages, botMsg];

      // Save / update in MongoDB AFTER streaming completes
      const allMsgs = finalMessages.map((m) => ({
        role:      m.role,
        content:   m.content,
        timestamp: m.timestamp,
        modelId:   m.model,
      }));

      if (!convId) {
        // Create new conversation
        const title = content.slice(0, 60) + (content.length > 60 ? '…' : '');
        const saveRes = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            provider: selectedProvider.id,
            modelId:  selectedModel,
            persona:  selectedSystemPrompt,
            messages: allMsgs,
          }),
        });
        const saveData = await saveRes.json();
        if (saveData.conversation?._id) {
          setConvId(saveData.conversation._id);
          await fetchConversations();
        }
      } else {
        // Update existing
        await fetch(`/api/conversations/${convId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: allMsgs }),
        });
        await fetchConversations();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    const trimmed = [...messages];
    if (trimmed[trimmed.length - 1]?.role === 'assistant') trimmed.pop();
    setMessages(trimmed);
    await handleSendMessage(lastUser.content);
  };

  const handleExportChat = () => {
    const sp = SYSTEM_PROMPTS.find((p) => p.id === selectedSystemPrompt);
    const lines = [
      `# NexusChat Export`,
      `Model: ${selectedProvider.shortName} — ${selectedProvider.models.find((m) => m.id === selectedModel)?.name}`,
      `Persona: ${sp?.label}`,
      `Date: ${new Date().toLocaleString()}`,
      `---`, '',
    ];
    messages.forEach((m) => {
      lines.push(`**${m.role === 'user' ? 'You' : selectedProvider.shortName}** (${m.timestamp})`);
      lines.push(m.content); lines.push('');
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `nexuschat-${Date.now()}.md`; a.click();
    URL.revokeObjectURL(url);
  };

  const quickPrompts = [
    { emoji: '🧪', text: 'Explain quantum computing in simple terms' },
    { emoji: '💡', text: 'Give me 5 creative startup ideas for 2025' },
    { emoji: '🔧', text: 'Write a Python web scraper with requests' },
    { emoji: '✍️', text: 'Write a short poem about the night sky' },
    { emoji: '🧠', text: 'What are the pros and cons of AI in education?' },
    { emoji: '🌍', text: 'Explain climate change to a 10-year-old' },
  ];

  const currentSP    = SYSTEM_PROMPTS.find((p) => p.id === selectedSystemPrompt);
  const currentModel = selectedProvider.models.find((m) => m.id === selectedModel);

  return (
    <div className="chat-shell">
      {sidebarOpen && (
        <Sidebar
          selectedProvider={selectedProvider}
          selectedModel={selectedModel}
          selectedSystemPrompt={selectedSystemPrompt}
          onSelectProvider={handleSelectProvider}
          onSelectModel={setSelectedModel}
          onSelectSystemPrompt={setSelectedSystemPrompt}
          messageCount={messages.length}
          onClearChat={handleNewChat}
          onExportChat={handleExportChat}
          conversations={conversations}
          activeConvId={convId}
          onLoadConversation={handleLoadConversation}
          onDeleteConversation={handleDeleteConversation}
          onNewChat={handleNewChat}
        />
      )}

      <div className="chat-main">
        {/* Header */}
        <header className="app-header">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="icon-btn" title="Toggle sidebar">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="header-model-chip">
            <span
              className="header-model-icon"
              style={{
                background: `linear-gradient(135deg, ${selectedProvider.gradientFrom}33, ${selectedProvider.gradientTo}33)`,
                border: `1px solid ${selectedProvider.color}44`,
                color: selectedProvider.color,
              }}
            >
              {selectedProvider.icon}
            </span>
            <div>
              <p className="header-model-name">{selectedProvider.shortName}</p>
              <p className="header-model-sub">{currentModel?.name}</p>
            </div>
          </div>

          <div className="header-persona-chip">{currentSP?.icon} {currentSP?.label}</div>
          <div className="flex-1" />

          <div className="header-status">
            <div className="status-pulse" style={{ background: isLoading ? '#f59e0b' : '#10b981' }} />
            <span className="hidden sm:block" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {isLoading ? 'Thinking…' : 'Ready'}
            </span>
          </div>
          {messages.length > 0 && <span className="badge">{messages.length} msgs</span>}
          {convId && (
            <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
              💾 Saved
            </span>
          )}
        </header>

        {/* Messages */}
        <div className="messages-scroll">
          <div className="messages-inner">
            {messages.length === 0 ? (
              <div className="welcome-screen fade-in">
                <div className="welcome-icon" style={{ color: selectedProvider.color }}>
                  {selectedProvider.icon}
                </div>
                <div className="welcome-text">
                  <h2 className="welcome-title">Chat with {selectedProvider.shortName}</h2>
                  <p className="welcome-sub">
                    Using <span style={{ color: selectedProvider.color, fontWeight: 600 }}>{currentModel?.name}</span>
                    {' '}· {selectedProvider.freeTierNote}
                  </p>
                  <p className="welcome-persona">{currentSP?.icon} Persona: <strong>{currentSP?.label}</strong></p>
                </div>
                <div className="quick-prompts-grid">
                  {quickPrompts.map(({ emoji, text }) => (
                    <button
                      key={text}
                      onClick={() => handleSendMessage(text)}
                      className="quick-prompt-btn"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${selectedProvider.color}55`;
                        e.currentTarget.style.background  = `${selectedProvider.color}0d`;
                        e.currentTarget.style.color       = 'var(--text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.background  = 'var(--bg-card)';
                        e.currentTarget.style.color       = 'var(--text-secondary)';
                      }}
                    >
                      <span className="quick-prompt-emoji">{emoji}</span>
                      <p className="quick-prompt-text">{text}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <Message
                  key={msg.id}
                  message={msg}
                  isLast={i === messages.length - 1}
                  onRegenerate={handleRegenerate}
                />
              ))
            )}

            {isLoading && (
              <div className="flex items-start fade-in">
                <div className="typing-bubble" style={{ borderColor: `${selectedProvider.color}33` }}>
                  <span className="mr-2 text-base" style={{ color: selectedProvider.color }}>{selectedProvider.icon}</span>
                  <div className="typing-dot" style={{ background: selectedProvider.color }} />
                  <div className="typing-dot" style={{ background: selectedProvider.color }} />
                  <div className="typing-dot" style={{ background: selectedProvider.color }} />
                </div>
              </div>
            )}

            {error && (
              <div className="error-card fade-in">
                <span className="text-lg flex-shrink-0">⚠️</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: '#ff8080' }}>Error</p>
                  <p className="text-xs mt-0.5 break-words" style={{ color: 'var(--text-secondary)' }}>{error}</p>
                </div>
                <button onClick={() => setError(null)} className="icon-btn" style={{ fontSize: '0.75rem' }}>✕</button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <InputArea
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          providerColor={selectedProvider.color}
        />
      </div>
    </div>
  );
}
