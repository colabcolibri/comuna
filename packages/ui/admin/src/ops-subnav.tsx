import { cn } from '@community/ui';
import { DefaultOpsLink, type OpsLinkComponent } from './ops-link';

export function OpsSubnav({
  items,
  linkComponent: Link = DefaultOpsLink,
}: {
  items: { href: string; label: string; active?: boolean }[];
  linkComponent?: OpsLinkComponent;
}) {
  return (
    <nav className="mb-8 flex flex-wrap items-center gap-1 border-b border-border">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'inline-flex min-h-9 items-center px-3 text-sm',
            item.active ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <span className="relative">
            {item.label}
            {item.active ? <span aria-hidden className="absolute inset-x-0 top-full mt-0.5 h-0.5 bg-mark" /> : null}
          </span>
        </Link>
      ))}
    </nav>
  );
}
