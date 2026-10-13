import React, { useRef, useState } from 'react';
import { CalendarCheck, Database, Download, Plus, RotateCcw, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { AccountState, JourneyKind, MealChoice, freshDemoAccount } from '../../data/account';
import { INTERESTS, SECTOR_LABEL, Sector } from '../../data/networking';
import { sfx } from '../../utils/audio';

const INK = 'var(--ripple-ink, #1d1d1f)';
const MUTED = 'var(--ripple-muted, #6e6e73)';
const BODY = 'var(--ripple-body, #424245)';
const JOURNEY_KIND: { id: JourneyKind; label: string }[] = [
  { id: 'naissance', label: 'Naissance' },
  { id: 'etudes', label: 'Études' },
  { id: 'diplome', label: 'Diplôme' },
  { id: 'travail', label: 'Travail' },
  { id: 'personnel', label: 'Personnel' },
  { id: 'autre', label: 'Autre' }
];

interface AccountPageProps {
  account: AccountState;
  onChange: (next: AccountState) => void;
  onToast: (message: string) => void;
  onBackToRipple: () => void;
}

type AccountTab = 'profile' | 'rsvp' | 'journey' | 'data';

export const AccountPage: React.FC<AccountPageProps> = ({ account, onChange, onToast, onBackToRipple }) => {
  const [tab, setTab] = useState<AccountTab>('profile');
  const [form, setForm] = useState({ date: '', title: '', detail: '', kind: 'personnel' as JourneyKind });
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const exportAccount = () => {
    const content = JSON.stringify({
      product: 'RIPPLECIRCLE',
      kind: 'local-account-export',
      exportedAt: new Date().toISOString(),
      account
    }, null, 2);
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'ripplecircle-mes-donnees.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    onToast('Export téléchargé sur cet appareil.');
  };

  const update = <K extends keyof AccountState>(key: K, value: AccountState[K]) => onChange({ ...account, [key]: value });
  const tabs: { id: AccountTab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profil', icon: UserRound },
    { id: 'rsvp', label: 'RSVP', icon: CalendarCheck },
    { id: 'journey', label: 'Parcours', icon: Plus },
    { id: 'data', label: 'Mes données', icon: Database }
  ];

  const sectionTitle = tab === 'profile' ? 'Profil & centres d’intérêt'
    : tab === 'rsvp' ? 'RSVP & accueil'
    : tab === 'journey' ? 'Parcours de vie'
    : 'Mes données';

  return (
    <main className="max-w-[1080px] mx-auto px-4 sm:px-6 pt-8 pb-16">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-[var(--account-line,rgba(0,0,0,0.12))] pb-6">
        <div className="max-w-[650px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: MUTED }}>Compte local · démonstration</p>
          <h1 className="mt-1 text-[clamp(27px,3.4vw,42px)] font-semibold tracking-tight" style={{ color: INK }}>
            Votre histoire, votre soirée.
          </h1>
          <p className="mt-2 text-[14px] leading-snug" style={{ color: BODY }}>
            Identité, réponses au mariage et parcours : tout se reflète dans le cadran. Les modifications restent enregistrées dans ce navigateur.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToRipple}
          className="pressable h-9 px-4 rounded-[9px] bg-[#1d1d1f] text-white text-[13px] font-semibold"
        >
          Retour au Ripple
        </button>
      </header>

      <div className="mt-7 grid gap-8 md:grid-cols-[210px_minmax(0,1fr)]">
        <nav aria-label="Réglages du compte" className="account-settings-nav grid grid-cols-4 md:flex md:flex-col gap-1 md:sticky md:top-[76px] md:self-start">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  sfx.playNodeClick();
                  setTab(t.id);
                  setConfirmReset(false);
                }}
                aria-current={active ? 'page' : undefined}
                className="account-settings-tab pressable min-w-0 flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2.5 px-1 md:px-3.5 py-2.5 md:py-3 rounded-[9px] text-center md:text-left text-[10px] md:text-[13px] font-semibold"
                style={active ? { background: 'var(--account-field,#f2f2f7)', color: INK } : { color: MUTED }}
              >
                <Icon className="w-4 h-4 shrink-0" /> {t.label}
              </button>
            );
          })}
        </nav>

        <section className="min-w-0" aria-labelledby="account-section-title">
          <h2 id="account-section-title" className="text-[21px] font-semibold tracking-tight" style={{ color: INK }}>{sectionTitle}</h2>

          {tab === 'profile' && (
            <div className="news-swap mt-5">
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => fileRef.current?.click()} aria-label="Changer la photo de profil" className="relative w-[84px] h-[84px] rounded-full overflow-hidden shrink-0 border-[3px] border-[#0A84FF]">
                  <span className="absolute inset-0 flex items-center justify-center text-[23px] font-extrabold"
                    style={{ background: 'var(--account-field,#f2f2f7)', color: INK }} aria-hidden="true">
                    {account.first.trim().slice(0, 1)}{account.last.trim().slice(0, 1)}
                  </span>
                  <img key={account.avatarUrl} src={account.avatarUrl} alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                  <span className="absolute bottom-0 inset-x-0 text-center text-[9px] font-bold py-1 bg-black/60 text-white">PHOTO</span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
                      onToast('Photo au format PNG, JPEG ou WebP uniquement.');
                      e.target.value = '';
                      return;
                    }
                    if (file.size > 1_500_000) {
                      onToast('Choisissez une photo de moins de 1,5 Mo.');
                      e.target.value = '';
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === 'string') {
                        update('avatarUrl', reader.result);
                        onToast('Photo mise à jour sur cet appareil.');
                      }
                    };
                    reader.onerror = () => onToast('Impossible de lire cette photo.');
                    reader.readAsDataURL(file);
                    e.target.value = '';
                  }}
                />
                <div>
                  <p className="text-[15px] font-bold" style={{ color: INK }}>{account.first} {account.last}</p>
                  <p className="text-[13px]" style={{ color: MUTED }}>{account.job} · {account.company}</p>
                  <p className="mt-1 text-[12px]" style={{ color: BODY }}>Photo de profil affichée dans le cadran ; elle n'est envoyée à aucun serveur par ce formulaire.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label><span className="field-label">Prénom</span><input className="account-field" value={account.first} onChange={(e) => update('first', e.target.value)} /></label>
                <label><span className="field-label">Nom</span><input className="account-field" value={account.last} onChange={(e) => update('last', e.target.value)} /></label>
                <label><span className="field-label">Métier</span><input className="account-field" value={account.job} onChange={(e) => update('job', e.target.value)} /></label>
                <label><span className="field-label">Entreprise</span><input className="account-field" value={account.company} onChange={(e) => update('company', e.target.value)} /></label>
                <label>
                  <span className="field-label">Secteur</span>
                  <select className="account-field" value={account.sector} onChange={(e) => update('sector', e.target.value as Sector)}>
                    {Object.entries(SECTOR_LABEL).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                </label>
                <label><span className="field-label">Téléphone</span><input className="account-field" type="tel" value={account.phone} onChange={(e) => update('phone', e.target.value)} /></label>
                <label className="sm:col-span-2"><span className="field-label">Email</span><input className="account-field" type="email" value={account.email} onChange={(e) => update('email', e.target.value)} /></label>
                <label className="sm:col-span-2"><span className="field-label">Parcours, en quelques lignes</span><textarea className="account-field min-h-[88px] py-2.5 resize-y" value={account.bio} onChange={(e) => update('bio', e.target.value)} /></label>
                <label className="sm:col-span-2"><span className="field-label">Ce que je cherche ou peux offrir</span><input className="account-field" value={account.seeking} onChange={(e) => update('seeking', e.target.value)} /></label>
              </div>

              <div className="mt-6">
                <p className="field-label">Centres d’intérêt · portées de couleur dans le Ripple</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => {
                    const active = account.interests.includes(interest.id);
                    return (
                      <button
                        key={interest.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          const next = active ? account.interests.filter((id) => id !== interest.id) : [...account.interests, interest.id];
                          update('interests', next);
                        }}
                        className="pressable inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold"
                        style={active ? { background: `${interest.color}24`, color: INK, boxShadow: `inset 0 0 0 1px ${interest.color}88` } : { color: MUTED, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)' }}
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: interest.color }} /> {interest.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="mt-6 flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={account.contactVisible} onChange={(e) => update('contactVisible', e.target.checked)} className="mt-1 accent-[#1E7A39] w-4 h-4" />
                <span>
                  <span className="block text-[14px] font-bold" style={{ color: INK }}>Autoriser un partage futur de mes coordonnées</span>
                  <span className="block text-[12px] mt-0.5" style={{ color: MUTED }}>Préférence enregistrée localement. Aucune coordonnée n’est transmise aux autres invités dans cette démonstration.</span>
                </span>
              </label>
            </div>
          )}

          {tab === 'rsvp' && (
            <div className="news-swap mt-5 max-w-[650px]">
              <p className="text-[14px] leading-relaxed" style={{ color: BODY }}>Renseignez votre présence et vos besoins. Ces choix apparaissent dans votre profil de démonstration et ne sont pas transmis au traiteur.</p>
              <fieldset className="mt-6">
                <legend className="field-label">Serez-vous présent·e ?</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {([
                    ['yes', 'Oui, avec plaisir'],
                    ['no', 'Non, désolé·e'],
                    ['maybe', 'Je confirme bientôt']
                  ] as const).map(([id, label]) => (
                    <button key={id} type="button" aria-pressed={account.rsvp === id} onClick={() => update('rsvp', id)} className="pressable px-4 py-2 rounded-full text-[13px] font-bold" style={account.rsvp === id ? { background: INK, color: '#fff' } : { color: BODY, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.14)' }}>{label}</button>
                  ))}
                </div>
              </fieldset>
              {account.rsvp !== 'no' && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label><span className="field-label">Nombre de convives</span><select className="account-field" value={account.partySize} onChange={(e) => update('partySize', Number(e.target.value))}>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'personne' : 'personnes'}</option>)}</select></label>
                  <label><span className="field-label">Plat principal</span><select className="account-field" value={account.meal} onChange={(e) => update('meal', e.target.value as MealChoice)}><option value="poisson">Filet de bar</option><option value="volaille">Suprême de volaille</option><option value="vegetarien">Végétarien</option></select></label>
                  <label className="sm:col-span-2"><span className="field-label">Allergies ou régime</span><input className="account-field" value={account.allergy} onChange={(e) => update('allergy', e.target.value)} placeholder="Aucun" /></label>
                  <label className="sm:col-span-2 flex gap-3 items-start"><input type="checkbox" checked={account.needsShuttle} onChange={(e) => update('needsShuttle', e.target.checked)} className="mt-1 w-4 h-4 accent-[#1E7A39]" /><span className="text-[14px] font-semibold" style={{ color: INK }}>J’aurai besoin d’une navette retour (souhait, non réservé)</span></label>
                  <label className="sm:col-span-2"><span className="field-label">Besoin d’accessibilité</span><input className="account-field" value={account.accessNeeds} onChange={(e) => update('accessNeeds', e.target.value)} placeholder="Mobilité, place accessible…" /></label>
                </div>
              )}
              <div className="mt-6 rounded-[14px] p-4 bg-[#1E7A39]/[0.08] border border-[#1E7A39]/25">
                <p className="text-[13px] font-bold text-[#1E7A39]">Réponse enregistrée dans ce navigateur.</p>
                <p className="text-[12px] mt-1" style={{ color: BODY }}>Aucune réservation, notification ou synchronisation avec un prestataire n’est effectuée.</p>
              </div>
            </div>
          )}

          {tab === 'journey' && (
            <div className="news-swap mt-5">
              <p className="text-[14px] max-w-[650px] leading-relaxed" style={{ color: BODY }}>Ajoutez les étapes qui racontent votre parcours. Choisissez lesquelles partager : elles apparaîtront sur l’anneau « Parcours » du Ripple.</p>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!form.date || !form.title.trim()) return onToast('Ajoutez une date et un titre.');
                const next = [...account.journey, { id: `journey-${Date.now()}`, date: form.date, title: form.title.trim(), detail: form.detail.trim(), kind: form.kind, shared: true }].sort((a, b) => a.date.localeCompare(b.date));
                update('journey', next);
                setForm({ date: '', title: '', detail: '', kind: 'personnel' });
                onToast('Étape ajoutée au Parcours.');
                sfx.playSuccess();
              }} className="mt-5 p-4 rounded-[16px] bg-[var(--account-field,#f5f5f7)]">
                <p className="text-[14px] font-bold" style={{ color: INK }}>Ajouter une étape de vie</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-[150px_145px_minmax(0,1fr)]">
                  <input className="account-field" type="date" aria-label="Date de l’étape" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
                  <select className="account-field" aria-label="Type d’étape" value={form.kind} onChange={(e) => setForm((p) => ({ ...p, kind: e.target.value as JourneyKind }))}>{JOURNEY_KIND.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}</select>
                  <input className="account-field" aria-label="Titre de l’étape" placeholder="ex. Premier jour à l’école" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="mt-3 flex gap-2">
                  <input className="account-field flex-1" aria-label="Détail de l’étape" placeholder="Un souvenir, un détail…" value={form.detail} onChange={(e) => setForm((p) => ({ ...p, detail: e.target.value }))} />
                  <button type="submit" className="pressable h-11 px-4 rounded-full bg-[#1d1d1f] text-white text-[13px] font-bold inline-flex items-center gap-1.5"><Plus className="w-4 h-4" /> Ajouter</button>
                </div>
              </form>
              {account.journey.length === 0 && (
                <p className="mt-5 text-[13px]" style={{ color: MUTED }} role="status">
                  Aucune étape ajoutée pour le moment.
                </p>
              )}
              <ul className="mt-5 divide-y divide-black/[0.08]">
                {account.journey.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center gap-3 py-3">
                    <span className="w-[112px] shrink-0 text-[12px] font-bold tabular" style={{ color: INK }}>{new Date(`${m.date}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="flex-1 min-w-[190px]">
                      <span className="block text-[14px] font-bold" style={{ color: INK }}>{m.title}</span>
                      <span className="block text-[12px] mt-0.5" style={{ color: MUTED }}>{m.detail}</span>
                    </span>
                    <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer" style={{ color: BODY }}>
                      <input type="checkbox" checked={m.shared} onChange={(e) => update('journey', account.journey.map((x) => x.id === m.id ? { ...x, shared: e.target.checked } : x))} className="accent-[#1E7A39]" />
                      Visible sur mon cadran
                    </label>
                    <button type="button" aria-label={`Supprimer ${m.title}`} onClick={() => update('journey', account.journey.filter((x) => x.id !== m.id))} className="w-8 h-8 rounded-full flex items-center justify-center text-[#C7342B] hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'data' && (
            <div className="news-swap mt-5 max-w-[730px] space-y-5">
              <div className="account-data-intro">
                <ShieldCheck className="w-5 h-5 shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="font-bold text-[15px]">Votre espace est local</h3>
                  <p className="mt-1 text-[13px] leading-relaxed" style={{ color: BODY }}>
                    Les modifications sont enregistrées dans le navigateur de cet appareil.
                    Il ne s’agit pas d’un compte utilisateur connecté : aucun partage entre appareils,
                    aucune transmission du RSVP et aucune notification aux prestataires.
                  </p>
                </div>
              </div>
              <div className="account-data-grid">
                <div className="account-data-card">
                  <p className="field-label">Profil</p>
                  <p className="font-bold text-[15px]">{account.first} {account.last}</p>
                  <p className="text-[12px] mt-1" style={{ color: MUTED }}>
                    Coordonnées, photo et {account.interests.length} centre(s) d’intérêt
                  </p>
                </div>
                <div className="account-data-card">
                  <p className="field-label">Mariage fictif</p>
                  <p className="font-bold text-[15px]">{account.rsvp === 'yes' ? 'Présence confirmée' : account.rsvp === 'no' ? 'Absence déclarée' : 'Présence à confirmer'}</p>
                  <p className="text-[12px] mt-1" style={{ color: MUTED }}>
                    Réponse locale · {account.journey.length} étape(s) de parcours
                  </p>
                </div>
              </div>
              <div className="account-data-card">
                <h3 className="text-[15px] font-bold">Exporter mes données</h3>
                <p className="text-[13px] mt-1 leading-relaxed" style={{ color: BODY }}>
                  Téléchargez un fichier JSON avec le profil, le RSVP et le parcours.
                  Il peut contenir vos coordonnées et besoins particuliers : conservez-le dans un endroit sûr.
                </p>
                <button type="button" onClick={exportAccount}
                  className="account-data-action mt-4 bg-[#1d1d1f] text-white">
                  <Download className="w-4 h-4" /> Télécharger mes données
                </button>
              </div>
              <div className="account-data-card">
                <h3 className="text-[15px] font-bold">Rétablir le profil fictif</h3>
                <p className="text-[13px] mt-1 leading-relaxed" style={{ color: BODY }}>
                  Remplace uniquement les informations de ce compte par les valeurs de démonstration
                  (profil, RSVP, parcours). N'efface ni la playlist ni les autres préférences locales.
                  L’opération ne peut pas être annulée depuis l’application.
                </p>
                {!confirmReset ? (
                  <button type="button" onClick={() => setConfirmReset(true)}
                    className="account-data-action mt-4 account-data-outline">
                    <RotateCcw className="w-4 h-4" /> Rétablir le profil de démonstration
                  </button>
                ) : (
                  <div className="mt-4 account-reset-confirm" role="group" aria-label="Confirmer la réinitialisation du profil">
                    <p className="text-[13px] font-bold">Confirmer le remplacement de vos saisies locales ?</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" className="account-data-action bg-[#C7342B] text-white"
                        onClick={() => {
                          onChange(freshDemoAccount());
                          setConfirmReset(false);
                          onToast('Profil de démonstration rétabli sur cet appareil.');
                        }}>Oui, remplacer</button>
                      <button type="button" className="account-data-action account-data-outline"
                        onClick={() => setConfirmReset(false)}>Annuler</button>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: MUTED }}>
                Les données sont stockées dans le navigateur : vider les données du site les supprime.
                Pour un usage professionnel ou multi-utilisateur, une authentification et un stockage sécurisé côté serveur seront nécessaires.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};