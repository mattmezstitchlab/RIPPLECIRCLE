/** Public booking-calendar primitives. No private calendar data or availability claims. */
export const MONTHS_FR=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'] as const;
export type AvailabilityState = 'unknown' | 'pending' | 'available' | 'unavailable';
export function daysInMonth(year:number, monthIndex:number):number {
  return new Date(Date.UTC(year,monthIndex+1,0,12)).getUTCDate();
}
export function isoDay(year:number,monthIndex:number,day:number):string {
  return [String(year),String(monthIndex+1).padStart(2,'0'),String(day).padStart(2,'0')].join('-');
}
export function todayLocal():string {
  const date=new Date();
  return isoDay(date.getFullYear(),date.getMonth(),date.getDate());
}
export function validFutureDay(day:string,today=todayLocal()):boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const [y,m,d]=day.split('-').map(Number);
  return m>=1&&m<=12&&d>=1&&d<=daysInMonth(y,m-1)&&isoDay(y,m-1,d)===day&&day>=today;
}
export function dateSummary(day:string):{heading:string;weekday:string;daysAway:number}|null {
  if(!validFutureDay(day))return null;
  const [y,m,d]=day.split('-').map(Number);
  const selected=new Date(Date.UTC(y,m-1,d,12));
  const now=new Date();
  const daysAway=Math.round((Date.UTC(y,m-1,d)-Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()))/86400000);
  return {
    heading:new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(selected),
    weekday:new Intl.DateTimeFormat('fr-FR',{weekday:'long',timeZone:'UTC'}).format(selected),
    daysAway
  };
}
/** The public interface has no trusted provider availability feed yet. */
export function publicAvailability(_day:string):AvailabilityState { return 'unknown'; }
export function bookingEmailUrl(values:{day:string; city:string;moment:string; firstName:string}):string|null {
  if(!validFutureDay(values.day))return null;
  const subject='Demande de disponibilité · Matt Mez Sax · '+values.day;
  const body=[
    'Bonjour Matt Mez,',
    '',
    'Je souhaiterais connaître votre disponibilité pour notre mariage.',
    'Date : '+values.day,
    'Lieu : '+(values.city.trim()||'À préciser'),
    'Moment musical : '+(values.moment||'À définir'),
    'Prénom : '+(values.firstName.trim()||'À préciser'),
    '',
    'Merci de me confirmer la disponibilité et les possibilités de prestation.'
  ].join('\n');
  return 'mailto:bookingmattmezsax@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
}
