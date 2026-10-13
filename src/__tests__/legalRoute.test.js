import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { randomBytes, scryptSync } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import handler from '../../api/legal.js';

const saved = {
  hash: process.env.RIPPLE_LEGAL_SCRYPT,
  key: process.env.RIPPLE_LEGAL_SESSION_KEY,
  bundle: process.env.RIPPLE_LEGAL_ARCHIVE_BASE64
};
const password = 'unit-test-password-mock-unique-not-production';
function req(method='GET', others={}) {
  return { method, headers: { host:'ripplecircle.test', ...others.headers }, query:others.query||{}, body:others.body||{} };
}
function mockResponse() {
  const h={};
  return {
    statusCode:200, headers:h, payload:null,
    setHeader(k,v){h[k]=v;return this;},
    status(n){this.statusCode=n;return this;},
    json(v){this.payload=v;return this;},
    send(v){this.payload=v;return this;}
  };
}
beforeEach(()=>{
  const salt=randomBytes(16);
  process.env.RIPPLE_LEGAL_SCRYPT=salt.toString('hex')+':'+scryptSync(password,salt,32).toString('hex');
  process.env.RIPPLE_LEGAL_SESSION_KEY=randomBytes(32).toString('hex');
  // A small synthetic gzip is enough to verify the archive download is gated.
  process.env.RIPPLE_LEGAL_ARCHIVE_BASE64=gzipSync(Buffer.alloc(1500,0x61)).toString('base64');
});
afterEach(()=>{
  for(const [k,v] of Object.entries(saved)){
    const name={hash:'RIPPLE_LEGAL_SCRYPT',key:'RIPPLE_LEGAL_SESSION_KEY',bundle:'RIPPLE_LEGAL_ARCHIVE_BASE64'}[k];
    if(v===undefined) delete process.env[name]; else process.env[name]=v;
  }
});
async function loggedIn(){
  const res=mockResponse();
  await handler(req('POST',{body:{password},headers:{origin:'https://ripplecircle.test'}}),res);
  return res;
}
describe('Coffre juridique côté serveur',()=>{
  it('refuse la consultation et le téléchargement sans session',async()=>{
    const a=mockResponse(),b=mockResponse();
    await handler(req(),a);
    await handler(req('GET',{query:{file:'archive'}}),b);
    expect(a.statusCode).toBe(401);
    expect(b.statusCode).toBe(401);
    expect(a.headers['Cache-Control']).toContain('no-store');
  });
  it('refuse un mot de passe erroné et une origine externe',async()=>{
    const a=mockResponse(),b=mockResponse();
    await handler(req('POST',{body:{password:'wrong-password-with-length'}}),a);
    await handler(req('POST',{body:{password},headers:{origin:'https://not-allowed.test'}}),b);
    expect(a.statusCode).toBe(401);
    expect(b.statusCode).toBe(403);
  });
  it('accorde une session signée HttpOnly, Secure et SameSite Strict',async()=>{
    const r=await loggedIn();
    expect(r.statusCode).toBe(200);
    expect(r.headers['Set-Cookie']).toContain('HttpOnly');
    expect(r.headers['Set-Cookie']).toContain('Secure');
    expect(r.headers['Set-Cookie']).toContain('SameSite=Strict');
  });
  it('ne livre les données binaires qu’après connexion',async()=>{
    const auth=await loggedIn();
    const cookie=auth.headers['Set-Cookie'].split(';')[0];
    const ok=mockResponse();
    await handler(req('GET',{query:{file:'archive'},headers:{cookie}}),ok);
    expect(ok.statusCode).toBe(200);
    expect(Buffer.isBuffer(ok.payload)).toBe(true);
    expect(ok.headers['Content-Disposition']).toContain('.tar.gz');
  });
  it('refuse un cookie falsifié, une ressource inconnue, une archive désactivée',async()=>{
    const auth=await loggedIn();
    const cookie=auth.headers['Set-Cookie'].split(';')[0];
    const bad=mockResponse();
    await handler(req('GET',{headers:{cookie:cookie+'a'}}),bad);
    expect(bad.statusCode).toBe(401);
    const notFound=mockResponse();
    await handler(req('GET',{query:{file:'path/to/source'},headers:{cookie}}),notFound);
    expect(notFound.statusCode).toBe(404);
    delete process.env.RIPPLE_LEGAL_ARCHIVE_BASE64;
    const disabled=mockResponse();
    await handler(req('GET',{headers:{cookie}}),disabled);
    expect(disabled.statusCode).toBe(503);
  });
  it('déconnexion = suppression du cookie navigateur',async()=>{
    const res=mockResponse();
    await handler(req('DELETE'),res);
    expect(res.headers['Set-Cookie']).toContain('Max-Age=0');
  });
});
