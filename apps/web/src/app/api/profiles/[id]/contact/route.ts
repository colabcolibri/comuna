import { NextRequest } from 'next/server';
import { handleMediatedContactRequest } from '@/lib/server/contact-mediated';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return handleMediatedContactRequest(req, id);
}
