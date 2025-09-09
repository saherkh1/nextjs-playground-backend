import { NextResponse } from 'next/server';

export async function GET() {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'photoflow-frontend',
    version: '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    api: {
      configured: !!process.env.NEXT_PUBLIC_API_URL,
      url: process.env.NEXT_PUBLIC_API_URL || 'not configured',
    },
  };

  return NextResponse.json(healthData, { status: 200 });
}