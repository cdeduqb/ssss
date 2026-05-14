import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import type { Metadata } from 'next';
import Script from 'next/script';
import { trackBotVisit } from '@/lib/geo-tracker';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export const metadata: Metadata = {
  title: '探索本地优质商家',
  description: '发现身边的优质餐饮、酒店民宿、景点玩乐等本地商家，查看真实的商家信息、营业时间、人均消费和用户评价。',
};

const templateNames: Record<string, string> = {
  default: '精选推荐',
  restaurant: '美食餐饮',
  hotel: '酒店民宿',
  attraction: '景点玩乐',
};

const templateIcons: Record<string, string> = {
  default: '⭐',
  restaurant: '🍜',
  hotel: '🏨',
  attraction: '🎡',
};

async function getData() {
  try {
    const [categories, stores] = await Promise.all([
      prisma.category.findMany({
        where: { parentId: null },
        orderBy: { sortOrder: 'desc' },
      }),
      prisma.store.findMany({
        where: { isActive: true },
        include: {
          category: true,
          images: { where: { isCover: true }, take: 1 },
        },
        orderBy: { visitCount: 'desc' },
      }),
    ]);
    return { categories, stores };
  } catch (e) {
    return { categories: [], stores: [] };
  }
}

export default async function ExplorePage() {
  // 异步记录 AI 爬虫访问
  await trackBotVisit('/');

  const { categories, stores } = await getData();
  const baseUrl = process.env.SITE_URL || 'https://www.qibiai.cn';

  // Organization Schema
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "本地生活geo平台",
    "url": baseUrl,
    "description": "专注于本地生活服务的智能商家推荐平台",
  };

  // 按分类分组商家
  const storesByCategory = new Map<string, typeof stores>();
  for (const store of stores) {
    const key = store.category?.templateType || 'default';
    if (!storesByCategory.has(key)) storesByCategory.set(key, []);
    storesByCategory.get(key)!.push(store);
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px', fontFamily: '-apple-system, sans-serif' }}>
      <Script id="org-ld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />

      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          探索本地优质商家
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.6 }}>
          发现身边的好店 · 真实信息 · 品质推荐
        </p>
      </header>

      {/* 分类导航 */}
      <nav style={{ display: 'flex', gap: '12px', overflowX: 'auto', marginBottom: '40px', paddingBottom: '8px' }}>
        {categories.map(cat => (
          <a key={cat.id} href={`#${cat.templateType}`}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              padding: '16px 24px', background: 'white', borderRadius: '16px',
              border: '1px solid #f1f5f9', textDecoration: 'none', color: '#334155',
              minWidth: '100px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              transition: 'all 0.2s', flexShrink: 0,
            }}>
            <span style={{ fontSize: '28px' }}>{templateIcons[cat.templateType] || '📌'}</span>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{cat.name}</span>
          </a>
        ))}
      </nav>

      {/* 按分类展示商家 */}
      {Array.from(storesByCategory.entries()).map(([templateType, catStores]) => (
        <section key={templateType} id={templateType} style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{templateIcons[templateType] || '📌'}</span>
            {templateNames[templateType] || '其他'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {catStores.map(store => (
              <Link key={store.id} href={`/${store.id}`}
                style={{
                  display: 'flex', gap: '14px', padding: '16px',
                  background: 'white', borderRadius: '16px',
                  border: '1px solid #f1f5f9', textDecoration: 'none', color: '#1e293b',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)', transition: 'all 0.2s',
                }}>
                {store.images?.[0]?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={store.images[0].url} alt={store.name}
                    style={{
                      width: '80px', height: '80px', borderRadius: '12px',
                      objectFit: 'cover', flexShrink: 0,
                    }} />
                )}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{store.name}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>{store.category?.name}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {store.description?.substring(0, 60)}...
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>
                    {store.avgConsumption && <span>💰 ¥{store.avgConsumption}/人</span>}
                    <span>🔥 {store.visitCount}次访问</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {stores.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <p>暂无商家数据</p>
        </div>
      )}

      <footer style={{ textAlign: 'center', padding: '40px 0', color: '#cbd5e1', fontSize: '12px' }}>
        <p>本地生活geo平台 — 智能推荐引擎</p>
      </footer>
    </div>
  );
}
