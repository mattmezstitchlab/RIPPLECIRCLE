/**
 * Public, non-proprietary geometric framing of a radial timeline.
 * Does not include the confidential causal kernel or any user data.
 */
import { PAN_MAX, RIPPLE_SIZE, ZOOM_MAX, ZOOM_MIN } from '../ripple/config';

export type DialFrame = 'full' | 'half' | 'quarter';
export const FRAME_ORDER: readonly DialFrame[] = ['full','half','quarter'];
export const FRAME_LABELS: Record<DialFrame,string> = {
  full:'Cercle entier',
  half:'Demi-cercle',
  quarter:'Quart sélectionné'
};
export const FRAME_DESCRIPTIONS: Record<DialFrame,string> = {
  full:'Tout le programme',
  half:'Partie supérieure du cadran',
  quarter:'Détails du secteur sélectionné'
};
/** Click the same framing button to advance full → half → quarter → full. */
export function nextDialFrame(value:DialFrame):DialFrame {
  return FRAME_ORDER[(FRAME_ORDER.indexOf(value)+1)%FRAME_ORDER.length];
}
export interface FrameGeometry { zoom:number;pan:{x:number;y:number};quarter:string; }
/** Semantics: 0° is 12 o’clock; quadrants follow the chosen event, not a static zoom center. */
export function frameGeometry(frame:DialFrame,angle:number):FrameGeometry {
  if (frame!=='quarter') return {zoom:1,pan:{x:0,y:0},quarter:''};
  const degrees=Number.isFinite(angle)?((angle%360)+360)%360:0;
  const r=degrees*Math.PI/180;
  const sideX=Math.sin(r)>=0?1:-1;
  const sideY=Math.cos(r)>=0?-1:1;
  const offset=Math.min(PAN_MAX,(RIPPLE_SIZE+60)/4);
  return {
    zoom:Math.max(ZOOM_MIN,Math.min(ZOOM_MAX,2)),
    pan:{x:sideX*offset,y:sideY*offset},
    quarter:(sideY<0?'haut':'bas')+' '+(sideX>0?'droite':'gauche')
  };
}
/** Geometric point on the actual SVG, including zoom and pan. */
export function dialAngleAtPoint(x:number,y:number,center=RIPPLE_SIZE/2):number {
  if(!Number.isFinite(x)||!Number.isFinite(y))return 0;
  return ((Math.atan2(y-center,x-center)*180/Math.PI+90)%360+360)%360;
}
