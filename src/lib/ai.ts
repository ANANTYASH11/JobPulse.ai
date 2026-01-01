import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client if the key is provided
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Helper to call Gemini model
async function callGemini(prompt: string, systemInstruction?: string, isJson: boolean = false): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini API key is not configured');
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: isJson ? { responseMimeType: 'application/json' } : undefined,
    });

    const result = await model.generateContent(
      systemInstruction 
        ? `${systemInstruction}\n\nUser Prompt: ${prompt}` 
        : prompt
    );

    return result.response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

// ----------------------------------------------------
// 1. Resume Parser
// ----------------------------------------------------
export interface ParsedProfile {
  name: string;
  email: string;
  skills: string[];
  experience: Array<{ role: string; company: string; duration: string; details: string }>;
  education: Array<{ degree: string; school: string; year: string; gpa?: string }>;
  atsScore: number;
}

export async function parseResume(resumeText: string): Promise<ParsedProfile> {
  if (genAI) {
    const systemPrompt = `You are an expert ATS (Applicant Tracking System) resume parser. 
Parse the input resume text and output a JSON object matching this structure EXACTLY:
{
  "name": "Full Name",
  "email": "Email Address",
  "skills": ["Skill1", "Skill2", ...],
  "experience": [{"role": "Job Title", "company": "Company Name", "duration": "Dates", "details": "Key bullet points"}],
  "education": [{"degree": "Degree", "school": "School Name", "year": "Dates", "gpa": "GPA if available"}],
  "atsScore": 0-100 (An estimated base ATS score out of 100 based on standard formatting and details)
}`;
    try {
      const response = await callGemini(resumeText, systemPrompt, true);
      return JSON.parse(response) as ParsedProfile;
    } catch (e) {
      console.warn('Gemini Resume Parsing failed, falling back to simulator:', e);
    }
  }

  // Local Simulator Fallback
  return simulateResumeParsing(resumeText);
}

function simulateResumeParsing(text: string): ParsedProfile {
  const lowercase = text.toLowerCase();
  
  // Extract standard contact details
  let name = 'Alex Mercer';
  let email = 'alex.mercer@gmail.com';
  
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) email = emailMatch[0];

  const nameMatch = text.split('\n')[0].trim();
  if (nameMatch && nameMatch.length < 30) name = nameMatch;

  // Extract skills based on keywords
  const skillKeywords = [
    'React', 'Next.js', 'Node.js', 'Express', 'JavaScript', 'TypeScript', 'Python', 
    'Java', 'C++', 'SQL', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 
    'Git', 'HTML', 'CSS', 'Tailwind CSS', 'Redux', 'System Design', 'Machine Learning'
  ];
  const detectedSkills: string[] = [];
  skillKeywords.forEach(skill => {
    if (lowercase.includes(skill.toLowerCase())) {
      detectedSkills.push(skill);
    }
  });

  if (detectedSkills.length === 0) {
    detectedSkills.push('JavaScript', 'React', 'HTML', 'CSS', 'Git');
  }

  return {
    name,
    email,
    skills: detectedSkills,
    experience: [
      {
        role: lowercase.includes('senior') ? 'Senior Software Engineer' : 'Software Developer Intern',
        company: lowercase.includes('amazon') ? 'Amazon' : 'Tech Solutions Inc.',
        duration: 'Jan 2025 - Present',
        details: 'Collaborated on migrating legacy codebases to Next.js, developed REST APIs, and integrated database storage.'
      }
    ],
    education: [
      {
        degree: lowercase.includes('master') ? 'Master of Science in Computer Science' : 'Bachelor of Technology in Computer Science',
        school: 'State Technical University',
        year: '2022 - 2026',
        gpa: '8.8/10'
      }
    ],
    atsScore: Math.min(60 + detectedSkills.length * 4, 98)
  };
}

// ----------------------------------------------------
// 2. Job Match Score & Gap Analyzer
// ----------------------------------------------------
export interface JobMatchResult {
  score: number;
  whyMatches: string;
  missingSkills: string[];
  recommendations: Array<{ title: string; type: 'course' | 'youtube' | 'doc' | 'practice'; link: string }>;
}

