import React,{useEffect,useMemo,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Camera,Check,Clock3,Music2,Pause,Play,Plus,RotateCcw,Trash2,Volume2,VolumeX} from 'lucide-react';
import {sfx} from '../../utils/audio';
import {usePersistentState} from '../../hooks/usePersistentState';
import {
  PHASES,ROLES,DEMO_SEGMENTS,GRID_MINUTES,boundsForSegment,getPhase,getRole,
  phaseRoles,isValidSegment,overlaps,sanitizeSegments,segmentsOf,snapMinute,timeLabel,
  type Phase,type PhaseId,type Role,type RoleId,type Segment
} from '../../data/weddingScore';

const C=360;
const RADII=[310,270,230,190,150];
const rpos=(radius:number,angle:number)=>({
  x:C+radius*Math.sin(angle*Math.PI/180),
  y:C-radius*Math.cos(angle*Math.PI/180)
});
const minuteAngle=(minute:number,p:Phase)=>-100+(minute-p.start)/(p.end-p.start)*200;
const arc=(r:number,a:number,b:number)=>{
  const start=rpos(r,a),end=rpos(r,b);
  return 'M '+start.x.toFixed(2)+' '+start.y.toFixed(2)+' A '+r+' '+r+' 0 '+(Math.abs(b-a)>180?1:0)+' 1 '+end.x.toFixed(2)+' '+end.y.toFixed(2);
};
const colorFor=(role:Role)=>({
  image:'#0A84FF',music:'#E25D98',food:'#E69B39',coordination:'#34A77B',decoration:'#9669DC'
})[role.family];
const GRID_PX=40;
const uid=()=> 'local-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
const timeFromInput=(str:string,phase:Phase):number|null=>{
  if(!/^\d{2}:\d{2}$/.test(str))return null;
  const [hours,minutes]=str.split(':').map(Number);
  if(hours>23||minutes>59)return null;
  let value=hours*60+minutes;
  if(phase.end>1440&&value<phase.start) value+=1440;
  return snapMinute(value);
};
interface PointerOperation {
  type:'add'|'move'|'resize';
  initial:Segment; pointerId:number; fromX:number; width:number;
}
export const WeddingScore:React.FC=()=>{
  const [phaseId,setPhaseId]=useState<PhaseId>('cocktail');
  const [roleId,setRoleId]=useState<RoleId>('photo');
  const [stored,setStored]=usePersistentState<Segment[]>('ripple.v9.score.segments',[...DEMO_SEGMENTS]);
  const segments=useMemo(()=>sanitizeSegments(stored),[stored]);
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [focusZoom,setFocusZoom]=useState(false);
  const [soundOn,setSoundOn]=useState(true);
  const [playing,setPlaying]=useState(false);
  const [cursor,setCursor]=useState(getPhase('cocktail').start);
  const [preview,setPreview]=useState<Segment|null>(null);
  const [message,setMessage]=useState('');
  const pointer=useRef<PointerOperation|null>(null);
  const asideRef=useRef<HTMLElement|null>(null);
  const phase=getPhase(phaseId);
  const activeRole=getRole(roleId);
  const selected=segments.find(s=>s.id===selectedId)||null;
  const phaseItems=segmentsOf(segments,phaseId);
  const roleItems=phaseRoles(phaseId);
  const collisions=phaseItems.filter((s,i,all)=>all.some((other,j)=>j!==i&&overlaps(s,other)));
  const total=segments.length;
  const trackWidth=Math.max(540,(phase.end-phase.start)/GRID_MINUTES*GRID_PX);
  const zoomPoint=rpos(RADII[PHASES.findIndex(p=>p.id===phaseId)],165);
  const span=focusZoom?470:720;
  const viewBox=focusZoom
    ? [(C+(zoomPoint.x-C)*0.57-span/2),(C+(zoomPoint.y-C)*0.57-span/2),span,span].join(' ')
    : '0 0 720 720';

  const note=(role:Role,success=false)=>{
    if(!soundOn)return;
    sfx.enabled=true;
    sfx.playBlip(success?role.sound*1.5:role.sound,success?0.10:0.075);
  };
  const selectPhase=(id:PhaseId)=>{
    const roles=phaseRoles(id);
    setPlaying(false);setPhaseId(id);
    if(!roles.some(r=>r.id===roleId))setRoleId(roles[0].id);
    setSelectedId(null);setFocusZoom(false);setCursor(getPhase(id).start);
    note(roles[0]);setMessage('');
  };
  const selectRole=(id:RoleId,idPhase:PhaseId=phaseId)=>{
    setPlaying(false);setPhaseId(idPhase);setRoleId(id);setSelectedId(null);
    setFocusZoom(true);setCursor(getPhase(idPhase).start);
    note(getRole(id));setMessage('Piste sélectionnée — glisser sur la grille pour placer un segment.');
    if(window.innerWidth<900)window.requestAnimationFrame(()=>asideRef.current?.scrollIntoView({behavior:'smooth',block:'start'}));
  };
  const save=(segment:Segment)=>{
    if(!isValidSegment(segment))return;
    setStored(current=>{
      const cleaned=sanitizeSegments(current);
      return cleaned.some(x=>x.id===segment.id)
        ? cleaned.map(x=>x.id===segment.id?segment:x)
        : [...cleaned,segment];
    });
    setSelectedId(segment.id);
    const conflict=segments.some(x=>overlaps(x,segment));
    setMessage(conflict?'Deux interventions se chevauchent sur la même piste. Vérifiez les horaires.':'Segment placé sur la partition locale.');
    note(getRole(segment.roleId),true);
  };
  const remove=()=>{
    if(!selected)return;
    setStored(current=>sanitizeSegments(current).filter(s=>s.id!==selected.id));
    setSelectedId(null);setMessage('Segment retiré de la partition locale.');
    if(soundOn)sfx.playBlip(440,0.08);
  };
  const add=(id:RoleId=roleId)=>{
    const duration=Math.min(45,phase.end-phase.start);
    let start=phase.start;
    while(start+duration<=phase.end&&segments.some(s=>s.phaseId===phase.id&&s.roleId===id&&start<s.end&&s.start<start+duration)){
      start+=GRID_MINUTES;
    }
    if(start+duration>phase.end){setMessage('La piste est déjà occupée : déplacer un segment existant.');return;}
    save({id:uid(),phaseId:phase.id,roleId:id,start,end:start+duration});
  };
  const fromX=(e:React.PointerEvent<HTMLDivElement>):number=>{
    const rect=e.currentTarget.getBoundingClientRect();
    const proportion=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));
    return Math.max(phase.start,Math.min(phase.end-GRID_MINUTES,snapMinute(phase.start+proportion*(phase.end-phase.start))));
  };
  const compute=(op:PointerOperation,clientX:number):Segment=>{
    const dt=snapMinute((clientX-op.fromX)/op.width*(phase.end-phase.start));
    if(op.type==='move'){
      const result=boundsForSegment(phase,op.initial.start+dt,op.initial.end+dt);
      return {...op.initial,...result};
    }
    if(op.type==='resize'){
      const result=boundsForSegment(phase,op.initial.start,Math.max(op.initial.start+GRID_MINUTES,op.initial.end+dt));
      return {...op.initial,...result};
    }
    const end=Math.max(op.initial.start+GRID_MINUTES,op.initial.end+dt);
    return {...op.initial,...boundsForSegment(phase,op.initial.start,end)};
  };
  const onTrackDown=(e:React.PointerEvent<HTMLDivElement>,r:Role)=>{
    if(e.button!==0)return;
    const target=e.target as Element;
    const segmentEl=target.closest('[data-segment-id]');
    const id=segmentEl?.getAttribute('data-segment-id');
    const old=segments.find(s=>s.id===id&&s.roleId===r.id&&s.phaseId===phase.id);
    const start=fromX(e);
    const initial=old||{id:uid(),phaseId:phase.id,roleId:r.id,start,end:Math.min(phase.end,start+30)};
    const type=old?(target.closest('[data-resize-end]')?'resize':'move'):'add';
    pointer.current={type,initial,pointerId:e.pointerId,fromX:e.clientX,width:e.currentTarget.getBoundingClientRect().width};
    setPreview(initial);setRoleId(r.id);setSelectedId(initial.id);
    setFocusZoom(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const onTrackMove=(e:React.PointerEvent<HTMLDivElement>)=>{
    const op=pointer.current;
    if(!op||e.pointerId!==op.pointerId)return;
    setPreview(compute(op,e.clientX));
  };
  const onTrackEnd=(e:React.PointerEvent<HTMLDivElement>)=>{
    const op=pointer.current;
    if(!op||e.pointerId!==op.pointerId)return;
    pointer.current=null;
    const next=compute(op,e.clientX);
    setPreview(null);
    save(next);
    if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const onTrackCancel=()=>{pointer.current=null;setPreview(null);};
  useEffect(()=>{
    if(!playing)return;
    const id=window.setInterval(()=>setCursor(current=>Math.min(phase.end,current+GRID_MINUTES)),620);
    return ()=>window.clearInterval(id);
  },[playing,phase.end]);
  useEffect(()=>{
    if(!playing)return;
    if(cursor>=phase.end){setPlaying(false);return;}
    const begins=phaseItems.filter(s=>s.start===cursor);
    for(const s of begins)note(getRole(s.roleId),true);
  // Preview is intentionally triggered only after the user presses Play.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[cursor,playing]);
  const togglePlay=()=>{
    if(playing){setPlaying(false);return;}
    setCursor(phase.start);setPlaying(true);note(activeRole);
  };
  const moveField=(edge:'start'|'end',value:string)=>{
    if(!selected)return;
    const number=timeFromInput(value,phase);
    if(number===null)return;
    const candidate=edge==='start'
      ? {...selected,...boundsForSegment(phase,number,number+(selected.end-selected.start))}
      : {...selected,...boundsForSegment(phase,selected.start,number)};
    save(candidate);
  };
  return (
    <main className="ripple-score-page" data-testid="wedding-score">
      <header className="ripple-score-hero">
        <div>
          <p className="ripple-score-eyebrow">RIPPLECIRCLE / STUDIO · DÉMONSTRATION LOCALE</p>
          <h1>Composez votre journée.</h1>
          <p>Chaque cercle est une phase. Chaque métier devient une piste. Chaque intervention est un segment que vous placez comme une note.</p>
        </div>
        <div className="ripple-score-hero-meta">
          <strong>{PHASES.length} phases</strong>
          <span>{total} segments en mémoire locale</span>
          <button type="button" onClick={()=>{setStored([...DEMO_SEGMENTS]);setPhaseId('cocktail');setRoleId('photo');setSelectedId(null);setFocusZoom(false);setPlaying(false);setMessage('Exemple rétabli.');}}>
            <RotateCcw size={14}/> Réinitialiser l’exemple
          </button>
        </div>
      </header>

      <div className="ripple-score-layout">
        <section className="ripple-score-disc-area" aria-label="Cercles des phases du mariage">
          <div className="ripple-score-disc-top">
            <div><span className="ripple-score-small">LA PARTITION DU MARIAGE</span>
              <h2>Les cinq phases en un regard</h2></div>
            <button type="button" onClick={()=>setFocusZoom(false)} disabled={!focusZoom} className="ripple-score-disc-reset"><RotateCcw size={15}/> Vue entière</button>
          </div>
          <div className="ripple-score-disc-wrap">
            <svg viewBox={viewBox} className="ripple-score-disc" role="img" aria-label="Cadran concentrique, cinq phases de l’extérieur vers l’intérieur" data-testid="phase-circle">
              {PHASES.map((p,i)=>{
                const r=RADII[i],active=p.id===phaseId,roles=phaseRoles(p.id);
                const items=segmentsOf(segments,p.id);
                const markerTimes:Array<number>=[];
                for(let t=p.start;t<=p.end;t+=60)markerTimes.push(t);
                if(!markerTimes.includes(p.end))markerTimes.push(p.end);
                return <g key={p.id} data-phase={p.id}>
                  <circle cx={C} cy={C} r={r} fill="none" stroke={p.color} strokeWidth={active?35:32} opacity={active?.18:.09}/>
                  <circle cx={C} cy={C} r={r} fill="none" stroke={p.color} strokeWidth={active?3:1.5} opacity={active?1:.42}/>
                  <circle cx={C} cy={C} r={r} fill="none" stroke="transparent" strokeWidth="40" className="ripple-score-ring-hit"
                    onClick={()=>selectPhase(p.id)} aria-label={'Phase '+p.label}/>
                  {items.map(seg=>{
                    const role=getRole(seg.roleId);
                    return <path key={seg.id} d={arc(r,minuteAngle(seg.start,p),minuteAngle(seg.end,p))}
                      stroke={colorFor(role)} strokeWidth={active?11:7} strokeLinecap="round" fill="none"
                      opacity={active?1:.7} className="ripple-score-arc"
                      onClick={()=>{selectRole(role.id,p.id);setSelectedId(seg.id);}}/>;
                  })}
                  {markerTimes.filter((_,j)=>j===0||j===markerTimes.length-1||j%2===0).map(t=>{
                    const point=rpos(r,minuteAngle(t,p));
                    return <text key={t} x={point.x} y={point.y+4} fill="currentColor"
                      textAnchor="middle" fontSize={active?12:10} fontWeight={active?800:650}
                      opacity={active?.92:.54}>{timeLabel(t)}</text>;
                  })}
                  {roles.map((role,j)=>{
                    const point=rpos(r,130+j*(100/Math.max(roles.length-1,1)));
                    const isSelected=active&&role.id===roleId;
                    return <g key={role.id} role="button" tabIndex={0} className="ripple-score-role-dot"
                      aria-label={role.label+' · '+p.label} data-testid={'role-dot-'+p.id+'-'+role.id}
                      onClick={()=>selectRole(role.id,p.id)}
                      onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectRole(role.id,p.id);}}}>
                      <circle cx={point.x} cy={point.y} r={isSelected?15:11} fill={colorFor(role)} stroke="#fff" strokeWidth={isSelected?4:3}/>
                      {isSelected&&<circle cx={point.x} cy={point.y} r="20" fill="none" stroke={p.color} strokeWidth="2"/>}
                      <title>{role.label} · {p.label} · sélectionner et écouter</title>
                    </g>;
                  })}
                  {(()=>{const a=rpos(r,266);return <text x={a.x} y={a.y} fontSize={active?13:11} fill="currentColor" fontWeight="800"
                    textAnchor="middle" dominantBaseline="central">{p.label}</text>;})()}
                </g>;
              })}
              <circle cx={C} cy={C} r="114" fill="#fff" opacity=".97"/>
              <circle cx={C} cy={C} r="113" fill="none" stroke="#ECEEF1" strokeWidth="1"/>
              <text x={C} y={C-24} textAnchor="middle" fontSize="12" letterSpacing="1.6" fill="#86868b">PHASE SÉLECTIONNÉE</text>
              <text x={C} y={C+3} textAnchor="middle" fontSize="26" fontWeight="850" fill="#1d1d1f">{phase.label}</text>
              <text x={C} y={C+28} textAnchor="middle" fontSize="15" fontWeight="650" fill="#65656b">{timeLabel(phase.start)} — {timeLabel(phase.end)}</text>
              <text x={C} y={C+52} textAnchor="middle" fontSize="12" fill="#86868b">{focusZoom?activeRole.label:'Touchez un point coloré'}</text>
            </svg>
          </div>
          <div className="ripple-score-legend">
            {PHASES.map(p=><button type="button" key={p.id} className={p.id===phaseId?'is-active':''}
              onClick={()=>selectPhase(p.id)} aria-pressed={p.id===phaseId}>
              <span style={{background:p.color}}/><strong>{p.label}</strong><small>{timeLabel(p.start)}</small>
            </button>)}
          </div>
          <p className="ripple-score-explainer">Anneaux de l’extérieur vers l’intérieur : phases successives · heures propres à chaque phase · notes colorées = métiers possibles.</p>
        </section>

        <aside ref={asideRef} className="ripple-score-inspector" aria-label="Éditeur du moment sélectionné">
          <div className="ripple-score-inspector-head">
            <span className="ripple-score-small">UN SEUL PANNEAU CONTEXTUEL</span>
            <span className="ripple-score-phase-time"><Clock3 size={14}/>{timeLabel(phase.start)} – {timeLabel(phase.end)}</span>
          </div>
          <h2>{phase.label}</h2>
          <p className="ripple-score-inspector-lead">Touchez un métier. Une note retentit, le cadran zoome et sa piste s’ouvre.</p>
          <div className="ripple-score-palette" aria-label="Taxonomie des métiers du moment">
            {roleItems.map(role=><button type="button" key={role.id}
              className={roleId===role.id?'is-active':''}
              onClick={()=>selectRole(role.id)} aria-pressed={roleId===role.id}
              data-testid={'palette-'+role.id}>
              <span className="ripple-score-palette-dot" style={{background:colorFor(role)}}/>
              {role.label}
              {segmentsOf(segments,phaseId,role.id).length>0&&<span className="ripple-score-palette-count">{segmentsOf(segments,phaseId,role.id).length}</span>}
            </button>)}
          </div>
          <div className="ripple-score-selected">
            <span className="ripple-score-small">PISTE OUVERTE</span>
            <h3>{activeRole.label}</h3>
            <div className="ripple-score-selected-meta">
              <span>{segmentsOf(segments,phase.id,roleId).length} intervention(s)</span>
              <span>Grille · 15 min</span>
            </div>
            <button type="button" className="ripple-score-add" onClick={()=>add()} data-testid="score-add-segment">
              <Plus size={17}/> Ajouter un segment
            </button>
          </div>
          {selected&&selected.phaseId===phase.id&&(
            <div className="ripple-score-segment-editor" data-testid="score-segment-editor">
              <div className="ripple-score-editor-top"><strong>Intervention sélectionnée</strong>
                <button type="button" onClick={remove} aria-label="Supprimer le segment"><Trash2 size={17}/></button></div>
              <div className="ripple-score-editor-fields">
                <label>Début<input aria-label="Début du segment" type="time" step={900}
                  value={timeLabel(selected.start)} onChange={e=>moveField('start',e.target.value)}/></label>
                <label>Fin<input aria-label="Fin du segment" type="time" step={900}
                  value={timeLabel(selected.end)} onChange={e=>moveField('end',e.target.value)}/></label>
              </div>
              <p>Déplacez le clip pour changer son horaire ; attrapez sa bordure droite pour ajuster sa durée.</p>
            </div>
          )}
          {message&&<p className="ripple-score-message" role="status">{message}</p>}
          <div className="ripple-score-truth">
            <Check size={16}/> Exemple enregistré uniquement dans ce navigateur. Ces métiers ne sont pas des professionnels vérifiés ou disponibles.
          </div>
        </aside>
      </div>

      <section className="ripple-score-sequencer" aria-label="Partition du moment — édition sur pistes">
        <div className="ripple-score-sequencer-head">
          <div><span className="ripple-score-small">STUDIO DE COMPOSITION TEMPORELLE</span>
            <h2>La partition de « {phase.label} »</h2>
            <p>Chaque ligne est un métier. Cliquez pour créer ; glissez les blocs pour arranger la journée.</p></div>
          <div className="ripple-score-transport">
            <button type="button" onClick={togglePlay} aria-label={playing?'Mettre la partition en pause':'Écouter la partition'} data-testid="score-play">
              {playing?<Pause size={16}/>:<Play size={16}/>} {playing?'Pause':'Écouter'}
            </button>
            <button type="button" onClick={()=>{setPlaying(false);setCursor(phase.start);}} aria-label="Remettre au début"><RotateCcw size={16}/></button>
            <button type="button" aria-label={soundOn?'Couper les sons':'Activer les sons'} onClick={()=>{
              setSoundOn(v=>{sfx.enabled=!v;return !v;});
            }}>{soundOn?<Volume2 size={16}/>:<VolumeX size={16}/>}</button>
          </div>
        </div>
        <div className="ripple-score-tracks-scroll">
          <div className="ripple-score-tracks" style={{minWidth:trackWidth+160}}>
            <div className="ripple-score-axis">
              <span>PISTES</span>
              <div className="ripple-score-track-track">
                {Array.from({length:Math.ceil((phase.end-phase.start)/30)+1},(_,n)=>{
                  const t=phase.start+n*30;
                  return t<=phase.end?<span key={t} style={{left:((t-phase.start)/(phase.end-phase.start)*100)+'%'}}>{timeLabel(t)}</span>:null;
                })}
              </div>
            </div>
            {roleItems.map(role=>{
              const roleSegments=segmentsOf(segments,phase.id,role.id);
              const moving=preview&&preview.roleId===role.id&&preview.phaseId===phase.id?preview:null;
              const visible=roleSegments.filter(seg=>seg.id!==moving?.id).concat(moving?[moving]:[]);
              return <div key={role.id} className={'ripple-score-track-row '+(role.id===roleId?'is-active':'')}>
                <button type="button" className="ripple-score-track-label" onClick={()=>selectRole(role.id)}>
                  <span className="ripple-score-track-led" style={{background:colorFor(role)}}/>
                  <span>{role.label}</span>
                </button>
                <div className="ripple-score-track-track ripple-score-track-lane"
                  data-testid={'score-track-'+role.id}
                  role="group" aria-label={'Piste '+role.label}
                  onPointerDown={e=>onTrackDown(e,role)}
                  onPointerMove={onTrackMove} onPointerUp={onTrackEnd} onPointerCancel={onTrackCancel}>
                  {visible.map(seg=>{
                    const left=(seg.start-phase.start)/(phase.end-phase.start)*100;
                    const width=(seg.end-seg.start)/(phase.end-phase.start)*100;
                    return <button key={seg.id} type="button" data-segment-id={seg.id}
                      aria-label={role.label+' de '+timeLabel(seg.start)+' à '+timeLabel(seg.end)}
                      className={'ripple-score-clip '+(seg.id===selectedId?'is-selected':'')}
                      style={{left:left+'%',width:width+'%',background:colorFor(role)}}>
                      <span>{timeLabel(seg.start)} · {role.label}</span><span data-resize-end className="ripple-score-clip-resize" aria-label="Redimensionner"/>
                    </button>;
                  })}
                  {playing&&<div className="ripple-score-playhead" aria-hidden="true"
                    style={{left:((cursor-phase.start)/(phase.end-phase.start)*100)+'%'}}/>}
                </div>
              </div>;
            })}
          </div>
        </div>
        {collisions.length>0&&<p className="ripple-score-warning">Certains blocs du même métier se chevauchent. Vérifiez ces interventions avant de partager la partition.</p>}
        <p className="ripple-score-note">Les sons de la lecture sont des repères musicaux de démonstration, pas les morceaux réels. Les durées restent des heures civiles, distinctes du BPM d’une composition.</p>
      </section>
      <footer className="ripple-score-footer">
        <Camera size={16}/> Étape suivante : relier chaque clip à un prestataire, son tarif, son agenda et ses conditions — seulement après vérification réelle.
        <a href="#booking">Site Matt Mez Sax <ArrowRight size={14}/></a>
      </footer>
    </main>
  );
};
