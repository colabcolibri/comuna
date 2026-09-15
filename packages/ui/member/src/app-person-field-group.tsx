export function AppPersonFieldGroup({
  label,
  values,
}: {
  label: string;
  values?: string[];
}) {
  const chips = values?.length ? values : [];
  return (
    <section className="min-w-0">
      {label ? <h3 className="text-sm font-medium text-foreground">{label}</h3> : null}
      {chips.length > 0 ? (
        <ul className={`flex flex-wrap gap-2 ${label ? 'mt-2' : ''}`}>
          {chips.map((item) => (
            <li
              key={item}
              className="inline-flex rounded-md border border-border bg-secondary px-2.5 py-1 text-sm text-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
