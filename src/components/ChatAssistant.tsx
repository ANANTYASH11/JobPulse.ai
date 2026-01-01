'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, HelpCircle, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  parts: string;
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      parts: `Hi! I'm your **JobPulse AI Career Copilot**.\n\nI can help you:\n- Analyze job listings & match requirements\n- Practice DSA patterns & System Design\n- Draft salary negotiation scripts\n\nWhat are you preparing for today?`
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'How do I negotiate base salary?',
    'Explain STAR answer structure',
    'Tips for ATS resume score',
    'Stripe interview pattern'
  ];

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMessage: Message = { role: 'user', parts: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, parts: m.parts }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, history })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'model', parts: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', parts: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'model', parts: 'Network error. Please check the server.' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  return (
    <>
      {/* Floating Trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <Bot className="w-5 h-5" />
        </button>
      )}

      {/* Panel */}
      <div
        className={`fixed top-16 right-0 bottom-0 w-[380px] max-w-[95vw] z-50 bg-[#0c0c0f] border-l border-white/[0.06] flex flex-col overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/[0.04] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/10 border border-indigo-500/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-[13px] text-white">Career Copilot</h3>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Online
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/[0.04] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role === 'model' && (
                <div className="w-6 h-6 rounded-lg bg-indigo-600/10 border border-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3 h-3 text-indigo-400" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-md'
                    : 'bg-white/[0.03] border border-white/[0.04] text-zinc-300 rounded-bl-md'
                }`}
              >
                {m.parts.split('\n').map((line, lIdx) => {
                  if (line.startsWith('### ')) return <h4 key={lIdx} className="font-semibold text-[13px] text-indigo-400 mt-1.5 mb-0.5">{line.replace('### ', '')}</h4>;
                  if (line.startsWith('- ')) return <div key={lIdx} className="pl-3 relative before:content-['·'] before:absolute before:left-0 before:text-indigo-500 before:font-bold">{line.replace('- ', '')}</div>;
                  return <p key={lIdx} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />;
                })}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-indigo-600/10 border border-indigo-500/10 flex items-center justify-center shrink-0">
                <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
              </div>
              <div className="bg-white/[0.03] border border-white/[0.04] text-zinc-500 rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[12px]">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {!loading && messages.length <= 2 && (
          <div className="px-4 py-2.5 border-t border-white/[0.04]">
            <p className="text-[10px] text-zinc-600 mb-1.5 flex items-center gap-1 font-medium">
              <HelpCircle className="w-3 h-3" /> Quick questions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => handleSend(prompt)}
                  className="text-[10px] text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] px-2 py-1 rounded-lg transition-all text-left cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-white/[0.04] flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Ask anything..."
            className="input-field text-[12px]"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || loading}
            className="btn-primary p-2.5 disabled:opacity-30"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
