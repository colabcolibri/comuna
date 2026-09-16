export const READ_ONLY_ERROR_CODE = 'READ_ONLY';

export function isReadOnlyErrorPayload(data: unknown): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }
  const error = (data as { error?: { code?: string } }).error;
  return error?.code === READ_ONLY_ERROR_CODE;
}
