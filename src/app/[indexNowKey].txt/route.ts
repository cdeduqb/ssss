import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, context: any) {
  const params = await context.params;
  const indexNowKey = params.indexNowKey || params.filename || params.id;
  
  // 从环境变量读取配置的 key
  const configuredKey = process.env.INDEXNOW_KEY || 'geo_magic_indexnow_key_2026';
  
  // 验证请求的 txt 文件名是否与环境变量中配置的 Key 匹配
  if (indexNowKey === configuredKey) {
    return new NextResponse(configuredKey, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }

  return new NextResponse('Not Found', { status: 404 });
}
