'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmCard } from '@/components/confirm-card';

type AnalyzeResult = {
  name: string; calories: number; proteinG: number; carbsG: number; fatG: number;
  confidence: number; notes?: string;
};

export default function ScanPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<'idle' | 'analyzing' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState('');

  async function onFile(file: File) {
    setState('analyzing');
    setError('');
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: form });
      if (!res.ok) throw new Error('analyze failed');
      const json = (await res.json()) as AnalyzeResult;
      setResult(json);
      setState('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setState('error');
    }
  }

  if (state === 'done' && result) {
    return <ConfirmCard initial={result} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
      {state === 'idle' && (
        <>
          <Button onClick={() => fileRef.current?.click()} size="lg" className="h-20 w-20 rounded-full text-3xl">
            📷
          </Button>
          <p className="text-stone-600">Tap to take a photo</p>
        </>
      )}
      {state === 'analyzing' && (
        <div className="text-center space-y-2">
          <div className="animate-pulse text-4xl">🍳</div>
          <p className="text-stone-700">Analyzing your meal…</p>
        </div>
      )}
      {state === 'error' && (
        <div className="text-center space-y-2">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => setState('idle')}>Try again</Button>
        </div>
      )}
    </main>
  );
}
