import React, { useRef, useState } from 'react';
import { CalendarCheck, Moon, Plus, Sun, Trash2, UserRound } from 'lucide-react';
import { AccountState, JourneyKind, MealChoice } from '../../data/account';
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

type AccountTab = 'profile' | 'rsvp' | 'journey' | 'display';

export const AccountPage: React.FC<AccountPageProps> = ({ account, onChange, onToast, onBackToRipple }) => {
  const [tab, setTab] = useState<AccountTab>('profile');
  const [form, setForm] = useState({ date: '', title: '', detail: '', kind: 'personnel' as JourneyKind });
  const fileRef = useRef<HTMLInputElement | null>(null);

  const update = <K extends keyof AccountState>(key: K, value: AccountState[K]) => onChange({ ...account, [key]: value });
  const tabs: { id: AccountTab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profil', icon: UserRound },
    { id: 'rsvp', label: 'RSVP', icon: CalendarCheck },
    { id: 'journey', label: 'Parcours', icon: Plus },
    { id: 'display', label: 'Affichage', icon: Sun }
  ];

  const sectionTitle = tab === 'profile' ? 'Profil & centres d’intérêt'
    : tab === 'rsvp' ? 'RSVP & accueil'
    : tab === 'journey' ? 'Parcours de vie'
    : 'Affichage';

  return (
    <main className="max-w-[1080px] mx-auto px-4 sm:px-6 pt-8 pb-16">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-[var(--account-line,rgba(0,0,0,0.12))] pb-6">
        <div className="max-w-[650px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: MUTED }}>Compte · données du Ripple</p>
          <h1 className="mt-1 text-[clamp(27px,3.4vw,42px)] font-semibold tracking-tight" style={{ color: INK }}>
            Votre histoire, votre soirée.
          </h1>
          <p className="mt-2 text-[14px] leading-snug" style={{ color: BODY }}>
            Profil, centres d’intérêt, parcours et RSVP : une modification ici se répercute dans le cercle.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToRipple}
          className="pressable h-9 px-4 rounded-full bg-[#1d1d1f] text-white text-[13px] font-semibold"
        >
          Retour au Ripple
        </button>
      </header>

      <div className="mt-7 grid gap-8 md:grid-cols-[210px_minmax(0,1fr)]">
        <nav aria-label="Réglages du compte" className="flex md:flex-col gap-1 overflow-x-auto no-scrollbar md:overflow-visible md:sticky md:top-[76px] md:self-start">
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
                }}
                className="pressable shrink-0 flex items-center gap-2.5 px-3.5 py-3 rounded-[12px] text-left text-[13px] font-semibold"
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
                  <img src={account.avatarUrl} alt="" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 text-center text-[9px] font-bold py-1 bg-black/60 text-white">PHOTO</span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 1_500_000) {
                      onToast('Choisissez une photo de moins de 1,5 Mo.');
                      e.target.value = '';
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === 'string') update('avatarUrl', reader.result);
                    };
                    reader.readAsDataURL(file);
                    e.target.value = '';
                  }}
                />
                <div>
                  <p className="text-[15px] font-bold" style={{ color: INK }}>{account.first} {account.last}</p>
                  <p className="text-[13px]" style={{ color: MUTED }}>{account.job} · {account.company}</p>
                  <p className="mt-1 text-[12px]" style={{ color: BODY }}>Cette photo suit l’aiguille du Ripple et identifie votre portée.</p>
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
                  <span className="block text-[14px] font-bold" style={{ color: INK }}>Partager mes coordonnées aux autres convives</span>
                  <span className="block text-[12px] mt-0.5" style={{ color: MUTED }}>Votre téléphone n’est affiché dans Ripple que si vous y consentez.</span>
                </span>
              </label>
            </div>
          )}

          {tab === 'rsvp' && (
            <div className="news-swap mt-5 max-w-[650px]">
              <p className="text-[14px] leading-relaxed" style={{ color: BODY }}>Votre réponse enrichit la portée « Invités » et aide le traiteur à préparer le bon nombre de couverts.</p>
              <fieldset className="mt-6">
                <legend className="field-label">Serez-vous présent·e ?</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {([
                    ['yes', 'Oui, avec plaisir'],
                    ['no', 'Non, désolé·e'],
                    ['maybe', 'Je confirme bientôt']
                  ] as const).map(([id, label]) => (
                    <button key={id} type="button" onClick={() => update('rsvp', id)} className="pressable px-4 py-2 rounded-full text-[13px] font-bold" style={account.rsvp === id ? { background: INK, color: '#fff' } : { color: BODY, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.14)' }}>{label}</button>
                  ))}
                </div>
              </fieldset>
              {account.rsvp !== 'no' && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label><span className="field-label">Nombre de convives</span><select className="account-field" value={account.partySize} onChange={(e) => update('partySize', Number(e.target.value))}>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'personne' : 'personnes'}</option>)}</select></label>
                  <label><span className="field-label">Plat principal</span><select className="account-field" value={account.meal} onChange={(e) => update('meal', e.target.value as MealChoice)}><option value="poisson">Filet de bar</option><option value="volaille">Suprême de volaille</option><option value="vegetarien">Végétarien</option></select></label>
                  <label className="sm:col-span-2"><span className="field-label">Allergies ou régime</span><input className="account-field" value={account.allergy} onChange={(e) => update('allergy', e.target.value)} placeholder="Aucun" /></label>
                  <label className="sm:col-span-2 flex gap-3 items-start"><input type="checkbox" checked={account.needsShuttle} onChange={(e) => update('needsShuttle', e.target.checked)} className="mt-1 w-4 h-4 accent-[#1E7A39]" /><span className="text-[14px] font-semibold" style={{ color: INK }}>Réserver une place dans la navette retour de 23:30</span></label>
                  <label className="sm:col-span-2"><span className="field-label">Besoin d’accessibilité</span><input className="account-field" value={account.accessNeeds} onChange={(e) => update('accessNeeds', e.target.value)} placeholder="Mobilité, place accessible…" /></label>
                </div>
              )}
              <div className="mt-6 rounded-[14px] p-4 bg-[#1E7A39]/[0.08] border border-[#1E7A39]/25">
                <p className="text-[13px] font-bold text-[#1E7A39]">Votre RSVP est conservé sur cet appareil.</p>
                <p className="text-[12px] mt-1" style={{ color: BODY }}>La synchronisation avec le traiteur nécessite la version connectée de la régie.</p>
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
                      Partagé
                    </label>
                    <button type="button" aria-label={`Supprimer ${m.title}`} onClick={() => update('journey', account.journey.filter((x) => x.id !== m.id))} className="w-8 h-8 rounded-full flex items-center justify-center text-[#C7342B] hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'display' && (
            <div className="news-swap mt-5">
              <p className="text-[14px]" style={{ color: BODY }}>Mode d’éclairage de la régie. Vous pourrez aussi zoomer directement sur le Ripple.</p>
              <div className="mt-5 grid sm:grid-cols-2 gap-3 max-w-[640px]">
                {([
                  { id: 'day' as const, label: 'Mode jour', detail: 'Fond clair, contraste net', icon: Sun },
                  { id: 'night' as const, label: 'Mode nuit', detail: 'Fond sombre, lumière douce', icon: Moon }
                ]).map((t) => {
                  const active = account.theme === t.id;
                  const Icon = t.icon;
                  return (
                    <button key={t.id} type="button" onClick={() => { sfx.playNodeClick(); update('theme', t.id); onToast(t.id === 'night' ? 'Mode nuit activé' : 'Mode jour activé'); }} className="pressable p-5 rounded-[16px] border-2 text-left" style={{ background: t.id === 'night' ? '#17171b' : '#fff', color: t.id === 'night' ? '#f5f5f7' : INK, borderColor: active ? '#0A84FF' : 'rgba(0,0,0,0.1)' }}>
                      <Icon className="w-5 h-5" />
                      <span className="block mt-3 text-[15px] font-bold">{t.label}</span>
                      <span className="block mt-0.5 text-[12px] opacity-75">{t.detail}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};