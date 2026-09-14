'use client';

import OtpCard from '@/components/app/OtpCard';
import { pickContent } from '@community/identity';

const CONTENT = {
  'pt-BR': { hint: 'O código chega no Mailpit em localhost:8026.' },
  en: { hint: 'The code lands in Mailpit at localhost:8026.' },
} as const;

export default function HomePage() {
  const copy = pickContent(CONTENT, 'pt-BR');
  return (
    <main className="flex-1 flex items-center justify-center p-6 py-12 md:py-16">
      <div className="w-full max-w-[440px]">
        <OtpCard />
        <p className="mt-6 text-center text-xs text-muted">{copy.hint}</p>
      </div>
    </main>
  );
}
