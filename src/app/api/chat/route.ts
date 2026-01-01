import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { chatbotResponse } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { prompt, history } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const profile = await db.userProfile.findFirst();
    const profileText = profile 
      ? `User Name: ${profile.name}, Email: ${profile.email}, Skills: ${profile.skills}. Education: ${profile.education}. Experience: ${profile.experience}.`
      : 'No profile details uploaded yet.';

    const answer = await chatbotResponse(history || [], prompt, profileText);

    return NextResponse.json({ response: answer });
  } catch (error) {
    console.error('Failed to process chat:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
