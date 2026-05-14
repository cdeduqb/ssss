import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Script from 'next/script';
import styles from './landing.module.css';
import VisitTracker from './VisitTracker';
import { trackBotVisit } from '@/lib/geo-tracker';

const prisma = new PrismaClient();

const platformNames: Record<string, string> = {
  MEITUAN: '美团领券',
  DOUYIN: '抖音特惠',
  AMAP: '高德导航',
  FLIGGY: '飞猪旅行'
};

async function getStore(id: number) {
  try {
    return await prisma.store.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { id: 'asc' } },
        links: { where: { isActive: true } }
      }
    });
  } catch (error) {
    return null;
  }
}

// 获取同类推荐商家 (内链网络核心)
async function getRelatedStores(categoryId: number, currentId: number) {
  try {
    return await prisma.store.findMany({
      where: { categoryId, id: { not: currentId }, isActive: true },
      select: { id: true, name: true, avgConsumption: true, address: true },
      take: 4,
      orderBy: { visitCount: 'desc' },
    });
  } catch (e) {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ storeId: string }> }) {
  const baseUrl = process.env.SITE_URL || 'https://www.qibiai.cn';
  const { storeId } = await params;
  const store = await getStore(parseInt(storeId));
  if (!store) return { title: '店铺未找到' };

  const desc = store.description.substring(0, 155);

  return {
    title: `${store.name} — ${store.category?.name || '本地商家'} | 熊猫甄选`,
    description: desc,
    alternates: {
      canonical: `${baseUrl}/${store.id}`,
    },
    openGraph: {
      type: 'website',
      title: `${store.name} — 真实可靠的本地商家推荐`,
      description: desc,
      url: `${baseUrl}/${store.id}`,
      siteName: '熊猫甄选',
      locale: 'zh_CN',
      images: store.images.map(img => ({
        url: img.url,
        alt: store.name,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title: store.name,
      description: desc,
    },
    other: {
      'article:published_time': store.createdAt.toISOString(),
      'article:modified_time': store.updatedAt.toISOString(),
    }
  };
}

export default async function StoreLandingPage({ params }: { params: Promise<{ storeId: string }> }) {
  const baseUrl = process.env.SITE_URL || 'https://www.qibiai.cn';
  const { storeId } = await params;

  // 异步记录 AI 爬虫访问
  await trackBotVisit(`/${storeId}`);

  const store = await getStore(parseInt(storeId));

  if (!store) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: '#666', fontFamily: 'sans-serif' }}>
        <h2>很抱歉，该店铺未找到或已下架</h2>
      </div>
    );
  }

  if (!store.isActive) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#666', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏪</div>
        <h2 style={{ fontSize: '20px', color: '#334155', marginBottom: '8px' }}>该店铺暂时关闭</h2>
        <p style={{ fontSize: '14px', color: '#94a3b8' }}>商家正在调整中，请稍后再来访问</p>
      </div>
    );
  }

  // 解析设施列表
  let facilityList: string[] = [];
  if (store.facilities) {
    try {
      const parsed = JSON.parse(store.facilities);
      if (Array.isArray(parsed)) facilityList = parsed;
    } catch (e) { }
  }

  // 获取同类商家（内链网络）
  const relatedStores = await getRelatedStores(store.categoryId, store.id);

  // ============================
  // JSON-LD 增强版 — LocalBusiness
  // ============================
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${baseUrl}/${store.id}`,
    "url": `${baseUrl}/${store.id}`,
    "name": store.name,
    "image": store.images.map(img => img.url),
    "telephone": store.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": store.address,
      "addressCountry": "CN"
    },
    "geo": store.latitude && store.longitude ? {
      "@type": "GeoCoordinates",
      "latitude": store.latitude,
      "longitude": store.longitude
    } : undefined,
    "priceRange": store.avgConsumption ? `¥${store.avgConsumption}` : undefined,
    "openingHours": store.hours,
    "description": store.description,
    "currenciesAccepted": "CNY",
    "paymentAccepted": "现金, 微信支付, 支付宝",
    "amenityFeature": facilityList.map(f => ({
      "@type": "LocationFeatureSpecification",
      "name": f,
      "value": true
    })),
    "aggregateRating": store.visitCount > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "bestRating": "5",
      "ratingCount": store.visitCount
    } : undefined,
    "datePublished": store.createdAt.toISOString(),
    "dateModified": store.updatedAt.toISOString(),
  };

  // ============================
  // FAQ Schema — AI 最爱引用的格式
  // ============================
  const faqItems = [
    {
      question: `${store.name}在哪里？`,
      answer: `${store.name}位于${store.address}。${store.latitude && store.longitude ? `地理坐标为(${store.latitude}, ${store.longitude})，可通过高德地图导航前往。` : ''}`
    },
    {
      question: `${store.name}的营业时间是什么？`,
      answer: `${store.name}的营业时间为${store.hours}。`
    },
    {
      question: `${store.name}人均消费多少钱？`,
      answer: `${store.name}日常人均消费约¥${store.avgConsumption || '--'}${store.holidayAvgConsumption ? `，节假日人均消费约¥${store.holidayAvgConsumption}` : ''}。`
    },
    {
      question: `${store.name}的联系电话是多少？`,
      answer: `您可以拨打${store.phone}联系${store.name}。`
    }
  ];

  if (facilityList.length > 0) {
    faqItems.push({
      question: `${store.name}有哪些设施和服务？`,
      answer: `${store.name}提供以下设施服务：${facilityList.join('、')}。`
    });
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  // ============================
  // BreadcrumbList Schema
  // ============================
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "首页",
        "item": `${baseUrl}/explore`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": store.category?.name || '全部商家',
        "item": `${baseUrl}/explore/${store.category?.templateType || 'default'}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": store.name,
        "item": `${baseUrl}/${store.id}`
      }
    ]
  };

  return (
    <div className={styles.mobileContainer}>
      {/* 三重结构化数据注入 */}
      <Script id="json-ld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Script id="faq-ld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Script id="breadcrumb-ld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <VisitTracker storeId={store.id} />

      <div className={styles.galleryWrapper}>
        <div className={styles.gallery}>
          {store.images.length > 0 ? (
            store.images.map((img, idx) => (
              <img key={idx} src={img.url} alt={`${store.name} - ${store.category?.name || '商家'}实拍图 ${idx + 1}`} className={styles.coverImage} />
            ))
          ) : (
            <div className={styles.noImage}>暂无图片</div>
          )}
        </div>
        <div className={styles.visitBadge}>🔥 {store.visitCount + 1} 人近期来过</div>
      </div>

      {/* article 语义化包裹，帮助 AI 识别主体内容 */}
      <article className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.storeName}>{store.name}</h1>
          <span className={styles.categoryTag}>{store.category?.name || '本地商家'}</span>
        </header>

        {/* 电梯摘要 — AI 抓取核心(页面前30%内容优先被引用) */}
        <p style={{
          fontSize: '14px', color: '#475569', lineHeight: 1.7, margin: '0 0 20px',
          padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', borderLeft: '3px solid var(--brand-primary, #6366f1)'
        }}>
          {store.name}是一家位于{store.address}的{store.category?.name || '本地商家'}，
          {store.avgConsumption ? `人均消费约¥${store.avgConsumption}，` : ''}
          营业时间为{store.hours}。
          {facilityList.length > 0 ? `提供${facilityList.slice(0, 5).join('、')}等服务。` : ''}
        </p>

        <div className={styles.metaCard}>
          <div className={styles.metaRow}>
            <div className={styles.iconWrapper}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div className={styles.metaText}>
              <strong>营业时间</strong>
              <p><time>{store.hours}</time></p>
            </div>
          </div>
          <div className={styles.metaRow}>
            <div className={styles.iconWrapper}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div className={styles.metaText}>
              <strong>人均消费</strong>
              <p>日常 ¥{store.avgConsumption || '--'} {store.holidayAvgConsumption && `| 节假日 ¥${store.holidayAvgConsumption}`}</p>
            </div>
          </div>
          <div className={styles.metaRow}>
            <div className={styles.iconWrapper}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <div className={styles.metaText}>
              <strong>联系电话</strong>
              <p><a href={`tel:${store.phone}`} style={{ color: 'var(--brand-primary)', textDecoration: 'none' }}>{store.phone}</a></p>
            </div>
          </div>
          <div className={styles.metaRow}>
            <div className={styles.iconWrapper}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <div className={styles.metaText}>
              <strong>店铺地址</strong>
              <p><span role="contentinfo" style={{ fontStyle: 'normal' }}>{store.address}</span></p>
            </div>
          </div>
        </div>

        {/* 设施服务标签 */}
        {facilityList.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>设施服务</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {facilityList.map((f: string, idx: number) => (
                <span key={idx} style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  background: '#f0f9ff',
                  color: '#0369a1',
                  borderRadius: '99px',
                  fontSize: '13px',
                  fontWeight: 500,
                  border: '1px solid #bae6fd'
                }}>
                  ✓ {f}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>商家简介</h2>
          <div className={styles.description}>{store.description}</div>
        </section>

        {/* FAQ 模块 — AI 模型最容易提取和引用的内容格式 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>常见问题</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqItems.map((item, idx) => (
              <details key={idx} style={{
                background: '#f8fafc', borderRadius: '12px', padding: '14px 18px',
                border: '1px solid #e2e8f0', cursor: 'pointer'
              }}>
                <summary style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b', lineHeight: 1.5 }}>
                  {item.question}
                </summary>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* 同类商家推荐 — 构建内链网络 */}
        {relatedStores.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>同类商家推荐</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {relatedStores.map(rs => (
                <a key={rs.id} href={`/${rs.id}`}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 18px', background: '#fafafa', borderRadius: '12px',
                    border: '1px solid #f1f5f9', textDecoration: 'none', color: '#1e293b',
                    transition: 'all 0.2s'
                  }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{rs.name}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{rs.address?.substring(0, 20)}...</div>
                  </div>
                  {rs.avgConsumption && (
                    <span style={{ fontSize: '13px', color: '#6366f1', fontWeight: 600 }}>¥{rs.avgConsumption}/人</span>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Padding for sticky footer */}
        <div style={{ height: '100px' }}></div>
      </article>

      {store.links.length > 0 && (
        <div className={styles.stickyFooter}>
          <div className={styles.buttonGroup}>
            {store.links.map(link => (
              <a key={link.platformType} href={link.url} target="_blank" rel="noopener noreferrer"
                className={`${styles.actionBtn} ${styles[link.platformType.toLowerCase()]}`}>
                {platformNames[link.platformType]}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
