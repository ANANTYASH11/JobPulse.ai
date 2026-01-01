import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { analyzeJobMatch, generateCoverLetter } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const job = await db.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const profile = await db.userProfile.findFirst();
    if (!profile) {
      return NextResponse.json({ error: 'Please upload a resume first to create a profile' }, { status: 400 });
    }

    const userSkills = profile.skills.split(',').map(s => s.trim()).filter(Boolean);

    // Call match analyzer
    const analysis = await analyzeJobMatch(
      userSkills,
      job.title,
      job.description,
      job.skills
    );

    // Generate cover letter
    const coverLetter = await generateCoverLetter(
      profile.name,
      userSkills,
      job.title,
      job.company,
      job.description
    );

    // Update job match score in database for this run
    await db.job.update({
      where: { id: jobId },
      data: { matchScore: analysis.score }
    });

    return NextResponse.json({
      jobTitle: job.title,
      company: job.company,
      score: analysis.score,
      whyMatches: analysis.whyMatches,
      missingSkills: analysis.missingSkills,
      recommendations: analysis.recommendations,
      coverLetter
    });
  } catch (error) {
    console.error('Failed to optimize resume:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
