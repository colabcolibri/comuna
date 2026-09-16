export function DemoRibbon({
  label,
  href,
  linkLabel,
}: {
  label: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div
      role="status"
      className="sticky top-0 z-50 shrink-0 border-b border-border bg-muted px-4 py-2 text-center text-sm text-muted-foreground"
    >
      <p className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:flex-wrap sm:gap-x-3">
        <span>{label}</span>
        {href && linkLabel ? (
          <a
            href={href}
            className="font-medium text-foreground underline underline-offset-4 hover:text-foreground"
          >
            {linkLabel}
          </a>
        ) : null}
      </p>
    </div>
  );
}
