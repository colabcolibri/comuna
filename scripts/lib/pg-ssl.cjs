'use strict';

function pgSsl(connectionString) {
  if (process.env.PGSSL === '0') {
    return undefined;
  }
  const url = String(connectionString || '');
  const wantsSsl =
    process.env.PGSSL === '1' ||
    Boolean(process.env.RAILWAY_ENVIRONMENT) ||
    /sslmode=(require|verify-ca|verify-full)/i.test(url);
  if (!wantsSsl) {
    return undefined;
  }
  return { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED === '1' };
}

module.exports = { pgSsl };
