import { query, queryAsOps } from '@community/db';
import { MembershipNotFoundError } from './memberships';

export type CohortRow = {
  id: string;
  name: string;
  code: string | null;
};

export class CohortNotFoundError extends Error {
  constructor() {
    super('COHORT_NOT_FOUND');
    this.name = 'CohortNotFoundError';
  }
}

export class InvalidCohortError extends Error {
  constructor() {
    super('INVALID_COHORT');
    this.name = 'InvalidCohortError';
  }
}

export async function listCohorts(communityId: string): Promise<CohortRow[]> {
  const result = await query<CohortRow>(
    `SELECT id, name, code
     FROM network_core.cohorts
     WHERE community_id = $1
     ORDER BY name`,
    [communityId]
  );
  return result.rows;
}

export async function createCohort(communityId: string, name: string, code?: string): Promise<CohortRow> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new InvalidCohortError();
  }
  const inserted = await queryAsOps<CohortRow>(
    `INSERT INTO network_core.cohorts (community_id, name, code)
     VALUES ($1, $2, $3)
     RETURNING id, name, code`,
    [communityId, trimmed, code?.trim() || null]
  );
  const row = inserted.rows[0];
  if (!row) {
    throw new Error('COHORT_INSERT_FAILED');
  }
  return row;
}

export async function deleteCohort(communityId: string, cohortId: string): Promise<void> {
  await queryAsOps(`UPDATE network_core.memberships SET cohort_id = NULL WHERE cohort_id = $1`, [cohortId]);
  const deleted = await queryAsOps(
    `DELETE FROM network_core.cohorts WHERE id = $1 AND community_id = $2 RETURNING id`,
    [cohortId, communityId]
  );
  if (!deleted.rows[0]) {
    throw new CohortNotFoundError();
  }
}

export async function setMembershipCohort(membershipId: string, cohortId: string | null): Promise<void> {
  if (!cohortId) {
    const updated = await queryAsOps(
      `UPDATE network_core.memberships SET cohort_id = NULL WHERE id = $1 RETURNING id`,
      [membershipId]
    );
    if (!updated.rows[0]) {
      throw new MembershipNotFoundError();
    }
    return;
  }
  const updated = await queryAsOps(
    `UPDATE network_core.memberships AS m
     SET cohort_id = $2
     FROM network_core.cohorts c
     WHERE m.id = $1 AND c.id = $2 AND c.community_id = m.community_id
     RETURNING m.id`,
    [membershipId, cohortId]
  );
  if (!updated.rows[0]) {
    throw new InvalidCohortError();
  }
}
