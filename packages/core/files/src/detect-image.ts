export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export type ImageKind = { mime: 'image/jpeg' | 'image/png' | 'image/webp' };

export function detectImage(bytes: Uint8Array): ImageKind | null {
  if (bytes.length < 12) {
    return null;
  }
  if (bytes[0] === 0x3c) {
    return null;
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: 'image/jpeg' };
  }
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { mime: 'image/png' };
  }
  const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  const webp = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
  if (riff === 'RIFF' && webp === 'WEBP') {
    return { mime: 'image/webp' };
  }
  return null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function avatarObjectKey(userId: string): string | null {
  if (!UUID.test(userId)) {
    return null;
  }
  return `person/${userId}/avatar`;
}

export function avatarPublicPath(userId: string): string | null {
  if (!UUID.test(userId)) {
    return null;
  }
  return `/api/media/person/${userId}/avatar`;
}
