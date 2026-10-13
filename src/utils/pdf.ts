import { DOC_KIND_LABEL, DocItem, euro, totalsOf } from '../data/documents';

/*
 * Générateur PDF sans dépendance externe.
 * Format A4, unités internes en millimètres, polices Helvetica (base-14).
 * Suffisant pour des devis, contrats et factures : texte, tableaux,
 * filets, blocs de couleur et zones de signature.
 */

const MM = 72 / 25.4; // 1 mm en points
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

const INK = [0.11, 0.11, 0.12];
const MUTED = [0.43, 0.43, 0.45];
const SOFT = [0.965, 0.965, 0.973];
const RULE = [0.87, 0.87, 0.875];

/* ------------------------- largeurs de caractères ------------------------- */

const NARROW = new Set("ijltfrI.,:;'\"!|()[]{}-`·’ ".split(''));
const WIDE = new Set('mwMW@%'.split(''));

function charWidth(ch: string, size: number, bold: boolean): number {
  let f: number;
  if (NARROW.has(ch)) f = 0.3;
  else if (WIDE.has(ch)) f = 0.82;
  else if (ch >= 'A' && ch <= 'Z') f = 0.66;
  else if (ch >= '0' && ch <= '9') f = 0.556;
  else f = 0.52;
  return f * size * (bold ? 1.06 : 1);
}

function textWidth(s: string, size: number, bold: boolean): number {
  let w = 0;
  for (const ch of winAnsi(s)) w += charWidth(ch, size, bold);
  return w;
}

function wrap(s: string, maxMm: number, size: number, bold: boolean): string[] {
  const maxPt = maxMm * MM;
  const out: string[] = [];
  for (const paragraph of s.split('\n')) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      out.push('');
      continue;
    }
    let line = '';
    for (const word of words) {
      const trial = line ? `${line} ${word}` : word;
      if (textWidth(trial, size, bold) <= maxPt || !line) {
        line = trial;
      } else {
        out.push(line);
        line = word;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

/* ------------------------- encodage WinAnsi (Latin-1) ------------------------- */

/**
 * Ramène les caractères Unicode courants du français vers leur octet WinAnsi,
 * afin que le PDF reste lisible dans tous les lecteurs.
 */
const WIN_ANSI: Record<string, number> = {
  '\u2014': 0x97, // — tiret cadratin
  '\u2013': 0x96, // – tiret demi-cadratin
  '\u2018': 0x91, // ‘
  '\u2019': 0x92, // ’ apostrophe typographique
  '\u201a': 0x82,
  '\u201c': 0x93, // “
  '\u201d': 0x94, // ”
  '\u201e': 0x84,
  '\u2026': 0x85, // …
  '\u2022': 0x95, // •
  '\u2039': 0x8b,
  '\u203a': 0x9b,
  '\u2020': 0x86,
  '\u2021': 0x87,
  '\u2030': 0x89,
  '\u0160': 0x8a,
  '\u0161': 0x9a,
  '\u0152': 0x8c,
  '\u0153': 0x9c,
  '\u017d': 0x8e,
  '\u017e': 0x9e,
  '\u0178': 0x98,
  '\u00a0': 0xa0,
  '\u2192': 0x2d, // → rendu « -> »
  '\u21b3': 0x3e // ↳ rendu « > »
};

function winAnsi(s: string): string {
  let out = '';
  for (const ch of s) {
    const code = ch.codePointAt(0) ?? 63;
    if (code < 256) {
      out += ch;
    } else if (WIN_ANSI[ch] !== undefined) {
      out += String.fromCharCode(WIN_ANSI[ch]);
    } else {
      out += '?';
    }
  }
  return out;
}

/* ------------------------------- échappement ------------------------------- */

function esc(s: string): string {
  return winAnsi(s)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[\r\n]/g, ' ');
}

/* -------------------------------- couleur -------------------------------- */

function rgb(c: number[]): string {
  return c.map((v) => v.toFixed(3)).join(' ');
}

function hexRgb(hex: string): number[] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255
  ];
}

/* ------------------------------- document ------------------------------- */

class PdfDoc {
  private pages: string[][] = [];
  private ops: string[] = [];
  private pageH = PAGE_H;

  constructor() {
    this.pages.push(this.ops);
  }

  newPage() {
    this.ops = [];
    this.pages.push(this.ops);
  }

  /** Dessine sur une page déjà créée (utilisé pour les pieds de page). */
  drawOnPage(index: number, draw: () => void) {
    const current = this.ops;
    this.ops = this.pages[index];
    draw();
    this.ops = current;
  }

  get pageCount() {
    return this.pages.length;
  }

  /* ---- primitives ---- */