export async function analyzeJobMatch(userSkills: string[], jobTitle: string, jobDescription: string, requiredSkills: string): Promise<JobMatchResult> {
  const requiredList = requiredSkills.split(',').map(s => s.trim());
  const userSkillSet = new Set(userSkills.map(s => s.toLowerCase()));

  // Calculate missing skills
  const missingSkills = requiredList.filter(skill => !userSkillSet.has(skill.toLowerCase()));

  if (genAI) {
    const prompt = `User Skills: ${userSkills.join(', ')}
Job Title: ${jobTitle}
Required Skills: ${requiredSkills}
Job Description: ${jobDescription}

Perform a job match analysis and return a JSON matching this structure:
{
  "score": 0-100 (matching score),
  "whyMatches": "Short 1-2 sentence explanation of compatibility",
  "recommendations": [{"title": "Course/Doc/Problem Title", "type": "course|youtube|doc|practice", "link": "Suggested URL (e.g. YouTube, MDN, Leetcode)"}]
}`;
    try {
      const response = await callGemini(prompt, 'You are an AI career matchmaking engine.', true);
      const parsed = JSON.parse(response);
      return {
        score: parsed.score,
        whyMatches: parsed.whyMatches,
        missingSkills,
        recommendations: parsed.recommendations
      };
    } catch (e) {
      console.warn('Gemini Job Match failed, falling back to simulator:', e);
    }
  }

  // Local Simulator Fallback
  const totalRequired = requiredList.length || 1;
  const matchingCount = requiredList.filter(s => userSkillSet.has(s.toLowerCase())).length;
  const baseScore = Math.round((matchingCount / totalRequired) * 100);
  const score = Math.max(25, Math.min(baseScore + 10, 98)); // buffer

  let whyMatches = '';
  if (score > 85) {
    whyMatches = `Excellent fit! You possess ${matchingCount} of the ${totalRequired} core skills required, including ${userSkills.slice(0, 2).join(' and ')}.`;
  } else if (score > 60) {
    whyMatches = `Good compatibility. You have foundational skills, but adding ${missingSkills.slice(0, 2).join(', ')} will make you a prime candidate.`;
  } else {
    whyMatches = `Low compatibility. This role relies heavily on ${missingSkills.slice(0, 3).join(', ')}, which are not listed on your profile.`;
  }

  const recommendations: Array<{ title: string; type: 'course' | 'youtube' | 'doc' | 'practice'; link: string }> = missingSkills.map(skill => {
    return {
      title: `Mastering ${skill} from Scratch`,
      type: 'course',
      link: `https://www.youtube.com/results?search_query=learn+${encodeURIComponent(skill)}`
    };
  });

  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Advanced System Design and Scaling APIs',
      type: 'doc',
      link: 'https://systemdesignprimer.com'
    });
  }

  return {
    score,
    whyMatches,
    missingSkills,
    recommendations
  };
}

// ----------------------------------------------------
// 3. AI Cover Letter Generator
// ----------------------------------------------------
export async function generateCoverLetter(userName: string, userSkills: string[], jobTitle: string, company: string, jobDescription: string): Promise<string> {
  if (genAI) {
    const prompt = `Candidate Name: ${userName}
Skills: ${userSkills.join(', ')}
Job Title: ${jobTitle}
Company: ${company}
Description: ${jobDescription}

Generate a highly professional, keyword-optimized cover letter that addresses the hiring manager, highlights relevant skills, and expresses enthusiasm for this specific role.`;
    try {
      return await callGemini(prompt, 'You are a professional resume writer.');
    } catch (e) {
      console.warn('Gemini Cover Letter failed, using simulator:', e);
    }
  }

  // Local Simulator Fallback
  return `Dear Hiring Team at ${company},

I am writing to express my strong interest in the ${jobTitle} position at ${company}. As a developer skilled in ${userSkills.slice(0, 5).join(', ')}, I am excited to apply my experience in building responsive web products to your active engineering teams.

In my recent projects, I have focused on writing clean, scalable code and collaborating with engineers to implement secure API endpoints and interactive client interfaces. I appreciate ${company}'s focus on innovation and technical excellence, and I believe my background aligns perfectly with your goals.

Thank you for your time and consideration. I look forward to discussing how my experience can contribute to the success of ${company}.

Sincerely,
${userName}`;
}

