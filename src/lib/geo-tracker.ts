import { headers } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BOT_PATTERNS = {
  'Bytespider (豆包/抖音)': /Bytespider/i,
  'Baiduspider (百度/文心)': /Baiduspider/i,
  'GPTBot (ChatGPT)': /GPTBot/i,
  'ClaudeBot (Claude)': /ClaudeBot/i,
  'PerplexityBot (Perplexity)': /PerplexityBot/i,
  'Applebot (Apple Intelligence)': /Applebot/i,
  'Googlebot (Google/Gemini)': /Googlebot/i,
  'Bingbot (必应/Copilot)': /bingbot/i,
  'YisouSpider (神马/阿里)': /YisouSpider/i,
  'Sogou (搜狗/腾讯)': /Sogou/i,
  '360Spider (360智脑)': /360Spider/i,
};

/**
 * 检查请求的 User-Agent 并记录爬虫访问日志。
 * @param path 当前访问的路径 (例如 "/1", "/explore")
 */
export async function trackBotVisit(path: string) {
  try {
    // Next.js 15+ headers() returns a Promise
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '';

    if (!userAgent) return;

    let detectedBot = '';
    for (const [botName, pattern] of Object.entries(BOT_PATTERNS)) {
      if (pattern.test(userAgent)) {
        detectedBot = botName;
        break;
      }
    }

    if (detectedBot) {
      // 异步写入日志，不阻塞当前请求
      prisma.crawlerLog.create({
        data: {
          botName: detectedBot,
          url: path,
          userAgent: userAgent.substring(0, 500),
          ip: ip.substring(0, 50),
        }
      }).catch(err => {
        console.error('Failed to write CrawlerLog:', err);
      });
    }
  } catch (error) {
    // 静默失败，保证不影响正常页面渲染
  }
}
