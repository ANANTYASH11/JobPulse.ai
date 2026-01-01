import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const timeString = new Date().toLocaleTimeString();

    // Generate changing metrics for realism
    const cpuUsage = Math.round(15 + Math.random() * 25); // 15% - 40%
    const memoryUsage = Math.round(52 + Math.random() * 8); // 52% - 60%
    const dbLatency = Math.round(5 + Math.random() * 15); // 5ms - 20ms
    const activeScrapers = [
      { name: 'LinkedIn Crawler', status: 'IDLE', lastRun: '15m ago', jobsFound: 14 },
      { name: 'Indeed Scraper', status: 'ACTIVE', lastRun: 'Running now', jobsFound: 8 },
      { name: 'YC Careers Sync', status: 'IDLE', lastRun: '1h ago', jobsFound: 5 },
      { name: 'Wellfound API Worker', status: 'IDLE', lastRun: '32m ago', jobsFound: 11 },
      { name: 'RemoteOK RSS Feed', status: 'ACTIVE', lastRun: 'Running now', jobsFound: 2 }
    ];

    const logs = [
      `[${timeString}] [System] Garbage collection complete. Freed 142MB.`,
      `[${timeString}] [Wellfound] Crawling completed: 11 jobs parsed, 2 duplicates skipped.`,
      `[${timeString}] [LinkedIn] Scraper logged in successfully. Cookie session valid.`,
      `[${timeString}] [Indeed] Active worker thread #3 started parsing page 2 of query 'SDE Intern'.`,
      `[${timeString}] [Database] Cleaned up 3 expired listings older than 48 hours.`,
      `[${timeString}] [Scheduler] Triggered hourly job scraper thread synchronization.`
    ];

    return NextResponse.json({
      cpu: cpuUsage,
      memory: memoryUsage,
      latency: dbLatency,
      scrapers: activeScrapers,
      logs
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