// ----------------------------------------------------
// 4. AI Interview Prep
// ----------------------------------------------------
export interface InterviewQuestion {
  id: number;
  question: string;
  type: 'technical' | 'behavioral' | 'hr';
  expectedKeywords: string[];
}

export async function generateInterviewQuestions(role: string, company: string, difficulty: string, resumeText: string): Promise<InterviewQuestion[]> {
  if (genAI) {
    const prompt = `Role: ${role}
Company: ${company}
Difficulty: ${difficulty}
Candidate Resume Context: ${resumeText}

Generate 5 tailored interview questions (a mix of technical, behavioral, and HR questions). Make them deep and resume-based where possible.
Output a JSON array matching:
[
  {
    "id": 1,
    "question": "Question text",
    "type": "technical|behavioral|hr",
    "expectedKeywords": ["keyword1", "keyword2"]
  }
]`;
    try {
      const response = await callGemini(prompt, 'You are an elite technical interviewer.', true);
      return JSON.parse(response) as InterviewQuestion[];
    } catch (e) {
      console.warn('Gemini Questions failed, using simulator:', e);
    }
  }

  // Local Simulator Fallback
  return [
    {
      id: 1,
      question: `How do you optimize rendering performance in a modern ${role} application? Explain with respect to React 19/server components if applicable.`,
      type: 'technical',
      expectedKeywords: ['Virtual DOM', 'Rehydration', 'Lazy Loading', 'Caching', 'Memoization']
    },
    {
      id: 2,
      question: `In your resume, you listed experience with database schema design. How do you design databases for high write concurrency, and why would you choose SQL over NoSQL (or vice versa)?`,
      type: 'technical',
      expectedKeywords: ['Indexing', 'Normalization', 'Sharding', 'ACID', 'Replication']
    },
    {
      id: 3,
      question: `Describe a time at a previous project/internship where you had a disagreement with a team member about a technical decision. How did you handle it and what was the outcome?`,
      type: 'behavioral',
      expectedKeywords: ['STAR', 'Collaboration', 'Compromise', 'Communication', 'Resolving']
    },
    {
      id: 4,
      question: `Why do you want to join ${company || 'our company'}, and how does this role align with your 5-year career objectives?`,
      type: 'hr',
      expectedKeywords: ['Growth', 'Culture', 'Vision', 'Contribution', 'Skillset']
    },
    {
      id: 5,
      question: `What are your salary expectations for this role, and are you open to relocation or hybrid setups if required?`,
      type: 'hr',
      expectedKeywords: ['Negotiation', 'Market Rate', 'Relocation', 'Flexibility']
    }
  ];
}

export interface EvaluationResult {
  score: number;
  communicationScore: number;
  technicalScore: number;
  grammarScore: number;
  fillersCount: number;
  feedback: string;
  optimalAnswer: string;
}

export async function evaluateInterviewAnswer(question: string, answer: string, expectedKeywords: string[]): Promise<EvaluationResult> {
  if (genAI) {
    const prompt = `Question: ${question}
Answer Given: ${answer}
Expected Keywords: ${expectedKeywords.join(', ')}

Analyze the answer and provide a JSON feedback evaluation matching:
{
  "score": 0-100 (overall score),
  "communicationScore": 0-100,
  "technicalScore": 0-100,
  "grammarScore": 0-100,
  "fillersCount": number (count words like "uh", "um", "like", "actually" in the answer),
  "feedback": "Constructive criticism and pointers",
  "optimalAnswer": "An example of an excellent, brief, textbook answer to this question"
}`;
    try {
      const response = await callGemini(prompt, 'You are an AI interviewer providing feedback.', true);
      return JSON.parse(response) as EvaluationResult;
    } catch (e) {
      console.warn('Gemini Evaluation failed, using simulator:', e);
    }
  }

  // Local Simulator Fallback
  const lowerAnswer = answer.toLowerCase();
  
  // Count fillers
  const fillers = (answer.match(/\b(um|uh|like|actually|basically|sort of|you know)\b/gi) || []).length;
  
  // Calculate keyword matches
  const matchedKeywords = expectedKeywords.filter(kw => lowerAnswer.includes(kw.toLowerCase()));
  const technicalScore = Math.min(30 + Math.round((matchedKeywords.length / (expectedKeywords.length || 1)) * 70), 100);
  
  // Basic heuristics
  const lengthBonus = Math.min(answer.split(' ').length / 2, 20); // up to 20 points
  const communicationScore = Math.max(40, Math.min(100 - fillers * 5 + Math.round(lengthBonus), 95));
  const grammarScore = Math.max(50, Math.min(98 - fillers * 2, 98));
  
  const score = Math.round((technicalScore * 0.5) + (communicationScore * 0.3) + (grammarScore * 0.2));

  let feedback = 'Your answer is formatted well but could benefit from deeper technical specificity. ';
  if (matchedKeywords.length > 0) {
    feedback += `Good job mentioning key concepts: ${matchedKeywords.join(', ')}. `;
  } else {
    feedback += `Try to mention foundational concepts like ${expectedKeywords.slice(0, 3).join(', ')} to sound more professional. `;
  }
  if (fillers > 2) {
    feedback += `Watch out for filler words (you used them ${fillers} times), which can detract from your confidence.`;
  }

  return {
    score,
    communicationScore,
    technicalScore,
    grammarScore,
    fillersCount: fillers,
    feedback,
    optimalAnswer: `An optimal answer should explicitly cover ${expectedKeywords.join(', ')} in a structured STAR (Situation, Task, Action, Result) format, keeping definitions crisp and sharing a brief personal engineering example.`
  };
}

