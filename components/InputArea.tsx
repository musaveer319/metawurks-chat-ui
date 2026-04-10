import React, { useState, KeyboardEvent } from 'react';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function InputArea({ onSendMessage, isLoading }: InputAreaProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <textarea
          className="flex-1 px-6 py-4 bg-gray-100 outline-none border border-transparent dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-950 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl text-gray-900 dark:text-gray-100 transition-all text-lg resize-none"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={3}
          autoFocus
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="px-8 py-4 mb-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-full transition-all flex items-center justify-center shadow-sm text-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
