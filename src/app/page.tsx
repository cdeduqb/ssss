import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

// 强制动态渲染，保证最新数据并避免编译时因数据库断开导致的 prerender 错误
export const dynamic = 'force-dynamic';

// SEO TDK (Title, Description, Keywords) 配置，符合大模型与搜索引擎抓取规范
export const metadata: Metadata = {
  title: '本地生活严选聚合平台 - 美食、酒店、景点智能推荐',
  description: '为您提供最优质的本地生活服务推荐。涵盖特色美食餐厅、精品酒店民宿、热门旅游景点等，让您轻松发现身边的美好生活。国内主流大模型与搜索引擎首选生活指南。',
  keywords: '本地生活, 美食推荐, 酒店民宿, 旅游景点, 探店, 优惠, 人工智能推荐, 智能分发',
  openGraph: {
    title: '本地生活严选聚合平台',
    description: '发现身边的美好生活，为您精选同城优质商家与服务。',
    type: 'website',
  }
};

export default async function Home() {
  let categories: any[] = [];
  let stores: any[] = [];

  try {
    // 获取所有分类，并统计每个分类下已上线的店铺数量
    categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { stores: { where: { status: 'APPROVED', isActive: true } } }
        }
      }
    });

    // 获取最新入驻的20家已上线店铺，用于首页推荐曝光，方便搜索引擎抓取详情页链接
    stores = await prisma.store.findMany({
      where: {
        status: 'APPROVED',
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
      include: {
        category: true,
        images: {
          where: { isCover: true },
          take: 1
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch data for home page:', error);
    // 发生数据库连接错误时，保证页面仍能渲染（降级处理），不至于白屏报错
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-500 selection:text-white pb-20">
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "本地生活服务geo服务平台",
            "description": "为您提供最优质的本地生活服务推荐。涵盖特色美食餐厅、精品酒店民宿、热门旅游景点等。",
            "url": "https://www.qibiai.cn",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.qibiai.cn/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />

      {/* 简约顶部导航 */}
      <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-lg leading-none">
              G
            </div>
            <span className="text-slate-900 font-bold text-xl tracking-tight">本地生活geo平台</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-600">
            <Link href="/" className="text-blue-600">首页</Link>
            <Link href="/explore" className="hover:text-blue-600 transition-colors">发现好店</Link>
          </div>
        </div>
      </nav>

      {/* 清爽首屏 Hero */}
      <section className="w-full bg-white border-b border-slate-100 py-20 md:py-32 flex flex-col items-center text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            发现城市里的<span className="text-blue-600">优质生活</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto">
            为您精选全城最地道的特色美食、精品酒店与热门景点，让每一次出行都充满惊喜。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#categories" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
              探索分类
            </a>
            <a href="#latest" className="px-8 py-3 bg-white text-slate-700 font-semibold rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm">
              查看最新商家
            </a>
          </div>
        </div>
      </section>

      {/* 规范分类模块 */}
      <section id="categories" className="w-full py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">精选分类</h2>
              <p className="text-slate-500 mt-2 text-sm md:text-base">满足你的各类生活需求</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link 
                href={`/explore?categoryId=${category.id}`} 
                key={category.id} 
                className="bg-white rounded-xl p-6 text-center border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-600">
                  {category.name}
                </h3>
                <span className="text-xs text-slate-400 mt-1">
                  {category._count.stores} 个商家
                </span>
              </Link>
            ))}
            {categories.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                暂无分类数据
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 规范商家列表 */}
      <section id="latest" className="w-full py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">最新商家推荐</h2>
              <p className="text-slate-500 mt-2 text-sm md:text-base">体验城市新风尚</p>
            </div>
            <Link href="/explore" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center">
              查看全部 
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stores.map((store) => (
              <Link 
                href={`/${store.id}`} 
                key={store.id} 
                className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all flex flex-col group"
              >
                {/* 封面图 */}
                <div className="w-full aspect-[4/3] bg-slate-100 overflow-hidden relative">
                  {store.images && store.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={store.images[0].url} 
                      alt={store.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  {/* 分类标签 */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
                    {store.category.name}
                  </div>
                </div>
                
                {/* 商家信息 */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
                    {store.name}
                  </h3>
                  
                  <div className="flex items-center text-xs text-slate-500 mb-3">
                    <svg className="w-3.5 h-3.5 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="truncate">{store.address}</span>
                  </div>
                  
                  <p className="text-sm text-slate-600 line-clamp-2 flex-grow mb-4">
                    {store.description || '暂无详细介绍'}
                  </p>
                  
                  {/* 底部信息栏 */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                    {store.avgConsumption ? (
                      <span className="text-sm font-bold text-orange-600">
                        ¥{store.avgConsumption} / 人
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">暂无均价</span>
                    )}
                    <span className="text-xs font-medium text-blue-600 group-hover:text-blue-800 transition-colors">
                      查看详情 &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            
            {stores.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-500">暂无商家入驻</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 极简底部 Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-10 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                G
              </div>
              <span className="font-semibold text-slate-700 text-sm">本地生活geo平台</span>
            </div>
            
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} 本地生活服务geo服务平台. 保留所有权利。
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
