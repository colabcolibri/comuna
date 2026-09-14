'use client';

import OtpCard from '@/components/app/OtpCard';
import { pickContent } from '@community/identity';
import { useLocale } from '@/components/app/LocaleProvider';

const CONTENT = {
  'pt-BR': { hint: 'O código chega no Mailpit em localhost:8026.' },
  en: { hint: 'The code lands in Mailpit at localhost:8026.' },
} as const;

export default function HomePage() {
  const copy = pickContent(CONTENT, useLocale());
  return (
    <main className="flex flex-1 items-center justify-center p-4 py-10 sm:p-6 md:py-16">
      <div className="w-full min-w-0 max-w-md">
        <OtpCard />
        <p className="mt-6 text-center text-xs text-muted-foreground">{copy.hint}</p>
      </div>
    </main>
  );
}
