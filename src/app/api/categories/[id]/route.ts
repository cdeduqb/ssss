import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params in Next.js 15
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    const { name, sortOrder, parentId, templateType } = await request.json();
    
    if (!name) {
      return NextResponse.json({ message: '分类名称不能为空' }, { status: 400 });
    }
    
    // Check if trying to set self as parent
    if (parentId && Number(parentId) === id) {
      return NextResponse.json({ message: '不能将自己设为上级分类' }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id },
      data: { 
        name, 
        sortOrder: Number(sortOrder) || 0,
        parentId: parentId ? Number(parentId) : null,
        templateType: templateType || 'default'
      }
    });
    
    return NextResponse.json(category);
  } catch (error) {
    console.error("Update category error", error);
    return NextResponse.json({ message: '更新失败，数据库连接异常' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params in Next.js 15
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    const childrenCount = await prisma.category.count({ where: { parentId: id } });
    if (childrenCount > 0) {
      return NextResponse.json({ message: '该分类下还有子分类，请先删除或移动子分类' }, { status: 400 });
    }

    const storesCount = await prisma.store.count({ where: { categoryId: id } });
    if (storesCount > 0) {
      return NextResponse.json({ message: '该分类下还有店铺数据，出于安全考虑无法直接删除' }, { status: 400 });
    }
    
    await prisma.category.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete category error", error);
    return NextResponse.json({ message: '删除失败，数据库连接异常' }, { status: 500 });
  }
}
