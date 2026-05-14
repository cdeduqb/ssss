import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { triggerGEOPush } from '@/lib/geo-push';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { storeId } = await request.json();
    
    if (!storeId) {
      return NextResponse.json({ message: 'Missing storeId' }, { status: 400 });
    }

    // 触发推送
    await triggerGEOPush(parseInt(storeId));

    return NextResponse.json({ success: true, message: '推送请求已发送' });
  } catch (error) {
    console.error("Manual push error", error);
    return NextResponse.json({ message: '推送失败' }, { status: 500 });
  }
}
