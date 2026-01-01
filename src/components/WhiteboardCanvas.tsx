'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Cpu, Database, Globe, Layers, ShieldCheck, ArrowRight, Zap, RefreshCw } from 'lucide-react';

interface Node {
  id: string;
  type: 'client' | 'load_balancer' | 'api_gateway' | 'web_server' | 'cache' | 'database' | 'queue';
  title: string;
  x: number;
  y: number;
}

export default function WhiteboardCanvas() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', type: 'client', title: 'Client Browser', x: 50, y: 150 },
    { id: '2', type: 'load_balancer', title: 'Nginx Load Balancer', x: 220, y: 150 },
    { id: '3', type: 'web_server', title: 'Next.js App Server', x: 400, y: 100 },
    { id: '4', type: 'database', title: 'PostgreSQL DB (Master)', x: 580, y: 100 },
  ]);

  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [critiqueResult, setCritiqueResult] = useState<string | null>(null);
  const [critiqueLoading, setCritiqueLoading] = useState(false);

  const nodeTypes = [
    { type: 'client', label: 'User Client', icon: Globe, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
    { type: 'load_balancer', label: 'Load Balancer', icon: Layers, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
    { type: 'api_gateway', label: 'API Gateway', icon: ShieldCheck, color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
    { type: 'web_server', label: 'Web Server', icon: Cpu, color: 'text-pink-400 border-pink-500/30 bg-pink-500/10' },
    { type: 'cache', label: 'Redis Cache', icon: Zap, color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
    { type: 'database', label: 'Database', icon: Database, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  ];

  const addNode = (type: any, label: string) => {
    const id = Date.now().toString();
    const newNode: Node = {
      id,
      type,
      title: label,
      x: 100 + Math.random() * 80,
      y: 100 + Math.random() * 80,
    };
    setNodes(prev => [...prev, newNode]);
    setCritiqueResult(null);
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setCritiqueResult(null);
  };

  // Node Drag Handlers
  const handleMouseDown = (e: React.MouseEvent, node: Node) => {
    setDraggedNodeId(node.id);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNodeId) return;

    const canvasRect = e.currentTarget.getBoundingClientRect();
    const newX = Math.max(10, Math.min(canvasRect.width - 150, e.clientX - canvasRect.left - dragOffset.x));
    const newY = Math.max(10, Math.min(canvasRect.height - 70, e.clientY - canvasRect.top - dragOffset.y));

    setNodes(prev => prev.map(n => n.id === draggedNodeId ? { ...n, x: newX, y: newY } : n));
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
  };

  const analyzeArchitecture = () => {
    if (critiqueLoading) return;
    setCritiqueLoading(true);

    setTimeout(() => {
      const hasCache = nodes.some(n => n.type === 'cache');
      const hasDB = nodes.some(n => n.type === 'database');
      const hasLB = nodes.some(n => n.type === 'load_balancer');

      let critique = '';
      if (!hasLB) {
        critique += `⚠️ **Single Point of Entry**: You are missing a Load Balancer. High traffic spikes will overwhelm your Web Server.\n\n`;
      } else {
        critique += `✅ **Ingress Router**: Load Balancer correctly balances traffic across server clusters.\n\n`;
      }

      if (!hasCache) {
        critique += `⚠️ **Database Bottleneck**: Direct reads to your Database will hit I/O locks. Introduce a **Redis Cache** layer in front of the database for common queries.\n\n`;
      } else {
        critique += `✅ **Caching Layer**: Redis cache handles session store and metadata queries, reducing latency to <5ms.\n\n`;
      }

      if (!hasDB) {
        critique += `❌ **No Persistent Storage**: There is no database layer to store profiles or session keys. Please add a relational database.\n\n`;
      } else {
        critique += `✅ **Persistence System**: Database node config handles indexing. Consider adding a **Read-Replica** database node for redundancy if traffic scales.`;
      }

      setCritiqueResult(critique);
      setCritiqueLoading(false);
    }, 1500);
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6">
      {/* Sidebar Tool Drawer */}
      <div className="w-full xl:w-72 glass border border-white/5 rounded-2xl p-5 flex flex-col gap-5 shrink-0">
        <div>
          <h4 className="font-bold text-xs text-white mb-1.5">Architectural Elements</h4>
          <p className="text-[10px] text-gray-500 mb-3">Click on a block type below to spawn it onto the canvas grid.</p>
          
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-2">
            {nodeTypes.map((nt) => {
              const Icon = nt.icon;
              return (
                <button
                  key={nt.type}
                  onClick={() => addNode(nt.type, nt.label)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 text-gray-300 text-xs transition-all text-left cursor-pointer"
                >
                  <Icon className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>{nt.label}</span>
                  <Plus className="w-3.5 h-3.5 ml-auto text-gray-600" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
          <button
            onClick={analyzeArchitecture}
            disabled={critiqueLoading || nodes.length === 0}
            className="w-full py-2.5 rounded-xl bg-gradient-to-tr from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 disabled:opacity-50 cursor-pointer"
          >
            {critiqueLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Evaluating Topology...
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" /> Analyze Topology
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Drag-and-Drop Canvas Board */}
      <div className="flex-1 flex flex-col gap-6">
        <div 
          className="relative h-[420px] rounded-2xl border border-white/5 bg-zinc-950/40 whiteboard-grid overflow-hidden cursor-crosshair select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Header */}
          <div className="absolute top-4 left-4 z-10 text-[10px] text-gray-500 font-mono bg-zinc-950/80 px-2.5 py-1.5 rounded-lg border border-white/5">
            DRAG AND DROP SYSTEM SCHEMATIC CANVAS
          </div>

          {/* Render nodes */}
          {nodes.map((node) => {
            const currentType = nodeTypes.find(nt => nt.type === node.type);
            const Icon = currentType?.icon || Cpu;
            const styleColor = currentType?.color || 'text-gray-400 border-white/10 bg-white/5';
            
            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleMouseDown(e, node)}
                className={`absolute w-44 rounded-xl border p-3 flex flex-col gap-2 shadow-xl cursor-grab active:cursor-grabbing transition-shadow hover:shadow-violet-500/5 ${styleColor}`}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold opacity-60 font-mono">{node.type.replace('_', ' ')}</span>
                  <button
                    onMouseDown={(e) => e.stopPropagation()} // stop drag triggering
                    onClick={() => deleteNode(node.id)}
                    className="p-1 rounded-md hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 shrink-0" />
                  <input
                    type="text"
                    value={node.title}
                    onMouseDown={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNodes(prev => prev.map(n => n.id === node.id ? { ...n, title: val } : n));
                    }}
                    className="bg-transparent border-0 text-xs font-bold text-white focus:outline-none p-0 w-full focus:ring-0"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* AI critique breakdown display */}
        {critiqueResult && (
          <div className="p-5 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-xs space-y-3">
            <h4 className="font-bold text-sm text-violet-400 flex items-center gap-2">
              <Zap className="w-4 h-4" /> AI Architectural Feedback
            </h4>
            <div className="space-y-2.5 text-gray-300 leading-relaxed font-sans">
              {critiqueResult.split('\n\n').map((paragraph, pIdx) => {
                let text = paragraph;
                let isWarning = text.startsWith('⚠️');
                let isError = text.startsWith('❌');
                let isSuccess = text.startsWith('✅');
                
                return (
                  <p key={pIdx} className={isError ? 'text-red-300' : isWarning ? 'text-yellow-300' : isSuccess ? 'text-green-300' : 'text-gray-300'}>
                    {text}
                  </p>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
