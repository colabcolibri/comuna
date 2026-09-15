import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@community/db', () => ({
  query: vi.fn(),
}));

import { query } from '@community/db';
import { createNetworkPerson, DuplicateEmailError, ensureUserByEmail, findUserByEmail, InvalidEmailError, isSuperAdmin } from './users';

const mockedQuery = vi.mocked(query);

describe('ops user lookup', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it('treats only global_role super_admin as ops', () => {
    expect(isSuperAdmin('super_admin')).toBe(true);
    expect(isSuperAdmin('user')).toBe(false);
    expect(isSuperAdmin('coordinator')).toBe(false);
  });

  it('looks up by lowercased email and does not invent a user', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 'u1', email: 'admin@example.com', global_role: 'super_admin' }],
    } as never);
    const user = await findUserByEmail('  Admin@Example.com ');
    expect(user?.global_role).toBe('super_admin');
    expect(mockedQuery.mock.calls[0]?.[1]).toEqual(['admin@example.com']);
  });

  it('returns null when the email is not in auth_core.users', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] } as never);
    await expect(findUserByEmail('nobody@example.com')).resolves.toBeNull();
  });

  it('rejects a string that is not an email before writing', async () => {
    await expect(ensureUserByEmail('nao-e-email')).rejects.toBeInstanceOf(InvalidEmailError);
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it('creates a user when the email is new', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] } as never);
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 'u2', email: 'm@example.com', global_role: 'user' }],
    } as never);
    await expect(ensureUserByEmail('m@example.com')).resolves.toMatchObject({ id: 'u2', global_role: 'user' });
  });

  it('refuses a second person with the same email', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 'u1', email: 'm@example.com', global_role: 'user' }],
    } as never);
    await expect(createNetworkPerson('m@example.com', 'Ada')).rejects.toBeInstanceOf(DuplicateEmailError);
  });
});
