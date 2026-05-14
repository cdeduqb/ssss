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
    <main className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
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

      {/* Hero 区域：极致现代毛玻璃与动态极光渐变 */}
      <section className="relative w-full min-h-[90vh] flex flex-col justify-center overflow-hidden bg-[#0A0F1C]">
        {/* Animated Aurora Background Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-r from-indigo-600/40 to-purple-600/40 mix-blend-screen filter blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-gradient-to-r from-blue-600/30 to-teal-500/30 mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[40%] rounded-full bg-gradient-to-r from-fuchsia-600/30 to-pink-500/30 mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Fine Grain Texture Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>

        {/* Top Navbar */}
        <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
              Q
            </div>
            <span className="text-white font-bold text-xl tracking-wide">企比AI</span>
          </div>
          <Link href="/admin/login" className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-medium backdrop-blur-md transition-all duration-300 flex items-center gap-2 group">
            商家入口
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
        </nav>

        <div className="relative z-10 container mx-auto px-6 text-center pt-20">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 backdrop-blur-xl text-indigo-100 text-sm font-medium mb-10 shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:bg-white/10 transition-colors cursor-default">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
            大模型数据分发引擎 2.0 现已上线
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-400 drop-shadow-sm">探索身边的</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-lg">非凡生活体验</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-300 max-w-3xl mx-auto mb-14 leading-relaxed font-light tracking-wide">
            基于领先的语义理解与智能推荐算法，为您挖掘全城最地道的特色美食、极具设计感的精品酒店与必去景点。
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a href="#categories" className="group relative px-10 py-5 bg-white text-slate-900 font-bold rounded-full overflow-hidden hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <div className="relative flex items-center justify-center gap-2">
                开启智能探索 
                <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              </div>
            </a>
            <a href="#latest" className="px-10 py-5 bg-slate-800/40 border border-slate-700/50 text-white font-semibold rounded-full backdrop-blur-xl hover:bg-slate-800/60 hover:border-slate-600 transition-all duration-300 shadow-xl flex items-center justify-center">
              浏览最新甄选
            </a>
          </div>
        </div>
        
        {/* Curvy Bottom Mask */}
        <div className="absolute bottom-[-2px] left-0 right-0 w-full overflow-hidden leading-none z-20">
          <svg className="relative block w-full h-[60px] md:h-[120px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,123.15,191.56,115.1,236.4,109.11,279.7,89.51,321.39,56.44Z" className="fill-[#F8FAFC]"></path>
          </svg>
        </div>
      </section>

      {/* 分类导航区域：让爬虫知道网站的主要内容结构 */}
      <section id="categories" className="pt-20 pb-32 relative z-10">
        <div className="container mx-auto px-6">
          <header className="mb-20 text-center relative">
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight relative inline-block">
              精选服务分类
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
            </h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto mt-8">多维度精准聚合，满足您对高品质生活的所有想象</p>
          </header>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
            {categories.map((category, idx) => {
              // 为不同分类配置不同的渐变色
              const gradients = [
                'from-blue-500 to-indigo-500',
                'from-purple-500 to-pink-500',
                'from-emerald-400 to-teal-500',
                'from-orange-400 to-rose-400',
                'from-cyan-400 to-blue-500',
                'from-fuchsia-500 to-purple-600',
              ];
              const gradient = gradients[idx % gradients.length];
              
              return (
                <Link href={`/explore?categoryId=${category.id}`} key={category.id} className="group relative bg-white rounded-[2rem] p-8 text-center hover:-translate-y-3 transition-all duration-500 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-10px_rgba(99,102,241,0.15)] flex flex-col items-center justify-center overflow-hidden z-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white -z-10"></div>
                  
                  {/* Hover background glow */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${gradient} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-500 -z-10`}></div>
                  
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                    <svg className="w-10 h-10 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800 mb-2">
                    {category.name}
                  </h3>
                  <span className="inline-block mt-2 px-4 py-1.5 bg-slate-100 text-slate-500 text-sm font-bold rounded-full group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    {category._count.stores} 优质商家
                  </span>
                </Link>
              );
            })}
            {categories.length === 0 && (
              <div className="col-span-full text-center text-slate-400 py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 shadow-sm">
                <div className="text-2xl font-bold text-slate-300 mb-2">暂无分类数据</div>
                <p>请前往后台添加您的第一个本地服务分类</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 最新推荐列表：打平网站层级，极大方便搜索引擎收录详情页 */}
      <section id="latest" className="py-32 relative">
        <div className="absolute inset-0 bg-white -skew-y-2 z-0 transform origin-top-left"></div>
        <div className="container mx-auto px-6 relative z-10">
          <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight relative inline-block">
                新锐商家大赏
                <div className="absolute -bottom-4 left-0 w-16 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              </h2>
              <p className="text-xl text-slate-500 font-medium mt-8">第一时间发现城市新风尚，打卡极具潜力的宝藏店铺</p>
            </div>
            <Link href="/explore" className="inline-flex items-center px-6 py-3 bg-indigo-50 text-indigo-600 font-bold rounded-full hover:bg-indigo-600 hover:text-white transition-all duration-300 group shadow-sm">
              浏览全城好店
              <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {stores.map((store) => (
              <article key={store.id} className="group bg-white rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgb(0,0,0,0.12)] transition-all duration-500 flex flex-col hover:-translate-y-2 ring-1 ring-slate-100 hover:ring-indigo-100">
                <Link href={`/${store.id}`} className="relative h-72 overflow-hidden block">
                  {store.images && store.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={store.images[0].url} 
                      alt={`${store.name} 封面图`} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                      <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  {/* Elegant Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C]/90 via-[#0A0F1C]/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                  
                  {/* Glassmorphism Category Tag */}
                  <div className="absolute top-5 left-5 bg-white/20 backdrop-blur-xl px-4 py-1.5 rounded-full text-xs font-bold text-white border border-white/30 shadow-[0_8px_16px_rgb(0,0,0,0.2)]">
                    {store.category.name}
                  </div>
                  
                  {/* Store Title & Address on Image */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-black text-white mb-2 leading-tight drop-shadow-lg group-hover:text-indigo-200 transition-colors">
                      {store.name}
                    </h3>
                    <div className="flex flex-wrap gap-3 items-center mt-3">
                      <span className="text-xs font-medium text-slate-200 flex items-center bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                        <svg className="w-3.5 h-3.5 mr-1.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {store.address.slice(0, 15)}{store.address.length > 15 ? '...' : ''}
                      </span>
                      {store.avgConsumption && (
                        <span className="text-xs font-bold text-emerald-300 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                          ¥{store.avgConsumption}/人
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                
                <div className="p-6 flex flex-col flex-grow bg-white relative">
                  <p className="text-slate-500 mb-6 flex-grow line-clamp-2 text-sm leading-relaxed font-medium" title={store.description}>
                    {store.description || '这家店很神秘，暂无详细介绍，亲自去一探究竟吧！'}
                  </p>
                  
                  <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <Link href={`/${store.id}`} className="text-sm font-black text-indigo-600 group-hover:text-indigo-800 transition-colors flex items-center tracking-wide uppercase">
                      查看详情 
                    </Link>
                    <Link href={`/${store.id}`} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 hover:rotate-12 shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
            {stores.length === 0 && (
              <div className="col-span-full py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="w-24 h-24 bg-white shadow-xl rounded-full flex items-center justify-center mx-auto mb-8 text-indigo-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-3">虚位以待</h3>
                <p className="text-lg text-slate-500 font-medium">平台正在火热招商中，敬请期待更多优质内容入驻。</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer：极简现代黑金风格 */}
      <footer className="bg-[#0A0F1C] text-slate-400 py-20 border-t border-slate-800/50 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16 border-b border-slate-800 pb-16">
            <div className="md:col-span-2">
              <h4 className="text-white text-3xl font-black mb-6 tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl">Q</div>
                企比AI 聚合平台
              </h4>
              <p className="text-base leading-relaxed max-w-md text-slate-400 font-medium">
                我们致力于打造最具品质的本地生活智能推荐网络。依靠前沿的搜索引擎与AI大模型解析技术，打破信息差，帮您发现城市中隐藏的非凡体验。
              </p>
            </div>
            <div>
              <h4 className="text-white text-lg font-bold mb-8 uppercase tracking-wider text-slate-300">快速探索</h4>
              <ul className="space-y-4 text-base font-medium">
                <li><Link href="/" className="hover:text-white hover:translate-x-1 inline-block transition-all">平台首页</Link></li>
                <li><Link href="/explore" className="hover:text-white hover:translate-x-1 inline-block transition-all">发现全城商家</Link></li>
                <li>
                  <Link href="/admin/login" className="hover:text-white hover:translate-x-1 inline-flex items-center transition-all group">
                    商家控制台 
                    <span className="ml-3 px-2.5 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] uppercase font-bold rounded-md border border-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white transition-colors">入口</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-lg font-bold mb-8 uppercase tracking-wider text-slate-300">商务合作</h4>
              <p className="text-base leading-relaxed font-medium mb-4">
                欢迎各地优质商家入驻平台，共同构建高净值本地生活服务生态。
              </p>
              <a href="mailto:contact@qibiai.cn" className="inline-flex items-center text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-white hover:to-white transition-all">
                contact@qibiai.cn
                <svg className="w-5 h-5 ml-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-sm font-medium text-slate-500">
            <p>&copy; {new Date().getFullYear()} 企比AI 本地生活聚合平台. 保留所有权利。</p>
            <p className="mt-4 md:mt-0 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              大模型内容抓取引擎运行中
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
