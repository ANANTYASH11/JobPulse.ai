'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  FileText, CheckCircle2, AlertCircle, Copy, Check,
  ExternalLink, Sparkles, BookOpen, Zap
} from 'lucide-react';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } } };
const popIn = { hidden: { opacity: 0, scale: 0.6 }, visible: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 400, damping: 15 } } };

function OptimizerContent() {
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get('jobId') || '';
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef(null);
  const resultsInView = useInView(resultsRef, { once: true });

  useEffect(() => {
    const loadInitData = async () => {
      try {
        const jobsRes = await fetch('/api/jobs');
        if (jobsRes.ok) { const jobsData = await jobsRes.json(); setJobs(jobsData); if (jobsData.length > 0 && !selectedJobId) setSelectedJobId(jobsData[0].id); }
        const profileRes = await fetch('/api/resume');
        if (profileRes.ok) setProfile(await profileRes.json());
      } catch (e) { console.error(e); }
    };
    loadInitData();
  }, []);

  const handleOptimize = async () => {
    if (!selectedJobId) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/resume/optimize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId: selectedJobId }) });
      if (res.ok) setResult(await res.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { if (initialJobId && jobs.length > 0) handleOptimize(); }, [jobs]);

  const copyCoverLetter = () => {
    if (!result?.coverLetter) return;
    navigator.clipboard.writeText(result.coverLetter);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const activeJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-lg font-semibold text-white">Resume <span className="font-display italic text-indigo-400">Optimizer</span></h2>
        <p className="text-[13px] text-zinc-500 mt-0.5">Cross-reference your profile against job descriptions for ATS scoring.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="surface p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] uppercase font-semibold text-zinc-600 tracking-wider">Target Position</label>
            {jobs.length === 0 ? (
              <span className="text-[13px] text-zinc-500 block">No jobs found. Search jobs first.</span>
            ) : (
              <select value={selectedJobId} onChange={(e) => { setSelectedJobId(e.target.value); setResult(null); }} className="input-field text-[13px]">
                {jobs.map((job) => <option key={job.id} value={job.id}>{job.company} — {job.title}</option>)}
              </select>
            )}
          </div>
          <motion.button onClick={handleOptimize} disabled={loading || !selectedJobId || !profile}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="btn-primary text-[13px] disabled:opacity-40">
            {loading ? <><div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4" /> Optimize</>}
          </motion.button>
        </div>

        {!profile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/10 text-[13px] text-amber-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>No resume uploaded. Visit the <Link href="/dashboard#resume-section" className="underline font-semibold text-white">Dashboard</Link> to paste your resume text.</span>
          </motion.div>
        )}
      </motion.div>

      {/* Results */}
      {result && (
        <motion.div initial="hidden" animate="visible" variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <motion.div variants={fadeUp} className="surface p-5 space-y-5">
              <h3 className="font-semibold text-[13px] text-white">Match Score</h3>
              <div className="flex items-center gap-5">
                <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                  className="relative w-20 h-20 rounded-2xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center">
                  <span className="text-2xl font-bold text-white tabular-nums">{result.score}%</span>
                </motion.div>
                <div className="flex-1">
                  <h4 className="font-medium text-[13px] text-indigo-400 mb-1">AI Analysis</h4>
                  <p className="text-[12px] text-zinc-500 leading-relaxed">{result.whyMatches}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/[0.04]">
                <h4 className="text-[10px] uppercase font-semibold text-zinc-600 tracking-wider mb-2">Missing Keywords</h4>
                <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-wrap gap-1.5">
                  {result.missingSkills.length === 0 ? (
                    <span className="text-[13px] text-emerald-400 font-medium flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Perfect match</span>
                  ) : (
                    result.missingSkills.map((skill: string, i: number) => (
                      <motion.span key={i} variants={popIn} className="badge badge-amber text-[10px]">{skill}</motion.span>
                    ))
                  )}
                </motion.div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="surface p-5 space-y-4">
              <h3 className="font-semibold text-[13px] text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" /> Learning Tasks
              </h3>
              <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.recommendations.map((rec: any, i: number) => (
                  <motion.div key={i} variants={fadeUp}
                    className="p-4 rounded-xl border border-white/[0.06] bg-zinc-900/30 flex flex-col justify-between hover:bg-zinc-900/50 transition-colors group">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-indigo-400/70">{rec.type}</span>
                      <h4 className="font-medium text-[13px] text-zinc-300 leading-relaxed mt-0.5 line-clamp-2">{rec.title}</h4>
                    </div>
                    <a href={rec.link} target="_blank" rel="noopener noreferrer"
                      className="text-[11px] text-indigo-400 hover:text-white flex items-center gap-1 mt-3 font-medium transition-colors">
                      Open <ExternalLink className="w-3 h-3" />
                    </a>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          <motion.div variants={fadeUp} className="surface p-5 flex flex-col h-fit lg:sticky lg:top-24">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-[13px] text-white">Cover Letter</h3>
              <motion.button onClick={copyCoverLetter} whileTap={{ scale: 0.9 }}
                className="flex items-center gap-1 text-[10px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
                {copied ? <><Check className="w-3 h-3 text-emerald-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </motion.button>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-4 text-[11px] leading-relaxed text-zinc-500 overflow-y-auto max-h-[360px] whitespace-pre-wrap font-mono border border-white/[0.04]">
              {result.coverLetter}
            </div>
            <div className="mt-3 p-3 rounded-xl bg-indigo-600/[0.04] border border-indigo-500/10 text-[11px] text-indigo-400/80 flex items-start gap-1.5">
              <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Tailored for {activeJob?.company || 'target company'}. Copy and submit directly.</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default function ResumeOptimizerPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-4">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="skeleton h-40 w-full rounded-2xl" />
      </div>
    }>
      <OptimizerContent />
    </Suspense>
  );
}
