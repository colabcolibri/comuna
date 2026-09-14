import { describe, it, expect } from 'vitest';
import { updatePersonAndMembershipProfile, PersonProfileInput, NetworkMembershipInput } from './update';

describe('Profile Management Module (US-0003)', () => {
  it('deve atualizar dados do perfil de pessoa e da comunidade com validacao de idiomas e localizacao', () => {
    const personInput: PersonProfileInput = {
      full_name: 'Ana Silva',
      gender: 'female',
      birth_city: 'Belo Horizonte, MG',
      birth_country: 'Brasil',
      current_city: 'São Paulo, SP',
      current_country: 'Brasil',
      languages: [
        { code: 'pt', name: 'Português', proficiency: 'native' },
        { code: 'en', name: 'Inglês', proficiency: 'fluent' }
      ]
    };

    const networkInput: NetworkMembershipInput = {
      community_id: 'comm_123',
      headline: 'Engenheira de Software Senior',
      bio: 'Especialista em TypeScript e sistemas distribuídos',
      availability_status: 'available_for_hire',
      is_public_showcase: true,
      work_modes: ['remote', 'hybrid']
    };

    const result = updatePersonAndMembershipProfile('user_123', personInput, networkInput);
    expect(result.success).toBe(true);
    expect(result.profile.full_name).toBe('Ana Silva');
    expect(result.membership.availability_status).toBe('available_for_hire');
    expect(result.membership.custom_attributes.work_modes).toContain('remote');
  });
});
