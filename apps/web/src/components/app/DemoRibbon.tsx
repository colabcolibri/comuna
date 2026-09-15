export function DemoRibbon({ label }: { label: string }) {
  return (
    <p
      role="status"
      className="shrink-0 border-b border-border bg-muted px-4 py-2 text-center text-sm text-muted-foreground"
    >
      {label}
    </p>
  );
}