// ----------------------------------------------------
// 5. Career chatbot helper
// ----------------------------------------------------
export async function chatbotResponse(history: Array<{ role: 'user' | 'model'; parts: string }>, userPrompt: string, userProfileText: string): Promise<string> {
  if (genAI) {
    try {
      const chat = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: `You are JobPulse AI, the user's autonomous career copilot and recruiter agent. 
You have access to the user's profile context: ${userProfileText}. 
Answer career questions, guide them on building resumes, negotiate salary, or explain how to prepare for interviews. Keep answers punchy and formatted in markdown.`,
      }).startChat({
        history: history.map(h => ({
          role: h.role,
          parts: [{ text: h.parts }]
        }))
      });

      const result = await chat.sendMessage(userPrompt);
      return result.response.text();
    } catch (e) {
      console.warn('Gemini Chat failed, using simulator:', e);
    }
  }

  // Local Simulator Fallback
  const query = userPrompt.toLowerCase();
  if (query.includes('resume')) {
    return `### AI Resume Tips for Alex Mercer
1. **Highlight Core Metrics**: Instead of "built database endpoints", use "Designed API endpoints handling 100k+ monthly requests, improving latency by 14%."
2. **Add Gap Keywords**: You are missing **AWS** and **Docker** on your profile. Consider adding them to your skills list once you build a mini deployment project.
3. **Keep it Single Page**: At your current experience level (0-2 years), recruiters spend 6 seconds reading; keep it concise and punchy.`;
  }
  if (query.includes('salary') || query.includes('negotiate')) {
    return `### How to Negotiate Salary
1. **Research Market Rates**: The median salary for a Junior Full Stack role in Bangalore is **8 LPA - 12 LPA**, while remote US startups pay **$70,000 - $90,000**.
2. **Never Give the First Number**: When recruiters ask, reply: *"I'm open to competitive market offers matching the responsibilities. What range has been budgeted for this position?"*
3. **Negotiate Benefits**: If they cannot increase base salary, ask for signing bonuses, learning allowances, or remote equipment stipends.`;
  }
  if (query.includes('roadmap') || query.includes('learn')) {
    return `### Recommended Next Learning Tasks
Based on your profile, you are a strong **Frontend React** engineer. To become a versatile Full Stack Developer, I recommend:
1. **Databases**: Learn advanced indexing, joins, and ACID compliance in SQL.
2. **DevOps**: Dockerize your Next.js application and deploy it to a free cluster like Render/Railway.
3. **System Design**: Learn load balancers, CDN routing, and cache invalidation strategies (Redis).`;
  }

  return `Hello Alex! I am your AI career copilot. You can ask me to:
- "Optimize my resume for Stripe backend role"
- "Give me advice on salary negotiation"
- "What topics should I prepare for a Google React interview?"
- "Draft a referral request email to a Razorpay engineer"`;
}

