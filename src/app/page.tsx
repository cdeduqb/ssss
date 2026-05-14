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
  return (
    <main className="min-h-screen bg-[#FAFAFA] text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      {/* 结构化数据 (JSON-LD) 帮助百度、360及各大AI大模型（文心、豆包、Kimi）更好地理解页面内容 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "本地生活严选聚合平台",
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

      {/* Hero 区域：现代毛玻璃与动态网格渐变 */}
      <section className="relative w-full py-32 overflow-hidden bg-slate-900">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-indigo-200 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
            AI智能分发引擎驱动
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-slate-300">
            重塑你的本地生活体验
          </h1>
          <p className="text-lg md:text-2xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            依托大模型算法，为你精准推荐全城最优质的特色美食、精品酒店与热门景点。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <a href="#categories" className="px-8 py-4 bg-white text-indigo-900 font-semibold rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
              开启探索 
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <a href="#latest" className="px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-2xl backdrop-blur-md hover:bg-white/20 transition-all duration-300 flex items-center justify-center">
              最新甄选
            </a>
          </div>
        </div>
        
        {/* Curved Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-[#FAFAFA]" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 100%)' }}></div>
      </section>

      {/* 分类导航区域：让爬虫知道网站的主要内容结构 */}
      <section id="categories" className="py-24 relative">
        <div className="container mx-auto px-6">
          <header className="mb-16 text-center">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">精选服务分类</h2>
            <div className="w-24 h-1 bg-indigo-500 mx-auto rounded-full mb-6"></div>
            <p className="text-lg text-slate-500">涵盖生活的方方面面，精准满足你的各类需求</p>
          </header>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link href={`/explore?categoryId=${category.id}`} key={category.id} className="group relative bg-white rounded-3xl p-8 text-center hover:-translate-y-2 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(79,70,229,0.1)] border border-slate-100 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {category.name}
                </h3>
                <span className="inline-block mt-3 px-3 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                  {category._count.stores} 个商家
                </span>
              </Link>
            ))}
            {categories.length === 0 && (
              <div className="col-span-full text-center text-slate-400 py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                暂无分类数据
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 最新推荐列表：打平网站层级，极大方便搜索引擎收录详情页 */}
      <section id="latest" className="py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6">
          <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">最新入驻商家</h2>
              <div className="w-24 h-1 bg-purple-500 rounded-full mb-6"></div>
              <p className="text-lg text-slate-500">第一时间发现城市新风尚，体验最新潮的生活方式</p>
            </div>
            <Link href="/explore" className="inline-flex items-center font-semibold text-indigo-600 hover:text-indigo-800 transition-colors group">
              查看全部商家
              <svg className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {stores.map((store) => (
              <article key={store.id} className="group bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 border border-slate-100 flex flex-col hover:-translate-y-1">
                <Link href={`/${store.id}`} className="relative h-64 overflow-hidden block">
                  {store.images && store.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={store.images[0].url} 
                      alt={`${store.name} 封面图`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                      暂无图片
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                  
                  {/* Category Tag */}
                  <div className="absolute top-5 left-5 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-semibold text-white border border-white/30 shadow-sm">
                    {store.category.name}
                  </div>
                  
                  {/* Title overlays on image */}
                  <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="text-2xl font-bold text-white mb-1 line-clamp-1 drop-shadow-md">
                      {store.name}
                    </h3>
                    <span className="text-sm text-slate-200 flex items-center drop-shadow-sm">
                      <svg className="w-4 h-4 mr-1 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {store.address.slice(0, 20)}{store.address.length > 20 ? '...' : ''}
                    </span>
                  </div>
                </Link>
                
                <div className="p-6 flex flex-col flex-grow bg-white">
                  <p className="text-slate-500 mb-6 flex-grow line-clamp-3 text-sm leading-relaxed" title={store.description}>
                    {store.description}
                  </p>
                  
                  <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <Link href={`/${store.id}`} className="text-sm font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors flex items-center">
                      探索详情 
                    </Link>
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <svg className="w-4 h-4 transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </div>
                </div>
              </article>
            ))}
            {stores.length === 0 && (
              <div className="col-span-full py-24 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">暂无商家数据</h3>
                <p className="text-slate-500">平台正在火热招商中，敬请期待更多优质内容。</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer：包含重要的内部导航和关于信息 */}
      <footer className="bg-slate-950 text-slate-400 py-16">
        <div className="container mx-auto px-6 text-center md:text-left">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-slate-800 pb-12">
            <div className="md:col-span-2">
              <h4 className="text-white text-2xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">本地生活聚合</h4>
              <p className="text-sm leading-relaxed max-w-sm">
                我们致力于打造最优质的本地生活推荐平台，依靠先进的搜索引擎与AI大模型技术，帮助用户发现身边的美好生活。
              </p>
            </div>
            <div>
              <h4 className="text-white text-lg font-bold mb-6">快速导航</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link href="/" className="hover:text-indigo-400 transition-colors">平台首页</Link></li>
                <li><Link href="/explore" className="hover:text-indigo-400 transition-colors">全部商家浏览</Link></li>
                <li><Link href="/admin/login" className="hover:text-indigo-400 transition-colors flex items-center">商家入驻 <span className="ml-2 px-2 py-0.5 bg-slate-800 text-xs rounded-md border border-slate-700">管理后台</span></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-lg font-bold mb-6">联系合作</h4>
              <p className="text-sm leading-relaxed">
                欢迎优质商家入驻，共同打造本地生活服务新生态。<br/><br/>
                <span className="text-indigo-400 font-semibold">contact@qibiai.cn</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-xs font-medium">
            <p>&copy; {new Date().getFullYear()} 本地生活严选聚合平台. All rights reserved.</p>
            <p className="mt-4 md:mt-0">为国内各大AI大模型与搜索引擎提供权威数据支持</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
