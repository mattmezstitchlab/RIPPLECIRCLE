import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto';
import { gunzipSync } from 'node:zlib';

const COOKIE = '__Host-ripple_legal';
const MAX_SESSION_AGE = 8 * 60 * 60;
const ARCHIVE_NAME = 'RIPPLECIRCLE-CAUSAL-KERNEL-CONFIDENTIEL.tar.gz';

function configured() {
  return Boolean(
    process.env.RIPPLE_LEGAL_SCRYPT &&
    process.env.RIPPLE_LEGAL_SESSION_KEY &&
    process.env.RIPPLE_LEGAL_ARCHIVE_BASE64
  );
}
function equal(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
function validPassword(password) {
  const [salt, hex] = (process.env.RIPPLE_LEGAL_SCRYPT ?? '').split(':');
  if (!salt || !/^[a-f0-9]{64}$/.test(hex || '')) return false;
  const actual = scryptSync(password, Buffer.from(salt, 'hex'), 32);
  return equal(actual, Buffer.from(hex, 'hex'));
}
function sign(expires) {
  return createHmac('sha256', process.env.RIPPLE_LEGAL_SESSION_KEY)
    .update('ripple-legal-session-v1:' + expires)
    .digest('hex');
}
function loggedIn(cookie = '') {
  const escaped = COOKIE.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const token = cookie.match(new RegExp('(?:^|;\\s*)' + escaped + '=([^;]+)'))?.[1];
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2 || !/^\d{10}$/.test(parts[0]) || !/^[a-f0-9]{64}$/.test(parts[1])) return false;
  const expiration = Number(parts[0]);
  const now = Math.floor(Date.now() / 1000);
  return expiration > now && expiration <= now + MAX_SESSION_AGE && equal(parts[1], sign(parts[0]));
}
function responseHeaders(res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Vary', 'Cookie');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; sandbox");
}
function readNoteFromTarGz(data) {
  const tar = gunzipSync(data);
  let cursor = 0;
  while (cursor + 512 <= tar.length) {
    const header = tar.subarray(cursor, cursor + 512);
    const file = header.subarray(0, 100).toString('utf8').split('\0')[0];
    if (!file) break;
    const sizeString = header.subarray(124, 136).toString('ascii').replace(/\0/g, '').trim();
    const size = Number.parseInt(sizeString || '0', 8);
    if (!Number.isSafeInteger(size) || size < 0 || size > 300_000 || cursor + 512 + size > tar.length) throw new Error('Archive invalide');
    cursor += 512;
    if (file.endsWith('/docs/NOTE_TECHNIQUE_CONFIDENTIELLE.md')) return tar.subarray(cursor, cursor + size).toString('utf8');
    cursor += Math.ceil(size / 512) * 512;
  }
  throw new Error('Note non trouvée');
}
const error = (res, code, message) => res.status(code).json({ error: message });

export default async function handler(req, res) {
  responseHeaders(res);
  res.setHeader('Allow', 'GET, HEAD, POST, DELETE');
  if (!configured()) return error(res, 503, 'Espace confidentiel non activé');
  if (req.method === 'POST') {
    const origin = req.headers.origin;
    if (origin && (!req.headers.host || new URL(origin).host !== req.headers.host)) {
      return error(res, 403, 'Origine refusée');
    }
    const password = req.body?.password;
    if (typeof password !== 'string' || password.length < 12 || password.length > 256) {
      return error(res, 401, 'Accès refusé');
    }
    // Identifiant suffisamment long et aléatoire : résiste aux essais hors ligne.
    if (!validPassword(password)) return error(res, 401, 'Accès refusé');
    const expiry = String(Math.floor(Date.now() / 1000) + MAX_SESSION_AGE);
    res.setHeader('Set-Cookie', COOKIE + '=' + expiry + '.' + sign(expiry) +
      '; Max-Age=' + MAX_SESSION_AGE + '; Path=/; HttpOnly; Secure; SameSite=Strict');
    return res.status(200).json({ authenticated: true });
  }
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', COOKIE + '=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict');
    return res.status(200).json({ authenticated: false });
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return error(res, 405, 'Méthode refusée');
  if (!loggedIn(req.headers.cookie)) return error(res, 401, 'Authentification nécessaire');
  const action = req.query?.file;
  if (!action) return res.status(200).json({ authenticated: true, archive: ARCHIVE_NAME });
  if (action !== 'archive' && action !== 'note') return error(res, 404, 'Document non trouvé');
  try {
    const archive = Buffer.from(process.env.RIPPLE_LEGAL_ARCHIVE_BASE64, 'base64');
    if (archive.length < 1024 || archive.length > 120_000 || archive[0] !== 0x1f || archive[1] !== 0x8b) {
      return error(res, 503, 'Archive indisponible');
    }
    if (action === 'note') {
      const note = readNoteFromTarGz(archive);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(200).send(req.method === 'HEAD' ? undefined : note);
    }
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', 'attachment; filename="' + ARCHIVE_NAME + '"');
    res.setHeader('Content-Length', archive.length);
    return res.status(200).send(req.method === 'HEAD' ? undefined : archive);
  } catch {
    return error(res, 503, 'Archive indisponible');
  }
}
