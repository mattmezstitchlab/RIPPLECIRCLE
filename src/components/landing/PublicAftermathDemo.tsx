import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronRight, ClipboardCopy, Eye, Film, ListChecks, Pause, Play, RotateCcw, ShieldAlert } from 'lucide-react';
import { buildDraftAssignments, buildPublicReplay, chooseDemoPlan, replayComparison, traceIndirectEffects } from '../../utils/publicAftermath';
import type { PublicMode, RepairId } from '../../utils/publicSimulation';

interface Props {
  mode:PublicMode;
  delay:number;
  selectedPlan:RepairId|null;
  onMode:(mode:PublicMode)=>void;
  onMinute:(minute:number)=>void;
}
type V4Mode='indirect'|'dispatch'|'replay';
const v4Modes:{id:V4Mode;label:string;icon:React.ElementType}[]=[
  {id:'indirect',label:'Impacts cachés',icon:Eye},
  {id:'dispatch',label:'Répartir les actions',icon:ListChecks},
  {id:'replay',label:'Rejouer',icon:Film}
];
export const PublicAftermathDemo:React.FC<Props>=({mode,delay,selectedPlan,onMode,onMinute})=>{
  const effects=useMemo(()=>traceIndirectEffects(delay),[delay]);
  const assignments=useMemo(()=>buildDraftAssignments(delay,selectedPlan),[delay,selectedPlan]);
  const plan=useMemo(()=>chooseDemoPlan(delay,selectedPlan),[delay,selectedPlan]);
  const frames=useMemo(()=>buildPublicReplay(delay,selectedPlan),[delay,selectedPlan]);
  const outcome=useMemo(()=>replayComparison(delay,selectedPlan),[delay,selectedPlan]);
  const [ready,setReady]=useState<string[]>([]);
  const [copyState,setCopyState]=useState<'idle'|'copied'|'error'>('idle');
  const [playing,setPlaying]=useState(false);
  const [replayIndex,setReplayIndex]=useState(0);
  // Prevent callback identity changes from replaying an unchanged frame.
  const onMinuteRef=useRef(onMinute);onMinuteRef.current=onMinute;
  useEffect(()=>{setReady([]);setCopyState('idle');setPlaying(false);setReplayIndex(0);},[delay,selectedPlan]);
  useEffect(()=>{
    if(mode!=='replay') {setPlaying(false);return;}
    onMinuteRef.current(frames[Math.min(replayIndex,frames.length-1)].minute);
  },[mode,replayIndex,frames]);
  useEffect(()=>{
    if(mode!=='replay'||!playing)return;
    const timer=window.setInterval(()=>{
      setReplayIndex(i=>{
        if(i>=frames.length-1) {setPlaying(false);return i;}
        return i+1;
      });
    },1150);
    return ()=>window.clearInterval(timer);
  },[mode,playing,frames.length]);
  const jump=(index:number)=>{setPlaying(false);setReplayIndex(index);};
  const copy=async()=>{
    const text=['RIPPLECIRCLE · Préparation fictive · aucun envoi',
      'Retard hypothétique : +'+delay+' min',
      'Option : '+plan.title,
      ...assignments.map(a=>a.actor+' — '+a.task)].join('\n');
    try {
      if(!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);setCopyState('copied');
    } catch {setCopyState('error');}
  };
  return (
    <section className="ripple-v4" aria-label="Explorer les conséquences, actions et replay">
      <details className="ripple-v6-advanced-tools">
        <summary>Autres outils · impacts et actions</summary>
        <div className="ripple-v4-nav" role="group" aria-label="Outils complémentaires de démonstration">
        {v4Modes.map(item=>{
          const Icon=item.icon;
          return <button type="button" key={item.id} aria-pressed={mode===item.id}
            className="ripple-v4-tab" onClick={()=>onMode(mode===item.id?'observe':item.id)}>
            <Icon className="w-3.5 h-3.5" aria-hidden="true"/>{item.label}
          </button>;
        })}
        </div>
      </details>
      {mode==='indirect'&&(
        <div className="ripple-v4-body">
          <header className="ripple-v4-heading">
            <div><strong>Conséquences indirectes</strong><p>Chaînes de dépendances hypothétiques autour du retard traiteur.</p></div>
            <span className="ripple-sim-tag">Simulation</span>
          </header>
          <div className="ripple-v4-statline">
            <span>{effects.filter(e=>e.depth>1).length} effets indirects</span>
            <span>{effects.filter(e=>e.status==='hypothese').length} à vérifier</span>
          </div>
          {effects.length===0?<p className="ripple-v4-empty">À +0 minute, aucun effet n'est projeté. Choisissez un retard dans « Simuler un imprévu ».</p>:
            <ol className="ripple-v4-impacts">{effects.filter(e=>e.depth>1).map(e=>
              <li key={e.id}>
                <div className="ripple-v4-impact-top">
                  <strong>{e.label}</strong>
                  <span className={e.status==='hypothese'?'ripple-v4-uncertain':'ripple-v4-scheduled'}>
                    {e.status==='hypothese'?'Hypothèse':'Déduit du programme'}
                  </span>
                </div>
                <p>{e.explanation}</p>
                <small>{e.actor} · Niveau {e.depth} · {e.path.join(' → ')}</small>
              </li>
            )}</ol>}
          <p className="ripple-v4-warning"><ShieldAlert className="w-4 h-4"/> Les signaux lumière, photo, transport et logistique sont des pistes à vérifier, pas des défaillances détectées.</p>
        </div>
      )}
      {mode==='dispatch'&&(
        <div className="ripple-v4-body">
          <header className="ripple-v4-heading">
            <div><strong>Répartir les actions</strong><p>Des consignes préparées pour chaque rôle, sans messagerie ni transmission automatique.</p></div>
            <span className="ripple-sim-tag">Brouillon local</span>
          </header>
          <p className="ripple-v4-plan-label">Option de démonstration : <strong>{plan.title}</strong>{!selectedPlan&&' (meilleur score fictif)'}</p>
          {!selectedPlan&&<button type="button" className="ripple-context-action" onClick={()=>onMode('repair')}>
            Choisir un autre plan <ChevronRight className="w-3.5 h-3.5"/>
          </button>}
          {assignments.length===0?<p className="ripple-v4-empty">Aucune action à préparer sans retard.</p>:
            <div className="ripple-v4-assignments">{assignments.map(a=>{
              const isReady=ready.includes(a.id);
              return <div key={a.id} className="ripple-v4-assignment">
                <span className="ripple-v4-avatar" aria-hidden="true">{a.actor.slice(0,1)}</span>
                <div className="ripple-v4-task"><strong>{a.actor}</strong><p>{a.task}</p><small>{a.timing}</small></div>
                <button type="button" aria-pressed={isReady} aria-label={'Marquer préparé : '+a.actor}
                  onClick={()=>setReady(all=>isReady?all.filter(id=>id!==a.id):[...all,a.id])}
                  className="ripple-v4-ready">{isReady?<><Check className="w-3.5 h-3.5"/>Prêt</>:'Préparer'}</button>
              </div>;
            })}</div>}
          <div className="ripple-v4-toolbar">
            <span>{ready.length}/{assignments.length} actions préparées ici</span>
            <button type="button" className="ripple-context-action" onClick={copy} disabled={!assignments.length}>
              <ClipboardCopy className="w-3.5 h-3.5"/> Copier les consignes
            </button>
          </div>
          {copyState!=='idle'&&<p role="status" className="ripple-v4-notice">{copyState==='copied'?'Consignes copiées. Aucun envoi effectué.':'Copie non autorisée par le navigateur.'}</p>}
          <p className="ripple-v4-warning"><ShieldAlert className="w-4 h-4"/> Ces états « Prêt » ne sont pas sauvegardés ni envoyés aux prestataires : démonstration uniquement.</p>
        </div>
      )}
      {mode==='replay'&&(
        <div className="ripple-v4-body">
          <header className="ripple-v4-heading">
            <div><strong>Rejouer la journée</strong><p>Chronologie reconstruite de la référence et des conséquences simulées.</p></div>
            <span className="ripple-sim-tag">Non historique</span>
          </header>
          <div className="ripple-v4-replay-controls">
            <button type="button" className="ripple-v4-play" aria-label={playing?'Mettre le rejeu en pause':'Lancer le rejeu'}
              onClick={()=>{
                if(playing){setPlaying(false);return;}
                if(replayIndex>=frames.length-1)setReplayIndex(0);
                setPlaying(true);
              }}>
              {playing?<Pause className="w-4 h-4"/>:<Play className="w-4 h-4"/>}
              {playing?'Pause':'Rejouer'}
            </button>
            <button type="button" className="ripple-context-action" onClick={()=>jump(0)}>
              <RotateCcw className="w-3.5 h-3.5"/> Revenir au début
            </button>
            <span className="ripple-v4-frame-counter">{replayIndex+1}/{frames.length}</span>
          </div>
          <label htmlFor="ripple-v4-replay-index" className="ripple-context-caption">Parcourir les étapes</label>
          <input id="ripple-v4-replay-index" aria-label="Étape du rejeu fictif" type="range"
            min={0} max={frames.length-1} step={1} value={replayIndex}
            onChange={e=>jump(Number(e.target.value))} className="ripple-instant-slider"/>
          <div className="ripple-v4-current-frame" role="status" aria-live="polite">
            <span>{frames[replayIndex].status} · {frames[replayIndex].title}</span>
            <strong>{frames[replayIndex].description}</strong>
          </div>
          <ol className="ripple-v4-frames">{frames.map((frame,i)=>
            <li key={frame.id}>
              <button type="button" aria-current={i===replayIndex?'step':undefined}
                className="ripple-v4-frame" onClick={()=>jump(i)}>
                <span className="ripple-v4-dot"/>
                <span className="ripple-v4-frame-copy"><strong>{frame.title}</strong><small>{frame.status}</small></span>
                <span>{new Date(2026,0,1,17,0+frame.minute).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</span>
              </button>
            </li>
          )}</ol>
          <div className="ripple-v4-recap">
            <div><span>Référence</span><strong>{outcome.reference}</strong></div>
            <div><span>Sans plan</span><strong>{outcome.withoutPlan}</strong></div>
            <div><span>Avec option</span><strong>{outcome.withPlan??'Non choisi'}</strong></div>
          </div>
          <p className="ripple-v4-warning"><ShieldAlert className="w-4 h-4"/> Aucun journal réel enregistré : ce rejeu est construit à partir des scénarios préparés et de l'option actuellement choisie.</p>
        </div>
      )}
    </section>
  );
};
