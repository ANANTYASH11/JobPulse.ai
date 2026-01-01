'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ArrowRight, ArrowLeft, Trash2, Calendar,
  ClipboardList, Info, X, Check, Save
} from 'lucide-react';

interface Application {
  id: string; jobId: string; company: string; role: string; status: string;
  dateApplied: string; notes: string | null; timeline: string; checklist: string;
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } } };
const slideLeft = { hidden: { opacity: 0, x: 24 }, visible: { opacity: 1, x: 0, transition: { duration: 0.4 } } };

export default function ApplicationsTracker() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newStatus, setNewStatus] = useState('APPLIED');
  const [newNotes, setNewNotes] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editChecklist, setEditChecklist] = useState<any[]>([]);

  const columns = [
    { id: 'APPLIED', title: 'Applied', color: 'text-blue-400 border-blue-500/15 bg-blue-500/[0.04]' },
    { id: 'ASSESSMENT', title: 'Assessment', color: 'text-amber-400 border-amber-500/15 bg-amber-500/[0.04]' },
    { id: 'INTERVIEW_SCHEDULED', title: 'Interviews', color: 'text-violet-400 border-violet-500/15 bg-violet-500/[0.04]' },
    { id: 'OFFER', title: 'Offers', color: 'text-emerald-400 border-emerald-500/15 bg-emerald-500/[0.04]' },
    { id: 'REJECTED', title: 'Archived', color: 'text-rose-400 border-rose-500/15 bg-rose-500/[0.04]' }
  ];

  const fetchApps = async () => {
    try { const res = await fetch('/api/applications'); if (res.ok) setApps(await res.json()); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchApps(); }, []);

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRole.trim()) return;
    try {
      const res = await fetch('/api/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company: newCompany, role: newRole, status: newStatus, notes: newNotes }) });
      if (res.ok) { setIsAddOpen(false); setNewCompany(''); setNewRole(''); setNewNotes(''); setNewStatus('APPLIED'); fetchApps(); }
    } catch (e) { console.error(e); }
  };

  const handleUpdateStatus = async (app: Application, direction: 'forward' | 'backward') => {
    const colIds = columns.map(c => c.id);
    const currIdx = colIds.indexOf(app.status);
    const nextIdx = direction === 'forward' ? Math.min(currIdx + 1, colIds.length - 1) : Math.max(currIdx - 1, 0);
    if (nextIdx === currIdx) return;
    const nextStatus = colIds[nextIdx];
    try {
      const res = await fetch('/api/applications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: app.id, status: nextStatus }) });
      if (res.ok) {
        setApps(prev => prev.map(a => a.id === app.id ? { ...a, status: nextStatus } : a));
        if (selectedApp?.id === app.id) setSelectedApp(prev => prev ? { ...prev, status: nextStatus } : null);
      }
    } catch (e) { console.error(e); }
  };

  const handleSaveDetails = async () => {
    if (!selectedApp) return;
    try {
      const res = await fetch('/api/applications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedApp.id, notes: editNotes, checklist: editChecklist }) });
      if (res.ok) { const updated = await res.json(); setApps(prev => prev.map(a => a.id === selectedApp.id ? updated : a)); setSelectedApp(updated); }
    } catch (e) { console.error(e); }
  };

  const handleDeleteApp = async (id: string) => {
    if (!confirm('Delete this application card?')) return;
    try { const res = await fetch(`/api/applications?id=${id}`, { method: 'DELETE' }); if (res.ok) { setApps(prev => prev.filter(a => a.id !== id)); setSelectedApp(null); } }
    catch (e) { console.error(e); }
  };

  const openAppDetails = (app: Application) => {
    setSelectedApp(app); setEditNotes(app.notes || '');
    try { setEditChecklist(JSON.parse(app.checklist)); } catch { setEditChecklist([]); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-6 relative">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between md:items-end gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Application <span className="font-display italic text-indigo-400">Tracker</span></h2>
          <p className="text-[13px] text-zinc-500 mt-0.5">Manage your placement pipeline from application to offer.</p>
        </div>
        <motion.button onClick={() => setIsAddOpen(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="btn-primary text-[13px]">
          <Plus className="w-4 h-4" /> Add Card
        </motion.button>
      </motion.div>

      {/* Kanban */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-96 rounded-2xl" />)}</div>
      ) : (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col lg:flex-row gap-3 overflow-x-auto pb-4">
          {columns.map((col, colIdx) => {
            const colApps = apps.filter(a => a.status === col.id);
            return (
              <motion.div key={col.id} variants={slideLeft} custom={colIdx} className="w-full lg:w-64 shrink-0 surface p-3 flex flex-col h-[480px]">
                <div className={`p-2.5 rounded-xl border mb-3 flex items-center justify-between text-[12px] font-semibold ${col.color}`}>
                  <span>{col.title}</span>
                  <span className="bg-white/[0.06] px-1.5 py-0.5 rounded-md text-[10px] font-mono tabular-nums">{colApps.length}</span>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                  {colApps.length === 0 ? (
                    <div className="h-full flex items-center justify-center border border-dashed border-white/[0.04] rounded-xl">
                      <p className="text-[11px] text-zinc-700">Empty</p>
                    </div>
                  ) : (
                    colApps.map((app, aIdx) => (
                      <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: aIdx * 0.05 }} onClick={() => openAppDetails(app)}
                        className="p-3.5 rounded-xl border border-white/[0.06] bg-zinc-900/40 hover:bg-zinc-900/60 cursor-pointer transition-all group hover:border-indigo-500/20">
                        <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider block">{app.company}</span>
                        <h4 className="font-medium text-[13px] text-zinc-300 group-hover:text-indigo-400 mt-0.5 transition-colors truncate">{app.role}</h4>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-700 mt-1.5">
                          <Calendar className="w-3 h-3" /> {new Date(app.dateApplied).toLocaleDateString()}
                        </div>
                        <div className="flex justify-end gap-1 pt-2 mt-2 border-t border-white/[0.03]" onClick={e => e.stopPropagation()}>
                          <motion.button onClick={() => handleUpdateStatus(app, 'backward')} whileTap={{ scale: 0.85 }}
                            className="p-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer">
                            <ArrowLeft className="w-3 h-3" />
                          </motion.button>
                          <motion.button onClick={() => handleUpdateStatus(app, 'forward')} whileTap={{ scale: 0.85 }}
                            className="p-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer">
                            <ArrowRight className="w-3 h-3" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-md bg-[#111114] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/[0.04] flex justify-between items-center">
                <h3 className="font-semibold text-[14px] text-white">New Application</h3>
                <button onClick={() => setIsAddOpen(false)} className="p-1 rounded hover:bg-white/[0.04] text-zinc-500 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleCreateApp} className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-semibold text-zinc-600 tracking-wider">Company</label>
                  <input type="text" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} placeholder="e.g. Stripe" className="input-field text-[13px]" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-semibold text-zinc-600 tracking-wider">Role</label>
                  <input type="text" value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="e.g. SDE Intern" className="input-field text-[13px]" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-semibold text-zinc-600 tracking-wider">Stage</label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input-field text-[13px]">
                    <option value="APPLIED">Applied</option><option value="ASSESSMENT">Assessment</option>
                    <option value="INTERVIEW_SCHEDULED">Interview</option><option value="OFFER">Offer</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-semibold text-zinc-600 tracking-wider">Notes</label>
                  <textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="Referral, deadline, etc." className="input-field h-20 resize-none text-[13px]" />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsAddOpen(false)} className="btn-secondary text-[13px]">Cancel</button>
                  <motion.button type="submit" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary text-[13px]">Create</motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end" onClick={() => setSelectedApp(null)}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }} onClick={(e) => e.stopPropagation()}
              className="w-[440px] max-w-[95vw] h-full bg-[#0c0c0f] border-l border-white/[0.06] flex flex-col overflow-hidden">
              <div className="p-4 border-b border-white/[0.04] flex justify-between items-center shrink-0">
                <div>
                  <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider">{selectedApp.company}</span>
                  <h3 className="font-semibold text-[14px] text-white mt-0.5">{selectedApp.role}</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleDeleteApp(selectedApp.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-600 hover:text-rose-400 transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  <button onClick={() => setSelectedApp(null)} className="p-1.5 rounded-lg hover:bg-white/[0.04] text-zinc-500 cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="p-3 rounded-xl border border-white/[0.06] bg-zinc-900/30 flex justify-between items-center text-[13px] font-medium">
                  <span className="text-zinc-500">Stage</span>
                  <span className="text-indigo-400 uppercase text-[12px]">{selectedApp.status.replace('_', ' ')}</span>
                </div>
                <div className="space-y-2.5">
                  <h4 className="font-medium text-[13px] text-white flex items-center gap-2"><ClipboardList className="w-4 h-4 text-indigo-400" /> Checklist</h4>
                  {editChecklist.map((item, idx) => (
                    <motion.div key={item.id} whileTap={{ scale: 0.98 }}
                      onClick={() => { const next = [...editChecklist]; next[idx].completed = !next[idx].completed; setEditChecklist(next); }}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                        item.completed ? 'bg-emerald-500/[0.04] border-emerald-500/10 text-zinc-600 line-through' : 'border-white/[0.06] text-zinc-300 hover:bg-white/[0.02]'
                      }`}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${item.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-700'}`}>
                        {item.completed && <Check className="w-3 h-3" />}
                      </div>
                      <span className="text-[12px] font-medium">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-medium text-[13px] text-white flex items-center gap-2"><Info className="w-4 h-4 text-indigo-400" /> Notes</h4>
                  <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Add notes..." className="input-field h-28 resize-none text-[12px] leading-relaxed" />
                </div>
                <div className="space-y-2.5 pt-2">
                  <h4 className="font-medium text-[13px] text-white">Timeline</h4>
                  <div className="relative border-l border-white/[0.06] pl-4 ml-2 space-y-3">
                    {JSON.parse(selectedApp.timeline).map((t: any, tIdx: number) => (
                      <motion.div key={tIdx} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: tIdx * 0.08 }} className="relative text-[11px]">
                        <span className="absolute -left-[19px] top-1 w-2 h-2 rounded-full bg-indigo-600 border-2 border-[#0c0c0f]" />
                        <span className="block font-medium text-zinc-400">{t.label}</span>
                        <span className="block text-[10px] text-zinc-700 mt-0.5">{new Date(t.date).toLocaleString()}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-white/[0.04] shrink-0 flex justify-end gap-2">
                <button onClick={() => setSelectedApp(null)} className="btn-secondary text-[12px]">Close</button>
                <motion.button onClick={handleSaveDetails} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="btn-primary text-[12px]"><Save className="w-3.5 h-3.5" /> Save</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
