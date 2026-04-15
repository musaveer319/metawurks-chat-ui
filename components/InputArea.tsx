'use client';

import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  providerColor?: string;
  disabled?: boolean;
}

const MAX_CHARS = 4000;

export default function InputArea({ onSendMessage, isLoading, providerColor, disabled }: InputAreaProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSubmitting = useRef(false);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !isLoading && !disabled && !isSubmitting.current) {
      isSubmitting.current = true;
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  useEffect(() => {
    if (!isLoading) {
      isSubmitting.current = false;
    }
  }, [isLoading]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const charCount = input.length;
  const nearLimit = charCount > MAX_CHARS * 0.85;
  const atLimit = charCount >= MAX_CHARS;

  const accentColor = providerColor ?? '#7c6bff';

  return (
    <div className="input-area-wrapper">
      <div className="input-area-inner">
        {/* Textarea wrapper */}
        <div
          className="input-box-shell"
          style={{ '--provider-color': accentColor } as React.CSSProperties}
        >
          <textarea
            ref={textareaRef}
            className="chat-input"
            placeholder="Ask anything… (Shift+Enter for newline)"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={handleKeyDown}
            disabled={isLoading || disabled}
            rows={1}
            autoFocus
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || disabled}
            className="send-btn"
            title="Send (Enter)"
            style={{
              background: input.trim() && !isLoading
                ? `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`
                : undefined,
            }}
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </div>

        {/* Footer row */}
        <div className="input-footer">
          <span className="input-hint">
            <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for newline
          </span>
          <span
            className="char-count"
            style={{ color: atLimit ? '#f87171' : nearLimit ? '#fbbf24' : 'var(--text-muted)' }}
          >
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
