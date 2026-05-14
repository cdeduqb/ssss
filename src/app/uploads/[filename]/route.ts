import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    
    // 防御性处理：防止目录穿越攻击 (Directory Traversal)
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '');
    
    const filePath = join(process.cwd(), 'public', 'uploads', sanitizedFilename);
    
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    
    // 简单的 MIME 类型判断，帮助浏览器正确渲染图片
    let contentType = 'application/octet-stream';
    const lowerName = sanitizedFilename.toLowerCase();
    if (lowerName.endsWith('.png')) contentType = 'image/png';
    else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (lowerName.endsWith('.gif')) contentType = 'image/gif';
    else if (lowerName.endsWith('.webp')) contentType = 'image/webp';
    else if (lowerName.endsWith('.svg')) contentType = 'image/svg+xml';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        // 缓存一年，提升后续加载速度
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving dynamic file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
