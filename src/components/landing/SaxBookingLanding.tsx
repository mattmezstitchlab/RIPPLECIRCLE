import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, CircleCheck, Clock3, Mail, Music2, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { MONTHS_FR, bookingEmailUrl, dateSummary, daysInMonth, isoDay, publicAvailability, todayLocal, validFutureDay } from '../../utils/bookingCalendar';

const NOW=new Date();
const MIN_YEAR=NOW.getFullYear();
const MAX_YEAR=MIN_YEAR+4;
type MomentChoice='À définir'|'Cérémonie'|'Cocktail'|'Soirée'|'Plusieurs moments';
const MOMENTS:readonly MomentChoice[]=['À définir','Cérémonie','Cocktail','Soirée','Plusieurs moments'];

export const SaxBookingLanding:React.FC=()=>{
  const [year,setYear]=useState(Math.min(MAX_YEAR,MIN_YEAR+1));
  const [month,setMonth]=useState<number|null>(null);
  const [day,setDay]=useState('');
  const [city,setCity]=useState('');
  const [firstName,setFirstName]=useState('');
  const [moment,setMoment]=useState<MomentChoice>('À définir');
  const date=dateSummary(day);
  const mail=useMemo(()=>bookingEmailUrl({day,city,firstName,moment}),[day,city,firstName,moment]);
  const count=month===null?0:daysInMonth(year,month);
  const availability=publicAvailability(day);
  const selectMonth=(m:number)=>{setMonth(m);setDay('');};
  const selectDay=(n:number)=>{
    if(month===null)return;
    const v=isoDay(year,month,n);
    if(validFutureDay(v))setDay(v);
  };
  const changeYear=(v:number)=>{
    if(v<MIN_YEAR||v>MAX_YEAR)return;
    setYear(v);setDay('');
  };
  const fromInput=(value:string)=>{
    if(!validFutureDay(value))return;
    const [y,m]=value.split('-').map(Number);
    if(y<MIN_YEAR||y>MAX_YEAR)return;
    setYear(y);setMonth(m-1);setDay(value);
  };
  const radius=month===null?39:41;
  const values=month===null
    ? MONTHS_FR.map((_,n)=>({n:n+1,label:MONTHS_FR[n].slice(0,3),angle:(n/12)*360}))
    : Array.from({length:count},(_,n)=>({n:n+1,label:String(n+1),angle:(n/count)*360}));
  const isSelected=(n:number)=>month!==null&&day===isoDay(year,month,n);
  return (
    <main className="ripple-booking-page">
      <div className="ripple-booking-shell">
        <header className="ripple-booking-hero">
          <div>
            <p className="ripple-booking-eyebrow">MATT MEZ SAX <span>× RIPPLECIRCLE</span></p>
            <h1>Votre date. Votre musique.<br/><em>Votre grand jour.</em></h1>
            <p className="ripple-booking-subtitle">Choisissez la date de votre mariage. Découvrez comment votre journée pourrait prendre vie autour d’une prestation saxophone.</p>
          </div>
          <div className="ripple-booking-hero-links">
            <a href="#score" className="ripple-booking-explore">Composer votre journée <Music2 size={17}/></a>
            <a href="#explore" className="ripple-booking-explore">Découvrir le cadran <ArrowRight size={17}/></a>
          </div>
        </header>

        <div className="ripple-booking-content">
          <section className="ripple-booking-wheel-column" aria-labelledby="ripple-booking-wheel-heading">
            <div className="ripple-booking-wheel-head">
              <div>
                <span className="ripple-booking-step">01 — CHOISIR</span>
                <h2 id="ripple-booking-wheel-heading">Quand vous mariez-vous ?</h2>
              </div>
              <div className="ripple-booking-year" aria-label="Année du mariage">
                <button type="button" aria-label="Année précédente" disabled={year<=MIN_YEAR} onClick={()=>changeYear(year-1)}><ChevronLeft size={18}/></button>
                <strong>{year}</strong>
                <button type="button" aria-label="Année suivante" disabled={year>=MAX_YEAR} onClick={()=>changeYear(year+1)}><ChevronRight size={18}/></button>
              </div>
            </div>
            <div className="ripple-booking-wheel" data-testid="booking-date-circle" data-view={month===null?'year':'month'}>
              <div className="ripple-booking-wheel-rings" aria-hidden="true"/>
              {values.map(({n,label,angle})=>{
                const radians=(angle-90)*Math.PI/180;
                const left=50+radius*Math.cos(radians);
                const top=50+radius*Math.sin(radians);
                const disabled=month!==null&&!validFutureDay(isoDay(year,month,n));
                return <button type="button" key={n} disabled={disabled}
                  aria-label={month===null?MONTHS_FR[n-1]+' '+year:(n+' '+MONTHS_FR[month]+' '+year)}
                  aria-pressed={month!==null&&isSelected(n)}
                  className={'ripple-booking-dial-item '+(month===null?'ripple-booking-month':'ripple-booking-day')+(isSelected(n)?' is-selected':'')}
                  style={{left:left+'%',top:top+'%'}}
                  onClick={()=>month===null?selectMonth(n-1):selectDay(n)}>
                  {label}
                </button>;
              })}
              <div className="ripple-booking-wheel-center">
                <span>{month===null?'CALENDRIER':MONTHS_FR[month].toUpperCase()}</span>
                <strong>{date?day.slice(8,10):year}</strong>
                <small>{date?date.weekday:month===null?'Sélectionnez un mois':'Choisissez un jour'}</small>
                {month!==null&&<button type="button" className="ripple-booking-back" onClick={()=>{setMonth(null);setDay('');}}>
                  <ArrowLeft size={13}/> Les mois
                </button>}
              </div>
            </div>
            <label className="ripple-booking-date-field" htmlFor="ripple-booking-date">
              <CalendarDays size={17}/>
              <span>Ou saisir directement une date</span>
              <input id="ripple-booking-date" aria-label="Date du mariage" type="date"
                min={todayLocal()} max={isoDay(MAX_YEAR,11,31)}
                value={day} onChange={e=>fromInput(e.target.value)}/>
            </label>
            <p className="ripple-booking-underwheel">Le cercle affiche les mois puis les jours. Les dates passées sont désactivées.</p>
          </section>

          <aside className="ripple-booking-detail" aria-label="Votre mariage et disponibilités">
            <div className="ripple-booking-detail-top">
              <span className="ripple-booking-step">02 — DÉCOUVRIR</span>
              <span className="ripple-booking-demo-label"><ShieldCheck size={14}/> Demande sans engagement</span>
            </div>
            {date?(
              <>
                <p className="ripple-booking-date-weekday">{date.weekday}</p>
                <h2 className="ripple-booking-date-title">{date.heading}</h2>
                <div className="ripple-booking-status">
                  <span className="ripple-booking-status-dot"/>
                  <div><strong>{availability==='unknown'?'Disponibilité à confirmer':'Statut en attente'}</strong>
                    <p>Mon agenda professionnel n’est pas encore connecté à ce site. Aucun créneau n’est bloqué par cette sélection.</p>
                  </div>
                </div>
                <div className="ripple-booking-facts">
                  <div><span>Jour</span><strong>{date.weekday}</strong></div>
                  <div><span>Avant le mariage</span><strong>{date.daysAway} jours</strong></div>
                </div>
                <div className="ripple-booking-form">
                  <label htmlFor="ripple-booking-first">Votre prénom <span>facultatif</span></label>
                  <input id="ripple-booking-first" type="text" maxLength={65} autoComplete="given-name"
                    placeholder="Camille" value={firstName} onChange={e=>setFirstName(e.target.value)}/>
                  <label htmlFor="ripple-booking-city">Lieu du mariage <span>facultatif</span></label>
                  <input id="ripple-booking-city" type="text" maxLength={90} autoComplete="address-level2"
                    placeholder="Ville ou lieu de réception" value={city} onChange={e=>setCity(e.target.value)}/>
                  <label htmlFor="ripple-booking-moment">Le saxophone pour quel moment ?</label>
                  <select id="ripple-booking-moment" value={moment}
                    onChange={e=>setMoment(e.target.value as MomentChoice)}>
                    {MOMENTS.map(item=><option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                {mail&&<a className="ripple-booking-primary" href={mail} data-testid="booking-request">
                  <Mail size={18}/> Demander ma disponibilité <ArrowRight size={18}/>
                </a>}
                <p className="ripple-booking-form-note">Ouvre un courriel prérempli dans votre messagerie. La demande n’est pas envoyée automatiquement ; je vous confirmerai personnellement la disponibilité.</p>
              </>
            ):(
              <div className="ripple-booking-empty">
                <div className="ripple-booking-empty-icon"><CalendarDays size={29}/></div>
                <h2>Tout commence par une date.</h2>
                <p>Sélectionnez un mois, puis votre jour dans le cercle. Vous pourrez ensuite demander ma disponibilité et préciser les moments musicaux souhaités.</p>
                <div className="ripple-booking-next">
                  <span><CircleCheck size={18}/> Choisir une date</span>
                  <span><Music2 size={18}/> Imaginer la musique</span>
                  <span><UsersRound size={18}/> Rassembler les prestataires</span>
                </div>
              </div>
            )}
          </aside>
        </div>

        <section className="ripple-booking-beyond">
          <div className="ripple-booking-beyond-head">
            <p className="ripple-booking-step">03 — IMAGINER LA SUITE</p>
            <h2>Un seul jour. Toutes les personnes qui le rendent possible.</h2>
            <p>À terme, la date deviendra le point d'entrée du conducteur, des prestataires, de la musique et des souvenirs — sans multiplier les tableaux et les messages.</p>
          </div>
          <div className="ripple-booking-path">
            <div><Clock3 size={22}/><strong>Avant</strong><span>Disponibilités, devis et préparation</span></div>
            <div><Sparkles size={22}/><strong>Pendant</strong><span>Programme commun, décisions et moments</span></div>
            <div><UsersRound size={22}/><strong>Après</strong><span>Photos et souvenirs réunis au bon instant</span></div>
          </div>
          <div className="ripple-booking-partners">
            <div>
              <strong>Vous êtes prestataire de mariage ?</strong>
              <p>Photographe, DJ, lieu, traiteur, wedding planner… Un futur réseau de coordination se prépare.</p>
            </div>
            <a href={'mailto:bookingmattmezsax@gmail.com?subject='+encodeURIComponent('RIPPLECIRCLE · Intérêt pour rejoindre le réseau de prestataires')}>
              Proposer ma participation <ArrowRight size={15}/>
            </a>
          </div>
          <p className="ripple-booking-footer">RIPPLECIRCLE · Prototype de prise de contact. Aucun agenda synchronisé, aucun paiement et aucune réservation effective sur cette page.</p>
        </section>
      </div>
    </main>
  );
};
