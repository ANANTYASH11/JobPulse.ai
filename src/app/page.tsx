'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Briefcase, Award, FileText, CheckSquare, Sparkles, ArrowUpRight, ChevronDown, Upload, Cpu, Zap, Users, Star } from 'lucide-react';

/* ─── Reusable scroll-reveal wrapper ─── */
function Reveal({ children, delay = 0, direction = 'up', className = '' }: { children: React.ReactNode; delay?: number; direction?: 'up' | 'left' | 'right' | 'scale'; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const variants: Record<string, any> = {
    up: { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } },
    left: { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } },
    scale: { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } },
  };
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={variants[direction]}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }} className={className}>
      {children}
    </motion.div>
  );
}

/* ─── Animated counter ─── */
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    if (!inView) return;
    const dur = 1800;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setDisplay(Math.round(eased * value));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value]);
  return <span ref={ref} className="tabular-nums">{display}{suffix}</span>;
}

/* ─── 3D Tilt Card ─── */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
  };
  const handleLeave = () => { if (ref.current) ref.current.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale(1)'; };
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      className={`transition-transform duration-300 ease-out will-change-transform ${className}`} style={{ transformStyle: 'preserve-3d' }}>
      {children}
    </div>
  );
}

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const features = [
    { title: 'Intelligent Job Crawler', description: 'Aggregates developer roles posted within 48 hours across trusted platforms. Filters by experience, stack, and location.', icon: Briefcase, accent: 'from-blue-500/20 to-cyan-500/10', iconColor: 'text-blue-400' },
    { title: 'ATS Resume Optimizer', description: 'Analyzes keyword gaps between your resume and target JDs. Generates tailored cover letters with Gemini AI.', icon: FileText, accent: 'from-violet-500/20 to-purple-500/10', iconColor: 'text-violet-400' },
    { title: 'AI Mock Interview Arena', description: 'Practice with webcam analysis, speech feedback, a coding IDE with test runners, and system design whiteboarding.', icon: Award, accent: 'from-amber-500/20 to-orange-500/10', iconColor: 'text-amber-400' },
    { title: 'Application Pipeline Tracker', description: 'Visual Kanban board to manage your pipeline from application to offer, with automated timeline tracking.', icon: CheckSquare, accent: 'from-emerald-500/20 to-teal-500/10', iconColor: 'text-emerald-400' },
  ];

  const steps = [
    { num: '01', title: 'Upload Your Resume', desc: 'Paste your resume text and our AI extracts skills, experience, and keywords instantly.', icon: Upload },
    { num: '02', title: 'Get Matched & Scored', desc: 'We crawl fresh jobs and score each against your profile. See your ATS compatibility in seconds.', icon: Cpu },
    { num: '03', title: 'Ace Your Interview', desc: 'Practice with AI-powered mock interviews, get real-time feedback, and track your improvement.', icon: Zap },
  ];

  const techStack = ['Next.js', 'React 19', 'Prisma ORM', 'SQLite', 'Gemini AI', 'TypeScript', 'Framer Motion', 'Recharts', 'Tailwind CSS', 'Lucide Icons'];

  const testimonials = [
    { name: 'Aarav Mehta', uni: 'IIT Delhi, CSE \'26', quote: 'JobPulse helped me track 30+ applications without losing my mind. The ATS scorer alone saved me hours of guesswork.', avatar: '🧑‍💻' },
    { name: 'Priya Sharma', uni: 'BITS Pilani, IT \'25', quote: 'The mock interview arena is insanely good. I practiced system design questions and got a pre-placement offer at a Big 4.', avatar: '👩‍🎓' },
    { name: 'Rohit Verma', uni: 'NIT Trichy, ECE \'26', quote: 'I used to apply blindly. Now I know exactly which keywords I\'m missing and fix my resume before every application.', avatar: '👨‍💼' },
  ];

  const faqs = [
    { q: 'How does the job crawler work?', a: 'JobPulse scrapes trusted tech job boards every few hours and indexes roles posted within the last 48 hours. Results are filtered by your profile skills and preferences.' },
    { q: 'Is my data stored securely?', a: 'All data is stored locally in a SQLite database on your machine. No external data transmission occurs unless you explicitly use the Gemini API for AI features.' },
    { q: 'Can I practice coding interviews?', a: 'Yes. The coding arena includes a full IDE with syntax highlighting, multi-language support (JS, Python, C++, Java), test case validation, and AI-powered solution feedback.' },
    { q: 'What AI model powers the platform?', a: 'JobPulse uses Google Gemini for resume analysis, interview feedback, and the career copilot chatbot. A high-fidelity fallback simulator runs when no API key is configured.' },
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="w-full flex flex-col items-center overflow-hidden">

      {/* ═══ Hero ═══ */}
      <section ref={heroRef} className="relative w-full min-h-[92vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Parallax decorative elements */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-indigo-600/[0.06] blur-[140px]" />
          <div className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full bg-violet-600/[0.04] blur-[100px]" />
          <div className="absolute top-20 left-10 w-[300px] h-[300px] rounded-full bg-amber-500/[0.03] blur-[100px]" />
          {/* Decorative floating shapes */}
          <motion.div animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[18%] right-[15%] w-16 h-16 rounded-xl border border-indigo-500/10 bg-indigo-500/[0.04] rotate-12" />
          <motion.div animate={{ y: [0, 12, 0], rotate: [0, -3, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-[25%] left-[12%] w-12 h-12 rounded-full border border-violet-500/10 bg-violet-500/[0.04]" />
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-[40%] left-[8%] w-8 h-8 rounded-md border border-amber-500/10 bg-amber-500/[0.04] rotate-45" />
        </motion.div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-3xl mx-auto space-y-7">
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }} className="badge badge-indigo mx-auto">
            <Sparkles className="w-3 h-3" /> AI-Powered Career Operating System
          </motion.div>

          <div className="overflow-hidden">
            <motion.h1 initial={{ y: 80 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
              Your placement run,{' '}
              <span className="font-display italic gradient-text-animated">supercharged</span>
            </motion.h1>
          </div>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Aggregate jobs, optimize your resume, practice interviews with AI feedback, and track every application — all from a single dashboard.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link href="/dashboard" className="btn-primary text-sm px-8 py-3.5 shadow-xl shadow-indigo-500/15">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link href="/jobs" className="btn-secondary text-sm px-8 py-3.5">
                Browse Jobs
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-600">
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </section>

      {/* ═══ Stats ═══ */}
      <section className="w-full max-w-5xl mx-auto px-4 -mt-6 relative z-10">
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.03] rounded-2xl overflow-hidden border border-white/[0.06]">
            {[
              { value: 48, suffix: 'hr', label: 'Crawl Window' },
              { value: 12, suffix: '+', label: 'Job Sources' },
              { value: 95, suffix: '%', label: 'ATS Accuracy' },
              { value: 500, suffix: '+', label: 'Practice Problems' },
            ].map((s, i) => (
              <div key={i} className="bg-[#0a0a0e]/80 backdrop-blur-sm p-6 text-center">
                <span className="text-2xl md:text-3xl font-bold text-white">
                  <AnimatedNumber value={s.value} suffix={s.suffix} />
                </span>
                <span className="block text-[11px] text-zinc-500 font-medium mt-1 uppercase tracking-wider">{s.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ═══ Features — Bento Grid ═══ */}
      <section className="w-full max-w-5xl mx-auto px-4 py-24 md:py-32">
        <Reveal className="text-center mb-16 space-y-4">
          <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">
            Everything you need to<br />
            <span className="font-display italic text-indigo-400">land your dream role</span>
          </h2>
          <p className="text-sm text-zinc-500 max-w-lg mx-auto">
            Four tightly integrated workspaces designed to eliminate friction from every step of your job search.
          </p>
          <div className="section-divider mx-auto" />
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            const dir = idx % 2 === 0 ? 'left' as const : 'right' as const;
            return (
              <Reveal key={idx} delay={idx * 0.1} direction={dir}>
                <TiltCard>
                  <div className={`surface surface-hover p-7 flex flex-col gap-4 h-full ${idx === 0 ? 'md:col-span-1' : ''}`}>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.accent} border border-white/[0.06] flex items-center justify-center ${feature.iconColor} transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[16px] text-white mb-2">{feature.title}</h3>
                      <p className="text-[13px] text-zinc-500 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section className="w-full max-w-5xl mx-auto px-4 pb-24 md:pb-32">
        <Reveal className="text-center mb-16 space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Three steps to <span className="font-display italic text-amber-400">placement ready</span>
          </h2>
          <div className="section-divider mx-auto" />
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Reveal key={idx} delay={idx * 0.15} direction="up">
                <div className="text-center space-y-4 relative">
                  <motion.div whileHover={{ scale: 1.08, rotate: -3 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-white/[0.06] flex items-center justify-center mx-auto text-indigo-400 relative">
                    <Icon className="w-6 h-6" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      {step.num.slice(-1)}
                    </span>
                  </motion.div>
                  <h3 className="font-semibold text-[15px] text-white">{step.title}</h3>
                  <p className="text-[13px] text-zinc-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ═══ Tech Stack Marquee ═══ */}
      <section className="w-full border-y border-white/[0.04] py-5 overflow-hidden bg-white/[0.01]">
        <div className="marquee-track">
          {[...techStack, ...techStack].map((tech, i) => (
            <span key={i} className="text-[12px] text-zinc-600 font-medium px-6 whitespace-nowrap flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-indigo-500/40" />
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* ═══ Testimonials ═══ */}
      <section className="w-full max-w-5xl mx-auto px-4 py-24 md:py-32">
        <Reveal className="text-center mb-14 space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Loved by <span className="font-display italic text-emerald-400">ambitious students</span>
          </h2>
          <div className="section-divider mx-auto" />
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, idx) => (
            <Reveal key={idx} delay={idx * 0.12} direction={idx === 1 ? 'up' : idx === 0 ? 'left' : 'right'}>
              <div className={`surface p-6 space-y-4 ${idx === 1 ? 'md:-mt-4' : ''}`}>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-[13px] text-zinc-400 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                  <span className="text-2xl">{t.avatar}</span>
                  <div>
                    <span className="text-[13px] font-semibold text-white block">{t.name}</span>
                    <span className="text-[11px] text-zinc-600">{t.uni}</span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ CTA Banner ═══ */}
      <section className="w-full max-w-5xl mx-auto px-4 pb-24">
        <Reveal direction="scale">
          <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-indigo-600/[0.08] via-transparent to-violet-600/[0.04] p-10 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9zdmc+')] opacity-50" />
            <div className="relative z-10 space-y-5">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Ready to accelerate your <span className="font-display italic text-indigo-400">placement?</span>
              </h2>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                Start practicing mock interviews, optimizing your resume, and tracking applications today.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link href="/interview-prep" className="btn-primary text-sm px-8 py-3.5 mx-auto shadow-xl shadow-indigo-500/20">
                  Launch Interview Arena <ArrowUpRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="w-full max-w-3xl mx-auto px-4 pb-24">
        <Reveal className="text-center mb-10 space-y-3">
          <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
          <div className="section-divider mx-auto" />
        </Reveal>
        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <Reveal key={idx} delay={idx * 0.06}>
              <div className="border border-white/[0.06] rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left text-[13px] font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer">
                  {faq.q}
                  <motion.div animate={{ rotate: openFaq === idx ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0 ml-4" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}>
                      <div className="px-4 pb-4">
                        <p className="text-[13px] text-zinc-500 leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="w-full border-t border-white/[0.04] py-10 bg-[#050507]/50">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-600">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[8px] font-bold">JP</div>
            <div>
              <span className="block text-zinc-400 font-medium">JobPulse AI</span>
              <span>© 2026 · Made with ☕ by humans, powered by AI</span>
            </div>
          </div>
          <div className="flex gap-6">
            <Link href="/admin" className="hover:text-zinc-300 transition-colors">System Health</Link>
            <a href="https://nextjs.org" target="_blank" className="hover:text-zinc-300 transition-colors">Next.js</a>
            <a href="https://prisma.io" target="_blank" className="hover:text-zinc-300 transition-colors">Prisma</a>
            <a href="https://ai.google.dev" target="_blank" className="hover:text-zinc-300 transition-colors">Gemini AI</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
