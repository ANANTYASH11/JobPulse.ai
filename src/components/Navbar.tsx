'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, LayoutDashboard, Award, FileText, CheckSquare, ShieldAlert, Command, Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [stats, setStats] = useState({ xp: 0, level: 1, streak: 0 });
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const data = await res.json();
          setStats({ xp: data.profile.xp, level: data.profile.level, streak: data.profile.streak });
        }
      } catch { /* silent */ }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [pathname]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Jobs', path: '/jobs', icon: Briefcase },
    { label: 'Resume', path: '/resume-optimizer', icon: FileText },
    { label: 'Interview', path: '/interview-prep', icon: Award },
    { label: 'Tracker', path: '/applications', icon: CheckSquare },
    { label: 'Admin', path: '/admin', icon: ShieldAlert },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#050507]/70 backdrop-blur-2xl border-b border-white/[0.06] shadow-lg shadow-black/20 py-0'
            : 'bg-transparent py-1'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -3 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-indigo-500/20"
            >
              JP
            </motion.div>
            <span className="font-semibold text-[15px] text-white tracking-tight">
              JobPulse<span className="text-indigo-400">.ai</span>
            </span>
          </Link>

          {/* Center Navigation (Desktop) */}
          <div className="hidden md:flex items-center gap-0.5 bg-white/[0.03] rounded-xl p-1 border border-white/[0.04]">
            {navItems.map((item) => {
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative px-3.5 py-2 rounded-lg flex items-center gap-2 text-[13px] font-medium transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 bg-white/[0.08] rounded-lg shadow-sm"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {stats.streak > 0 && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-sm shadow-emerald-500/10"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs">🔥 {stats.streak}d streak</span>
              </motion.div>
            )}

            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <div className="w-5 h-5 rounded-md bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold border border-indigo-500/20">
                {stats.level}
              </div>
              <span className="hidden sm:inline font-medium">{stats.xp} XP</span>
            </div>

            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-all text-xs font-medium cursor-pointer"
            >
              <Command className="w-3 h-3" />
              <span className="font-mono text-[10px]">⌘K</span>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-72 z-50 bg-[#0a0a0e]/95 backdrop-blur-2xl border-l border-white/[0.06] p-6 pt-20 md:hidden"
            >
              <div className="space-y-1">
                {navItems.map((item, i) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                    >
                      <Link
                        href={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all ${
                          isActive
                            ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/15'
                            : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
