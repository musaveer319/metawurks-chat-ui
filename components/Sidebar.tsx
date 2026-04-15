'use client';

import React, { useState } from 'react';
import { AI_PROVIDERS, AIProvider, SYSTEM_PROMPTS } from '../lib/providers';

interface ConversationMeta {
  _id: string;
  title: string;
  provider: string;
  model: string;
  persona: string;
  updatedAt: string;
}

interface SidebarProps {
  selectedProvider: AIProvider;
  selectedModel: string;
  selectedSystemPrompt: string;
  onSelectProvider: (provider: AIProvider) => void;
  onSelectModel: (modelId: string) => void;
  onSelectSystemPrompt: (id: string) => void;
  messageCount: number;
  onClearChat: () => void;
  onExportChat: () => void;
  conversations: ConversationMeta[];
  activeConvId: string | null;
  onLoadConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onNewChat: () => void;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function Sidebar({
  selectedProvider, selectedModel, selectedSystemPrompt,
  onSelectProvider, onSelectModel, onSelectSystemPrompt,
  messageCount, onClearChat, onExportChat,
  conversations, activeConvId, onLoadConversation, onDeleteConversation, onNewChat,
}: SidebarProps) {
  const [hoveredConv, setHoveredConv] = useState<string | null>(null);

  return (
    <aside className="sidebar slide-in-sidebar">
      {/* Logo + New Chat */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ background: 'linear-gradient(135deg, #7c6bff, #5b8cee)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="sidebar-logo-title">NexusChat</p>
          <p className="sidebar-logo-sub">Free AI · MongoDB Powered</p>
        </div>
        <button onClick={onNewChat} className="new-chat-btn" title="New chat">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="sidebar-content">
        {/* Conversation History */}
        {conversations.length > 0 && (
          <>
            <p className="section-label">💬 Recent Chats</p>
            <div className="flex flex-col gap-0.5">
              {conversations.map((c) => {
                const isActive  = c._id === activeConvId;
                const isHovered = hoveredConv === c._id;
                return (
                  <div
                    key={c._id}
                    className={`conv-item ${isActive ? 'conv-item--active' : ''}`}
                    onMouseEnter={() => setHoveredConv(c._id)}
                    onMouseLeave={() => setHoveredConv(null)}
                  >
                    <button
                      onClick={() => onLoadConversation(c._id)}
                      className="conv-title"
                    >
                      <p className="conv-title-text" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {c.title}
                      </p>
                      <p className="conv-meta">{timeAgo(c.updatedAt)}</p>
                    </button>
                    {isHovered && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteConversation(c._id); }}
                        className="conv-delete-btn"
                        title="Delete"
                      >
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* AI Provider */}
        <p className="section-label" style={{ marginTop: conversations.length > 0 ? '14px' : '4px' }}>🤖 Choose AI</p>
        {AI_PROVIDERS.map((provider) => {
          const isActive = selectedProvider.id === provider.id;
          return (
            <button
              key={provider.id}
              onClick={() => { onSelectProvider(provider); onSelectModel(provider.models[0].id); }}
              className={`provider-btn ${isActive ? 'active' : ''}`}
              style={isActive ? { borderColor: `${provider.color}55`, background: `${provider.color}12` } : {}}
            >
              <span
                className="provider-icon"
                style={{
                  background: `linear-gradient(135deg, ${provider.gradientFrom}22, ${provider.gradientTo}22)`,
                  border: `1px solid ${provider.color}44`, color: provider.color,
                }}
              >
                {provider.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {provider.shortName}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{provider.tagline}</p>
              </div>
              {isActive && (
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: provider.color, boxShadow: `0 0 8px ${provider.color}` }} />
              )}
            </button>
          );
        })}

        {/* Model */}
        <p className="section-label" style={{ marginTop: '14px' }}>⚡ Model</p>
        <div className="flex flex-col gap-1.5">
          {selectedProvider.models.map((model) => {
            const isActive = selectedModel === model.id;
            return (
              <button
                key={model.id}
                onClick={() => onSelectModel(model.id)}
                className="model-card"
                style={{
                  borderColor: isActive ? `${selectedProvider.color}66` : 'var(--border)',
                  background:  isActive ? `${selectedProvider.color}15` : 'transparent',
                }}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-semibold flex-1 truncate"
                    style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {model.name}
                  </p>
                  {model.badge && (
                    <span className="model-badge"
                      style={{ background: `${selectedProvider.color}22`, color: selectedProvider.color, border: `1px solid ${selectedProvider.color}44` }}>
                      {model.badge}
                    </span>
                  )}
                  {model.contextWindow && <span className="context-badge">{model.contextWindow}</span>}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{model.description}</p>
              </button>
            );
          })}
        </div>

        {/* Persona */}
        <p className="section-label" style={{ marginTop: '14px' }}>🎭 Persona</p>
        <div className="flex flex-col gap-1">
          {SYSTEM_PROMPTS.map((sp) => {
            const isActive = selectedSystemPrompt === sp.id;
            return (
              <button
                key={sp.id}
                onClick={() => onSelectSystemPrompt(sp.id)}
                className={`persona-btn ${isActive ? 'persona-btn--active' : ''}`}
              >
                <span className="text-base">{sp.icon}</span>
                <span className="text-xs font-medium" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {sp.label}
                </span>
                {isActive && (
                  <svg className="w-3 h-3 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} style={{ color: '#7c6bff' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        {messageCount > 0 && (
          <div className="flex gap-2">
            <button onClick={onExportChat} className="footer-btn footer-btn--export">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            <button onClick={onClearChat} className="footer-btn footer-btn--clear">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Chat
            </button>
          </div>
        )}
        <div className="sidebar-status">
          <span className="status-dot" />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Free · {conversations.length} chats saved
          </p>
        </div>
      </div>
    </aside>
  );
}
