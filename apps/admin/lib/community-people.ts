export type CommunityPersonHit = {
  id: string;
  email: string;
  full_name: string;
};

export async function listPeopleOutsideCommunity(communityId: string, q: string): Promise<CommunityPersonHit[]> {
  const res = await fetch(`/api/admin/communities/${communityId}/people?q=${encodeURIComponent(q)}`);
  if (!res.ok) {
    throw new Error(`people search failed: ${res.status}`);
  }
  const json = (await res.json()) as { data?: CommunityPersonHit[] };
  return json.data ?? [];
}
