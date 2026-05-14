import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, categoryId, phone, address, 
      hours, avgConsumption, holidayAvgConsumption, facilities, description,
      latitude, longitude, images 
    } = body;

    // Validate required fields
    if (!name || !categoryId || !phone || !address || !description) {
      return NextResponse.json({ message: '请填写所有必填字段' }, { status: 400 });
    }

    // Get IP address (basic rate limiting / tracking)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

    // Create the store as PENDING and INACTIVE
    const store = await prisma.store.create({
      data: {
        name,
        categoryId: Number(categoryId),
        phone,
        address,
        hours: hours || '',
        avgConsumption: avgConsumption ? parseFloat(avgConsumption) : null,
        holidayAvgConsumption: holidayAvgConsumption ? parseFloat(holidayAvgConsumption) : null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        facilities: Array.isArray(facilities) ? JSON.stringify(facilities) : '[]',
        description: description || '',
        status: 'PENDING',
        isActive: false,
        submitterIp: ip,
        images: {
          create: (images || []).map((url: string, index: number) => ({
            url,
            isCover: index === 0
          }))
        }
      }
    });

    return NextResponse.json({ success: true, data: store });
  } catch (error) {
    console.error("Store submission error:", error);
    return NextResponse.json({ message: '提交失败，请稍后重试' }, { status: 500 });
  }
}
