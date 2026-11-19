import { NextRequest } from 'next/server';
import { handleMediatedContactRequest } from '@/lib/server/contact-mediated';

export async function POST(req: NextRequest, ctx: { params: Promise<{ membershipId: string }> }) {
  const { membershipId } = await ctx.params;
  return handleMediatedContactRequest(req, membershipId);
}
