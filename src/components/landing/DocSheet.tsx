import React from 'react';
import { Check, Download, X } from 'lucide-react';
import { DOC_KIND_LABEL, DocItem, euro, totalsOf } from '../../data/documents';
import { RoleProfile } from '../../data/roles';
import { usePersistentState } from '../../hooks/usePersistentState';
import { generateDocPdf } from '../../utils/pdf';
import { sfx } from '../../utils/audio';
import { cn } from '../../utils/cn';

const INK = '#1d1d1f';
const MUTED = '#6e6e73';
const BODY = '#424245';

export const DOC_STATUS_COLOR: Record<string, string> = {
  'signé': '#1E7A39',
  validé: '#1E7A39',
  'payée': '#1E7A39',
  'à signer': '#9A5B00',
  brouillon: '#6E6E73'
};

/* ------------------------------- aperçu ------------------------------- */

const Paper: React.FC<{ doc: DocItem; role: RoleProfile }> = ({ doc, role }) => {
  const t = totalsOf(doc);

  return (
    <div className="bg-white rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_12px_40px_rgba(0,0,0,0.10)] overflow-hidden">
      {/* Bandeau d'accent */}
      <div className="h-1.5" style={{ background: role.accent }} />

      <div className="p-6 sm:p-8">
        {/* Émetteur + références */}
        <div className="flex flex-wrap justify-between gap-4 pb-5 border-b border-black/[0.08]">
          <div className="min-w-0">
            <p className="text-[15px] font-bold tracking-tight" style={{ color: INK }}>
              {doc.from?.name}
            </p>
            <p className="text-[12px] leading-relaxed mt-1" style={{ color: MUTED }}>
              {doc.from?.address}
              <br />
              {doc.from?.contact}
              {doc.from?.siret && (
                <>
                  <br />
                  SIRET {doc.from.siret}
                </>
              )}
            </p>
          </div>
          <div className="text-right text-[12px] leading-relaxed" style={{ color: MUTED }}>
            <p className="font-semibold" style={{ color: INK }}>
              {DOC_KIND_LABEL[doc.kind]} n° {doc.number}
            </p>
            <p>Date : {doc.date}</p>
            {doc.dueDate && <p>Échéance : {doc.dueDate}</p>}
            {doc.validity && <p>Validité : {doc.validity}</p>}
          </div>
        </div>

        {/* Titre */}
        <h3 className="mt-6 text-[22px] sm:text-[26px] font-bold tracking-tight leading-tight" style={{ color: INK }}>
          {doc.title}
        </h3>
        <p className="mt-1.5 text-[13.5px]" style={{ color: MUTED }}>
          {doc.summary}
        </p>

        {/* Destinataire */}
        {doc.to && (
          <div className="mt-6">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.12em]" style={{ color: MUTED }}>
              Destinataire
            </p>
            <p className="mt-1.5 text-[14px] font-semibold" style={{ color: INK }}>
              {doc.to.name}
            </p>
            <p className="text-[12.5px] leading-relaxed" style={{ color: MUTED }}>
              {doc.to.address}
              <br />
              {doc.to.contact}
            </p>
          </div>
        )}

        {/* Lignes chiffrées */}
        {doc.lines && doc.lines.length > 0 && (
          <div className="mt-7">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[#f6f6f8] text-left">
                  <th className="py-2 pl-3 font-semibold" style={{ color: MUTED }}>
                    Désignation
                  </th>
                  <th className="py-2 px-2 text-center font-semibold whitespace-nowrap" style={{ color: MUTED }}>
                    Qté
                  </th>
                  <th className="py-2 px-2 text-right font-semibold whitespace-nowrap" style={{ color: MUTED }}>
                    P.U. HT
                  </th>
                  <th className="py-2 pr-3 text-right font-semibold whitespace-nowrap" style={{ color: MUTED }}>
                    Total HT
                  </th>
                </tr>
              </thead>
              <tbody>
                {doc.lines.map((l, i) => (
                  <tr key={i} className="border-b border-black/[0.06]">
                    <td className="py-2.5 pl-3" style={{ color: INK }}>
                      {l.label}
                    </td>
                    <td className="py-2.5 px-2 text-center tabular whitespace-nowrap" style={{ color: BODY }}>
                      {l.qty} {l.unit}
                    </td>
                    <td className="py-2.5 px-2 text-right tabular whitespace-nowrap" style={{ color: BODY }}>
                      {euro(l.priceHT)}
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular font-semibold whitespace-nowrap" style={{ color: INK }}>
                      {euro(l.qty * l.priceHT)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totaux */}
            <dl className="mt-4 ml-auto max-w-[280px] space-y-1.5 text-[13px]">
              <div className="flex justify-between gap-4">
                <dt style={{ color: MUTED }}>Total HT</dt>
                <dd className="tabular" style={{ color: BODY }}>
                  {euro(t.ht)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt style={{ color: MUTED }}>TVA {doc.vatRate ?? 20} %</dt>
                <dd className="tabular" style={{ color: BODY }}>
                  {euro(t.vat)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 pt-1.5 mt-1.5 border-t border-black/[0.1]">
                <dt className="font-bold" style={{ color: INK }}>
                  Total TTC
                </dt>
                <dd className="tabular font-bold" style={{ color: INK }}>
                  {euro(t.ttc)}
                </dd>
              </div>
              {t.paid > 0 && (
                <div className="flex justify-between gap-4">
                  <dt style={{ color: MUTED }}>Déjà réglé</dt>
                  <dd className="tabular" style={{ color: '#1E7A39' }}>
                    {euro(t.paid)}
                  </dd>
                </div>
              )}
              {t.due > 0 && (
                <div className="flex justify-between gap-4 bg-[#f6f6f8] px-3 py-2 rounded-[8px]">
                  <dt className="font-bold" style={{ color: INK }}>
                    Reste à payer
                  </dt>
                  <dd className="tabular font-bold" style={{ color: INK }}>
                    {euro(t.due)}
                  </dd>
                </div>
              )}
            </dl>

            {doc.paymentTerms && (
              <div className="mt-6">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em]" style={{ color: MUTED }}>
                  Conditions de règlement
                </p>
                <p className="mt-1 text-[13px] leading-relaxed" style={{ color: BODY }}>
                  {doc.paymentTerms}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Clauses */}
        {doc.clauses && doc.clauses.length > 0 && (
          <div className="mt-7 space-y-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.12em]" style={{ color: MUTED }}>
              Dispositions du contrat
            </p>
            {doc.clauses.map((c, i) => (
              <div key={i}>
                <p className="text-[13.5px] font-semibold" style={{ color: INK }}>
                  {c.title}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed" style={{ color: BODY }}>
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Spécifications */}
        {doc.specs && doc.specs.length > 0 && (
          <div className="mt-7">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.12em]" style={{ color: MUTED }}>
              Caractéristiques techniques
            </p>
            <dl className="mt-2 divide-y divide-black/[0.07]">
              {doc.specs.map((s, i) => (
                <div key={i} className="flex flex-wrap justify-between gap-x-6 gap-y-0.5 py-2">
                  <dt className="text-[13px] font-semibold" style={{ color: INK }}>
                    {s.label}
                  </dt>
                  <dd className="text-[13px] text-right" style={{ color: BODY }}>
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Corps de texte */}
        {doc.body.length > 0 && (
          <div className="mt-7">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.12em]" style={{ color: MUTED }}>
              Informations complémentaires
            </p>
            <ul className="mt-2 space-y-1.5">
              {doc.body.map((b, i) => (
                <li key={i} className="text-[13px] leading-relaxed" style={{ color: BODY }}>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Blocs de signature */}
        {(doc.kind === 'contrat' || doc.kind === 'devis') && (
          <div className="mt-9 grid sm:grid-cols-2 gap-5">
            {[doc.from?.name ?? 'Prestataire', doc.to?.name ?? 'Client'].map((party) => (
              <div key={party}>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: MUTED }}>
                  Pour {party}
                </p>
                <div className="h-[70px] rounded-[8px] border border-black/[0.12] flex items-end p-2">
                  <span className="text-[11px]" style={{ color: MUTED }}>
                    Signature et cachet
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------------- feuille -------------------------------- */

interface DocSheetProps {
  doc: DocItem;
  role: RoleProfile;
  onClose: () => void;
}

export const DocSheet: React.FC<DocSheetProps> = ({ doc, role, onClose }) => {
  const [checks, setChecks] = usePersistentState<Record<string, boolean>>('regie.checks.v1', {});
  const [signed, setSigned] = usePersistentState<Record<string, boolean>>('regie.signed.v1', {});
  const st = signed[doc.id] ? 'signé' : doc.status;
  const ck = (id: string, i: number) => `${id}:${i}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-6"
      data-doc-sheet
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={doc.title}
    >
      <div
        className="sheet-enter w-full sm:max-w-[820px] max-h-[94svh] bg-[#f5f5f7] sm:rounded-[24px] rounded-t-[24px] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barre d'outils */}
        <div className="flex items-center justify-between gap-3 px-5 h-[60px] bg-white border-b border-black/[0.08] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: `${role.accent}38` }}>
              <role.icon className="w-3.5 h-3.5" strokeWidth={2.2} color={INK} />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold truncate" style={{ color: INK }}>
                {DOC_KIND_LABEL[doc.kind]} · {doc.number}
              </p>
              <p className="text-[12px] font-semibold" style={{ color: DOC_STATUS_COLOR[st] ?? MUTED }}>
                {st}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                sfx.playSuccess();
                generateDocPdf(doc, role.accent);
              }}
              className="pressable h-9 px-4 rounded-full bg-[#1d1d1f] text-white text-[13px] font-semibold flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Télécharger le PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="pressable w-9 h-9 rounded-full bg-black/[0.05] flex items-center justify-center"
            >
              <X className="w-4 h-4" style={{ color: INK }} />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6">
          <Paper doc={doc} role={role} />

          {/* Checklist */}
          {doc.checklist && doc.checklist.length > 0 && (
            <div className="mt-5 bg-white rounded-[16px] p-5">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em]" style={{ color: MUTED }}>
                Points à vérifier
              </p>
              <ul className="mt-3 space-y-1">
                {doc.checklist.map((c, i) => {
                  const on = !!checks[ck(doc.id, i)];
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => {
                          sfx.playBlip(on ? 600 : 900, 0.025);
                          setChecks((p) => ({ ...p, [ck(doc.id, i)]: !p[ck(doc.id, i)] }));
                        }}
                        className="flex items-center gap-3 py-1.5 text-left w-full"
                      >
                        <span
                          className={cn(
                            'w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                            on ? 'bg-[#30D158] border-[#30D158]' : 'border-black/25'
                          )}
                        >
                          {on && <Check className="w-3 h-3" strokeWidth={3.2} style={{ color: INK }} />}
                        </span>
                        <span className={cn('text-[14px]', on && 'line-through')} style={{ color: on ? MUTED : INK }}>
                          {c}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Signature */}
          {st === 'à signer' && (
            <button
              type="button"
              onClick={() => {
                sfx.playSuccess();
                setSigned((p) => ({ ...p, [doc.id]: true }));
              }}
              className="pressable mt-5 w-full h-[50px] rounded-[14px] bg-[#1E7A39] text-white text-[16px] font-semibold"
            >
              Signer ce document
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
