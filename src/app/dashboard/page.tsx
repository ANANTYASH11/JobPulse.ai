'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  Award, FileText, CheckSquare,
  ArrowRight, TrendingUp, Upload, CheckCircle2, ChevronRight, Play, Activity
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } } };

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className={className}>
      {children}
    </motion.div>
  );
}

function SkeletonCard() {
  return <div className="surface p-5 space-y-3"><div className="skeleton h-3 w-24" /><div className="skeleton h-7 w-32" /></div>;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [resumeText, setResumeText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const loadData = async () => {
    try { const res = await fetch('/api/analytics'); if (res.ok) setData(await res.json()); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleUploadResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;
    setUploading(true); setUploadSuccess(false);
    try {
      const res = await fetch('/api/resume', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumeText }) });
      if (res.ok) { setUploadSuccess(true); setResumeText(''); loadData(); }
    } catch (e) { console.error(e); } finally { setUploading(false); }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-6 animate-fade-in">
        <div className="skeleton h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="skeleton h-72 w-full rounded-2xl" />
          <div className="skeleton h-72 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const profile = data?.profile || { name: 'Guest User', email: '', skills: '', xp: 0, level: 1, streak: 0, atsScore: 0 };
  const jobs = data?.jobs || { total: 0, bookmarked: 0, averageMatch: 75 };
  const applications = data?.applications || { total: 0, funnel: { APPLIED: 0, INTERVIEW_SCHEDULED: 0, ASSESSMENT: 0, OFFER: 0, ACCEPTED: 0 }, interviewRate: 0 };
  const interviews = data?.interviews || { totalCompleted: 0, averageScore: 75, trends: [] };

  const currentLevelMinXp = (profile.level - 1) * 500;
  const nextLevelMinXp = profile.level * 500;
  const xpProgress = Math.min(100, Math.round(((profile.xp - currentLevelMinXp) / 500) * 100));

  const dailyTasks = [
    { id: 1, title: 'Upload or update your resume for ATS scoring', completed: profile.atsScore > 0, link: '#resume-section' },
    { id: 2, title: 'Review fresh jobs posted in the last 48 hours', completed: jobs.total > 0, link: '/jobs' },
    { id: 3, title: 'Complete one AI mock interview session', completed: interviews.totalCompleted > 0, link: '/interview-prep' },
    { id: 4, title: 'Update your application tracker board', completed: applications.total > 0, link: '/applications' }
  ];

  const funnelData = [
    { name: 'Applied', count: (applications.funnel.APPLIED || 0) + (applications.funnel.ASSESSMENT || 0) + (applications.funnel.INTERVIEW_SCHEDULED || 0) + (applications.funnel.OFFER || 0) + (applications.funnel.ACCEPTED || 0) },
    { name: 'Assessment', count: (applications.funnel.ASSESSMENT || 0) + (applications.funnel.INTERVIEW_SCHEDULED || 0) + (applications.funnel.OFFER || 0) },
    { name: 'Interview', count: (applications.funnel.INTERVIEW_SCHEDULED || 0) + (applications.funnel.OFFER || 0) },
    { name: 'Offer', count: (applications.funnel.OFFER || 0) + (applications.funnel.ACCEPTED || 0) }
  ];

  const metrics = [
    { label: 'ATS Score', value: profile.atsScore ? `${profile.atsScore}%` : '—', color: profile.atsScore > 75 ? 'text-emerald-400' : 'text-amber-400', icon: FileText },
    { label: 'Applications', value: `${applications.total}`, color: 'text-blue-400', icon: CheckSquare },
    { label: 'Interview Rate', value: `${applications.interviewRate}%`, color: 'text-violet-400', icon: TrendingUp },
    { label: 'Avg Score', value: `${interviews.averageScore}%`, color: 'text-indigo-400', icon: Award },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-6">
      {/* Welcome + Progress */}
      <AnimatedSection>
        <motion.div variants={fadeUp} className="surface p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">
                Welcome back, <span className="font-display italic text-indigo-400">{profile.name}</span>
              </h2>
              {profile.streak > 0 && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-sm shadow-emerald-500/10">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  🔥 {profile.streak}d streak
                </span>
              )}
            </div>
            <p className="text-[13px] text-zinc-500">
              {profile.skills ? `Skills: ${profile.skills.slice(0, 50)}...` : 'Upload your resume to unlock ATS scoring and job matching.'}
            </p>
          </div>
          <div className="w-full md:w-72 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500 font-medium">Level {profile.level}</span>
              <span className="text-indigo-400 font-semibold tabular-nums">{profile.xp} / {nextLevelMinXp} XP</span>
            </div>
            <div className="w-full h-2 bg-zinc-800/60 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full" />
            </div>
          </div>
        </motion.div>
      </AnimatedSection>

      {/* Metrics Grid */}
      <AnimatedSection className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div key={i} variants={fadeUp} className="surface surface-hover p-5 flex items-center justify-between group">
              <div>
                <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider block mb-1">{m.label}</span>
                <span className={`text-2xl font-bold ${m.color} tabular-nums`}>{m.value}</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-600 group-hover:text-zinc-400 transition-colors group-hover:scale-110 duration-300">
                <Icon className="w-4 h-4" />
              </div>
            </motion.div>
          );
        })}
      </AnimatedSection>

      {/* Charts */}
      <AnimatedSection className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={fadeUp} className="surface p-5 flex flex-col h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[13px] text-white">Interview Progress</h3>
            <span className="badge badge-indigo text-[10px]"><Activity className="w-3 h-3" /> Trend</span>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={interviews.trends} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} domain={[50, 100]} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }} labelStyle={{ color: '#a1a1aa' }} />
                <Area type="monotone" dataKey="score" stroke="#6366f1" fillOpacity={1} fill="url(#scoreGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="surface p-5 flex flex-col h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[13px] text-white">Application Funnel</h3>
            <span className="badge badge-indigo text-[10px]">Pipeline</span>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </AnimatedSection>

      {/* Daily Tasks + Quick Launch */}
      <AnimatedSection className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={fadeUp} className="lg:col-span-2 surface p-5 flex flex-col">
          <h3 className="font-semibold text-[13px] text-white mb-1">Daily Tasks</h3>
          <p className="text-[11px] text-zinc-600 mb-4">Complete these to build your placement readiness.</p>
          <div className="space-y-2 flex-1">
            {dailyTasks.map((task, tIdx) => (
              <motion.div key={task.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + tIdx * 0.08, ease: 'easeOut' }}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  task.completed ? 'bg-emerald-500/[0.04] border-emerald-500/10 text-zinc-500' : 'bg-transparent border-white/[0.06] text-zinc-300 hover:bg-white/[0.02]'
                }`}>
                <div className="flex items-center gap-3">
                  <motion.div whileTap={{ scale: 0.85 }}
                    className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border ${
                      task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-700'
                    }`}>
                    {task.completed && <CheckCircle2 className="w-3 h-3" />}
                  </motion.div>
                  <span className="text-[13px] font-medium">{task.title}</span>
                </div>
                {!task.completed && (
                  <Link href={task.link} className="p-1 rounded-lg hover:bg-indigo-600/10 text-indigo-400 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="surface p-5 flex flex-col justify-between bg-gradient-to-br from-indigo-600/[0.04] to-transparent">
          <div>
            <motion.div whileHover={{ scale: 1.08, rotate: -3 }}
              className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
              <Award className="w-5 h-5" />
            </motion.div>
            <h3 className="font-semibold text-[13px] text-white mb-2">Practice Interview</h3>
            <p className="text-[12px] text-zinc-500 leading-relaxed mb-5">
              Test your skills with AI-powered mock interviews, coding challenges, and system design reviews.
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href="/interview-prep" className="btn-primary text-[13px] w-full justify-center">
              Launch Arena <Play className="w-3.5 h-3.5 fill-current" />
            </Link>
          </motion.div>
        </motion.div>
      </AnimatedSection>

      {/* Resume Upload */}
      <AnimatedSection>
        <motion.div variants={fadeUp} id="resume-section" className="surface p-6">
          <h3 className="font-semibold text-[13px] text-white mb-1">Resume Parser</h3>
          <p className="text-[11px] text-zinc-600 mb-4">Paste your resume text to sync your skills and enable ATS scoring.</p>

          {uploadSuccess && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/10 text-[13px] text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Resume parsed successfully. ATS keywords are now active.
            </motion.div>
          )}

          <form onSubmit={handleUploadResume} className="space-y-4">
            <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume content here..." className="input-field h-36 resize-none leading-relaxed" required />
            <motion.button type="submit" disabled={uploading || !resumeText.trim()} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="btn-primary disabled:opacity-40">
              {uploading ? (
                <><div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Parsing...</>
              ) : (
                <><Upload className="w-3.5 h-3.5" /> Parse Resume</>
              )}
            </motion.button>
          </form>
        </motion.div>
      </AnimatedSection>
    </div>
  );
}
