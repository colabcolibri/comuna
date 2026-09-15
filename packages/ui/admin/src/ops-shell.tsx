import type { ReactNode } from 'react';

export function OpsShell({
  brand,
  communitiesLabel,
  signOutLabel,
  localeSlot,
  onSignOut,
  children,
}: {
  brand: string;
  communitiesLabel: string;
  signOutLabel: string;
  localeSlot?: ReactNode;
  onSignOut: () => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col md:flex-row bg-background text-foreground">
      <aside className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-border p-4 flex flex-col gap-4">
        <p className="text-sm font-semibold tracking-tight">{brand}</p>
        <nav className="flex flex-row md:flex-col gap-2 flex-wrap">
          <a
            href="/communities"
            className="min-h-11 inline-flex items-center px-3 rounded-md text-sm bg-secondary text-secondary-foreground"
          >
            {communitiesLabel}
          </a>
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          {localeSlot}
          <button
            type="button"
            className="min-h-11 text-left text-sm px-3 rounded-md border border-border"
            onClick={onSignOut}
          >
            {signOutLabel}
          </button>
        </div>
      </aside>
      <div className="flex-1 min-w-0 p-4 md:p-6 overflow-x-hidden">{children}</div>
    </div>
  );
}
