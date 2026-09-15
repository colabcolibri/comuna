export async function sendPersonContact(
  membershipId: string,
  body: { sender_email: string; sender_name?: string; sender_phone?: string; message: string }
) {
  const res = await fetch(`/api/profiles/${membershipId}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { error?: { message?: string } };
  return { ok: res.ok, message: data.error?.message };
}
