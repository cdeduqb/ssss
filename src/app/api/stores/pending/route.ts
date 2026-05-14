import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      where: { status: 'PENDING' },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(stores);
  } catch (error) {
    console.error("Fetch pending stores error", error);
    return NextResponse.json({ message: '数据库连接超时或网络波动' }, { status: 500 });
  }
}
