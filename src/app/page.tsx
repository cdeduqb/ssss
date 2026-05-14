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
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-500 selection:text-white">
      {/* 结构化数据 (JSON-LD) */}
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

      {/* 简约导航栏 */}
      <nav className="w-full bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              G
            </div>
            <span className="text-slate-900 font-bold text-xl tracking-tight">本地生活geo平台</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            <Link href="/" className="text-blue-600">首页</Link>
            <Link href="/explore" className="hover:text-blue-600 transition-colors">发现好店</Link>
          </div>
        </div>
      </nav>

      {/* 极简清爽 Hero 区域 */}
      <section className="relative w-full py-24 md:py-32 bg-white flex flex-col items-center text-center overflow-hidden">
        {/* 极简网格背景 */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        
        <div className="relative z-10 container mx-auto px-6 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            发现城市里的<br className="hidden md:block" />
            <span className="text-blue-600">优质生活体验</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed">
            为您精选全城最地道的特色美食、精品酒店与热门景点，让每一次出行都充满惊喜。
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#categories" className="px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              按分类浏览
            </a>
            <a href="#latest" className="px-8 py-3.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors">
              查看最新推荐
            </a>
          </div>
        </div>
      </section>

      {/* 简约分类导航 */}
      <section id="categories" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">精选分类</h2>
            <p className="text-slate-500">满足你的各类生活需求</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link href={`/explore?categoryId=${category.id}`} key={category.id} className="group bg-white rounded-xl p-6 text-center hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md border border-slate-100 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <span className="text-xs text-slate-400 mt-1">
                  {category._count.stores} 个商家
                </span>
              </Link>
            ))}
            {categories.length === 0 && (
              <div className="col-span-full text-center text-slate-400 py-16 bg-white rounded-xl border border-dashed border-slate-200">
                暂无分类数据
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 极简商家卡片列表 */}
      <section id="latest" className="py-20 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">最新商家推荐</h2>
              <p className="text-slate-500">体验城市新风尚</p>
            </div>
            <Link href="/explore" className="text-blue-600 font-medium hover:text-blue-800 transition-colors flex items-center">
              查看全部 <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stores.map((store) => (
              <Link href={`/${store.id}`} key={store.id} className="group flex flex-col bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  {store.images && store.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={store.images[0].url} 
                      alt={store.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 shadow-sm">
                    {store.category.name}
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {store.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3 truncate">
                    {store.address}
                  </p>
                  
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-grow">
                    {store.description || '暂无详细介绍'}
                  </p>
                  
                  {store.avgConsumption && (
                    <div className="text-sm font-semibold text-orange-500 mt-auto">
                      ¥{store.avgConsumption} / 人
                    </div>
                  )}
                </div>
              </Link>
            ))}
            
            {stores.length === 0 && (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-500">暂无商家入驻</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 清爽底部 Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 text-slate-500">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                G
              </div>
              <span className="font-semibold text-slate-700">本地生活服务geo服务平台</span>
            </div>
            
            <div className="flex gap-6 text-sm">
              <Link href="/" className="hover:text-blue-600 transition-colors">首页</Link>
              <Link href="/explore" className="hover:text-blue-600 transition-colors">发现好店</Link>
              <a href="mailto:contact@qibiai.cn" className="hover:text-blue-600 transition-colors">联系我们</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center text-xs">
            <p>&copy; {new Date().getFullYear()} 本地生活服务geo服务平台. 保留所有权利。</p>
            <p className="mt-2 md:mt-0">致力于为您发现更美好的城市生活体验</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
