'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getProvider } from '../lib/providers';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  provider?: string;
  model?: string;
}

interface MessageProps {
  message: ChatMessage;
  onRegenerate?: () => void;
  isLast?: boolean;
}

export default function Message({ message, onRegenerate, isLast }: MessageProps) {
  const isUser = message.role === 'user';
  const provider = message.provider ? getProvider(message.provider) : null;

  return (
    <div className={`msg-row ${isUser ? 'msg-row--user' : 'msg-row--assistant'}`}>
      {/* AI Avatar */}
      {!isUser && (
        <div
          className="msg-avatar"
          style={{
            background: provider
              ? `linear-gradient(135deg, ${provider.gradientFrom}33, ${provider.gradientTo}33)`
              : 'rgba(255,255,255,0.06)',
            border: provider
              ? `1px solid ${provider.color}44`
              : '1px solid rgba(255,255,255,0.1)',
            color: provider?.color ?? 'var(--text-secondary)',
          }}
        >
          {provider?.icon ?? '🤖'}
        </div>
      )}

      <div className={`msg-body ${isUser ? 'msg-body--user' : 'msg-body--assistant'}`}>
        {/* Provider label */}
        {!isUser && provider && (
          <div className="msg-meta">
            <span style={{ color: provider.color, fontWeight: 600 }}>
              {provider.shortName}
            </span>
            {message.model && (
              <span className="msg-model-tag">
                {message.model.replace('mistral-small-latest', 'Mistral Small 4')
                  .replace('open-mistral-nemo', 'Nemo 12B')
                  .replace('llama-3.3-70b-versatile', 'Llama 3.3 70B')
                  .replace('llama-3.1-8b-instant', 'Llama 3.1 8B')}
              </span>
            )}
          </div>
        )}

        {/* Bubble */}
        <div className={`msg-bubble ${isUser ? 'msg-bubble--user' : 'msg-bubble--assistant'}`}>
          {isUser ? (
            <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose-custom">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer: timestamp + retry */}
        <div className={`msg-footer ${isUser ? 'msg-footer--user' : ''}`}>
          <span className="msg-time">{message.timestamp}</span>
          {!isUser && isLast && onRegenerate && (
            <button onClick={onRegenerate} className="retry-btn" title="Regenerate response">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </button>
          )}
        </div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="msg-avatar msg-avatar--user">U</div>
      )}
    </div>
  );
}
