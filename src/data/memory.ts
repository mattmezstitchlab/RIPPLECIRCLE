/*
 * Memory : les médias partagés par les invités et l'équipe au fil de la
 * journée, dans l'ordre chronologique — comme un grand film du jour J.
 * (Démonstration : données et visuels fictifs.)
 */

export type MediaType = 'photo' | 'video' | 'audio' | 'note';

export interface MemoryItem {
  id: string;
  /** Heure de partage, pour l'ordre chronologique. */
  at: string;
  minute: number;
  author: string;
  type: MediaType;
  /** Image (photo, vidéo) — les audios et notes n'en ont pas. */
  url?: string;
  legend: string;
  /** Durée en secondes pour les vidéos et audios. */
  duration?: number;
}

export const MEDIA_TYPE_META: Record<MediaType, { label: string; color: string }> = {
  photo: { label: 'Photo', color: '#0A84FF' },
  video: { label: 'Vidéo', color: '#BF5AF2' },
  audio: { label: 'Message audio', color: '#30D158' },
  note: { label: 'Note', color: '#FF9F0A' }
};

const pic = (seed: string, size = 400) => `https://picsum.photos/seed/${seed}/${size}/${size}`;

export const MEMORIES: MemoryItem[] = [
  { id: 'm01', at: '17:12', minute: 0, author: 'logistique', type: 'photo', url: pic('regie-17h12'), legend: 'Allumage des extérieurs, entrée Sud.' },
  { id: 'm02', at: '17:48', minute: 36, author: 't-photo', type: 'photo', url: pic('regie-17h48'), legend: 'Dernier repérage avant la cérémonie.' },
  { id: 'm03', at: '18:03', minute: 51, author: 'n4', type: 'photo', url: pic('regie-18h03'), legend: 'L’arche fleurie, cinq minutes avant le cortège.' },
  { id: 'm04', at: '18:22', minute: 70, author: 'n12', type: 'video', url: pic('regie-18h22'), duration: 18, legend: 'L’échange des vœux, en vidéo.' },
  { id: 'm05', at: '18:41', minute: 89, author: 't-temoins', type: 'audio', duration: 42, legend: 'Le fou rire juste après le « oui ».' },
  { id: 'm06', at: '19:05', minute: 113, author: 'n20', type: 'photo', url: pic('regie-19h05'), legend: 'Premier verre sur la terrasse.' },
  { id: 'm07', at: '19:26', minute: 134, author: 't-maries', type: 'note', legend: 'Note des mariés : « On a oublié de respirer. »' },
  { id: 'm08', at: '19:44', minute: 152, author: 'n7', type: 'photo', url: pic('regie-19h44'), legend: 'Le buffet d’huitres, déjà pris d’assaut.' },
  { id: 'm09', at: '20:08', minute: 176, author: 'n16', type: 'video', url: pic('regie-20h08'), duration: 26, legend: 'Sabrage du champagne, ralenti.' },
  { id: 'm10', at: '20:35', minute: 203, author: 'n1', type: 'photo', url: pic('regie-20h35'), legend: 'Les deux fondateurs, en terrasse.' },
  { id: 'm11', at: '20:58', minute: 226, author: 't-photo', type: 'photo', url: pic('regie-20h58'), legend: 'Golden hour — bassin des nymphéas.' },
  { id: 'm12', at: '21:15', minute: 243, author: 't-traiteur', type: 'note', legend: 'Note du traiteur : « Four N°2 recalibré, on glisse de 12 min. »' },
  { id: 'm13', at: '21:31', minute: 259, author: 'n3', type: 'photo', url: pic('regie-21h31'), legend: 'Le cocktail s’éternise, personne ne veut partir.' },
  { id: 'm14', at: '21:44', minute: 271, author: 't-maries', type: 'video', url: pic('regie-21h44'), duration: 31, legend: 'L’entrée en salle, serviettes en l’air.' },
  { id: 'm15', at: '21:58', minute: 285, author: 'n24', type: 'photo', url: pic('regie-21h58'), legend: 'La table d’honneur, juste avant le service.' },
  { id: 'm16', at: '22:18', minute: 296, author: 't-temoins', type: 'audio', duration: 65, legend: 'Le discours du père, enregistré par la témoin.' },
  { id: 'm17', at: '22:46', minute: 314, author: 'n10', type: 'photo', url: pic('regie-22h46'), legend: 'La projection surprise — 4 min de souvenirs.' },
  { id: 'm18', at: '23:12', minute: 340, author: 'n30', type: 'photo', url: pic('regie-23h12'), legend: 'Le jeu des mariés, table 3 en tête.' },
  { id: 'm19', at: '23:47', minute: 375, author: 't-traiteur', type: 'video', url: pic('regie-23h47'), duration: 22, legend: 'La pièce montée arrive, étincelles froides.' },
  { id: 'm20', at: '00:04', minute: 392, author: 'n6', type: 'photo', url: pic('regie-00h04'), legend: 'Ouverture de bal — tout le monde s’y met.' },
  { id: 'm21', at: '00:38', minute: 426, author: 't-dj', type: 'audio', duration: 38, legend: '« On remet ça dans dix ans », murmuré au micro.' },
  { id: 'm22', at: '01:24', minute: 472, author: 'n5', type: 'photo', url: pic('regie-01h24'), legend: 'Piste centrale, 1h24 — personne ne s’arrête.' },
  { id: 'm23', at: '02:16', minute: 504, author: 't-planner', type: 'note', legend: 'Note de la planner : « Incident absorbé, marge reconstituée. »' },
  { id: 'm24', at: '03:05', minute: 553, author: 'n18', type: 'photo', url: pic('regie-03h05'), legend: 'Dernier slow, il est 3 heures.' },
  { id: 'm25', at: '04:12', minute: 600, author: 'logistique', type: 'photo', url: pic('regie-04h12'), legend: 'Dernier métro, dernière navette.' },
  { id: 'm26', at: '04:58', minute: 646, author: 't-maries', type: 'note', legend: 'Note finale des mariés : « Merci d’avoir été là. »' }
];

/** Durée totale du « film », du premier au dernier média. */
export const MEMORY_SPAN = Math.max(...MEMORIES.map((m) => m.minute)) - Math.min(...MEMORIES.map((m) => m.minute));
