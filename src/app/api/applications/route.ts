import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const apps = await db.application.findMany({
      orderBy: { dateApplied: 'desc' },
    });
    return NextResponse.json(apps);
  } catch (error) {
    console.error('Failed to get applications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { jobId, company, role, status, notes } = await request.json();

    if (!company || !role) {
      return NextResponse.json({ error: 'Company and Role are required' }, { status: 400 });
    }

    const defaultTimeline = [
      {
        status: status || 'APPLIED',
        date: new Date().toISOString(),
        label: `Application created at status: ${status || 'APPLIED'}`,
      },
    ];

    const defaultChecklist = [
      { id: 1, text: 'Tailor resume for this specific position', completed: true },
      { id: 2, text: 'Review company mission and tech stack details', completed: false },
      { id: 3, text: 'Draft follow-up introduction or connection request', completed: false },
    ];

    const app = await db.application.create({
      data: {
        jobId: jobId || '',
        company,
        role,
        status: status || 'APPLIED',
        notes: notes || '',
        timeline: JSON.stringify(defaultTimeline),
        checklist: JSON.stringify(defaultChecklist),
      },
    });

    return NextResponse.json(app);
  } catch (error) {
    console.error('Failed to create application:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status, notes, checklist, timeline } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    const app = await db.application.findUnique({ where: { id } });
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const updateData: any = {};

    if (notes !== undefined) updateData.notes = notes;
    if (checklist !== undefined) updateData.checklist = JSON.stringify(checklist);

    if (status !== undefined && status !== app.status) {
      updateData.status = status;
      
      // Update timeline
      let currentTimeline = [];
      try {
        currentTimeline = JSON.parse(timeline || app.timeline);
      } catch (e) {
        currentTimeline = [];
      }

      currentTimeline.push({
        status,
        date: new Date().toISOString(),
        label: `Moved to status: ${status.replace('_', ' ')}`,
      });

      updateData.timeline = JSON.stringify(currentTimeline);
    } else if (timeline !== undefined) {
      updateData.timeline = JSON.stringify(timeline);
    }

    const updatedApp = await db.application.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedApp);
  } catch (error) {
    console.error('Failed to update application:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    await db.application.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete application:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
