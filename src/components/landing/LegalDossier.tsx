import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, Eye, EyeOff, FileKey2, LockKeyhole, LogOut, ShieldCheck } from 'lucide-react';

const BACK = () => { window.location.hash = ''; };
const api = '/api/legal';

export const LegalDossier: React.FC = () => {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [access, setAccess] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  useEffect(() => {
    let cancelled = false;
    fetch(api, { cache: 'no-store', credentials: 'same-origin' })
      .then(res => { if (!cancelled) setAccess(res.ok); })
      .catch(() => { if (!cancelled) setError('Service indisponible'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending || password.length < 12) return;
    setSending(true); setError('');
    try {
      const result = await fetch(api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin', cache: 'no-store',
        body: JSON.stringify({ password })
      });
      if (!result.ok) {
        setError(result.status === 503 ? 'Accès non activé sur ce déploiement.' : 'Code d’accès incorrect ou expiré.');
      } else {
        setAccess(true); setPassword('');
      }
    } catch { setError('Connexion impossible. Réessayez.'); }
    finally { setSending(false); }
  };
  const getNote = async () => {
    setError('');
    try {
      const response = await fetch(api + '?file=note', { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) { if (response.status === 401) setAccess(false); throw Error(); }
      setNote(await response.text());
    } catch { setError('Lecture du document indisponible.'); }
  };
  const logout = async () => {
    try { await fetch(api, { method: 'DELETE', cache: 'no-store', credentials: 'same-origin' }); }
    finally { setAccess(false); setNote(''); setPassword(''); }
  };
  return (
    <main className="legal-page max-w-[920px] mx-auto px-5 sm:px-8 pt-8 pb-16" aria-labelledby="legal-title">
      <button type="button" onClick={BACK} className="flex items-center gap-2 text-[12px] font-semibold mb-10 opacity-70 hover:opacity-100">
        <ArrowLeft className="w-4 h-4" /> Retour au cadran
      </button>
      <div className="border-b pb-6" style={{ borderColor: 'var(--ripple-line,rgba(0,0,0,.12))' }}>
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] uppercase opacity-60">
          <LockKeyhole className="w-4 h-4" /> Espace réservé
        </div>
        <h1 id="legal-title" className="text-[clamp(28px,4.4vw,48px)] tracking-tight font-semibold mt-3 leading-tight">Dossier confidentiel</h1>
        <p className="mt-3 max-w-[630px] leading-relaxed text-[14px]" style={{ color: 'var(--ripple-muted,#515154)' }}>
          RIPPLECIRCLE · Noyau causal expérimental · Documentation technique destinée à l’examen par un conseil en propriété intellectuelle.
        </p>
      </div>
      {loading ? (
        <p className="mt-9 text-[14px] opacity-70" role="status">Vérification de l’accès…</p>
      ) : !access ? (
        <form onSubmit={login} className="legal-login mt-10 max-w-[420px] rounded-[16px] border p-6 sm:p-8" style={{ borderColor: 'var(--ripple-line,rgba(0,0,0,.12))' }}>
          <ShieldCheck className="w-8 h-8 mb-5" aria-hidden="true" />
          <h2 className="text-[19px] font-semibold">Accès par code privé</h2>
          <p className="mt-2 text-[13px] leading-relaxed opacity-70">Le code doit être transmis séparément du lien. Session limitée à huit heures.</p>
          <label htmlFor="legal-password" className="block text-[12px] font-semibold mt-6 mb-2">Code confidentiel</label>
          <div className="relative">
            <input
              id="legal-password" required minLength={12} maxLength={256}
              type={show ? 'text' : 'password'} autoComplete="off"
              value={password} onChange={e => setPassword(e.target.value)}
              className="account-field pr-12 w-full" placeholder="Saisir le code reçu"
            />
            <button type="button" onClick={() => setShow(v => !v)}
              aria-label={show ? 'Masquer le code' : 'Afficher le code'}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-70">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && <p role="alert" className="mt-3 text-[12px] text-[#C7342B]">{error}</p>}
          <button type="submit" disabled={sending || password.length < 12} className="mt-5 h-10 px-5 rounded-[9px] bg-[#1d1d1f] text-white font-semibold text-[13px] disabled:opacity-40">
            {sending ? 'Vérification…' : 'Accéder au dossier'}
          </button>
        </form>
      ) : (
        <section className="mt-9 space-y-7">
          <div className="flex justify-between items-center gap-3">
            <span className="flex gap-2 items-center text-[12px] font-semibold" style={{ color: '#1E7A39' }}>
              <ShieldCheck className="w-4 h-4" /> Accès temporaire autorisé
            </span>
            <button type="button" onClick={logout} className="flex gap-1.5 items-center text-[12px] opacity-75 hover:opacity-100">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <article className="rounded-[14px] border p-5 space-y-4" style={{ borderColor: 'var(--ripple-line,rgba(0,0,0,.12))' }}>
              <FileKey2 className="w-6 h-6" />
              <h2 className="font-semibold text-[17px]">Note technique confidentielle</h2>
              <p className="text-[13px] leading-relaxed opacity-75">Problème technique, hypothèses et limites du prototype, destinés à l’examen juridique.</p>
              <button type="button" onClick={getNote} className="text-[#0A84FF] text-[13px] font-semibold underline underline-offset-4">Consulter la note</button>
            </article>
            <article className="rounded-[14px] border p-5 space-y-4" style={{ borderColor: 'var(--ripple-line,rgba(0,0,0,.12))' }}>
              <Download className="w-6 h-6" />
              <h2 className="font-semibold text-[17px]">Paquet technique complet</h2>
              <p className="text-[13px] leading-relaxed opacity-75">Code expérimental, scénarios fictifs, tests et résultats reproductibles · archive TAR.GZ.</p>
              <a href={api + '?file=archive'} className="inline-flex gap-2 items-center text-[#0A84FF] text-[13px] font-semibold underline underline-offset-4">
                <Download className="w-4 h-4" /> Télécharger l’archive
              </a>
            </article>
          </div>
          {note && (
            <section aria-label="Note confidentielle" className="rounded-[14px] border p-5" style={{ borderColor: 'var(--ripple-line,rgba(0,0,0,.12))' }}>
              <h2 className="text-[14px] font-bold mb-4">Note technique · Version de travail</h2>
              <pre className="whitespace-pre-wrap break-words text-[12px] leading-relaxed font-sans">{note}</pre>
            </section>
          )}
          {error && <p role="alert" className="text-[#C7342B] text-[13px]">{error}</p>}
          <p className="text-[12px] opacity-65">Prototype et documentation de travail, sans conclusion de brevetabilité. Ne pas redistribuer sans autorisation. L’accès est révocable.</p>
        </section>
      )}
    </main>
  );
};
