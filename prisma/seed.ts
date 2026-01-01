import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing data
  await prisma.userProfile.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.interviewSession.deleteMany({});
  await prisma.codingProblem.deleteMany({});
  await prisma.systemDesignProblem.deleteMany({});

  // 2. Create default User Profile
  const user = await prisma.userProfile.create({
    data: {
      name: 'Alex Mercer',
      email: 'alex.mercer@gmail.com',
      skills: 'TypeScript, JavaScript, React, Next.js, Node.js, Express, SQL, Git, HTML, CSS, Tailwind CSS',
      experience: JSON.stringify([
        {
          role: 'Full Stack Intern',
          company: 'TechCorp Solutions',
          duration: '6 Months (2025)',
          details: 'Built responsive web interfaces using React and designed backend REST APIs using Node.js/Express.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'Bachelor of Technology in Computer Science',
          school: 'State University',
          year: '2022 - 2026',
          gpa: '8.7/10'
        }
      ]),
      resumeText: 'Alex Mercer. Full Stack Developer. Skills: TypeScript, JavaScript, React, Next.js, Node.js, Express, SQL. Experience: Intern at TechCorp. Projects: E-Commerce store using React, Node, PostgreSQL. Education: B.Tech State University.',
      atsScore: 82,
      xp: 320,
      level: 3,
      streak: 5,
      lastActive: new Date()
    }
  });
  console.log('Created User Profile:', user.name);

  // Helper for dates relative to now
  const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);

  // 3. Create active jobs posted in the last 48h
  const jobsData = [
    {
      title: 'Frontend Engineer (React/Next.js)',
      company: 'Vercel',
      salary: '$110,000 - $130,000',
      experience: '1-3 years',
      skills: 'TypeScript, React, Next.js, Tailwind CSS, JavaScript',
      location: 'San Francisco, CA',
      remote: 'Remote',
      employType: 'Full-time',
      datePosted: hoursAgo(4), // 4h ago
      originalSource: 'Wellfound',
      link: 'https://vercel.com/careers/frontend',
      funding: 'Series D - $150M',
      techStack: 'React, Next.js, Tailwind, Vercel Edge',
      difficulty: 'Hard',
      description: 'Join the team building the frontend cloud. You will implement sleek user interfaces, work on rendering performance, and integrate complex state flows. Required: strong TypeScript, React 19, and Next.js App Router experience.',
      aiSummary: JSON.stringify({
        responsibilities: [
          'Build and maintain highly responsive UI components using Next.js 15.',
          'Optimize web performance, aiming for Lighthouse scores above 95.',
          'Collaborate with product designers to implement pixel-perfect glassmorphic interfaces.'
        ],
        requirements: ['2+ years of professional Frontend experience.', 'Expert level TypeScript & React.', 'Experience with Framer Motion and modern styling.'],
        culture: 'High autonomy, fast-paced, remote-first, values high quality design.',
        interviewPrep: 'Focused on UI design, React rendering loop, web vitals, and a live coding assignment.',
        salaryPredictor: '$120,000 median base salary + equity options.'
      }),
      matchScore: 94 // High match because of matching frontend stack
    },
    {
      title: 'Backend Software Developer',
      company: 'Stripe',
      salary: '$130,000 - $160,000',
      experience: '2-4 years',
      skills: 'Node.js, Express, SQL, TypeScript, REST APIs, PostgreSQL',
      location: 'Seattle, WA',
      remote: 'Hybrid',
      employType: 'Full-time',
      datePosted: hoursAgo(10), // 10h ago
      originalSource: 'LinkedIn',
      link: 'https://stripe.com/jobs/backend',
      funding: 'Publicly Traded',
      techStack: 'Ruby, Node.js, Go, PostgreSQL, AWS',
      difficulty: 'Hard',
      description: 'Design and build APIs that handle millions of transactions. You will work on ledger systems, database optimizations, and microservice communication. Node.js, Express, and SQL databases are core requirements.',
      aiSummary: JSON.stringify({
        responsibilities: [
          'Design secure and scalable payment endpoints.',
          'Optimize PostgreSQL queries and perform data modeling.',
          'Write extensive automated tests for transaction integrity.'
        ],
        requirements: ['3+ years Node.js and SQL experience.', 'Understanding of distributed systems and security compliance.', 'Strong RESTful API design principles.'],
        culture: 'Rigorous engineering standards, data-driven, writing-oriented documentation culture.',
        interviewPrep: 'Heavy emphasis on API design, concurrency, DB locking, and behavioral scenarios (STAR).',
        salaryPredictor: '$145,000 base + equity.'
      }),
      matchScore: 88
    },
    {
      title: 'Junior Full Stack Engineer',
      company: 'Razorpay',
      salary: '8 LPA - 12 LPA',
      experience: '0-2 years',
      skills: 'JavaScript, React, Node.js, Express, SQL, Git',
      location: 'Bangalore, India',
      remote: 'On-site',
      employType: 'Full-time',
      datePosted: hoursAgo(20), // 20h ago
      originalSource: 'Naukri',
      link: 'https://razorpay.com/careers/fullstack',
      funding: 'Series F - $375M Valuation',
      techStack: 'React, Node, Express, MySQL, AWS',
      difficulty: 'Medium',
      description: 'Looking for a passionate junior developer who can work across our stack. You will develop backend services in Node.js and user interfaces in React. Great mentorship and rapid growth opportunities.',
      aiSummary: JSON.stringify({
        responsibilities: [
          'Add new features to client dashboard portals.',
          'Assist in writing internal tooling and dashboard services.',
          'Participate in code reviews and agile meetings.'
        ],
        requirements: ['Proficient in JavaScript, React, and Node.js.', 'Good understanding of database structures and Git version control.', 'B.Tech/B.E in Computer Science or similar.'],
        culture: 'Young, energetic, work-hard-play-hard mindset, high learning curve.',
        interviewPrep: 'Covers JS fundamentals, basic DSA (Arrays/Strings), object-oriented programming, and SQL syntax.',
        salaryPredictor: '10 LPA base.'
      }),
      matchScore: 92 // High match for junior/intern skills
    },
    {
      title: 'DevOps & Infrastructure Associate',
      company: 'Amazon Web Services',
      salary: '$100,000 - $120,000',
      experience: '1-3 years',
      skills: 'AWS, Docker, Linux, Bash, CI/CD, Git',
      location: 'Boston, MA',
      remote: 'Hybrid',
      employType: 'Full-time',
      datePosted: hoursAgo(30), // 30h ago
      originalSource: 'Indeed',
      link: 'https://amazon.jobs/devops',
      funding: 'Big Tech',
      techStack: 'AWS, Kubernetes, Terraform, Python',
      difficulty: 'Hard',
      description: 'Maintain and scale our AWS developer platforms. Configure cloud formation scripts, set up CI/CD pipelines, and monitor cluster utilization. Knowledge of Docker and Linux administration is critical.',
      aiSummary: JSON.stringify({
        responsibilities: [
          'Manage containerized deployments and orchestrate using Kubernetes.',
          'Script automation tasks in Python or Bash.',
          'Manage cloud budgets and resource quotas.'
        ],
        requirements: ['Experience with AWS services (EC2, S3, RDS).', 'Solid command over Docker containerization.', 'Linux shell programming and server maintenance.'],
        culture: 'Process-heavy, operational excellence, writing-centric leadership principles.',
        interviewPrep: 'Strictly evaluated on Amazon Leadership Principles, basic networking, systems scripting, and troubleshooting.',
        salaryPredictor: '$110,000 + RSUs.'
      }),
      matchScore: 45 // Low match because DevOps/AWS are missing in profile
    },
    {
      title: 'AI/ML Engineering Intern',
      company: 'Google',
      salary: '35,000/mo INR',
      experience: 'Freshers',
      skills: 'Python, PyTorch, SQL, Linear Algebra, Machine Learning',
      location: 'Bangalore, India',
      remote: 'Hybrid',
      employType: 'Internship',
      datePosted: hoursAgo(44), // 44h ago
      originalSource: 'Google Careers',
      link: 'https://careers.google.com/internships',
      funding: 'Alphabet',
      techStack: 'Python, C++, TensorFlow, Google Cloud',
      difficulty: 'Hard',
      description: 'Work with researchers to train large models, parse datasets, and optimize inference systems. Strong Python and foundational math/linear algebra required.',
      aiSummary: JSON.stringify({
        responsibilities: [
          'Pre-process and clean terabytes of training data.',
          'Run validation testing on computer vision models.',
          'Collaborate with AI researchers to document findings.'
        ],
        requirements: ['Currently enrolled in B.Tech/M.Tech/PhD in CS or Math.', 'Expert scripting in Python.', 'Familiarity with deep learning frameworks.'],
        culture: 'Research-driven, collaborative, academically rigorous, values work-life balance.',
        interviewPrep: 'Strong emphasis on Machine Learning concepts, algorithms & DSA (Graphs, Dynamic Programming), and stats quizzes.',
        salaryPredictor: '40,000 INR per month.'
      }),
      matchScore: 50 // Medium match: SQL is there, but Python/ML missing
    }
  ];

  for (const job of jobsData) {
    await prisma.job.create({ data: job });
  }
  console.log('Seeded Jobs.');

  // 4. Create Coding Problems
  const codingProblems = [
    {
      title: 'Two Sum',
      topic: 'Arrays',
      difficulty: 'Easy',
      description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
      starterCode: JSON.stringify({
        javascript: 'function twoSum(nums, target) {\n  // Write your code here\n  return [];\n}',
        python: 'def twoSum(nums: List[int], target: int) -> List[int]:\n    # Write your code here\n    return []',
        cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        return {};\n    }\n};',
        java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[2];\n    }\n}'
      }),
      testCases: JSON.stringify([
        { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
        { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
        { input: 'nums = [3,3], target = 6', output: '[0,1]' }
      ]),
      optimalComplexity: 'O(N) Time, O(N) Space (Hash Map)'
    },
    {
      title: 'Reverse Linked List',
      topic: 'Linked Lists',
      difficulty: 'Easy',
      description: 'Given the `head` of a singly linked list, reverse the list, and return the reversed list.',
      starterCode: JSON.stringify({
        javascript: 'function reverseList(head) {\n  // Write your code here\n  return head;\n}',
        python: 'def reverseList(head: ListNode) -> ListNode:\n    # Write your code here\n    return head',
        cpp: 'class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        return head;\n    }\n};',
        java: 'class Solution {\n    public ListNode reverseList(ListNode head) {\n        return head;\n    }\n}'
      }),
      testCases: JSON.stringify([
        { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
        { input: 'head = [1,2]', output: '[2,1]' }
      ]),
      optimalComplexity: 'O(N) Time, O(1) Space (Iterative)'
    },
    {
      title: 'Longest Common Subsequence',
      topic: 'Dynamic Programming',
      difficulty: 'Medium',
      description: 'Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return 0.\n\nA subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters. (e.g. "ace" is a subsequence of "abcde" while "aec" is not).',
      starterCode: JSON.stringify({
        javascript: 'function longestCommonSubsequence(text1, text2) {\n  // Write your code here\n  return 0;\n}',
        python: 'def longestCommonSubsequence(text1: str, text2: str) -> int:\n    # Write your code here\n    return 0',
        cpp: 'class Solution {\npublic:\n    int longestCommonSubsequence(string text1, string text2) {\n        return 0;\n    }\n};',
        java: 'class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {\n        return 0;\n    }\n}'
      }),
      testCases: JSON.stringify([
        { input: 'text1 = "abcde", text2 = "ace"', output: '3' },
        { input: 'text1 = "abc", text2 = "abc"', output: '3' },
        { input: 'text1 = "abc", text2 = "def"', output: '0' }
      ]),
      optimalComplexity: 'O(M * N) Time, O(M * N) Space (DP Matrix)'
    }
  ];

  for (const prob of codingProblems) {
    await prisma.codingProblem.create({ data: prob });
  }
  console.log('Seeded Coding Problems.');

  // 5. Create System Design Problems
  const designProblems = [
    {
      title: 'Design TinyURL (URL Shortener)',
      description: 'Design a system that can take a long URL and generate a shorter URL redirecting to the same location, supporting millions of requests per second.',
      requirements: JSON.stringify([
        'Given a long URL, return a short URL (e.g., tiny.com/abc1234).',
        'Redirect short URLs to original URLs instantly with low latency.',
        'High availability, scalability, and persistence.',
        'Analytics: Track redirection count over time.'
      ]),
      aiCritiqueTemplate: JSON.stringify({
        keyElements: ['Hashing/Encoding (Base62)', 'NoSQL vs Relational DB storage', 'Caching (Redis) for redirection', 'Load Balancer & Redirection flow'],
        scoringWeight: {
          database: 25,
          api: 20,
          scaling: 30,
          tradeoffs: 25
        }
      })
    },
    {
      title: 'Design WhatsApp (Real-time Messaging)',
      description: 'Design a real-time messaging service that supports one-on-one and group chats, online/offline status indicators, and file attachments.',
      requirements: JSON.stringify([
        'Low latency one-on-one messaging.',
        'Online/offline user presence indicators.',
        'Delivery receipts (Sent, Delivered, Read).',
        'Support scaling to 500 million daily active users.'
      ]),
      aiCritiqueTemplate: JSON.stringify({
        keyElements: ['WebSockets / Gateway server connection', 'Message store database (Cassandra/NoSQL)', 'Presence status engine', 'Message queues (Kafka/RabbitMQ)'],
        scoringWeight: {
          websocket: 30,
          database: 20,
          queueing: 25,
          presence: 25
        }
      })
    }
  ];

  for (const prob of designProblems) {
    await prisma.systemDesignProblem.create({ data: prob });
  }
  console.log('Seeded System Design Problems.');

  // 6. Create initial applications
  const activeJob = await prisma.job.findFirst({ where: { company: 'Razorpay' } });
  if (activeJob) {
    await prisma.application.create({
      data: {
        jobId: activeJob.id,
        company: 'Razorpay',
        role: 'Junior Full Stack Engineer',
        status: 'INTERVIEW_SCHEDULED',
        dateApplied: hoursAgo(24),
        notes: 'HR round cleared! Technical interview scheduled for next Monday. Reviewing React render cycles and SQL indexes.',
        timeline: JSON.stringify([
          { status: 'APPLIED', date: hoursAgo(24).toISOString(), label: 'Applied through JobPulse One-Click portal' },
          { status: 'INTERVIEW_SCHEDULED', date: hoursAgo(22).toISOString(), label: 'Recruiter contacted, scheduled Tech Round 1' }
        ]),
        checklist: JSON.stringify([
          { id: 1, text: 'Confirm schedule calendar invite', completed: true },
          { id: 2, text: 'Practice 3 SQL Joins problems', completed: true },
          { id: 3, text: 'Revise virtual DOM and React 19 compiler changes', completed: false }
        ])
      }
    });
    console.log('Seeded mock applications.');
  }

  console.log('Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
