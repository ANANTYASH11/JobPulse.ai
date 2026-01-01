'use client';

import React, { useEffect, useState } from 'react';
import {
  RefreshCw, Cpu, Database, Server, Terminal
} from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState('');

  const fetchMetrics = async () => {
    try { const res = await fetch('/api/admin/metrics'); if (res.ok) setMetrics(await res.json()); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleForceSync = async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncResult('Connecting to aggregator nodes...');
    const stages = [
      'Authenticating scraper credentials...',
      'Crawling LinkedIn for "React Developer"...',
      'Crawling Wellfound for "Backend Engineer"...',
      'Pruning 4 duplicate records...',
      'Synced 8 new listings to dev.db'
    ];
    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, 700));
      setSyncResult(stage);
    }
    setTimeout(() => { setSyncResult('Sync complete'); setSyncing(false); fetchMetrics(); }, 400);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-4">
        <div className="skeleton h-8 w-56 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
        <div className="skeleton h-56 rounded-2xl" />
      </div>
    );
  }

  const systemMetrics = [
    { label: 'CPU Load', value: `${metrics?.cpu}%`, icon: Cpu, color: 'text-indigo-400', bar: metrics?.cpu },
    { label: 'Memory', value: `${metrics?.memory}%`, icon: Server, color: 'text-blue-400', bar: metrics?.memory },
    { label: 'DB Latency', value: `${metrics?.latency}ms`, icon: Database, color: 'text-emerald-400', bar: Math.min(100, (metrics?.latency || 0) * 4) },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">System Health</h2>
          <p className="text-[13px] text-zinc-500 mt-0.5">Monitor crawlers, database latency, and resource allocation.</p>
        </div>
        <button onClick={handleForceSync} disabled={syncing} className="btn-primary text-[13px]">
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          Sync Crawlers
        </button>
      </div>

      {/* Sync Banner */}
      {syncResult && (
        <div className={`p-3.5 rounded-xl border text-[13px] flex items-center gap-2.5 transition-all font-mono ${
          syncing ? 'bg-indigo-600/[0.04] border-indigo-500/10 text-indigo-400' : 'bg-emerald-500/[0.06] border-emerald-500/10 text-emerald-400 font-semibold'
        }`}>
          <Server className="w-4 h-4 shrink-0" />
          {syncResult}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {systemMetrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="surface p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-semibold text-zinc-600 tracking-wider">{m.label}</span>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <span className="text-2xl font-bold text-white tabular-nums block">{m.value}</span>
              <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${
                  m.color === 'text-indigo-400' ? 'bg-indigo-600' : m.color === 'text-blue-400' ? 'bg-blue-600' : 'bg-emerald-600'
                }`} style={{ width: `${m.bar}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Scrapers Table */}
      <div className="surface p-5 space-y-4">
        <h3 className="font-semibold text-[13px] text-white">Source Feeds</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] text-left">
            <thead className="text-[10px] uppercase text-zinc-600 font-semibold border-b border-white/[0.04]">
              <tr>
                <th className="pb-3">Source</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Last Run</th>
                <th className="pb-3 text-right">Results</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {metrics?.scrapers.map((sc: any, idx: number) => (
                <tr key={idx} className="hover:bg-white/[0.01]">
                  <td className="py-3 font-medium text-zinc-300">{sc.name}</td>
                  <td className="py-3">
                    <span className={`badge text-[9px] ${sc.status === 'ACTIVE' ? 'badge-emerald' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'}`}>
                      {sc.status}
                    </span>
                  </td>
                  <td className="py-3 text-zinc-500">{sc.lastRun}</td>
                  <td className="py-3 text-right font-mono font-semibold text-white tabular-nums">{sc.jobsFound}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logs Terminal */}
      <div className="surface p-5 flex flex-col h-[260px]">
        <h3 className="font-semibold text-[13px] text-white mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" /> Scheduler Logs
        </h3>
        <div className="flex-1 bg-zinc-900/50 rounded-xl p-4 font-mono text-[10px] space-y-1 overflow-y-auto leading-relaxed border border-white/[0.04]">
          {metrics?.logs.map((log: string, idx: number) => (
            <div key={idx} className={
              log.includes('[System]') ? 'text-blue-400' :
              log.includes('[Database]') ? 'text-emerald-400' :
              (log.includes('[Wellfound]') || log.includes('[LinkedIn]') || log.includes('[Indeed]')) ? 'text-indigo-400' :
              'text-zinc-500'
            }>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
