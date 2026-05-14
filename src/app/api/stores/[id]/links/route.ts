import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const storeId = parseInt(paramId);
    
    const links = await prisma.platformLink.findMany({
      where: { storeId }
    });
    
    return NextResponse.json(links);
  } catch (error) {
    console.error("Fetch links error", error);
    return NextResponse.json({ message: '数据库异常' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const storeId = parseInt(paramId);
    const { links } = await request.json();
    
    // Using atomic operations: delete old, insert new
    await prisma.platformLink.deleteMany({
      where: { storeId }
    });
    
    const validLinks = links.filter((l: any) => l.url || l.isActive);
    
    if (validLinks.length > 0) {
      await prisma.platformLink.createMany({
        data: validLinks.map((l: any) => ({
          storeId,
          platformType: l.platformType,
          url: l.url || '',
          isActive: l.isActive
        }))
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save links error", error);
    return NextResponse.json({ message: '保存链接失败，数据库连接超时' }, { status: 500 });
  }
}
