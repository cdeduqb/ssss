import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const storeId = parseInt(params.id);
    if (isNaN(storeId)) {
      return NextResponse.json({ message: '无效的店铺 ID' }, { status: 400 });
    }

    const { status, rejectReason } = await request.json();

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ message: '无效的审核状态' }, { status: 400 });
    }

    // Update store status
    const store = await prisma.store.update({
      where: { id: storeId },
      data: {
        status,
        isActive: status === 'APPROVED', // If approved, it becomes active
        rejectReason: status === 'REJECTED' ? rejectReason : null,
      }
    });

    return NextResponse.json({ success: true, data: store });
  } catch (error) {
    console.error("Store review error:", error);
    return NextResponse.json({ message: '审核操作失败' }, { status: 500 });
  }
}
