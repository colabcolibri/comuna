import type { ReactNode } from 'react';

export function AppPublicChrome({
  wordmark,
  action,
  tools,
  children,
}: {
  wordmark: ReactNode;
  action: ReactNode;
  tools: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          <div className="min-w-0">{wordmark}</div>
          <div className="ml-auto flex items-center gap-2">
            {tools}
            {action}
          </div>
        </div>
      </header>
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