  private fill(c: number[]) {
    this.ops.push(`${rgb(c)} rg`);
  }

  private stroke(c: number[]) {
    this.ops.push(`${rgb(c)} RG`);
  }

  rect(x: number, yMm: number, w: number, h: number, color?: number[]) {
    if (color) this.fill(color);
    this.ops.push(`${(x * MM).toFixed(2)} ${((this.pageH - yMm) * MM).toFixed(2)} ${(w * MM).toFixed(2)} ${(h * MM).toFixed(2)} re f`);
  }

  box(x: number, yMm: number, w: number, h: number, color: number[], lw = 0.3) {
    this.stroke(color);
    this.ops.push(`${lw} w`);
    this.ops.push(`${(x * MM).toFixed(2)} ${((this.pageH - yMm) * MM).toFixed(2)} ${(w * MM).toFixed(2)} ${(h * MM).toFixed(2)} re S`);
  }

  line(x1: number, y1: number, x2: number, y2: number, color: number[] = RULE, lw = 0.2) {
    this.stroke(color);
    this.ops.push(`${lw} w`);
    this.ops.push(`${(x1 * MM).toFixed(2)} ${((this.pageH - y1) * MM).toFixed(2)} m ${(x2 * MM).toFixed(2)} ${((this.pageH - y2) * MM).toFixed(2)} l S`);
  }

  text(s: string, x: number, yMm: number, size: number, opts: { bold?: boolean; color?: number[]; align?: 'left' | 'right' | 'center' } = {}) {
    const { bold = false, color = INK, align = 'left' } = opts;
    let px = x;
    if (align !== 'left') {
      const w = textWidth(s, size, bold) / MM;
      px = align === 'right' ? x - w : x - w / 2;
    }
    this.fill(color);
    this.ops.push('BT');
    this.ops.push(`/${bold ? 'F2' : 'F1'} ${size} Tf`);
    this.ops.push(`${(px * MM).toFixed(2)} ${((this.pageH - yMm) * MM).toFixed(2)} Td`);
    this.ops.push(`(${esc(s)}) Tj`);
    this.ops.push('ET');
  }

  paragraph(s: string, x: number, yMm: number, widthMm: number, size: number, color: number[] = INK): number {
    const lines = wrap(s, widthMm, size, false);
    lines.forEach((l, i) => this.text(l, x, yMm + i * size * 0.42, size, { color }));
    return lines.length * size * 0.42;
  }

  /* ---- assemblage ---- */

