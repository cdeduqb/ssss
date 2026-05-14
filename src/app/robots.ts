import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // 当前使用的域名，部署到正式环境后需要替换
  const baseUrl = process.env.SITE_URL || 'https://www.qibiai.cn';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'Bytespider',  // 豆包/抖音AI爬虫
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'Applebot-Extended', // Apple Intelligence
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'Google-Extended', // Gemini
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
