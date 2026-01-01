import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const remote = searchParams.get('remote') || ''; // 'Remote', 'Hybrid', 'On-site'
    const employType = searchParams.get('employType') || ''; // 'Full-time', 'Internship'
    const postedWithin = searchParams.get('postedWithin') || ''; // '6h', '12h', '24h', '48h'
    const experience = searchParams.get('experience') || ''; // 'Freshers', '1-3 years', etc.

    // Calculate cutoff time for posted date
    let dateLimit: Date | null = null;
    if (postedWithin) {
      const hours = parseInt(postedWithin.replace('h', ''), 10);
      if (!isNaN(hours)) {
        dateLimit = new Date(Date.now() - hours * 60 * 60 * 1000);
      }
    }

    // Load jobs from DB
    const jobs = await db.job.findMany({
      orderBy: { datePosted: 'desc' },
    });

    // Apply filtering in memory for easy search parsing/natural language matching
    let filteredJobs = jobs.filter(job => {
      // 1. Search Query (Semantic simulation / simple keyword match)
      if (search) {
        const titleMatch = job.title.toLowerCase().includes(search);
        const companyMatch = job.company.toLowerCase().includes(search);
        const descriptionMatch = job.description.toLowerCase().includes(search);
        const skillsMatch = job.skills.toLowerCase().includes(search);
        
        // Semantic search matches
        let semanticMatch = false;
        if (search.includes('backend') && (job.title.toLowerCase().includes('node') || job.title.toLowerCase().includes('go') || job.title.toLowerCase().includes('api'))) {
          semanticMatch = true;
        }
        if (search.includes('frontend') && (job.title.toLowerCase().includes('react') || job.title.toLowerCase().includes('next.js') || job.title.toLowerCase().includes('ui'))) {
          semanticMatch = true;
        }
        if (search.includes('intern') && job.employType === 'Internship') {
          semanticMatch = true;
        }

        if (!titleMatch && !companyMatch && !descriptionMatch && !skillsMatch && !semanticMatch) {
          return false;
        }
      }

      // 2. Remote / Location Filter
      if (remote && remote !== 'All' && job.remote !== remote) {
        return false;
      }

      // 3. Employment Type Filter
      if (employType && employType !== 'All' && job.employType !== employType) {
        return false;
      }

      // 4. Experience Filter
      if (experience && experience !== 'All') {
        const xpRequired = job.experience.toLowerCase();
        if (experience === 'Freshers' && !xpRequired.includes('fresher') && !xpRequired.includes('0-2') && !xpRequired.includes('0-1')) {
          return false;
        }
        if (experience === 'Intermediate' && !xpRequired.includes('1-3') && !xpRequired.includes('2-4')) {
          return false;
        }
        if (experience === 'Senior' && !xpRequired.includes('3+') && !xpRequired.includes('5+') && !xpRequired.includes('senior')) {
          return false;
        }
      }

      // 5. Date posted limit
      if (dateLimit && job.datePosted < dateLimit) {
        return false;
      }

      return true;
    });

    return NextResponse.json(filteredJobs);
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { jobId, action } = await request.json();

    if (action === 'bookmark') {
      const job = await db.job.findUnique({ where: { id: jobId } });
      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      const updatedJob = await db.job.update({
        where: { id: jobId },
        data: { isBookmarked: !job.isBookmarked },
      });

      return NextResponse.json(updatedJob);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to update job:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
