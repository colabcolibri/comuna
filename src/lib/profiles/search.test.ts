import { describe, it, expect } from 'vitest';
import { searchCommunityMembers, MemberSearchFilter } from './search';

describe('Community Member Search Module (US-0004)', () => {
  it('deve filtrar membros respeitando o isolamento do community_id e filtros de cidade e idioma', () => {
    const mockMembers = [
      { id: '1', community_id: 'comm_A', name: 'Ana', city: 'São Paulo', language: 'en' },
      { id: '2', community_id: 'comm_A', name: 'Carlos', city: 'Rio de Janeiro', language: 'es' },
      { id: '3', community_id: 'comm_B', name: 'Beatriz', city: 'São Paulo', language: 'en' }
    ];

    const filter: MemberSearchFilter = {
      community_id: 'comm_A',
      city: 'São Paulo',
      language: 'en'
    };

    const results = searchCommunityMembers(mockMembers, filter);
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Ana');
  });
});
