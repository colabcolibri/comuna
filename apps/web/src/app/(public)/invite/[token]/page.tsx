import { query } from '@community/db';
import { InviteAcceptClient } from './InviteAcceptClient';

type InviteLookup = {
  community_name: string;
  email: string;
  expires_at: string;
  accepted_at: string | null;
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const found = await query<InviteLookup>(
    `SELECT c.name AS community_name, i.email, i.expires_at, i.accepted_at
     FROM network_core.invitations i
     JOIN network_core.communities c ON c.id = i.community_id
     WHERE i.token = $1`,
    [token]
  );

  const row = found.rows[0];
  let state: 'valid' | 'used' | 'expired' | 'invalid' = 'valid';
  if (!row) {
    state = 'invalid';
  } else if (row.accepted_at) {
    state = 'used';
  } else if (new Date(row.expires_at).getTime() < Date.now()) {
    state = 'expired';
  }

  return (
    <InviteAcceptClient
      token={token}
      communityName={row?.community_name || 'Comunidade'}
      email={row?.email || ''}
      state={state}
    />
  );
}
