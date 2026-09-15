import { missingRequiredFields, nestCatalog, parseAttrFilters, parseField, validateCustomAttributes, visibleCatalog } from './catalog';
import { parseListField } from './list-fields';

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
    });
    const result = validateCustomAttributes([field!], { extra: true });
    expect(result.ok).toBe(false);
  });

  it('rejects checkbox values outside the option list', () => {
    const field = parseField({
      name: 'editions',
      type: 'checkbox',
      storage: 'attributes',
      options: [
        { value: '2014', label: [{ locale: 'pt-BR', value: '2014' }] },
        { value: '2022', label: [{ locale: 'pt-BR', value: '2022' }] },
      ],
    });
    expect(validateCustomAttributes([field!], { editions: ['2014', '1999'] }).ok).toBe(false);
    expect(validateCustomAttributes([field!], { editions: ['2014', '2022'] })).toEqual({
      ok: true,
      value: { editions: ['2014', '2022'] },
    });
  });

  it('rejects select values outside the option list', () => {
    const field = parseField({
      name: 'track',
      type: 'select',
      storage: 'attributes',
      options: [{ value: 'a', label: [{ locale: 'pt-BR', value: 'A' }] }],
    });
    expect(validateCustomAttributes([field!], { track: 'b' }).ok).toBe(false);
  });

  it('accepts boolean attributes', () => {
    const field = parseField({
      name: 'host_at_home',
      type: 'boolean',
      storage: 'attributes',
    });
    const result = validateCustomAttributes([field!], { host_at_home: true });
    expect(result).toEqual({ ok: true, value: { host_at_home: true } });
  });

  it('builds jsonb filters only for filterable names', () => {
    const field = parseListField({
      name: 'host_at_home',
      type: 'boolean',
      storage: 'attributes',
      filterable: true,
      placement: 'detail',
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

  it('hides disabled groups and fields from the member catalog', () => {
    const groups = nestCatalog([
      {
        group_slug: 'person',
        group_label: [{ locale: 'pt-BR', value: 'Sobre você' }],
        group_enabled: true,
        name: 'full_name',
        type: 'text',
        storage: 'person',
        enabled: false,
      },
      {
        group_slug: 'person',
        group_label: [{ locale: 'pt-BR', value: 'Sobre você' }],
        group_enabled: true,
        name: 'gender',
        type: 'select',
        storage: 'person',
        enabled: true,
      },
    ]);
    expect(visibleCatalog(groups, []).flatMap((group) => group.fields.map((field) => field.name))).toEqual(['gender']);
  });

  it('treats required empty text as missing and boolean as filled', () => {
    const name = parseField({
      name: 'full_name',
      type: 'text',
      storage: 'person',
      required: true,
    });
    const flag = parseField({
      name: 'host_at_home',
      type: 'boolean',
      storage: 'attributes',
      required: true,
    });
    expect(missingRequiredFields([name!, flag!], { full_name: '  ', host_at_home: false })).toEqual([name]);
  });
});
