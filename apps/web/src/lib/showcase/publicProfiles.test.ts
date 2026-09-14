import { describe, it, expect } from 'vitest';
import { filterPublicShowcaseProfiles } from './publicProfiles';

describe('Public Showcase Module (US-0005)', () => {
  it('deve retornar apenas membros com is_public_showcase true e omitir dados privados como e-mail e whatsapp', () => {
    const mockMembers = [
      { id: '1', name: 'Lucas', is_public_showcase: true, email: 'lucas@org.com', whatsapp: '+5511999' },
      { id: '2', name: 'Mariana', is_public_showcase: false, email: 'mariana@org.com', whatsapp: '+5511888' }
    ];

    const results = filterPublicShowcaseProfiles(mockMembers);
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Lucas');
    expect(results[0].email).toBeUndefined();
    expect(results[0].whatsapp).toBeUndefined();
  });
});
