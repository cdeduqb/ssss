import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const settingsFile = path.join(dataDir, 'settings.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export async function GET() {
  try {
    if (!fs.existsSync(settingsFile)) {
      return NextResponse.json({});
    }
    const data = fs.readFileSync(settingsFile, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Merge with existing if any
    let currentSettings = {};
    if (fs.existsSync(settingsFile)) {
      currentSettings = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
    }
    
    const newSettings = { ...currentSettings, ...data };
    fs.writeFileSync(settingsFile, JSON.stringify(newSettings, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
