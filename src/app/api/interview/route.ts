import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateInterviewQuestions, evaluateInterviewAnswer } from '@/lib/ai';

export async function GET() {
  try {
    const sessions = await db.interviewSession.findMany({
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Failed to get sessions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'start') {
      const { role, company, difficulty } = body;
      
      const profile = await db.userProfile.findFirst();
      const resumeText = profile?.resumeText || 'No resume uploaded. Junior Frontend React Developer.';

      // Generate questions
      const questions = await generateInterviewQuestions(role, company || 'Generic Company', difficulty, resumeText);

      return NextResponse.json({ questions });
    }

    if (action === 'evaluate') {
      const { question, answer, expectedKeywords } = body;
      
      // Evaluate answer
      const evaluation = await evaluateInterviewAnswer(question, answer, expectedKeywords || []);
      
      return NextResponse.json(evaluation);
    }

    if (action === 'save_session') {
      const { role, type, difficulty, company, score, details, feedback, transcript } = body;

      // Save session
      const session = await db.interviewSession.create({
        data: {
          role,
          type,
          difficulty,
          company,
          score,
          details: JSON.stringify(details),
          feedback,
          transcript: JSON.stringify(transcript)
        }
      });

      // Award XP & update streak
      const profile = await db.userProfile.findFirst();
      if (profile) {
        const xpEarned = Math.round(score * 1.5);
        const newXp = profile.xp + xpEarned;
        const newLevel = Math.floor(newXp / 500) + 1; // 500 XP per level
        
        // Calculate streak
        let streak = profile.streak;
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - profile.lastActive.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
          // Keep/increment streak
          if (diffDays === 1) streak += 1;
        } else {
          // Reset streak
          streak = 1;
        }

        await db.userProfile.update({
          where: { id: profile.id },
          data: {
            xp: newXp,
            level: newLevel,
            streak,
            lastActive: now
          }
        });
      }

      return NextResponse.json({ success: true, session });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to process interview request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