// ----------------------------------------------------
// 6. Roadmap Generator
// ----------------------------------------------------
export interface RoadmapStep {
  title: string;
  description: string;
  duration: string;
  topics: string[];
  resources: Array<{ title: string; type: 'video' | 'doc'; link: string }>;
}

export async function generateRoadmap(roleName: string, durationMonths: number = 3): Promise<RoadmapStep[]> {
  if (genAI) {
    const prompt = `Role: ${roleName}
Timeline: ${durationMonths} months

Generate a week-by-week learning roadmap with conceptual steps, required topics, and curated documentation/video links.
Output a JSON array matching:
[
  {
    "title": "Step title (e.g. Month 1: Advanced Javascript)",
    "description": "Details about what to learn",
    "duration": "Time block (e.g. Week 1-2)",
    "topics": ["Closures", "Event Loop"],
    "resources": [{"title": "MDN Guide", "type": "doc", "link": "https://developer.mozilla.org"}]
  }
]`;
    try {
      const response = await callGemini(prompt, 'You are an expert curriculum designer.', true);
      return JSON.parse(response) as RoadmapStep[];
    } catch (e) {
      console.warn('Gemini Roadmap failed, using simulator:', e);
    }
  }

  // Local Simulator Fallback
  if (roleName.toLowerCase().includes('frontend')) {
    return [
      {
        title: 'HTML & CSS Layouts (Aesthetic UI)',
        description: 'Master CSS Grid, Flexbox, transitions, variables, and responsive design systems.',
        duration: 'Week 1-2',
        topics: ['Flexbox', 'CSS Variables', 'Responsive Breakpoints', 'Tailwind CSS utility mappings'],
        resources: [
          { title: 'CSS Flexbox Complete Guide', type: 'doc', link: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/' },
          { title: 'Learn CSS Grid in 20 Minutes', type: 'video', link: 'https://www.youtube.com/watch?v=rg7Fvvl3ZuU' }
        ]
      },
      {
        title: 'Modern JS Fundamentals & DOM',
        description: 'Understand async JavaScript, DOM manipulation, ES6 syntax, and networking.',
        duration: 'Week 3-4',
        topics: ['Event Loop', 'Promises & Async/Await', 'Fetch API', 'Local Storage'],
        resources: [
          { title: 'JavaScript.info Complete Guide', type: 'doc', link: 'https://javascript.info' }
        ]
      },
      {
        title: 'React 19 & Next.js 15 Foundations',
        description: 'Deep dive into virtual DOM, components, hooks, React Server Components (RSC), and file routing.',
        duration: 'Week 5-8',
        topics: ['useState & useEffect', 'Server Actions', 'RSC render loop', 'Dynamic Routing'],
        resources: [
          { title: 'Official Next.js Documentation', type: 'doc', link: 'https://nextjs.org/docs' }
        ]
      }
    ];
  }

  // Default Backend/Generic Roadmap
  return [
    {
      title: 'Backend Language & Server API Design',
      description: 'Learn Node.js, Express, middleware routing, error handling, and request-response cycles.',
      duration: 'Week 1-3',
      topics: ['Node.js Runtime', 'Express Server Setup', 'Middleware Architecture', 'RESTful Guidelines'],
      resources: [
        { title: 'Node.js Express Tutorial', type: 'video', link: 'https://www.youtube.com/watch?v=Oe421EPjeBE' }
      ]
    },
    {
      title: 'Data Modeling & Databases (SQL/NoSQL)',
      description: 'Master relational schemas, Prisma ORM operations, SQL indexing, and transaction compliance.',
      duration: 'Week 4-6',
      topics: ['Relational Database Normalization', 'Prisma ORM Queries', 'SQL Indexing & Optimizations', 'MongoDB setup'],
      resources: [
        { title: 'Prisma Client Quickstart', type: 'doc', link: 'https://www.prisma.io/docs/getting-started' }
      ]
    },
    {
      title: 'System Design & Deployments',
      description: 'Learn system design scaling, horizontal scaling, caching servers (Redis), and containerized hosting.',
      duration: 'Week 7-9',
      topics: ['Load Balancers', 'Redis Cache Store', 'Docker containers', 'CI/CD deployment pipelines'],
      resources: [
        { title: 'System Design Primer Roadmap', type: 'doc', link: 'https://github.com/donnemartin/system-design-primer' }
      ]
    }
  ];
}
