import { nestCatalog, parseAttrFilters, parseField, validateCustomAttributes, visibleCatalog } from './catalog';

describe('directory catalog', () => {
  it('rejects unknown field types', () => {
    expect(parseField({ name: 'x', type: 'php', storage: 'attributes' })).toBeNull();
    expect(parseField({ name: 'avatar_url', type: 'image', storage: 'person', column_key: 'avatar_url' })?.type).toBe(
      'image'
    );
  });

  it('nests groups and keeps unique names', () => {
    const groups = nestCatalog([
      {
        group_slug: 'availability',
        group_label: [{ locale: 'pt-BR', value: 'Disponibilidade' }],
        group_description: [],
        columns: 1,
        name: 'host_at_home',
        type: 'boolean',
        storage: 'attributes',
        filterable: true,
        label: [{ locale: 'pt-BR', value: 'Recebe em casa' }],
      },
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].fields[0].name).toBe('host_at_home');
  });

  it('rejects undeclared custom_attributes keys', () => {
    const field = parseField({
      name: 'host_at_home',
      type: 'boolean',
      storage: 'attributes',
      filterable: true,
    });
    const result = validateCustomAttributes([field!], { extra: true });
    expect(result.ok).toBe(false);
  });

  it('accepts boolean attributes', () => {
    const field = parseField({
      name: 'host_at_home',
      type: 'boolean',
      storage: 'attributes',
      filterable: true,
    });
    const result = validateCustomAttributes([field!], { host_at_home: true });
    expect(result).toEqual({ ok: true, value: { host_at_home: true } });
  });

  it('builds jsonb filters only for filterable names', () => {
    const field = parseField({
      name: 'host_at_home',
      type: 'boolean',
      storage: 'attributes',
      filterable: true,
    });
    const ok = parseAttrFilters(new URLSearchParams('attr.host_at_home=true'), [field!]);
    expect(ok).toEqual({ ok: true, filters: [{ host_at_home: true }] });
    const bad = parseAttrFilters(new URLSearchParams('attr.unknown=1'), [field!]);
    expect(bad.ok).toBe(false);
  });

  it('hides directory and showcase fields when those plugins are off', () => {
    const groups = nestCatalog([
      {
        group_slug: 'person',
        group_label: [{ locale: 'pt-BR', value: 'Pessoa' }],
        name: 'full_name',
        type: 'text',
        storage: 'person',
        column_key: 'full_name',
      },
      {
        group_slug: 'availability',
        group_label: [{ locale: 'pt-BR', value: 'Disp' }],
        name: 'public_showcase',
        type: 'boolean',
        storage: 'card_column',
        column_key: 'public_showcase',
        module_slug: 'showcase',
      },
      {
        group_slug: 'hospitality',
        group_label: [{ locale: 'pt-BR', value: 'Hosp' }],
        name: 'host_at_home',
        type: 'boolean',
        storage: 'attributes',
        module_slug: 'directory',
      },
    ]);
    const onlyCore = visibleCatalog(groups, []);
    expect(onlyCore.map((g) => g.slug)).toEqual(['person']);
    const noShowcase = visibleCatalog(groups, ['directory']);
    expect(noShowcase.flatMap((g) => g.fields.map((f) => f.name))).toEqual(['full_name', 'host_at_home']);
  });
});
