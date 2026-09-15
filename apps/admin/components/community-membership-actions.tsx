'use client';

import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@community/ui';

type Cohort = { id: string; name: string };

export function CommunityMembershipActions({
  row,
  saving,
  cohorts,
  copy,
  onRole,
  onStatus,
  onCohort,
  onRemove,
}: {
  row: { id: string; network_role: string; network_status: string; cohort_id?: string | null };
  saving: boolean;
  cohorts: Cohort[];
  copy: {
    makeMember: string;
    promote: string;
    approve: string;
    suspend: string;
    reactivate: string;
    remove: string;
    cohortNone: string;
  };
  onRole: (role: 'member' | 'coordinator') => void;
  onStatus: (status: 'pending_approval' | 'active' | 'suspended') => void;
  onCohort: (cohortId: string | null) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {row.network_role === 'coordinator' ? (
          <Button type="button" size="sm" variant="outline" disabled={saving} onClick={() => onRole('member')}>
            {copy.makeMember}
          </Button>
        ) : (
          <Button type="button" size="sm" disabled={saving} onClick={() => onRole('coordinator')}>
            {copy.promote}
          </Button>
        )}
        {row.network_status === 'pending_approval' ? (
          <Button type="button" size="sm" disabled={saving} onClick={() => onStatus('active')}>
            {copy.approve}
          </Button>
        ) : null}
        {row.network_status === 'active' ? (
          <Button type="button" size="sm" variant="outline" disabled={saving} onClick={() => onStatus('suspended')}>
            {copy.suspend}
          </Button>
        ) : null}
        {row.network_status === 'suspended' ? (
          <Button type="button" size="sm" disabled={saving} onClick={() => onStatus('active')}>
            {copy.reactivate}
          </Button>
        ) : null}
        <Button type="button" size="sm" variant="outline" disabled={saving} onClick={onRemove}>
          {copy.remove}
        </Button>
      </div>
      <Select
        value={row.cohort_id || 'none'}
        onValueChange={(value) => onCohort(value === 'none' ? null : value)}
        disabled={saving}
      >
        <SelectTrigger className="h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">{copy.cohortNone}</SelectItem>
          {cohorts.map((cohort) => (
            <SelectItem key={cohort.id} value={cohort.id}>
              {cohort.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
