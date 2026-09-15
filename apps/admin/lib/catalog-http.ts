import { NextResponse } from 'next/server';
import { CatalogWriteError } from '@community/directory/ops';
import { jsonError } from '@/lib/http';

export function catalogWriteResponse(err: unknown) {
  if (!(err instanceof CatalogWriteError)) {
    throw err;
  }
  if (err.message === 'DUPLICATE_FIELD' || err.message === 'DUPLICATE_GROUP') {
    return jsonError('VALIDATION_ERROR', 'Nome duplicado', 409);
  }
  if (err.message === 'LOCKED') {
    return jsonError('FORBIDDEN', 'Item do núcleo', 403);
  }
  if (err.message === 'NOT_FOUND') {
    return jsonError('NOT_FOUND', 'Inexistente', 404);
  }
  if (err.message === 'ACTIVE') {
    return jsonError('VALIDATION_ERROR', 'Desative antes de excluir', 409);
  }
  if (err.message === 'GROUP_NOT_EMPTY') {
    return jsonError('VALIDATION_ERROR', 'Grupo ainda tem campos', 409);
  }
  return jsonError('VALIDATION_ERROR', 'Catálogo inválido', 400);
}

export function catalogOk() {
  return NextResponse.json({ ok: true });
}
