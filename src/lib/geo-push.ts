import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 从环境变量读取 Token，这里提供默认占位符方便本地测试
const BAIDU_TOKEN = process.env.BAIDU_PUSH_TOKEN || 'your_baidu_token';
const TOUTIAO_TOKEN = process.env.TOUTIAO_PUSH_TOKEN || 'your_toutiao_token';

/**
 * 统一的主动推送入口：当新增或更新店铺时调用
 */
export async function triggerGEOPush(storeId: number) {
  try {
    const baseUrl = process.env.SITE_URL || 'https://www.qibiai.cn';
    // 只有非 localhost 才真实推送，避免测试环境污染
    if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
      console.log(`[GEO Push] Skipped push for store ${storeId} because environment is local.`);
      return;
    }

    // 检查该店铺是否已经成功推送过，避免重复推送浪费额度
    const existingSuccessPush = await prisma.pushLog.findFirst({
      where: { storeId: storeId, status: 'SUCCESS' }
    });

    if (existingSuccessPush) {
      console.log(`[GEO Push] Skipped push for store ${storeId} because it has already been successfully pushed.`);
      return;
    }

    const targetUrl = `${baseUrl}/${storeId}`;
    console.log(`[GEO Push] Triggering active push for: ${targetUrl}`);

    // 并行向三大平台推送
    await Promise.allSettled([
      pushToBaidu(targetUrl, storeId, baseUrl),
      pushToToutiao(targetUrl, storeId, baseUrl),
      pushToIndexNow(targetUrl, storeId, baseUrl)
    ]);
  } catch (error) {
    console.error('[GEO Push] Global error:', error);
  }
}

/**
 * 1. 百度搜索 / 文心一言生态推送
 */
async function pushToBaidu(url: string, storeId: number, baseUrl: string) {
  try {
    // 使用用户提供的百度推送 API 接口
    const api = `http://data.zz.baidu.com/urls?site=https://www.qibiai.cn&token=ngfnpx2Y0aCbpqOb`;
    
    const res = await fetch(api, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: url,
    });
    
    const result = await res.json();
    const isSuccess = res.status === 200 && result.success;

    await prisma.pushLog.create({
      data: {
        storeId,
        platform: 'Baidu (百度/文心)',
        status: isSuccess ? 'SUCCESS' : 'FAILED',
        response: JSON.stringify(result),
      }
    });
  } catch (e: any) {
    await logFailure(storeId, 'Baidu (百度/文心)', e.message);
  }
}

/**
 * 2. 字节跳动 / 豆包生态推送 (依托头条搜索站长平台)
 */
async function pushToToutiao(url: string, storeId: number, baseUrl: string) {
  try {
    const domain = new URL(baseUrl).hostname;
    // 注意：头条的 API 格式与百度极度相似
    const api = `https://sitemap.toutiao.com/index.php/api/push?site=${domain}&token=${TOUTIAO_TOKEN}`;
    
    const res = await fetch(api, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: url,
    });
    
    const result = await res.json();
    const isSuccess = res.status === 200 && result.success;

    await prisma.pushLog.create({
      data: {
        storeId,
        platform: 'Toutiao (豆包/抖音)',
        status: isSuccess ? 'SUCCESS' : 'FAILED',
        response: JSON.stringify(result),
      }
    });
  } catch (e: any) {
    await logFailure(storeId, 'Toutiao (豆包/抖音)', e.message);
  }
}

/**
 * 3. IndexNow 协议推送 (覆盖必应 Copilot, Yandex, 360 等)
 */
async function pushToIndexNow(url: string, storeId: number, baseUrl: string) {
  try {
    // 使用用户提供的必应推送 key
    const indexNowKey = '15a9c73081574eac8c2ca0b40304759e';
    
    // 使用用户提供的接口地址
    const api = `https://www.bing.com/indexnow?url=${encodeURIComponent(url)}&key=${indexNowKey}`;

    const res = await fetch(api, {
      method: 'GET',
    });
    
    // IndexNow 返回 200 或 202 就算成功
    const isSuccess = res.status === 200 || res.status === 202;

    await prisma.pushLog.create({
      data: {
        storeId,
        platform: 'IndexNow (必应/360)',
        status: isSuccess ? 'SUCCESS' : 'FAILED',
        response: `HTTP ${res.status}`,
      }
    });
  } catch (e: any) {
    await logFailure(storeId, 'IndexNow (必应/360)', e.message);
  }
}

async function logFailure(storeId: number, platform: string, errorMsg: string) {
  try {
    await prisma.pushLog.create({
      data: {
        storeId,
        platform,
        status: 'FAILED',
        response: errorMsg,
      }
    });
  } catch (e) {
    console.error('Failed to write failure log', e);
  }
}
