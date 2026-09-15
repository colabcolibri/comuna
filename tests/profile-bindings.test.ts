import { describe, expect, it } from 'vitest';
import { coreCatalog } from '@community/directory';
import { parseLanguages } from '@community/identity';
import { personBodyFromFields, readFieldValue } from '../apps/web/src/lib/profile-bindings';

describe('profile language binding', () => {
  const languages = coreCatalog()
    .flatMap((group) => group.fields)
    .find((field) => field.name === 'languages');

  it('round-trips code and proficiency', () => {
    if (!languages) {
      throw new Error('languages field missing');
    }
    const value = readFieldValue(languages, {
      profile: { languages: [{ code: 'it', proficiency: 'intermediate' }] },
      card: null,
    });
    expect(value).toEqual([{ code: 'it', proficiency: 'intermediate' }]);
    const body = personBodyFromFields([languages], { languages: value }, 'pt-BR');
    expect(parseLanguages(body.languages)).toEqual([{ code: 'it', proficiency: 'intermediate' }]);
  });
});
