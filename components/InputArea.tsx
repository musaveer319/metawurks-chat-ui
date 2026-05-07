'use client';

import React, { useState, KeyboardEvent, useRef, useEffect, ChangeEvent } from 'react';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  providerColor?: string;
  disabled?: boolean;
}

const MAX_CHARS = 4000;

export default function InputArea({ onSendMessage, isLoading, providerColor, disabled }: InputAreaProps) {
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSubmitting = useRef(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setIsUploading(true);
      setUploadStatus('Uploading...');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('provider', 'local');

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        const data = await res.json();
        if (res.ok) {
          setUploadStatus('Ready');
        } else {
          setUploadStatus(`Error: ${data.error || 'Failed'}`);
        }
      } catch (err) {
        setUploadStatus('Upload failed');
      } finally {
        setIsUploading(false);
      }
    }
  };

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
          className="input-box-shell flex items-end gap-2"
          style={{ '--provider-color': accentColor } as React.CSSProperties}
        >
          {/* File input and attach button */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <button
            type="button"
            className="p-2 mb-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50 flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || disabled || isUploading}
            title="Attach file"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

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
          <div className="flex items-center gap-3">
            <span className="input-hint">
              <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for newline
            </span>
            {selectedFile && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                📎 {selectedFile.name} 
                <span className={uploadStatus === 'Ready' ? 'text-green-400' : 'text-yellow-400'}>
                  ({uploadStatus})
                </span>
              </span>
            )}
          </div>
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
