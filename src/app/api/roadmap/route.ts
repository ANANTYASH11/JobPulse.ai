import { NextResponse } from 'next/server';
import { generateRoadmap } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { role, duration } = await request.json();

    if (!role) {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 });
    }

    const steps = await generateRoadmap(role, duration || 3);

    return NextResponse.json(steps);
  } catch (error) {
    console.error('Failed to generate roadmap:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
