export interface PersonProfileInput {
  full_name: string;
  gender: string;
  birth_city?: string;
  birth_country?: string;
  current_city: string;
  current_country: string;
  languages: Array<{
    code: string;
    name: string;
    proficiency: 'basic' | 'intermediate' | 'fluent' | 'native';
  }>;
}

export interface NetworkMembershipInput {
  community_id: string;
  headline: string;
  bio?: string;
  availability_status: 'available_for_hire' | 'project_partner' | 'mentor' | 'unavailable';
  is_public_showcase: boolean;
  work_modes: Array<'remote' | 'hybrid' | 'on_site'>;
}

export function updatePersonAndMembershipProfile(
  userId: string,
  person: PersonProfileInput,
  network: NetworkMembershipInput
) {
  // Simulação da atualização relacional + JSONB no banco de dados
  return {
    success: true,
    profile: {
      userId,
      ...person,
      updated_at: new Date().toISOString()
    },
    membership: {
      userId,
      community_id: network.community_id,
      headline: network.headline,
      bio: network.bio || '',
      availability_status: network.availability_status,
      is_public_showcase: network.is_public_showcase,
      custom_attributes: {
        work_modes: network.work_modes
      }
    }
  };
}
