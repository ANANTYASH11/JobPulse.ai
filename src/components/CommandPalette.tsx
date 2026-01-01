'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, LayoutDashboard, Briefcase, FileText, Award, CheckSquare, ShieldAlert, X } from 'lucide-react';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const items = [
    { label: 'Dashboard', desc: 'View metrics and daily tasks', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Job Feed', desc: 'Browse scraped positions', path: '/jobs', icon: Briefcase },
    { label: 'Resume Optimizer', desc: 'ATS scoring and cover letters', path: '/resume-optimizer', icon: FileText },
    { label: 'Interview Arena', desc: 'AI mock practice sessions', path: '/interview-prep', icon: Award },
    { label: 'Application Tracker', desc: 'Kanban pipeline board', path: '/applications', icon: CheckSquare },
    { label: 'System Health', desc: 'Server and scraper metrics', path: '/admin', icon: ShieldAlert },
  ];

  const filtered = items.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.desc.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelect = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(prev => (prev + 1) % filtered.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(prev => (prev - 1 + filtered.length) % filtered.length); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[activeIndex]) handleSelect(filtered[activeIndex].path); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[20vh] px-4" onClick={() => setIsOpen(false)}>
      <div
        className="w-full max-w-lg bg-[#111114] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[360px] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04]">
          <Search className="w-4 h-4 text-zinc-600" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveIndex(0); }}
            placeholder="Search or jump to..."
            className="flex-1 bg-transparent text-[13px] text-white placeholder-zinc-600 focus:outline-none"
          />
          <kbd className="text-[9px] font-mono bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded border border-white/[0.06]">ESC</kbd>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-zinc-600">No results found.</div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isActive = idx === activeIndex;
              return (
                <button
                  key={item.path}
                  onClick={() => handleSelect(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                    isActive ? 'bg-indigo-600/10 text-white' : 'text-zinc-400 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-indigo-600/20 text-indigo-400' : 'bg-zinc-800/50 text-zinc-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-medium block">{item.label}</span>
                    <span className="text-[11px] text-zinc-600 block">{item.desc}</span>
                  </div>
                  {isActive && (
                    <kbd className="text-[9px] font-mono text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded border border-white/[0.06]">↵</kbd>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/[0.04] text-[10px] text-zinc-700 flex items-center justify-between">
          <div className="flex gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Open</span>
          </div>
          <span className="font-mono">⌘K</span>
        </div>
      </div>
    </div>
  );
}
