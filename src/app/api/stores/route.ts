import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { triggerGEOPush } from '@/lib/geo-push';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      include: {
        category: true,
        images: { where: { isCover: true }, take: 1 }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(stores);
  } catch (error) {
    console.error("Fetch stores error", error);
    return NextResponse.json({ message: '数据库连接超时或网络波动' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.name || !data.categoryId) {
      return NextResponse.json({ message: '店名和分类为必填项' }, { status: 400 });
    }

    const store = await prisma.store.create({
      data: {
        name: data.name,
        description: data.description || '',
        address: data.address || '',
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        hours: data.hours || '',
        phone: data.phone || '',
        avgConsumption: data.avgConsumption ? parseFloat(data.avgConsumption) : null,
        holidayAvgConsumption: data.holidayAvgConsumption ? parseFloat(data.holidayAvgConsumption) : null,
        facilities: data.facilities || null,
        categoryId: parseInt(data.categoryId),
        images: {
          create: (data.images || []).map((url: string, index: number) => ({
            url,
            isCover: index === 0
          }))
        }
      }
    });
    
    // 异步触发 GEO 主动推送，不阻塞当前请求
    triggerGEOPush(store.id).catch(console.error);

    return NextResponse.json(store);
  } catch (error) {
    console.error("Create store error", error);
    return NextResponse.json({ message: '数据保存失败，请检查数据库连通性' }, { status: 500 });
  }
}
