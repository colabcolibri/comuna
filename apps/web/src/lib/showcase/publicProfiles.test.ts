import { describe, it, expect } from 'vitest';
import { filterPublicShowcaseProfiles, toPublicShowcaseProfile } from './publicProfiles';

describe('Public Showcase Module (US-0005)', () => {
  it('deve retornar apenas membros com is_public_showcase true e omitir dados privados como e-mail e whatsapp', () => {
    const mockMembers = [
      { id: '1', name: 'Lucas', is_public_showcase: true, email: 'lucas@org.com', whatsapp: '+5511999' },
      { id: '2', name: 'Mariana', is_public_showcase: false, email: 'mariana@org.com', whatsapp: '+5511888' },
    ];

    const results = filterPublicShowcaseProfiles(mockMembers);
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Lucas');
    expect(results[0].email).toBeUndefined();
    expect(results[0].whatsapp).toBeUndefined();
  });

  it('keeps https professional links and drops email-like contact keys', () => {
    const profile = toPublicShowcaseProfile(
      {
        id: 'm1',
        full_name: 'Marina Silva',
        avatar_url: '/api/media/person/u1/avatar',
        current_city: { label: { 'pt-BR': 'São Paulo' } },
        languages: [{ code: 'pt' }],
        contacts: {
          linkedin: 'https://linkedin.com/in/x',
          email: 'hidden@example.com',
          github: 'github.com/nope',
        },
        headline: [{ locale: 'pt-BR', value: 'Produto' }],
        bio: [{ locale: 'pt-BR', value: 'Bio' }],
        availability_status: 'mentor',
        custom_attributes: { host_at_home: true, secret: 'no' },
      },
      ['host_at_home']
    );
    expect(profile.contacts).toEqual({ linkedin: 'https://linkedin.com/in/x' });
    expect(profile.custom_attributes).toEqual({ host_at_home: true });
    expect(profile).not.toHaveProperty('email');
  });
});
