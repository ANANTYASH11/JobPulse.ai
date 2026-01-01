import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseResume } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { resumeText } = await request.json();

    if (!resumeText || resumeText.trim() === '') {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
    }

    // Call parser
    const parsed = await parseResume(resumeText);

    // Upsert into default profile
    let profile = await db.userProfile.findFirst();

    if (profile) {
      profile = await db.userProfile.update({
        where: { id: profile.id },
        data: {
          name: parsed.name,
          email: parsed.email,
          skills: parsed.skills.join(', '),
          experience: JSON.stringify(parsed.experience),
          education: JSON.stringify(parsed.education),
          resumeText,
          atsScore: parsed.atsScore,
          lastActive: new Date()
        }
      });
    } else {
      profile = await db.userProfile.create({
        data: {
          name: parsed.name,
          email: parsed.email,
          skills: parsed.skills.join(', '),
          experience: JSON.stringify(parsed.experience),
          education: JSON.stringify(parsed.education),
          resumeText,
          atsScore: parsed.atsScore,
          xp: 100,
          level: 1,
          streak: 1,
          lastActive: new Date()
        }
      });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Failed to parse resume:', error);
    return NextResponse.json({ error: 'Failed to process resume parsing' }, { status: 500 });
  }
}

export async function GET() {
  try {
    let profile = await db.userProfile.findFirst();
    if (!profile) {
      return NextResponse.json({ error: 'No profile found' }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
