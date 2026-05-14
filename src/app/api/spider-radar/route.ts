import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [logs, stats] = await Promise.all([
      prisma.crawlerLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.crawlerLog.groupBy({
        by: ['botName'],
        _count: {
          botName: true,
        },
        orderBy: {
          _count: {
            botName: 'desc',
          },
        },
      })
    ]);

    return NextResponse.json({ logs, stats });
  } catch (error) {
    console.error("Fetch radar data error", error);
    return NextResponse.json({ message: '获取数据失败' }, { status: 500 });
  }
}
