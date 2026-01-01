'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Video, Cpu, ShieldCheck, Play, ArrowRight, CheckCircle2,
  ChevronRight, MessageSquare, RefreshCw
} from 'lucide-react';
import WebcamAnalyzer from '@/components/WebcamAnalyzer';
import CodeEditor from '@/components/CodeEditor';
import WhiteboardCanvas from '@/components/WhiteboardCanvas';

interface Question { id: number; question: string; type: 'technical' | 'behavioral' | 'hr'; expectedKeywords: string[]; }

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } } };

export default function InterviewPrep() {
  const [sessionActive, setSessionActive] = useState(false);
  const [role, setRole] = useState('Software Engineer');
  const [difficulty, setDifficulty] = useState('Medium');
  const [arenaType, setArenaType] = useState<'video' | 'coding' | 'design'>('video');
  const [company, setCompany] = useState('Google');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState<any>(null);
  const [transcript, setTranscript] = useState<Array<{ q: string; a: string; score: number; feedback: string }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSessionResult, setSavedSessionResult] = useState<any>(null);

  const startSession = async () => {
    setSessionActive(true); setQuestions([]); setCurrentIdx(0); setTranscript([]); setLastEvaluation(null); setAnswerText(''); setSavedSessionResult(null);
    try {
      const res = await fetch('/api/interview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'start', role, company, difficulty }) });
      if (res.ok) { const data = await res.json(); setQuestions(data.questions); }
    } catch (e) { console.error(e); }
  };

  const handleEvaluateAnswer = async () => {
    if (!answerText.trim() || evaluating) return;
    setEvaluating(true); setLastEvaluation(null);
    const q = questions[currentIdx];
    try {
      const res = await fetch('/api/interview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'evaluate', question: q.question, answer: answerText, expectedKeywords: q.expectedKeywords }) });
      if (res.ok) { const data = await res.json(); setLastEvaluation(data); setTranscript(prev => [...prev, { q: q.question, a: answerText, score: data.score, feedback: data.feedback }]); }
    } catch (e) { console.error(e); } finally { setEvaluating(false); }
  };

  const handleNext = () => {
    setLastEvaluation(null); setAnswerText('');
    if (currentIdx + 1 < questions.length) setCurrentIdx(prev => prev + 1);
    else saveSessionData();
  };

  const saveSessionData = async () => {
    setIsSaving(true);
    const totalScore = transcript.reduce((acc, curr) => acc + curr.score, 0);
    const avgScore = transcript.length > 0 ? Math.round(totalScore / transcript.length) : 78;
    const details = { communicationScore: transcript.length > 0 ? Math.round(transcript.reduce((acc, curr) => acc + (curr.score + 5), 0) / transcript.length) : 80, technicalScore: avgScore, grammarScore: 88, fillersCount: transcript.length * 2 };
    try {
      const res = await fetch('/api/interview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'save_session', role, type: arenaType.toUpperCase(), difficulty, company, score: avgScore, details, feedback: `Completed mock session for ${role}. Score: ${avgScore}%.`, transcript }) });
      if (res.ok) setSavedSessionResult(await res.json());
    } catch (e) { console.error(e); } finally { setIsSaving(false); }
  };

  const codingStarterTemplates = {
    javascript: `function maxSubArray(nums) {\n  let maxSum = nums[0];\n  let currentSum = nums[0];\n  for(let i = 1; i < nums.length; i++) {\n    currentSum = Math.max(nums[i], currentSum + nums[i]);\n    maxSum = Math.max(maxSum, currentSum);\n  }\n  return maxSum;\n}`,
    python: `def maxSubArray(nums: list[int]) -> int:\n    max_sum = nums[0]\n    curr_sum = nums[0]\n    for x in nums[1:]:\n        curr_sum = max(x, curr_sum + x)\n        max_sum = max(max_sum, curr_sum)\n    return max_sum`,
    cpp: `int maxSubArray(vector<int>& nums) {\n    int maxSum = nums[0];\n    int currSum = nums[0];\n    for (size_t i = 1; i < nums.size(); ++i) {\n        currSum = max(nums[i], currSum + nums[i]);\n        maxSum = max(maxSum, currSum);\n    }\n    return maxSum;\n}`,
    java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        int maxSum = nums[0];\n        int currSum = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            currSum = Math.max(nums[i], currSum + nums[i]);\n            maxSum = Math.max(maxSum, currSum);\n        }\n        return maxSum;\n    }\n}`
  };

  const codingTestCases = [
    { input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]', output: '6' },
    { input: '[1]', output: '1' },
    { input: '[5, 4, -1, 7, 8]', output: '23' }
  ];

  const CompletionCard = ({ title, score, xp }: { title: string; score: number; xp: number }) => (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="surface p-8 text-center space-y-5 max-w-md mx-auto">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
        className="w-14 h-14 rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/10 flex items-center justify-center mx-auto text-emerald-400">
        <CheckCircle2 className="w-7 h-7" />
      </motion.div>
      <div>
        <h3 className="font-bold text-lg text-white">{title}</h3>
        <p className="text-[13px] text-zinc-500 mt-1">Session data has been saved to your profile.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/[0.04]">
        <div><span className="text-2xl font-bold text-white tabular-nums">{score}%</span><span className="block text-[10px] text-zinc-600 font-medium uppercase tracking-wider mt-0.5">Score</span></div>
        <div><span className="text-2xl font-bold text-indigo-400 tabular-nums">+{xp}</span><span className="block text-[10px] text-zinc-600 font-medium uppercase tracking-wider mt-0.5">XP Earned</span></div>
      </div>
      <button onClick={() => setSessionActive(false)} className="btn-secondary text-[13px]">Return to Arena</button>
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-lg font-semibold text-white">Interview <span className="font-display italic text-indigo-400">Arena</span></h2>
        <p className="text-[13px] text-zinc-500 mt-0.5">Practice technical interviews, coding challenges, and system design reviews.</p>
      </motion.div>

      {/* Configuration */}
      <AnimatePresence mode="wait">
        {!sessionActive && (
          <motion.div key="config" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }} className="surface p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-semibold text-zinc-600 tracking-wider">Mode</label>
                <div className="flex flex-col gap-1.5">
                  {[{ id: 'video', label: 'Speech & Video', icon: Video }, { id: 'coding', label: 'Coding Platform', icon: Cpu }, { id: 'design', label: 'System Design', icon: ShieldCheck }].map((type) => {
                    const Icon = type.icon;
                    return (
                      <motion.button key={type.id} onClick={() => setArenaType(type.id as any)}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-[13px] font-medium transition-all text-left cursor-pointer ${
                          arenaType === type.id ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20 shadow-sm shadow-indigo-500/5' : 'bg-transparent text-zinc-500 border-white/[0.06] hover:text-zinc-300'
                        }`}>
                        <Icon className="w-4 h-4 shrink-0" /> {type.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-semibold text-zinc-600 tracking-wider">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field mt-0.5 text-[13px]">
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="AI/ML Engineer">AI/ML Engineer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="HR / Behavioral">HR / Behavioral</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-semibold text-zinc-600 tracking-wider">Company</label>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Google, Stripe, Amazon..." className="input-field mt-0.5 text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-semibold text-zinc-600 tracking-wider">Difficulty</label>
                <div className="flex gap-1.5 mt-0.5">
                  {['Easy', 'Medium', 'Hard'].map((lvl) => (
                    <motion.button key={lvl} onClick={() => setDifficulty(lvl)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className={`flex-1 py-2.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                        difficulty === lvl ? 'bg-white/[0.08] text-white border-white/[0.12]' : 'bg-transparent text-zinc-600 border-white/[0.06] hover:text-zinc-300'
                      }`}>{lvl}</motion.button>
                  ))}
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-white/[0.04] flex justify-end">
              <motion.button onClick={startSession} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="btn-primary text-[13px] px-6 py-2.5">
                Start Session <Play className="w-3.5 h-3.5 fill-current" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Session */}
      <AnimatePresence mode="wait">
        {sessionActive && (
          <motion.div key="session" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="space-y-5">
            <div className="surface p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400 text-[10px] font-bold breathe-glow">LIVE</div>
                <div>
                  <h3 className="font-semibold text-[13px] text-white">{role} Interview</h3>
                  <span className="text-[11px] text-zinc-600">{company} · {difficulty}</span>
                </div>
              </div>
              <button onClick={() => setSessionActive(false)} className="btn-secondary text-[12px] py-2 px-4">Exit</button>
            </div>

            {arenaType === 'video' && (
              <div className="space-y-5">
                {questions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[250px]">
                    <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    <span className="text-[13px] text-zinc-600 mt-3">Generating questions...</span>
                  </div>
                ) : savedSessionResult ? (
                  <CompletionCard title="Interview Complete" score={savedSessionResult.session.score} xp={Math.round(savedSessionResult.session.score * 1.5)} />
                ) : (
                  <div className="space-y-5">
                    <WebcamAnalyzer />
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="surface p-5 space-y-4">
                      <div className="flex justify-between items-center text-[11px] text-zinc-600">
                        <span className="font-medium">Question {currentIdx + 1} of {questions.length}</span>
                        <span className="badge badge-indigo text-[10px]">{questions[currentIdx]?.type}</span>
                      </div>
                      <AnimatePresence mode="wait">
                        <motion.h3 key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                          className="font-semibold text-[15px] text-white leading-relaxed">{questions[currentIdx]?.question}</motion.h3>
                      </AnimatePresence>
                      {lastEvaluation ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className="p-5 rounded-xl bg-indigo-600/[0.04] border border-indigo-500/10 space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                            <div><span className="text-lg font-bold text-white tabular-nums">{lastEvaluation.score}</span><span className="block text-[9px] text-zinc-600 uppercase mt-0.5">Score</span></div>
                            <div><span className="text-lg font-bold text-indigo-400 tabular-nums">{lastEvaluation.technicalScore}</span><span className="block text-[9px] text-zinc-600 uppercase mt-0.5">Technical</span></div>
                            <div><span className="text-lg font-bold text-blue-400 tabular-nums">{lastEvaluation.communicationScore}</span><span className="block text-[9px] text-zinc-600 uppercase mt-0.5">Communication</span></div>
                            <div><span className="text-lg font-bold text-amber-400 tabular-nums">{lastEvaluation.fillersCount}</span><span className="block text-[9px] text-zinc-600 uppercase mt-0.5">Fillers</span></div>
                          </div>
                          <div className="text-[12px] text-zinc-400 space-y-2 pt-3 border-t border-white/[0.04]">
                            <p><strong className="text-zinc-300">Feedback:</strong> {lastEvaluation.feedback}</p>
                            <p className="bg-zinc-900/50 p-3 rounded-lg text-zinc-500 text-[11px]"><strong>Model answer:</strong> {lastEvaluation.optimalAnswer}</p>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="space-y-2.5">
                          <textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="Type your answer..." className="input-field h-28 resize-none leading-relaxed" />
                          <p className="text-[11px] text-zinc-600 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Keywords: {questions[currentIdx]?.expectedKeywords.join(', ')}</p>
                        </div>
                      )}
                      <div className="flex justify-end gap-2 pt-1">
                        {!lastEvaluation ? (
                          <motion.button onClick={handleEvaluateAnswer} disabled={evaluating || !answerText.trim()}
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            className="btn-primary text-[13px] disabled:opacity-40">
                            {evaluating ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Evaluating...</> : 'Submit Answer'}
                          </motion.button>
                        ) : (
                          <motion.button onClick={handleNext} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary text-[13px]">
                            {currentIdx + 1 < questions.length ? <>Next <ChevronRight className="w-3.5 h-3.5" /></> : <>Finish <ArrowRight className="w-3.5 h-3.5" /></>}
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            )}

            {arenaType === 'coding' && (
              <div className="space-y-5">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="surface p-5 space-y-2">
                  <div className="flex justify-between items-center text-[11px] text-zinc-600">
                    <span className="font-medium">Challenge #39</span><span className="badge badge-amber text-[10px]">Medium</span>
                  </div>
                  <h3 className="font-semibold text-[15px] text-white">Maximum Subarray Sum (Kadane&apos;s Algorithm)</h3>
                  <p className="text-[12px] text-zinc-500 leading-relaxed">Find the contiguous subarray with the largest sum. Optimize to O(N) runtime.</p>
                </motion.div>
                <CodeEditor problemId="kadanes_algorithm" starterTemplates={codingStarterTemplates} testCases={codingTestCases}
                  onComplete={(score) => { setTranscript([{ q: 'Kadane algorithm', a: 'Solution submitted', score, feedback: 'Correct.' }]); }} />
                {transcript.length > 0 && !savedSessionResult && (
                  <div className="flex justify-end">
                    <motion.button onClick={saveSessionData} disabled={isSaving} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary text-[13px]">
                      {isSaving ? 'Saving...' : 'Save Session'}
                    </motion.button>
                  </div>
                )}
                {savedSessionResult && <CompletionCard title="Challenge Complete" score={savedSessionResult.session.score} xp={Math.round(savedSessionResult.session.score * 1.5)} />}
              </div>
            )}

            {arenaType === 'design' && (
              <div className="space-y-5">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="surface p-5 space-y-2">
                  <div className="flex justify-between items-center text-[11px] text-zinc-600">
                    <span className="font-medium">System Design</span><span className="badge badge-rose text-[10px]">Hard</span>
                  </div>
                  <h3 className="font-semibold text-[15px] text-white">Design a Scalable E-commerce Cart API</h3>
                  <p className="text-[12px] text-zinc-500 leading-relaxed">Handle high write concurrency during flash sales. Include load balancing, caching, and message queues.</p>
                </motion.div>
                <WhiteboardCanvas />
                {!savedSessionResult && (
                  <div className="flex justify-end">
                    <button onClick={() => { setTranscript([{ q: 'System design', a: 'Architecture submitted', score: 90, feedback: 'Good decoupling.' }]); saveSessionData(); }}
                      className="btn-secondary text-[13px]">Mark Complete</button>
                  </div>
                )}
                {savedSessionResult && <CompletionCard title="Design Review Complete" score={90} xp={135} />}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
