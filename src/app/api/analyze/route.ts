import { NextRequest, NextResponse } from 'next/server';
import { analyzeMeal } from '@/lib/claude';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('image');
  if (!(file instanceof File)) return NextResponse.json({ error: 'no image' }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  const base64 = buf.toString('base64');
  const mediaType = file.type === 'image/png' ? 'image/png'
    : file.type === 'image/webp' ? 'image/webp'
    : 'image/jpeg';

  try {
    const result = await analyzeMeal(base64, mediaType);
    return NextResponse.json(result);
  } catch (err) {
    console.error('analyze failed', err);
    return NextResponse.json({ error: 'analysis failed' }, { status: 500 });
  }
}
