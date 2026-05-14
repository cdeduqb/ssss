import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'desc' }
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Fetch categories error", error);
    return NextResponse.json({ message: '数据库连接异常，请检查远端网络' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, sortOrder, parentId, templateType } = await request.json();
    if (!name) {
      return NextResponse.json({ message: '分类名称不能为空' }, { status: 400 });
    }
    
    const category = await prisma.category.create({
      data: { 
        name, 
        sortOrder: Number(sortOrder) || 0,
        parentId: parentId ? Number(parentId) : null,
        templateType: templateType || 'default'
      }
    });
    
    return NextResponse.json(category);
  } catch (error) {
    console.error("Create category error", error);
    return NextResponse.json({ message: '创建失败，数据库连接超时' }, { status: 500 });
  }
}
