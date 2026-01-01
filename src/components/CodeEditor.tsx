'use client';

import React, { useState } from 'react';
import { Play, Send, Terminal, Loader2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

interface CodeEditorProps {
  problemId: string;
  starterTemplates: Record<string, string>; // Language -> starter code
  testCases: Array<{ input: string; output: string }>;
  onComplete?: (score: number) => void;
}

export default function CodeEditor({ problemId, starterTemplates, testCases, onComplete }: CodeEditorProps) {
  const languages = ['javascript', 'python', 'cpp', 'java'];
  const [selectedLang, setSelectedLang] = useState('javascript');
  
  // Initialize values
  const defaultCode = starterTemplates[selectedLang] || `// Write your code here...`;
  const [code, setCode] = useState(defaultCode);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<Array<{ input: string; expected: string; actual: string; passed: boolean }>>([]);
  const [submitFeedback, setSubmitFeedback] = useState<{ score: number; text: string } | null>(null);

  const handleLanguageChange = (lang: string) => {
    setSelectedLang(lang);
    setCode(starterTemplates[lang] || `// Starter code for ${lang}...`);
  };

  const handleRun = () => {
    if (isRunning) return;
    setIsRunning(true);
    setConsoleLogs([`[System] Initializing V8 Engine environment...`, `[System] Bundling source files...`]);
    setTestResults([]);

    setTimeout(() => {
      // Simulate compiling
      const logs = [
        `[System] Compilation successful.`,
        `[Console] Executing main thread...`,
        `[Console] Heap used: 12.4 MB`
      ];

      const results = testCases.map((tc, idx) => {
        // Quick simulator logic: if user code is not edited, it might fail, if edited it has high chance to pass
        const isDefault = code.includes('//') && code.length < 200;
        const passed = !isDefault || Math.random() > 0.3; // Give a chance of success
        
        return {
          input: tc.input,
          expected: tc.output,
          actual: passed ? tc.output : 'NullPointer / Undefined',
          passed
        };
      });

      setConsoleLogs(prev => [...prev, ...logs, `[System] Checked ${results.length} test cases.`]);
      setTestResults(results);
      setIsRunning(false);
    }, 1500);
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitFeedback(null);

    setTimeout(() => {
      // Grade based on code changes and run results
      const totalPassed = testResults.filter(r => r.passed).length;
      const score = Math.max(40, Math.round((totalPassed / (testResults.length || 1)) * 100));
      
      setSubmitFeedback({
        score,
        text: score > 80 
          ? 'Excellent! Optimal runtime complex (O(N)) and space complexity (O(1)) achieved. Dynamic Programming cache hits utilized perfectly.'
          : 'Submission accepted, but space complexity can be optimized from O(N) to O(1) by avoiding additional hash buffers.'
      });
      setIsSubmitting(false);

      if (onComplete) {
        onComplete(score);
      }
    }, 2000);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6">
      {/* Code Editor Panel */}
      <div className="flex-1 glass rounded-2xl overflow-hidden border border-white/5 flex flex-col min-h-[500px]">
        {/* Editor Header Toolbar */}
        <div className="p-4 border-b border-white/5 bg-zinc-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-[10px] text-gray-500 font-mono ml-4">COMPILER_PORT_8080.sh</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <select
              value={selectedLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-zinc-900 border border-white/5 text-xs text-gray-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-violet-500 font-mono capitalize"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang === 'cpp' ? 'C++' : lang}
                </option>
              ))}
            </select>

            <button
              onClick={() => setCode(starterTemplates[selectedLang] || '')}
              className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              title="Reset Code"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Text Area Input */}
        <div className="flex-1 relative">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full min-h-[380px] bg-zinc-950/40 p-5 font-mono text-xs text-green-400 placeholder-zinc-700 resize-none focus:outline-none focus:ring-0 leading-relaxed border-0"
            spellCheck="false"
          />
        </div>

        {/* Editor Bottom Actions */}
        <div className="p-4 border-t border-white/5 bg-zinc-950/40 flex items-center justify-between">
          <span className="text-[10px] text-gray-500 font-mono">UTF-8 | Tab size: 2 spaces</span>
          
          <div className="flex gap-2">
            <button
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Compiling...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> Run Code
                </>
              )}
            </button>

            <button
              onClick={handleSubmit}
              disabled={isRunning || isSubmitting || testResults.length === 0}
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Grading...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Submit Solution
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Terminal Log Console */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        {/* Console logs */}
        <div className="glass rounded-2xl p-5 border border-white/5 flex flex-col h-[260px]">
          <h4 className="font-bold text-xs text-white mb-3 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-violet-400" />
            Console Output Log
          </h4>
          <div className="flex-1 bg-zinc-950 rounded-xl p-3 font-mono text-[10px] space-y-1.5 overflow-y-auto">
            {consoleLogs.length === 0 ? (
              <span className="text-gray-600 italic">No console logs. Run your code to compile.</span>
            ) : (
              consoleLogs.map((log, idx) => (
                <div key={idx} className={log.includes('[System]') ? 'text-blue-400' : 'text-gray-400'}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Test Cases Results */}
        <div className="glass rounded-2xl p-5 border border-white/5 flex-1 flex flex-col min-h-[220px]">
          <h4 className="font-bold text-xs text-white mb-3">Test Case Validations</h4>
          <div className="flex-1 space-y-3 overflow-y-auto">
            {testResults.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center p-4">
                <p className="text-[11px] text-gray-500">Run code to see diagnostic results for each sample input.</p>
              </div>
            ) : (
              testResults.map((tr, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 flex flex-col gap-1.5 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-300">Test Case #{idx + 1}</span>
                    {tr.passed ? (
                      <span className="text-green-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 fill-green-400/10" /> Passed
                      </span>
                    ) : (
                      <span className="text-red-400 font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 fill-red-400/10" /> Failed
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-gray-500 pt-1 border-t border-white/[0.02]">
                    <div>
                      <span className="block text-[8px] text-gray-600">INPUT</span>
                      <code className="text-gray-400 font-mono truncate block">{tr.input}</code>
                    </div>
                    <div>
                      <span className="block text-[8px] text-gray-600">EXPECTED</span>
                      <code className="text-gray-400 font-mono truncate block">{tr.expected}</code>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Submit feedback alert */}
        {submitFeedback && (
          <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-violet-400">Grading Score: {submitFeedback.score}/100</span>
              <span className="text-[10px] text-gray-500 font-mono">XP Earned!</span>
            </div>
            <p className="text-gray-300 leading-normal">{submitFeedback.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
