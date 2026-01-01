'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bookmark, MapPin, DollarSign, Calendar,
  SlidersHorizontal, CheckCircle2, ChevronRight, Zap,
  Building2, Bell, Sparkles, Filter, Briefcase, TrendingUp
} from 'lucide-react';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } } };

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [remote, setRemote] = useState('All');
  const [experience, setExperience] = useState('All');
  const [postedWithin, setPostedWithin] = useState('48h');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [alertEmail, setAlertEmail] = useState('');
  const [alertSubscribed, setAlertSubscribed] = useState(false);

  const hotSkills = ['React', 'Python', 'Node.js', 'Full Stack', 'System Design', 'TypeScript', 'Java', 'AI/ML', 'AWS', 'DevOps'];

  const topEmployers = [
    { name: 'Google', count: 14, icon: '🌐', color: 'from-blue-500/20 to-indigo-500/10' },
    { name: 'Amazon', count: 22, icon: '📦', color: 'from-amber-500/20 to-orange-500/10' },
    { name: 'Stripe', count: 8, icon: '💳', color: 'from-violet-500/20 to-purple-500/10' },
    { name: 'Microsoft', count: 19, icon: '💻', color: 'from-cyan-500/20 to-blue-500/10' },
    { name: 'TCS', count: 35, icon: '🏢', color: 'from-emerald-500/20 to-teal-500/10' },
    { name: 'Infosys', count: 28, icon: '🚀', color: 'from-rose-500/20 to-pink-500/10' },
  ];

  const fetchJobs = async (overrideSearch?: string, overrideCompany?: string | null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const querySearch = overrideSearch !== undefined ? overrideSearch : search;
      const compFilter = overrideCompany !== undefined ? overrideCompany : selectedCompanyFilter;

      if (querySearch) params.append('search', querySearch);
      if (compFilter) params.append('search', compFilter);
      if (remote !== 'All') params.append('remote', remote);
      if (experience !== 'All') params.append('experience', experience);
      if (postedWithin !== 'All') params.append('postedWithin', postedWithin);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (res.ok) {
        let fetched: any[] = await res.json();
        if (locationSearch.trim()) {
          fetched = fetched.filter(j => j.location.toLowerCase().includes(locationSearch.toLowerCase()) || j.remote.toLowerCase().includes(locationSearch.toLowerCase()));
        }
        setJobs(fetched);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, [remote, experience, postedWithin]);

  const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); fetchJobs(); };

  const handleHotSkillClick = (skill: string) => {
    if (search === skill) {
      setSearch('');
      fetchJobs('');
    } else {
      setSearch(skill);
      fetchJobs(skill);
    }
  };

  const handleCompanyClick = (companyName: string) => {
    if (selectedCompanyFilter === companyName) {
      setSelectedCompanyFilter(null);
      fetchJobs(search, null);
    } else {
      setSelectedCompanyFilter(companyName);
      fetchJobs(search, companyName);
    }
  };

  const handleToggleBookmark = async (jobId: string) => {
    try {
      const res = await fetch('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId, action: 'bookmark' }) });
      if (res.ok) setJobs(prev => prev.map(job => job.id === jobId ? { ...job, isBookmarked: !job.isBookmarked } : job));
    } catch (e) { console.error(e); }
  };

  const handleOneClickApply = async (job: any) => {
    if (applyingJobId) return;
    setApplyingJobId(job.id);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      const res = await fetch('/api/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, company: job.company, role: job.title, status: 'APPLIED', notes: `Applied via JobPulse One-Click Apply. Source: ${job.originalSource}.` }) });
      if (res.ok) setAppliedJobIds(prev => { const next = new Set(prev); next.add(job.id); return next; });
    } catch (e) { console.error(e); } finally { setApplyingJobId(null); }
  };

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertEmail.trim()) return;
    setAlertSubscribed(true);
    setTimeout(() => setAlertSubscribed(false), 4000);
    setAlertEmail('');
  };

  const filterOptions = (items: string[], active: string, setter: (v: string) => void) => (
    <div className="flex gap-1 flex-wrap">
      {items.map(item => (
        <motion.button key={item} onClick={() => setter(item)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            active === item ? 'bg-white/[0.08] text-white shadow-sm border border-white/10' : 'text-zinc-500 hover:text-zinc-300'
          }`}>
          {item}
        </motion.button>
      ))}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-6">

      {/* TimesJobs-Inspired Header Banner */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative rounded-2xl surface p-6 overflow-hidden border border-white/[0.06] bg-gradient-to-r from-indigo-950/30 via-[#0a0a0e] to-violet-950/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-indigo text-[10px]"><Briefcase className="w-3 h-3" /> Live Recruitment Portal</span>
              {selectedCompanyFilter && (
                <span className="badge badge-amber text-[10px]">Filter: {selectedCompanyFilter}</span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Explore Tech <span className="font-display italic text-indigo-400">Opportunities</span>
            </h2>
            <p className="text-[13px] text-zinc-400 mt-1">
              Cross-indexed from top tech companies within 48 hours.
            </p>
          </div>

          {/* Alert Widget */}
          <div className="bg-white/[0.03] p-3 rounded-xl border border-white/[0.06] max-w-sm">
            {alertSubscribed ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-emerald-400 text-xs font-medium py-1">
                <CheckCircle2 className="w-4 h-4" /> 48h Job alerts active for your email!
              </motion.div>
            ) : (
              <form onSubmit={handleAlertSubmit} className="flex gap-2 items-center">
                <Bell className="w-4 h-4 text-amber-400 shrink-0" />
                <input type="email" value={alertEmail} onChange={(e) => setAlertEmail(e.target.value)}
                  placeholder="Get instant 48h job alerts..." className="bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none flex-1" required />
                <button type="submit" className="text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0">
                  Notify Me
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Multi-Parameter Search Bar */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-[#050507]/80 p-2 rounded-xl border border-white/[0.08]">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Designation, skills (e.g. React, Python, SDE)..." className="w-full bg-transparent text-xs text-white placeholder-zinc-500 pl-10 pr-3 py-2.5 focus:outline-none" />
          </div>
          <div className="md:col-span-4 relative border-t md:border-t-0 md:border-l border-white/[0.06] pt-2 md:pt-0">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input type="text" value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)}
              placeholder="Location (Bangalore, Remote...)" className="w-full bg-transparent text-xs text-white placeholder-zinc-500 pl-10 pr-3 py-2.5 focus:outline-none" />
          </div>
          <div className="md:col-span-2">
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="btn-primary w-full text-xs py-2.5 justify-center shadow-lg shadow-indigo-500/20">
              Find Jobs <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </form>

        {/* Hot Skills Chips */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.04] overflow-x-auto pb-1">
          <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-indigo-400" /> Hot Skills:
          </span>
          <div className="flex gap-1.5">
            {hotSkills.map((skill) => {
              const isActive = search === skill;
              return (
                <button key={skill} onClick={() => handleHotSkillClick(skill)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
                  }`}>
                  {skill}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Top Hirers Carousel / Grid */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-2.5">
        <div className="flex justify-between items-center px-1">
          <span className="text-[12px] font-semibold text-zinc-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Featured Employers Hiring Now
          </span>
          {selectedCompanyFilter && (
            <button onClick={() => { setSelectedCompanyFilter(null); fetchJobs(search, null); }}
              className="text-[11px] text-indigo-400 hover:underline">
              Clear Company Filter
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {topEmployers.map((emp) => {
            const isSelected = selectedCompanyFilter === emp.name;
            return (
              <motion.button key={emp.name} onClick={() => handleCompanyClick(emp.name)}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/15 border-indigo-500/40 text-white shadow-md shadow-indigo-500/10'
                    : 'surface surface-hover text-zinc-400'
                }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-lg">{emp.icon}</span>
                  <span className="text-[10px] font-semibold bg-white/[0.06] text-zinc-300 px-1.5 py-0.5 rounded-md">{emp.count} jobs</span>
                </div>
                <span className="font-semibold text-xs text-white block">{emp.name}</span>
                <span className="text-[10px] text-zinc-500">Active postings</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
        className="surface p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Location:</span>
            {filterOptions(['All', 'Remote', 'Hybrid', 'On-site'], remote, setRemote)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Level:</span>
            {filterOptions(['All', 'Freshers', 'Intermediate', 'Senior'], experience, setExperience)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Posted:</span>
            <select value={postedWithin} onChange={(e) => setPostedWithin(e.target.value)}
              className="bg-zinc-900 border border-white/[0.08] text-[11px] text-zinc-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500">
              <option value="All">All Time</option>
              <option value="6h">Past 6 hours</option>
              <option value="12h">Past 12 hours</option>
              <option value="24h">Past 24 hours</option>
              <option value="48h">Past 48 hours</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-500 font-medium">{jobs.length} roles found</span>
          <button onClick={() => { setSearch(''); setLocationSearch(''); setRemote('All'); setExperience('All'); setPostedWithin('48h'); setSelectedCompanyFilter(null); fetchJobs('', null); }}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
            Reset Filters
          </button>
        </div>
      </motion.div>

      {/* Job Cards Feed */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="surface p-5 space-y-3">
              <div className="skeleton h-3 w-20" /><div className="skeleton h-5 w-48" />
              <div className="skeleton h-3 w-full" /><div className="skeleton h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="surface p-16 text-center space-y-3">
          <SlidersHorizontal className="w-8 h-8 text-zinc-700 mx-auto" />
          <h3 className="font-semibold text-sm text-white">No matching jobs found</h3>
          <p className="text-[13px] text-zinc-500 max-w-sm mx-auto">Try broadening your search keywords or location filter.</p>
        </motion.div>
      ) : (
        <motion.div initial="hidden" animate="visible" variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {jobs.map(job => {
            const hasApplied = appliedJobIds.has(job.id);
            const isApplying = applyingJobId === job.id;
            return (
              <motion.div key={job.id} variants={fadeUp} className="surface surface-hover p-5 flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-white/[0.08] flex items-center justify-center font-bold text-xs text-indigo-400 shrink-0">
                        {job.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider block">{job.company}</span>
                        <h3 className="font-semibold text-[15px] text-white group-hover:text-indigo-400 transition-colors mt-0.5">{job.title}</h3>
                      </div>
                    </div>
                    <motion.button onClick={() => handleToggleBookmark(job.id)} whileTap={{ scale: 0.75 }}
                      animate={job.isBookmarked ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      className={`p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                        job.isBookmarked ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20' : 'bg-transparent text-zinc-600 border-white/[0.06] hover:text-zinc-300'
                      }`}>
                      <Bookmark className={`w-3.5 h-3.5 ${job.isBookmarked ? 'fill-current' : ''}`} />
                    </motion.button>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-400 mt-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-zinc-500" /> {job.location} · {job.remote}</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-medium"><DollarSign className="w-3 h-3" /> {job.salary}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-zinc-500" /> {new Date(job.datePosted).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[12px] text-zinc-500 mt-2.5 line-clamp-2 leading-relaxed">{job.aiSummary || job.description}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {job.skills.split(',').slice(0, 4).map((skill: string, sIdx: number) => (
                      <span key={sIdx} className="text-[10px] bg-zinc-800/60 text-zinc-400 px-2 py-0.5 rounded-md font-medium">{skill.trim()}</span>
                    ))}
                    <span className="text-[9px] text-zinc-600 ml-auto font-mono">Source: {job.originalSource}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-5 pt-3.5 border-t border-white/[0.04]">
                  <Link href={`/resume-optimizer?jobId=${job.id}`} className="btn-secondary flex-1 text-[12px] py-2">
                    ATS Score <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <motion.button onClick={() => handleOneClickApply(job)} disabled={hasApplied || isApplying}
                    whileHover={!hasApplied ? { scale: 1.03 } : {}} whileTap={!hasApplied ? { scale: 0.97 } : {}}
                    className={`flex-1 py-2 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      hasApplied ? 'bg-emerald-500/[0.06] text-emerald-400 border border-emerald-500/10' : 'btn-primary'
                    }`}>
                    {isApplying ? (
                      <><div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Applying...</>
                    ) : hasApplied ? (
                      <><CheckCircle2 className="w-3.5 h-3.5" /> Applied</>
                    ) : (
                      <><Zap className="w-3 h-3 fill-current" /> Quick Apply</>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
