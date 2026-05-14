import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { triggerGEOPush } from '@/lib/geo-push';

const prisma = new PrismaClient();

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    await prisma.store.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete store error", error);
    return NextResponse.json({ message: '删除失败，数据库连接异常' }, { status: 500 });
  }
}

// 上架/下架切换
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const { isActive } = await request.json();
    
    const store = await prisma.store.update({
      where: { id },
      data: { isActive: Boolean(isActive) }
    });
    
    // 如果是重新上架，主动推送一次
    if (store.isActive) {
      triggerGEOPush(store.id).catch(console.error);
    }
    
    return NextResponse.json({ success: true, isActive: store.isActive });
  } catch (error) {
    console.error("Toggle store status error", error);
    return NextResponse.json({ message: '操作失败，数据库连接异常' }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    const store = await prisma.store.findUnique({
      where: { id },
      include: { 
        images: { orderBy: { id: 'asc' } },
        category: true
      }
    });
    
    if (!store) {
      return NextResponse.json({ message: 'Store not found' }, { status: 404 });
    }
    return NextResponse.json(store);
  } catch (error) {
    console.error("Fetch store error", error);
    return NextResponse.json({ message: '获取失败，数据库连接异常' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const data = await request.json();
    
    const { images, id: _storeId, category, links, createdAt, updatedAt, ...storeData } = data;
    
    const updateData: any = {
      ...storeData,
      categoryId: parseInt(storeData.categoryId),
      avgConsumption: storeData.avgConsumption ? parseFloat(storeData.avgConsumption) : null,
      holidayAvgConsumption: storeData.holidayAvgConsumption ? parseFloat(storeData.holidayAvgConsumption) : null,
      latitude: storeData.latitude ? parseFloat(storeData.latitude) : null,
      longitude: storeData.longitude ? parseFloat(storeData.longitude) : null,
    };
    
    await prisma.$transaction(async (tx) => {
      await tx.store.update({
        where: { id },
        data: updateData
      });
      
      if (images && Array.isArray(images)) {
        await tx.storeImage.deleteMany({ where: { storeId: id } });
        if (images.length > 0) {
          await tx.storeImage.createMany({
            data: images.map((url: string, index: number) => ({
              storeId: id,
              url: typeof url === 'string' ? url : (url as any).url,
              isCover: index === 0
            }))
          });
        }
      }
    });

    // 数据更新后，触发 GEO 主动推送以保持 AI 爬虫的数据鲜活度
    triggerGEOPush(id).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update store error", error);
    return NextResponse.json({ message: '更新失败，数据库连接异常' }, { status: 500 });
  }
}
