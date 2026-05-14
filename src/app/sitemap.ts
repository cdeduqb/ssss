import type { MetadataRoute } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 强制动态渲染，保证 sitemap 每次请求都会实时获取最新数据，不再使用缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // baseUrl 优先使用系统环境变量，如果没有则使用默认协议+域名
  const baseUrl = process.env.SITE_URL || 'https://www.qibiai.cn';

  // 1. 获取所有上架且审核通过的店铺 (避免将未审核或拒绝的店铺放入sitemap导致404)
  let stores: { id: number; updatedAt: Date; category: { templateType: string; name: string } | null }[] = [];
  try {
    stores = await prisma.store.findMany({
      where: { 
        isActive: true,
        status: 'APPROVED' // 必须是已审核通过的
      },
      select: { id: true, updatedAt: true, category: { select: { templateType: true, name: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  } catch (e) {
    console.error('Sitemap: failed to fetch stores', e);
  }

  // 2. 获取所有有店铺的分类
  let categories: { id: number; templateType: string; name: string; updatedAt: Date }[] = [];
  try {
    categories = await prisma.category.findMany({
      where: { 
        stores: {
          some: {
            isActive: true,
            status: 'APPROVED'
          }
        }
      },
      select: { id: true, templateType: true, name: true, updatedAt: true },
    });
  } catch (e) {
    console.error('Sitemap: failed to fetch categories', e);
  }

  // 3. 静态基础页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
  ];

  // 4. 分类聚合页 (更新为正确的带参数的路径)
  const categoryPages: MetadataRoute.Sitemap = categories.map(cat => ({
    url: `${baseUrl}/?categoryId=${cat.id}`,
    lastModified: cat.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // 5. 每个店铺的落地页
  const storePages: MetadataRoute.Sitemap = stores.map(store => ({
    url: `${baseUrl}/${store.id}`,
    lastModified: store.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...categoryPages, ...storePages];
}
