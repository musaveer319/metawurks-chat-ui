"use client";

import React, { useState, useRef, useEffect } from 'react';
import Message, { ChatMessage } from './Message';
import InputArea from './InputArea';

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (content: string) => {
    setError(null);
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content })
      });

      if (!res.ok) {
        throw new Error('Failed to fetch from server.');
      }

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setError('An error occurred connecting to the backend mock API.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      <header className="px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm z-10 flex items-center justify-center">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">AI Assistant</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 w-full">
        <div className="max-w-4xl mx-auto flex flex-col space-y-1">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
              <svg className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <p className="text-sm font-medium">No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <Message key={msg.id} message={msg} />
            ))
          )}

          {isLoading && (
            <div className="flex justify-start my-2">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-4 rounded-2xl rounded-tl-sm flex items-center space-x-2 shadow-sm">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center mt-4">
              <span className="text-xs text-red-600 bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-full font-medium">
                {error}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
