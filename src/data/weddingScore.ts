/**
 * RIPPLECIRCLE V9 — public phase/role/segment score.
 * Time is civil minutes since 00:00 on the wedding date, with >1440 next day.
 * Separate from private causal kernel, booking calendar and musical BPM score.
 */
export type PhaseId='preparations'|'ceremony'|'cocktail'|'dinner'|'evening';
export type RoleId='photo'|'video'|'flowers'|'beauty'|'officiant'|'music'|'catering'|'bar'|'coordination'|'dj'|'lighting';
export interface Phase {id:PhaseId;label:string;start:number;end:number;color:string;}
export interface Role {id:RoleId;label:string;family:'image'|'music'|'food'|'coordination'|'decoration';sound:number;phases:PhaseId[];}
export interface Segment {id:string;phaseId:PhaseId;roleId:RoleId;start:number;end:number;note?:string;}
export const PHASES:readonly Phase[]=[
  {id:'preparations',label:'Préparatifs',start:540,end:780,color:'#9C78EB'},
  {id:'ceremony',label:'Cérémonie',start:840,end:990,color:'#E8A34D'},
  {id:'cocktail',label:'Vin d’honneur',start:990,end:1170,color:'#0A84FF'},
  {id:'dinner',label:'Dîner',start:1170,end:1350,color:'#24A580'},
  {id:'evening',label:'Soirée',start:1350,end:1560,color:'#EB668B'}
];
export const ROLES:readonly Role[]=[
  {id:'photo',label:'Photographe',family:'image',sound:783.99,phases:['preparations','ceremony','cocktail','dinner','evening']},
  {id:'video',label:'Vidéaste',family:'image',sound:987.77,phases:['preparations','ceremony','cocktail','evening']},
  {id:'flowers',label:'Fleuriste',family:'decoration',sound:587.33,phases:['preparations','ceremony','dinner']},
  {id:'beauty',label:'Coiffure & beauté',family:'decoration',sound:659.25,phases:['preparations']},
  {id:'officiant',label:'Officiant',family:'coordination',sound:698.46,phases:['ceremony']},
  {id:'music',label:'Musicien live',family:'music',sound:659.25,phases:['ceremony','cocktail','dinner','evening']},
  {id:'catering',label:'Traiteur',family:'food',sound:523.25,phases:['cocktail','dinner','evening']},
  {id:'bar',label:'Bar & boissons',family:'food',sound:587.33,phases:['cocktail','evening']},
  {id:'coordination',label:'Coordination',family:'coordination',sound:739.99,phases:['preparations','ceremony','cocktail','dinner','evening']},
  {id:'dj',label:'DJ',family:'music',sound:880,phases:['dinner','evening']},
  {id:'lighting',label:'Lumières',family:'decoration',sound:1046.5,phases:['dinner','evening']}
];
export const DEMO_SEGMENTS:readonly Segment[]=[
  {id:'demo-photo-ceremony',phaseId:'ceremony',roleId:'photo',start:855,end:975},
  {id:'demo-photo-cocktail',phaseId:'cocktail',roleId:'photo',start:1020,end:1125},
  {id:'demo-music-cocktail',phaseId:'cocktail',roleId:'music',start:1035,end:1140},
  {id:'demo-catering-dinner',phaseId:'dinner',roleId:'catering',start:1185,end:1335},
  {id:'demo-dj-evening',phaseId:'evening',roleId:'dj',start:1380,end:1530}
];
export const GRID_MINUTES=15;
export const timeLabel=(minute:number)=>{
  const h=Math.floor(minute/60)%24,m=minute%60;
  return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
};
export const getPhase=(id:PhaseId)=>PHASES.find(p=>p.id===id)!;
export const getRole=(id:RoleId)=>ROLES.find(r=>r.id===id)!;
export const phaseRoles=(id:PhaseId)=>ROLES.filter(r=>r.phases.includes(id));
export function snapMinute(value:number,step=GRID_MINUTES):number{
  return Math.round(value/step)*step;
}
export function boundsForSegment(phase:Phase,start:number,end:number):{start:number;end:number}{
  const length=Math.max(GRID_MINUTES,snapMinute(end-start));
  const safeLength=Math.min(length,phase.end-phase.start);
  const safeStart=Math.max(phase.start,Math.min(phase.end-safeLength,snapMinute(start)));
  return {start:safeStart,end:safeStart+safeLength};
}
export function segmentsOf(segments:readonly Segment[],phaseId:PhaseId,roleId?:RoleId){
  return segments.filter(s=>s.phaseId===phaseId&&(!roleId||s.roleId===roleId))
    .sort((a,b)=>a.start-b.start);
}
export function overlaps(a:Segment,b:Segment):boolean{
  return a.phaseId===b.phaseId&&a.roleId===b.roleId&&a.id!==b.id&&a.start<b.end&&b.start<a.end;
}
export function isValidSegment(s:Segment):boolean{
  const p=PHASES.find(x=>x.id===s.phaseId);
  const r=ROLES.find(x=>x.id===s.roleId);
  return Boolean(p&&r&&r.phases.includes(s.phaseId)&&
    Number.isFinite(s.start)&&Number.isFinite(s.end)&&
    s.start>=p.start&&s.end<=p.end&&s.start<s.end&&
    s.start%GRID_MINUTES===0&&s.end%GRID_MINUTES===0);
}
export function sanitizeSegments(value:unknown):Segment[]{
  if(!Array.isArray(value))return [...DEMO_SEGMENTS];
  return value.filter((v):v is Segment=>v!==null&&typeof v==='object'&&
    typeof v.id==='string'&&typeof v.phaseId==='string'&&typeof v.roleId==='string'&&
    isValidSegment(v as Segment)).slice(0,240);
}
/** These are hypothetical roles, NOT available professionals. */
export function rolesMatchingPhase(id:PhaseId,search=''):Role[]{
  const term=search.trim().toLocaleLowerCase('fr');
  return phaseRoles(id).filter(r=>r.label.toLocaleLowerCase('fr').includes(term));
}