  build(): string {
    const objects: string[] = [];
    const nPages = this.pages.length;

    // 1 catalogue, 2 pages, 3 F1, 4 F2
    objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
    objects[2] = `<< /Type /Pages /Count ${nPages} /Kids [${this.pages.map((_, i) => `${5 + i * 2} 0 R`).join(' ')}] >>`;
    objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
    objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';

    this.pages.forEach((ops, i) => {
      const pageObj = 5 + i * 2;
      const streamObj = 6 + i * 2;
      const stream = ops.join('\n');
      objects[pageObj] =
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${(PAGE_W * MM).toFixed(2)} ${(PAGE_H * MM).toFixed(2)}] ` +
        `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${streamObj} 0 R >>`;
      objects[streamObj] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
    });

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [];
    for (let i = 1; i < objects.length; i++) {
      offsets[i] = pdf.length;
      pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
    }

    const xrefPos = pdf.length;
    pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
    for (let i = 1; i < objects.length; i++) {
      pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

    // Encodage binaire : les accents passent en WinAnsi (Latin-1)
    const bytes = new Uint8Array(pdf.length);
    for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff;
    return URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  }
}

/* ------------------------------ génération ------------------------------ */

export function generateDocPdf(doc: DocItem, accent: string): void {
  const pdf = new PdfDoc();
  const t = totalsOf(doc);
  const [ar, ag, ab] = hexRgb(accent);
  const ACCENT = [ar, ag, ab];
  let y = 0;

  const need = (h: number) => {
    if (y + h > PAGE_H - 26) {
      pdf.newPage();
      y = MARGIN + 4;
    }
  };

  const heading = (title: string) => {
    need(16);
    y += 4;
    pdf.text(title.toUpperCase(), MARGIN, y, 9.5, { bold: true, color: INK });
    y += 2;
    pdf.line(MARGIN, y, MARGIN + CONTENT_W, y, RULE);
    y += 6;
  };

  /* Bandeau d'accent */
  pdf.rect(0, 0, PAGE_W, 6, ACCENT);
  y = 22;

  /* Émetteur */
  if (doc.from) {
    pdf.text(doc.from.name, MARGIN, y, 11, { bold: true });
    y += 5;
    pdf.text(doc.from.address, MARGIN, y, 8.5, { color: MUTED });
    y += 3.8;
    pdf.text(doc.from.contact, MARGIN, y, 8.5, { color: MUTED });
    y += 3.8;
    if (doc.from.siret) {
      pdf.text(`SIRET ${doc.from.siret}`, MARGIN, y, 8.5, { color: MUTED });
      y += 3.8;
    }
  }

  /* Références à droite */
  let ry = 22;
  const refs = [
    `${DOC_KIND_LABEL[doc.kind]} n° ${doc.number}`,
    `Date : ${doc.date}`,
    doc.dueDate ? `Échéance : ${doc.dueDate}` : null,
    doc.validity ? `Validité : ${doc.validity}` : null
  ].filter(Boolean) as string[];
  refs.forEach((r) => {
    pdf.text(r, MARGIN + CONTENT_W, ry, 8.5, { color: MUTED, align: 'right' });
    ry += 4.2;
  });

  y = Math.max(y, ry) + 5;
  pdf.line(MARGIN, y, MARGIN + CONTENT_W, y, INK);
  pdf.line(MARGIN, y - 0.7, MARGIN + CONTENT_W, y - 0.7, ACCENT, 0.8);
  y += 11;

  /* Titre */
  const titleLines = wrap(doc.title, CONTENT_W, 17, true);
  titleLines.forEach((l) => {
    pdf.text(l, MARGIN, y, 17, { bold: true });
    y += 7.2;
  });
  y += 2;
  y += pdf.paragraph(doc.summary, MARGIN, y, CONTENT_W, 9.5, MUTED) + 7;

  /* Destinataire */
  if (doc.to) {
    pdf.text('DESTINATAIRE', MARGIN, y, 8.5, { bold: true, color: MUTED });
    y += 5;
    pdf.text(doc.to.name, MARGIN, y, 10);
    y += 4.6;
    pdf.text(doc.to.address, MARGIN, y, 8.5, { color: MUTED });
    y += 3.8;
    pdf.text(doc.to.contact, MARGIN, y, 8.5, { color: MUTED });
    y += 9;
  }

  /* Lignes chiffrées */
  if (doc.lines && doc.lines.length > 0) {
    const cLabel = 82;
    const cQty = 16;
    const cUnit = 20;
    const cPu = 28;
    const xQty = MARGIN + cLabel;
    const xUnit = xQty + cQty;
    const xPu = xUnit + cPu;
    const xEnd = MARGIN + CONTENT_W;

    // En-tête
    need(20);
    pdf.rect(MARGIN, y - 4.4, CONTENT_W, 8, SOFT);
    pdf.text('DÉSIGNATION', MARGIN + 2, y, 8, { bold: true, color: MUTED });
    pdf.text('QTÉ', xQty + cQty / 2, y, 8, { bold: true, color: MUTED, align: 'center' });
    pdf.text('UNITÉ', xUnit + cUnit / 2, y, 8, { bold: true, color: MUTED, align: 'center' });
    pdf.text('P.U. HT', xPu + cPu - 2, y, 8, { bold: true, color: MUTED, align: 'right' });
    pdf.text('TOTAL HT', xEnd - 2, y, 8, { bold: true, color: MUTED, align: 'right' });
    y += 8;
    pdf.line(MARGIN, y, xEnd, y, RULE);
    y += 5;

    doc.lines.forEach((l, i) => {
      const labelLines = wrap(l.label, cLabel - 4, 9, false);
      const h = Math.max(7, labelLines.length * 3.9 + 3);
      need(h + 3);

      if (i % 2 === 1) pdf.rect(MARGIN, y - 3.4, CONTENT_W, h, [0.98, 0.98, 0.992]);

      labelLines.forEach((ll, k) => pdf.text(ll, MARGIN + 2, y + k * 3.9, 9));
      pdf.text(String(l.qty), xQty + cQty / 2, y, 8.5, { color: MUTED, align: 'center' });
      pdf.text(l.unit, xUnit + cUnit / 2, y, 8.5, { color: MUTED, align: 'center' });
      pdf.text(euro(l.priceHT), xPu + cPu - 2, y, 8.5, { color: MUTED, align: 'right' });
      pdf.text(euro(l.qty * l.priceHT), xEnd - 2, y, 8.5, { bold: true, align: 'right' });

      y += h + 1.5;
      pdf.line(MARGIN, y, xEnd, y, RULE);
      y += 4.5;
    });

    /* Totaux */
    y += 2;
    need(48);
    const bx = MARGIN + CONTENT_W * 0.52;
    const bw = CONTENT_W * 0.48;
    const rows: [string, string, boolean][] = [
      ['Total HT', euro(t.ht), false],
      [`TVA ${doc.vatRate ?? 20} %`, euro(t.vat), false],
      ['Total TTC', euro(t.ttc), true]
    ];
    if (t.paid > 0) rows.push(['Déjà réglé', euro(t.paid), false]);
    if (t.due > 0) rows.push(['Reste à payer', euro(t.due), true]);

    rows.forEach(([label, value, strong]) => {
      if (strong) {
        y += 1.5;
        pdf.rect(bx - 3, y - 4, bw + 3, 6.8, SOFT);
      }
      pdf.text(label, bx, y, strong ? 10 : 9, { bold: strong, color: strong ? INK : MUTED });
      pdf.text(value, xEnd, y, strong ? 10 : 9, { bold: strong, color: strong ? INK : MUTED, align: 'right' });
      y += strong ? 8 : 5.2;
    });

    y += 4;
    if (doc.paymentTerms) {
      need(18);
      pdf.text('CONDITIONS DE RÈGLEMENT', MARGIN, y, 8.5, { bold: true, color: MUTED });
      y += 4.6;
      y += pdf.paragraph(doc.paymentTerms, MARGIN, y, CONTENT_W, 9, INK) + 4;
    }
  }

  /* Clauses */
  if (doc.clauses && doc.clauses.length > 0) {
    heading('Dispositions du contrat');
    doc.clauses.forEach((c) => {
      need(20);
      pdf.text(c.title, MARGIN, y, 9.5, { bold: true });
      y += 4.6;
      y += pdf.paragraph(c.body, MARGIN, y, CONTENT_W, 9, INK) + 4;
    });
  }

  /* Spécifications */
  if (doc.specs && doc.specs.length > 0) {
    heading('Caractéristiques techniques');
    doc.specs.forEach((s) => {
      need(9);
      pdf.text(s.label, MARGIN, y, 9, { bold: true, color: MUTED });
      const lines = wrap(s.value, CONTENT_W - 62, 9, false);
      lines.forEach((l, k) => pdf.text(l, MARGIN + 62, y + k * 3.9, 9));
      y += Math.max(4.8, lines.length * 3.9);
      pdf.line(MARGIN, y, MARGIN + CONTENT_W, y, RULE);
      y += 3.4;
    });
    y += 3;
  }

  /* Corps de texte */
  if (doc.body.length > 0) {
    heading('Informations complémentaires');
    doc.body.forEach((b) => {
      need(12);
      y += pdf.paragraph(b, MARGIN, y, CONTENT_W, 9, INK) + 3.5;
    });
  }

  /* Checklist */
  if (doc.checklist && doc.checklist.length > 0) {
    heading('Points à vérifier');
    doc.checklist.forEach((c) => {
      need(8);
      pdf.box(MARGIN, y - 2.8, 3.4, 3.4, [0.63, 0.63, 0.65], 0.3);
      const lines = wrap(c, CONTENT_W - 8, 9, false);
      lines.forEach((l, k) => pdf.text(l, MARGIN + 6, y + k * 3.9, 9));
      y += Math.max(6.2, lines.length * 3.9 + 2);
    });
    y += 3;
  }

  /* Signatures */
  if (doc.kind === 'contrat' || doc.kind === 'devis') {
    need(44);
    y = Math.max(y + 6, PAGE_H - 76);
    const half = (CONTENT_W - 8) / 2;
    const parties = [doc.from?.name ?? 'Prestataire', doc.to?.name ?? 'Client'];
    parties.forEach((p, i) => {
      const x = MARGIN + i * (half + 8);
      pdf.text(`POUR ${p.toUpperCase()}`, x, y, 8.5, { bold: true, color: MUTED });
    });
    y += 4;
    parties.forEach((_, i) => {
      const x = MARGIN + i * (half + 8);
      pdf.box(x, y, half, 26, [0.78, 0.78, 0.81]);
      pdf.text('Signature et cachet', x + 3, y + 22, 7.5, { color: MUTED });
    });
  }

  /* Pieds de page, sur chaque page */
  const label = `${DOC_KIND_LABEL[doc.kind]} n° ${doc.number} · ${doc.title}`;
  const total = pdf.pageCount;
  for (let i = 0; i < total; i++) {
    pdf.drawOnPage(i, () => {
      pdf.text(label, MARGIN, PAGE_H - 12, 7.5, { color: MUTED });
      pdf.text(`Page ${i + 1} / ${total}`, MARGIN + CONTENT_W, PAGE_H - 12, 7.5, { color: MUTED, align: 'right' });
      pdf.line(MARGIN, PAGE_H - 16, MARGIN + CONTENT_W, PAGE_H - 16, RULE);
    });
  }

  const url = pdf.build();
  const a = document.createElement('a');
  a.href = url;
  a.download = `${doc.number}-${doc.kind}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
