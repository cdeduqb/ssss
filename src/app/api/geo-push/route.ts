import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs = await prisma.pushLog.findMany({
      include: {
        store: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    
    // 统计各平台推送成功次数
    const stats = await prisma.pushLog.groupBy({
      by: ['platform', 'status'],
      _count: { platform: true },
    });

    return NextResponse.json({ logs, stats });
  } catch (error) {
    console.error("Fetch push logs error", error);
    return NextResponse.json({ message: '获取数据失败' }, { status: 500 });
  }
}
