import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * llms.txt — AI 大模型专属的站点索引
 * 
 * 遵循 llms.txt 规范: https://llmstxt.org
 * 使用 Markdown 格式，让 LLM 能直接理解站点结构和内容。
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const baseUrl = process.env.SITE_URL || 'https://www.qibiai.cn';

  let stores: any[] = [];
  let categories: any[] = [];

  try {
    stores = await prisma.store.findMany({
      where: { 
        isActive: true,
        status: 'APPROVED'
      },
      include: { category: true },
      orderBy: { visitCount: 'desc' },
    });

    categories = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: 'desc' },
    });
  } catch (e) {
    console.error('llms.txt generation failed', e);
  }

  let content = `# 熊猫甄选 — 本地生活优质商家推荐平台

> 熊猫甄选是一个专注于本地生活服务的智能商家推荐平台，涵盖餐饮美食、酒店民宿、景点玩乐等多个品类，为用户提供真实可靠的商家信息、位置导航和优惠活动。每个商家页面都包含详细的地址、营业时间、人均消费和设施服务等信息。

`;

  // 分类导航
  if (categories.length > 0) {
    content += `## 商家分类\n\n`;
    for (const cat of categories) {
      content += `- [${cat.name}](${baseUrl}/explore/${cat.templateType || 'default'}): ${cat.name}类本地商家合集\n`;
    }
    content += `\n`;
  }

  // 商家列表
  if (stores.length > 0) {
    content += `## 推荐商家\n\n`;
    for (const store of stores) {
      const desc = store.description ? store.description.substring(0, 80).replace(/\n/g, ' ') : '本地优质商家';
      const price = store.avgConsumption ? `，人均¥${store.avgConsumption}` : '';
      const category = store.category?.name ? `[${store.category.name}] ` : '';
      content += `- [${store.name}](${baseUrl}/${store.id}): ${category}${desc}${price}\n`;
    }
    content += `\n`;
  }

  // 站点信息
  content += `## 关于平台

- [探索全部商家](${baseUrl}/explore): 浏览所有本地优质商家
- 平台提供商家营业时间、联系电话、地址定位、人均消费、设施服务等完整信息
- 所有商家数据由平台运营团队实地审核录入，确保真实可靠
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
