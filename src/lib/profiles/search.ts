export interface MemberSearchFilter {
  community_id: string;
  search?: string;
  city?: string;
  language?: string;
}

export function searchCommunityMembers(members: any[], filter: MemberSearchFilter) {
  return members.filter(member => {
    // Isolamento Multi-Tenant estrito
    if (member.community_id !== filter.community_id) return false;

    if (filter.city && !member.city.toLowerCase().includes(filter.city.toLowerCase())) {
      return false;
    }

    if (filter.language && member.language !== filter.language) {
      return false;
    }

    if (filter.search && !member.name.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }

    return true;
  });
}
