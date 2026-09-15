import type { ReactNode } from 'react';

export function AppAuthFrame({ kicker, children }: { kicker?: string; children: ReactNode }) {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-md min-w-0">
        {kicker ? <p className="text-sm font-medium text-primary tracking-wide mb-6">{kicker}</p> : null}
        {children}
      </div>
    </main>
  );
}
