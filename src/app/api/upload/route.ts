import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ message: '未找到文件' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = file.name || 'upload.jpg';
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    try { await mkdir(uploadDir, { recursive: true }); } catch (e) {}

    const filePath = join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${uniqueName}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ message: '文件上传失败' }, { status: 500 });
  }
}
