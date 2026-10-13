// RIPPLECIRCLE — vanilla three.js module
// Standalone implementation: 7 concentric rings, nodes/links, Dijkstra propagation,
// orbit controls, explodable, flip to watch case-back, localStorage persistence.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// ---------- constants ----------
const PAPER = 0xf3f1ea;
const PAPER_LIGHT = 0xfaf9f5;
const INK = 0x252822;
const MUTED = 0x797b72;
const LINE = 0xd4d3c8;
const GOLD = 0xa5864c;
const BLUE = 0x668693;
const GREEN = 0x66816a;
const TITANIUM = 0xbec4bc;
const SILVER = 0xe4e6dd;
const LIGHT_METAL = 0xf0f0e5;
const DARK_METAL = 0x30372e;
const ENAMEL = 0xe7e8dc;
const NODE_OBSERVED = 0x283029;
const NODE_PREDICTED = 0x688c9c;
const NODE_PROPOSED = 0xb99a62;
const NODE_CONFIRMED = 0xf0f3e8;

const RING_DEFS = [
  { id: 'cal',       index: 0, radius: 8.0, width: 0.34, depth: 0.18, label: 'CALENDRIER',   short: 'CAL',  letter: 'A' },
  { id: 'time',      index: 1, radius: 6.8, width: 0.34, depth: 0.18, label: 'TEMPS',        short: 'TIME', letter: 'B' },
  { id: 'people',    index: 2, radius: 5.6, width: 0.34, depth: 0.18, label: 'PERSONNES',    short: 'PEPL', letter: 'C' },
  { id: 'relations', index: 3, radius: 4.5, width: 0.34, depth: 0.18, label: 'RELATIONS',    short: 'REL',  letter: 'D' },
  { id: 'moments',   index: 4, radius: 3.5, width: 0.30, depth: 0.16, label: 'MOMENTS',      short: 'MOM',  letter: 'E' },
  { id: 'orchestrate', index: 5, radius: 2.6, width: 0.26, depth: 0.14, label: 'ORCHESTRATION', short: 'ORCH', letter: 'F' },
  { id: 'memory',    index: 6, radius: 1.8, width: 0.24, depth: 0.12, label: 'MÉMOIRE',      short: 'MEM',  letter: 'G' }
];
const MONTHS = ['JANV.','FÉVR.','MARS','AVR.','MAI','JUIN','JUIL.','AOÛT','SEPT.','OCT.','NOV.','DÉC.'];
const DEFAULT_NAMES = ['Aube','Cal','Télia','Mori','Iris','Léo','Sage','Noé','Ivy','Rho','Véra','Tom'];

const stateColor = { OBSERVED: NODE_OBSERVED, PREDICTED: NODE_PREDICTED, PROPOSED: NODE_PROPOSED, CONFIRMED: NODE_CONFIRMED };
const stateIndex = { OBSERVED: 0, PREDICTED: 1, PROPOSED: 2, CONFIRMED: 3 };

// ---------- DOM ----------
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

const viewport = $('#viewport');
const tooltipEl = $('#tooltip');
const tooltipName = $('#tooltip-name');
const tooltipId = $('#tooltip-id');
const loadingEl = $('#loading');
const loadingTitle = $('#loading-title');
const loadingDetail = $('#loading-detail');
const liveStatus = $('#live-status');
const frameTop = $('#frame-top');
const frameBottom = $('#frame-bottom');
const playBtn = $('#play');
const playIcon = $('#play-icon');
const playText = $('#play-text');
const explodeInput = $('#explode-input');
const explodeValue = $('#explode-value');
const timelineInput = $('#timeline-input');
const dayLabel = $('#day-label');
const timeLabel = $('#time-label');
const resetBtn = $('#reset-view');
const zoomInBtn = $('#zoom-in');
const zoomOutBtn = $('#zoom-out');
const zoomNextEvt = $('#next-event');
const flipDosBtn = $('#flip-dos');
const selId = $('#selected-id');
const selName = $('#selected-name');
const selType = $('#selected-type');
const selDesc = $('#selected-description');
const connectionList = $('#connection-list');
const linksCount = $('#links-count');
const impactCount = $('#impact-count');
const impactTime = $('#impact-time');
const stateButtons = $$('#state-buttons button');
const propagateBtn = $('#propagate');
const simBadge = $('#simulation-badge');
const simText = $('#simulation-text');
const ringControls = $('#ring-controls');
const layerSearch = null;
const sourceLabel = $('#source-label');
const datasetName = $('#dataset-name');
const storageStatus = $('#storage-status');
const viewButtons = $$('#view-buttons button');
const modeButtons = $$('#mode-buttons button');
const modeCaption = $('#mode-caption');
const toastEl = (() => { const d = document.createElement('div'); d.className='toast'; document.body.appendChild(d); const t = { el: d, timer: null }; return t; })();

function toast(msg, ms=2200){ toastEl.el.textContent = msg; toastEl.el.classList.add('show'); clearTimeout(toastEl.timer); toastEl.timer = setTimeout(()=>toastEl.el.classList.remove('show'), ms); }

// ---------- three.js setup ----------
let renderer, scene, camera, controls, labelRenderer;
let clockRoot, frontGroup, backGroup;  // clockRoot rotates to flip; front/back are children
let jewelPivot;
let ringMeshes = [];          // {group, ring, bodyMesh, ticks, nodes:[{mesh,id}], screws, fasteners}
let nodeMeshById = new Map(); // id -> {mesh, data}
let webMat = null;
let nucleusGroup = null;
let handsGroup = null;
let spokesGroup = null;
let outerTicks = null;
let ringVisibility = RING_DEFS.map(()=>true);
let ringTargetZ = RING_DEFS.map(()=>0); // explode offset
let playing = true;
let side = 'front';           // 'front' | 'back'
let flipTarget = 0;           // 0 = front, π = back
let flipCurrent = 0;
let selectedNodeId = 'CORE-001';
let hoverId = null;
let activeMode = 'instrument';
let activeView = 'reset';
let raycaster = new THREE.Raycaster();
let pointer = new THREE.Vector2();
let hoverable = new THREE.Group(); hoverable.name = 'hoverable';
let pointerDown = {x:0,y:0,t:0};
let dragThreshold = 6;
let animFrame = null;
let clock = new THREE.Clock();
let timeline = 0;
let propagation = null;       // {origin, visited, wave, frontier, startTime, duration}

// ---------- data ----------
const DEFAULT_DATA = buildSampleData();
let data = structuredClone(DEFAULT_DATA);

function buildSampleData(){
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const toStr = d => d.toISOString().slice(0,10);
  const d = offset => { const x = new Date(start); x.setDate(x.getDate()+offset); return toStr(x); };

  const nodes = [
    {id:'CORE-001', name:'Noyau identitaire', ringId:'orchestrate', state:'OBSERVED',  angle:0,       description:'Ancre les valeurs, intentions et cohérence globale.', date:d(0), kind:'noyau'},
    {id:'CALL-001', name:'Solstice d\'hiver',  ringId:'cal',        state:'CONFIRMED', angle:-Math.PI/2, description:'Point de cadrage annuel : équilibre et repos.', date:d(0), kind:'échéance'},
    {id:'CALL-002', name:'Solstice d\'été',    ringId:'cal',        state:'PROPOSED',  angle: Math.PI/2, description:'Point d\'activation : déploiement des projets.', date:d(182), kind:'échéance'},
    {id:'TIME-001', name:'Matin productif',    ringId:'time',       state:'OBSERVED',  angle:-Math.PI/2+0.2, description:'Fenêtre haute de concentration.', date:d(0), kind:'fenêtre'},
    {id:'TIME-002', name:'Décision 15 h',      ringId:'time',       state:'PREDICTED', angle: Math.PI/8, description:'Point de décision cadré en après-midi.', date:d(2), kind:'fenêtre'},
    {id:'PEOP-Aube', name:'Aube',              ringId:'people',     state:'CONFIRMED', angle: -Math.PI*0.8, description:'Partenaire principal · co-écriture.', date:d(0), kind:'personne'},
    {id:'PEOP-Cal', name:'Cal',               ringId:'people',     state:'CONFIRMED', angle: -Math.PI*0.3, description:'Régulation · méthodologie.', date:d(0), kind:'personne'},
    {id:'PEOP-Télia', name:'Télia',            ringId:'people',     state:'PROPOSED',  angle:  Math.PI*0.15, description:'Design visuel · identité.', date:d(4), kind:'personne'},
    {id:'PEOP-Mori', name:'Mori',              ringId:'people',     state:'PREDICTED', angle:  Math.PI*0.55, description:'Sound design · voix-off.', date:d(7), kind:'personne'},
    {id:'PEOP-Iris', name:'Iris',              ringId:'people',     state:'OBSERVED',  angle:  Math.PI*0.95, description:'Production · coordination.', date:d(0), kind:'personne'},
    {id:'REL-001', name:'Alliance Aube/Noyau', ringId:'relations',  state:'CONFIRMED', angle:-Math.PI*0.7, description:'Contrat de co-écriture fondateur.', date:d(0), kind:'alliance'},
    {id:'REL-002', name:'Conseil Cal',         ringId:'relations',  state:'OBSERVED',  angle:-Math.PI*0.2, description:'Régulation rythmique hebdomadaire.', date:d(1), kind:'conseil'},
    {id:'MOM-001', name:'Point de cadrage',    ringId:'moments',    state:'CONFIRMED', angle:-Math.PI*0.55, description:'Rituel matinal de cadrage.', date:d(1), kind:'rituel'},
    {id:'MOM-002', name:'Lancement v1',        ringId:'moments',    state:'PROPOSED',  angle: Math.PI*0.25, description:'Mise en ligne de la première version.', date:d(21), kind:'jalon'},
    {id:'ORCH-001', name:'Table d\'harmonie',  ringId:'orchestrate',state:'OBSERVED',  angle: Math.PI*0.9, description:'Équilibrage des intentions.', date:d(1), kind:'gouvernance'},
    {id:'MEM-001', name:'Mémoire fondatrice',  ringId:'memory',     state:'OBSERVED',  angle:-Math.PI*0.15, description:'Origine et principes fondateurs.', date:d(0), kind:'archive'},
    {id:'MEM-002', name:'Archives prototypes', ringId:'memory',     state:'PREDICTED', angle: Math.PI*0.7, description:'Captures et versions de travail.', date:d(7), kind:'archive'}
  ];

  const links = [
    {from:'CORE-001', to:'CALL-001', weight:1.0, kind:'ancre'},
    {from:'CORE-001', to:'CALL-002', weight:0.9, kind:'ancre'},
    {from:'CORE-001', to:'TIME-001', weight:0.8, kind:'rythme'},
    {from:'CORE-001', to:'TIME-002', weight:0.7, kind:'rythme'},
    {from:'CORE-001', to:'PEOP-Aube', weight:1.0, kind:'alliance'},
    {from:'CORE-001', to:'PEOP-Cal',  weight:0.8, kind:'conseil'},
    {from:'CORE-001', to:'PEOP-Télia',weight:0.6, kind:'collab'},
    {from:'CORE-001', to:'PEOP-Mori', weight:0.5, kind:'collab'},
    {from:'CORE-001', to:'PEOP-Iris', weight:0.7, kind:'collab'},
    {from:'PEOP-Aube', to:'REL-001', weight:1.0, kind:'crée'},
    {from:'PEOP-Cal',  to:'REL-002', weight:1.0, kind:'crée'},
    {from:'REL-001', to:'ORCH-001',  weight:0.8, kind:'alimente'},
    {from:'REL-002', to:'ORCH-001',  weight:0.7, kind:'alimente'},
    {from:'ORCH-001', to:'MOM-001',  weight:0.9, kind:'produit'},
    {from:'ORCH-001', to:'MOM-002',  weight:0.7, kind:'produit'},
    {from:'MOM-001', to:'MEM-001',  weight:0.8, kind:'archive'},
    {from:'MOM-002', to:'MEM-002',  weight:0.9, kind:'archive'},
    {from:'TIME-001', to:'MOM-001', weight:0.9, kind:'cible'},
    {from:'TIME-002', to:'MOM-002', weight:0.6, kind:'cible'},
    {from:'PEOP-Télia', to:'MOM-002', weight:0.7, kind:'contribue'},
    {from:'PEOP-Mori', to:'MOM-002', weight:0.5, kind:'contribue'},
    {from:'PEOP-Iris', to:'MOM-001', weight:0.8, kind:'contribue'},
    {from:'PEOP-Iris', to:'MOM-002', weight:0.7, kind:'contribue'}
  ];

  return { version: '1.0', name:'Atelier des possibles', nodes, links, createdAt: new Date().toISOString() };
}

// ---------- geometry helpers ----------
function makeAnnulus(innerR, outerR, depth){
  const shape = new THREE.Shape();
  shape.absarc(0,0,outerR,0,Math.PI*2,false);
  const hole = new THREE.Path();
  hole.absarc(0,0,innerR,0,Math.PI*2,true);
  shape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled:true, bevelThickness:depth*0.08, bevelSize:depth*0.08, bevelSegments:2, curveSegments:80, steps:1 });
  geo.translate(0,0,-depth*0.5);
  geo.computeVertexNormals();
  return geo;
}

// ---------- materials ----------
let matTitanium, matSilver, matLight, matDark, matInk, matGold, matEnamel;
let nodeMats = [];  // 0:observed,1:predicted,2:proposed,3:confirmed
let nodeStemMat, tickMat, handMat;
let matSatin;
let matPaper, matBackingCyl, matBezel, matGroove;
let matRub, matGoldCap, matRuby, matCrown;

function buildMaterials(envMap){
  matTitanium = new THREE.MeshStandardMaterial({ color:TITANIUM, metalness:0.85, roughness:0.3, envMap, envMapIntensity:1.0 });
  matSilver = new THREE.MeshStandardMaterial({ color:SILVER, metalness:0.9, roughness:0.18, envMap, envMapIntensity:1.1 });
  matLight = new THREE.MeshStandardMaterial({ color:LIGHT_METAL, metalness:0.7, roughness:0.4, envMap, envMapIntensity:0.85 });
  matDark = new THREE.MeshStandardMaterial({ color:DARK_METAL, metalness:0.8, roughness:0.5, envMap, envMapIntensity:0.6 });
  matInk = new THREE.MeshStandardMaterial({ color:INK, metalness:0.4, roughness:0.6 });
  matGold = new THREE.MeshStandardMaterial({ color:GOLD, metalness:0.9, roughness:0.25, envMap, envMapIntensity:1.2 });
  matEnamel = new THREE.MeshStandardMaterial({ color:ENAMEL, metalness:0.0, roughness:0.8 });
  matSatin = new THREE.MeshStandardMaterial({ color:0xaea89a, metalness:0.9, roughness:0.35, envMap, envMapIntensity:0.7 });
  matPaper = new THREE.MeshStandardMaterial({ color:PAPER_LIGHT, metalness:0, roughness:0.95 });
  matBackingCyl = new THREE.MeshStandardMaterial({ color:0x8b8a80, metalness:0.7, roughness:0.55, envMap });
  matBezel = new THREE.MeshStandardMaterial({ color:INK, metalness:0.6, roughness:0.5 });
  matGroove = new THREE.MeshStandardMaterial({ color:0x1b1f18, metalness:0.5, roughness:0.7 });
  matCrown = new THREE.MeshStandardMaterial({ color:0xd8d4c5, metalness:0.85, roughness:0.4, envMap });
  matRuby = new THREE.MeshPhysicalMaterial({ color:0xc8303a, metalness:0.2, roughness:0.15, clearcoat:1.0, clearcoatRoughness:0.05 });
  matGoldCap = new THREE.MeshStandardMaterial({ color:0xd4af6a, metalness:0.9, roughness:0.2, envMap });
  matRub = new THREE.MeshStandardMaterial({ color:0x222720, metalness:0.2, roughness:0.9 });
  tickMat = new THREE.MeshStandardMaterial({ color:INK, metalness:0.5, roughness:0.5 });
  handMat = new THREE.MeshStandardMaterial({ color:INK, metalness:0.6, roughness:0.4 });
  nodeStemMat = new THREE.MeshStandardMaterial({ color:DARK_METAL, metalness:0.7, roughness:0.5 });
  nodeMats[0] = new THREE.MeshStandardMaterial({ color:NODE_OBSERVED,  metalness:0.5, roughness:0.35, envMap, envMapIntensity:0.8 });
  nodeMats[1] = new THREE.MeshStandardMaterial({ color:NODE_PREDICTED, metalness:0.4, roughness:0.3,  envMap, envMapIntensity:0.9, emissive:NODE_PREDICTED, emissiveIntensity:0.02 });
  nodeMats[2] = new THREE.MeshStandardMaterial({ color:NODE_PROPOSED,  metalness:0.7, roughness:0.25, envMap, envMapIntensity:1.1, emissive:NODE_PROPOSED, emissiveIntensity:0.05 });
  nodeMats[3] = new THREE.MeshStandardMaterial({ color:NODE_CONFIRMED, metalness:0.3, roughness:0.25, envMap, envMapIntensity:0.9 });
}

// ---------- build the scene ----------
function initScene(){
  renderer = new THREE.WebGLRenderer({ antialias:true, alpha:false, powerPreference:'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(viewport.clientWidth, viewport.clientHeight);
  renderer.setClearColor(PAPER, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  viewport.appendChild(renderer.domElement);

  // CSS2D label renderer (for month sprites and ring labels)
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(viewport.clientWidth, viewport.clientHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0';
  labelRenderer.domElement.style.left = '0';
  labelRenderer.domElement.style.pointerEvents = 'none';
  viewport.appendChild(labelRenderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(PAPER);
  scene.fog = new THREE.Fog(PAPER, 28, 48);

  // PMREM environment
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envMap;
  buildMaterials(envMap);
  pmrem.dispose();

  camera = new THREE.PerspectiveCamera(32, viewport.clientWidth/viewport.clientHeight, 0.1, 200);
  camera.position.set(0, 6.5, 13);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0,0,0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.enableZoom = false; // zoom via buttons / ctrl-wheel only
  controls.minPolarAngle = Math.PI*0.1;
  controls.maxPolarAngle = Math.PI*0.9;
  controls.minAzimuthAngle = -Math.PI*0.9;
  controls.maxAzimuthAngle =  Math.PI*0.9;
  controls.rotateSpeed = 0.55;

  // ---------- lights ----------
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const hemi = new THREE.HemisphereLight(0xffffff, 0xb8b4a6, 0.7);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(6, 14, 10);
  key.castShadow = true;
  key.shadow.mapSize.set(2048,2048);
  key.shadow.camera.near = 0.5; key.shadow.camera.far = 50;
  key.shadow.camera.left = -12; key.shadow.camera.right = 12;
  key.shadow.camera.top = 12; key.shadow.camera.bottom = -12;
  key.shadow.bias = -0.0003;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe8edf2, 0.5);
  fill.position.set(-7, 6, -6);
  scene.add(fill);

  // soft shadow catcher plane
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(40,40), new THREE.ShadowMaterial({ opacity:0.10, color:0x20221a }));
  catcher.rotation.x = -Math.PI/2;
  catcher.position.y = -3.2;
  catcher.receiveShadow = true;
  scene.add(catcher);

  // ---------- clockRoot (pivot for flip) ----------
  clockRoot = new THREE.Group();
  scene.add(clockRoot);

  frontGroup = new THREE.Group();
  backGroup = new THREE.Group();
  backGroup.rotation.x = Math.PI;
  clockRoot.add(frontGroup);
  clockRoot.add(backGroup);

  buildFront();
  buildBack();
}

// ---------- build front (the dial) ----------
function buildFront(){
  // --- backing (cylinder)
  const backOuter = new THREE.Mesh(new THREE.CylinderGeometry(8.2,8.2,0.24,80,1), matBackingCyl);
  backOuter.position.y = -0.12;
  backOuter.receiveShadow = true; backOuter.castShadow = true;
  frontGroup.add(backOuter);

  // paper disc on face
  const face = new THREE.Mesh(new THREE.CircleGeometry(8.05,80), matPaper);
  face.position.z = 0.005;
  face.rotation.x = 0;
  face.receiveShadow = true;
  frontGroup.add(face);

  // outer black bezel (torus)
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(8.16, 0.09, 12, 120), matBezel);
  bezel.rotation.x = Math.PI/2;
  bezel.position.z = 0;
  bezel.castShadow = true;
  frontGroup.add(bezel);

  // inner groove
  const groove = new THREE.Mesh(new THREE.TorusGeometry(7.96, 0.012, 8, 160), matGroove);
  groove.rotation.x = Math.PI/2;
  groove.position.z = 0.01;
  frontGroup.add(groove);

  // 12 outer screws (instanced)
  const screwGeo = new THREE.CylinderGeometry(0.06,0.06,0.04,12);
  const screwMat = matDark;
  const outerScrews = new THREE.InstancedMesh(screwGeo, screwMat, 12);
  outerScrews.castShadow = true;
  const _m = new THREE.Matrix4();
  const _q = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2,0,0));
  for (let i=0;i<12;i++){
    const a = (i/12)*Math.PI*2 - Math.PI/2;
    _m.compose(new THREE.Vector3(Math.cos(a)*8.04, Math.sin(a)*8.04, 0.02), _q, new THREE.Vector3(1,1,1));
    outerScrews.setMatrixAt(i, _m);
  }
  outerScrews.instanceMatrix.needsUpdate = true;
  frontGroup.add(outerScrews);

  // outer ticks (240, 4 per minute slot) via instanced box
  outerTicks = new THREE.Group();
  const tickGeo = new THREE.BoxGeometry(0.018, 0.07, 0.02);
  const bigTickGeo = new THREE.BoxGeometry(0.028, 0.14, 0.025);
  const outerTicksMesh = new THREE.InstancedMesh(tickGeo, tickMat, 240);
  outerTicksMesh.castShadow = true;
  const outerTicksBig = new THREE.InstancedMesh(bigTickGeo, tickMat, 60);
  outerTicksBig.castShadow = true;
  let ib = 0;
  for (let i=0;i<240;i++){
    const a = (i/240)*Math.PI*2 - Math.PI/2;
    const isHour = (i%4)===0;
    const r = 8.08;
    const len = isHour ? 0.14 : 0.07;
    const geo = isHour ? bigTickGeo : tickGeo;
    const pos = new THREE.Vector3(Math.cos(a)*r, Math.sin(a)*r, 0.02);
    const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,a + Math.PI/2));
    const sc = new THREE.Vector3(1, isHour?2:1, 1);
    _m.compose(pos, rot, sc);
    if (isHour) { outerTicksBig.setMatrixAt(ib++, _m); }
    else        { /* reuse same index space but we made two meshes */ }
    outerTicksMesh.setMatrixAt(i, _m);
  }
  outerTicksBig.count = ib;
  outerTicksBig.instanceMatrix.needsUpdate = true;
  outerTicksMesh.instanceMatrix.needsUpdate = true;
  outerTicks.add(outerTicksMesh, outerTicksBig);
  frontGroup.add(outerTicks);

  // 12 spokes from center to ~4.8r
  spokesGroup = new THREE.Group();
  const spokeGeo = new THREE.BoxGeometry(4.6, 0.012, 0.02);
  for (let i=0;i<12;i++){
    const a = (i/12)*Math.PI*2 + Math.PI/12;
    const s = new THREE.Mesh(spokeGeo, tickMat);
    s.position.set(Math.cos(a)*2.3, Math.sin(a)*2.3, 0.012);
    s.rotation.z = a;
    spokesGroup.add(s);
  }
  frontGroup.add(spokesGroup);

  // --- the 7 rings ---
  const ringMaterials = [matLight, matTitanium, matSilver, matLight, matTitanium, matSilver, matLight];
  RING_DEFS.forEach((def, i) => {
    const g = new THREE.Group();
    g.userData.ringDef = def;
    const innerR = def.radius - def.width/2;
    const outerR = def.radius + def.width/2;

    const bodyGeo = makeAnnulus(innerR, outerR, def.depth);
    const body = new THREE.Mesh(bodyGeo, ringMaterials[i]);
    body.castShadow = true; body.receiveShadow = true;
    body.position.z = 0;
    g.add(body);

    // silver inlay at 0.71 width
    const inlayW = def.width*0.42;
    const inlayGeo = makeAnnulus(def.radius - inlayW/2, def.radius + inlayW/2, def.depth*0.5);
    const inlay = new THREE.Mesh(inlayGeo, matSilver);
    inlay.position.z = def.depth*0.5 + 0.002;
    g.add(inlay);

    // black inner & outer rails (tori)
    const innerRail = new THREE.Mesh(new THREE.TorusGeometry(innerR, 0.012, 6, 80), matInk);
    innerRail.rotation.x = Math.PI/2;
    g.add(innerRail);
    const outerRail = new THREE.Mesh(new THREE.TorusGeometry(outerR, 0.012, 6, 80), matInk);
    outerRail.rotation.x = Math.PI/2;
    g.add(outerRail);

    // ticks per ring: more ticks on outer rings
    const tickCount = [60, 60, 12, 12, 8, 8, 6][i];
    const tickLen = [0.10,0.09,0.09,0.08,0.07,0.06,0.06][i];
    const rTickGeo = new THREE.BoxGeometry(0.014, tickLen, def.depth*0.5);
    const rTickMesh = new THREE.InstancedMesh(rTickGeo, tickMat, tickCount);
    rTickMesh.castShadow = true;
    for (let t=0;t<tickCount;t++){
      const a = (t/tickCount)*Math.PI*2;
      const pos = new THREE.Vector3(Math.cos(a)*def.radius, Math.sin(a)*def.radius, def.depth*0.25 + 0.02);
      const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,a + Math.PI/2));
      _m.compose(pos, rot, new THREE.Vector3(1,1,1));
      rTickMesh.setMatrixAt(t, _m);
    }
    rTickMesh.instanceMatrix.needsUpdate = true;
    g.add(rTickMesh);

    // numeric labels for CAL (1-12) and TIME (00-55 in 5 steps) — use CSS2D text elements
    if (def.id === 'cal') {
      for (let n=1;n<=12;n++){
        const a = (n/12)*Math.PI*2 - Math.PI/2;
        const label = makeTextLabel(String(n), {fontSize: 11, color:'#252822'});
        label.position.set(Math.cos(a)*(def.radius+0.22), Math.sin(a)*(def.radius+0.22), 0.04);
        g.add(label);
      }
    }
    if (def.id === 'time') {
      for (let n=0;n<12;n++){
        const a = (n/12)*Math.PI*2 - Math.PI/2;
        const lbl = String(n*5).padStart(2,'0');
        const label = makeTextLabel(lbl, {fontSize:8, color:'#797b72', mono:true});
        label.position.set(Math.cos(a)*(def.radius-0.18), Math.sin(a)*(def.radius-0.18), 0.04);
        g.add(label);
      }
    }

    // fasteners (6 screws per ring, near inner rail) for CAL, PEOPLE
    if (def.id === 'cal' || def.id === 'people' || def.id === 'memory'){
      const fs = 6;
      const fGeo = new THREE.CylinderGeometry(0.045,0.045,0.04,10);
      const fMesh = new THREE.InstancedMesh(fGeo, matGold, fs);
      fMesh.castShadow = true;
      for (let k=0;k<fs;k++){
        const a = (k/fs)*Math.PI*2 + Math.PI/fs;
        const pos = new THREE.Vector3(Math.cos(a)*(innerR+0.07), Math.sin(a)*(innerR+0.07), def.depth*0.5 + 0.025);
        _m.compose(pos, _q, new THREE.Vector3(1,1,1));
        fMesh.setMatrixAt(k,_m);
      }
      fMesh.instanceMatrix.needsUpdate = true;
      g.add(fMesh);
    }

    // ring label (outer)
    const ringLabel = makeTextLabel(def.label.toUpperCase(), {fontSize:7, color:'#999a90', mono:true, letterSpacing:'0.2em'});
    ringLabel.position.set(0, -(def.radius+0.48), 0.04);
    g.add(ringLabel);

    frontGroup.add(g);
    ringMeshes.push({ group:g, def, body, nodes:[], screwsAdded:false });
  });

  // --- nodes (spheres + stems) per ring ---
  buildNodes();

  // --- relationship web (lines between linked nodes) ---
  buildWeb();

  // --- nucleus ---
  buildNucleus();

  // --- hands ---
  buildHands();

  // --- month labels at the very edge ---
  MONTHS.forEach((m,i) => {
    const a = (i/12)*Math.PI*2 - Math.PI/2;
    const r = 8.87;
    const label = makeTextLabel(m, {fontSize:9, color:'#252822', mono:true, bold:true});
    label.position.set(Math.cos(a)*r, Math.sin(a)*r, 0.02);
    // rotate label to face outward?  CSS2D always faces camera, but place it.
    frontGroup.add(label);
  });

  // crosshair markers
  ['+','✦','+','✦'].forEach((ch,i) => {
    const a = i*Math.PI/2 - Math.PI/2;
    const r = 9.1;
    const el = makeTextLabel(ch, {fontSize:10, color:'#999b8e'});
    el.position.set(Math.cos(a)*r, Math.sin(a)*r, 0);
    frontGroup.add(el);
  });
}

function makeTextLabel(text, opts={}){
  const {fontSize=10, color='#252822', mono=false, bold=false, letterSpacing='0'} = opts;
  const div = document.createElement('div');
  div.textContent = text;
  div.style.fontSize = fontSize+'px';
  div.style.color = color;
  div.style.fontFamily = mono ? '"SFMono-Regular",Consolas,"Liberation Mono",monospace' : 'Georgia, "Times New Roman", serif';
  if (bold) div.style.fontWeight = '700';
  if (letterSpacing !== '0') div.style.letterSpacing = letterSpacing;
  div.style.textShadow = '0 0 3px #f3f1eabb';
  div.style.pointerEvents = 'none';
  div.style.whiteSpace = 'nowrap';
  const obj = new CSS2DObject(div);
  return obj;
}

function buildNodes(){
  // clear any existing
  ringMeshes.forEach(r => { r.nodes.forEach(n => r.group.remove(n.mesh)); r.nodes = []; });
  nodeMeshById.clear();

  const sphereGeo = new THREE.SphereGeometry(0.16, 24, 20);
  const stemGeo = new THREE.CylinderGeometry(0.02,0.02,0.22,8);
  stemGeo.translate(0,0.11,0);
  const coreSphereGeo = new THREE.SphereGeometry(0.72, 48, 32);

  data.nodes.forEach(nd => {
    const rdef = RING_DEFS.find(r => r.id === nd.ringId);
    if (!rdef) return;
    const ringEntry = ringMeshes[rdef.index];
    const grp = new THREE.Group();
    const stem = new THREE.Mesh(stemGeo, nodeStemMat);
    stem.castShadow = true;
    grp.add(stem);
    let mat, geo;
    if (nd.id === 'CORE-001'){
      geo = coreSphereGeo; mat = matGold;
    } else {
      geo = sphereGeo; mat = nodeMats[stateIndex[nd.state] ?? 0];
    }
    const s = new THREE.Mesh(geo, mat);
    s.castShadow = true; s.receiveShadow = true;
    s.position.z = 0.28;
    s.userData.nodeId = nd.id;
    grp.add(s);
    // rotate so stem aligns with radial direction: we'll set group rotation per node
    grp.userData.nodeData = nd;
    grp.position.set(Math.cos(nd.angle)*rdef.radius, Math.sin(nd.angle)*rdef.radius, rdef.depth*0.5);
    // radial rotation: stem points outward along radial
    grp.rotation.z = nd.angle - Math.PI/2;
    ringEntry.group.add(grp);
    hoverable.add(s);
    ringEntry.nodes.push({ mesh:grp, sphere:s, id:nd.id });
    nodeMeshById.set(nd.id, { mesh:grp, sphere:s, data:nd });
  });
}

function updateNodeStates(){
  data.nodes.forEach(nd => {
    const entry = nodeMeshById.get(nd.id);
    if (!entry) return;
    if (nd.id === 'CORE-001') return; // gold core
    const idx = stateIndex[nd.state] ?? 0;
    entry.sphere.material = nodeMats[idx];
  });
}

function buildWeb(){
  if (webMat){ webMat.dispose(); }
  if (frontGroup.getObjectByName('web')) frontGroup.remove(frontGroup.getObjectByName('web'));
  const lineGroup = new THREE.Group();
  lineGroup.name = 'web';
  lineGroup.position.z = 0.06;
  // group links by color bucket for line segments
  const segments = [];
  data.links.forEach(ln => {
    const a = nodeMeshById.get(ln.from);
    const b = nodeMeshById.get(ln.to);
    if (!a || !b) return;
    const ap = new THREE.Vector3(); a.mesh.getWorldPosition(ap);
    const bp = new THREE.Vector3(); b.mesh.getWorldPosition(bp);
    // convert back to frontGroup local
    frontGroup.worldToLocal(ap); frontGroup.worldToLocal(bp);
    segments.push({ a:new THREE.Vector3(ap.x,ap.y,0.06), b:new THREE.Vector3(bp.x,bp.y,0.06), weight:ln.weight, kind:ln.kind });
  });
  // one LineSegments with vertex colors
  const positions = new Float32Array(segments.length*2*3);
  const colors = new Float32Array(segments.length*2*3);
  const c = new THREE.Color(INK);
  segments.forEach((seg,i) => {
    const o = i*6;
    positions[o]   = seg.a.x; positions[o+1] = seg.a.y; positions[o+2] = seg.a.z;
    positions[o+3] = seg.b.x; positions[o+4] = seg.b.y; positions[o+5] = seg.b.z;
    const alpha = 0.10 + seg.weight*0.55;
    // gold for alliance, blue for collab, ink otherwise
    let col;
    if (seg.kind === 'alliance' || seg.kind === 'ancre') col = new THREE.Color(GOLD);
    else if (seg.kind === 'collab' || seg.kind === 'contribue') col = new THREE.Color(BLUE);
    else col = c;
    colors[o]   = col.r*alpha; colors[o+1] = col.g*alpha; colors[o+2] = col.b*alpha;
    colors[o+3] = col.r*alpha; colors[o+4] = col.g*alpha; colors[o+5] = col.b*alpha;
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions,3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors,3));
  webMat = new THREE.LineBasicMaterial({ vertexColors:true, transparent:true, opacity:0.55, depthWrite:false });
  const lines = new THREE.LineSegments(geo, webMat);
  lineGroup.add(lines);
  frontGroup.add(lineGroup);
}

function buildNucleus(){
  nucleusGroup = new THREE.Group();
  nucleusGroup.position.z = 0.3;
  // core golden sphere
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.72, 48, 32), matGold);
  core.castShadow = true;
  nucleusGroup.add(core);
  // wireframe icosahedron cage
  const cage = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9,1), new THREE.MeshBasicMaterial({ color:INK, wireframe:true, transparent:true, opacity:0.35 }));
  nucleusGroup.add(cage);
  // two torus orbits: gold and silver
  const orbit1 = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.012, 8, 80), matGold);
  orbit1.rotation.x = Math.PI/3;
  nucleusGroup.add(orbit1);
  const orbit2 = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.008, 8, 80), matSilver);
  orbit2.rotation.x = -Math.PI/4;
  orbit2.rotation.y = Math.PI/6;
  nucleusGroup.add(orbit2);
  // small dot on core (green live indicator)
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), new THREE.MeshStandardMaterial({ color:GREEN, emissive:GREEN, emissiveIntensity:0.8 }));
  dot.position.set(0.55, 0.35, 0.4);
  nucleusGroup.add(dot);
  nucleusGroup.userData.orbit1 = orbit1;
  nucleusGroup.userData.orbit2 = orbit2;
  frontGroup.add(nucleusGroup);
}

function buildHands(){
  handsGroup = new THREE.Group();
  handsGroup.position.z = 0.35;
  // hour hand
  const hHand = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.3, 0.03), handMat);
  hHand.position.y = 1.15;
  hHand.castShadow = true;
  // minute hand
  const mHand = new THREE.Mesh(new THREE.BoxGeometry(0.035, 3.5, 0.03), handMat);
  mHand.position.y = 1.75;
  mHand.castShadow = true;
  // center cap
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,0.08,20), matGold);
  cap.rotation.x = Math.PI/2;
  cap.position.z = 0.06;
  handsGroup.add(hHand, mHand, cap);
  handsGroup.userData.hHand = hHand;
  handsGroup.userData.mHand = mHand;
  frontGroup.add(handsGroup);
}

// ---------- build back (case-back) ----------
function buildBack(){
  // large brushed titanium plate
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(8.2,8.2,0.32,96), matSatin);
  plate.position.y = -0.16;
  plate.castShadow = true; plate.receiveShadow = true;
  backGroup.add(plate);

  // inset movement cover
  const cover = new THREE.Mesh(new THREE.CylinderGeometry(5.2,5.2,0.06,64), new THREE.MeshStandardMaterial({color:0x9b9a8e, metalness:0.8, roughness:0.45}));
  cover.position.y = -0.32 + 0.03;
  backGroup.add(cover);

  // engraved ring on cover
  const coverGroove = new THREE.Mesh(new THREE.TorusGeometry(5.0,0.015,8,100), matGroove);
  coverGroove.rotation.x = Math.PI/2;
  coverGroove.position.z = 0.035;
  backGroup.add(coverGroove);

  // cover screws (6 around the cover)
  const sc = 6;
  const csGeo = new THREE.CylinderGeometry(0.07,0.07,0.05,10);
  const csMesh = new THREE.InstancedMesh(csGeo, matDark, sc);
  const _mm = new THREE.Matrix4();
  const _qq = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2,0,0));
  for (let k=0;k<sc;k++){
    const a = (k/sc)*Math.PI*2;
    const pos = new THREE.Vector3(Math.cos(a)*5.1, Math.sin(a)*5.1, 0.03);
    _mm.compose(pos, _qq, new THREE.Vector3(1,1,1));
    csMesh.setMatrixAt(k,_mm);
  }
  csMesh.instanceMatrix.needsUpdate = true;
  backGroup.add(csMesh);

  // ruby bearing at center
  const ruby = new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,0.05,24), matRuby);
  ruby.position.z = 0.04;
  backGroup.add(ruby);
  const rubyRing = new THREE.Mesh(new THREE.TorusGeometry(0.22,0.015,8,40), matGold);
  rubyRing.rotation.x = Math.PI/2;
  rubyRing.position.z = 0.06;
  backGroup.add(rubyRing);

  // engraved calibre text labels (CS2D)
  const lbl1 = makeTextLabel('CALIBRE RC-01', {fontSize:9, mono:true, bold:true, color:'#252822'});
  lbl1.position.set(0, 2.8, 0.05); backGroup.add(lbl1);
  const lbl2 = makeTextLabel('RIPPLECIRCLE · 7 STRATES', {fontSize:8, mono:true, color:'#6a6d63'});
  lbl2.position.set(0, 2.3, 0.05); backGroup.add(lbl2);
  const lbl3 = makeTextLabel('N° 001 / 2026', {fontSize:9, mono:true, color:'#252822'});
  lbl3.position.set(0, -2.3, 0.05); backGroup.add(lbl3);
  const lbl4 = makeTextLabel('SWISS MADE · SW INSPIRED', {fontSize:7, mono:true, color:'#999a90', letterSpacing:'0.15em'});
  lbl4.position.set(0, -2.8, 0.05); backGroup.add(lbl4);

  // crown MODE (top-left) — knurled cylinder
  const crown1 = new THREE.Group();
  crown1.name = 'crown-mode';
  const crownBody = new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,0.18,48), matCrown);
  crownBody.rotation.x = Math.PI/2;
  crown1.add(crownBody);
  // knurl rings
  for (let k=0;k<10;k++){
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28,0.012,4,24), matDark);
    ring.position.z = -0.08 + k*0.018;
    crown1.add(ring);
  }
  const cap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.29,0.29,0.02,48), matGold);
  cap1.rotation.x = Math.PI/2;
  cap1.position.z = 0.1;
  crown1.add(cap1);
  crown1.position.set(-6.4, 2.4, 0.1);
  crown1.userData.idleSpin = 0.18;
  backGroup.add(crown1);

  const cl1 = makeTextLabel('MODE', {fontSize:8, mono:true, bold:true, color:'#252822'});
  cl1.position.set(-6.4, 2.9, 0.1); backGroup.add(cl1);

  // crown FOCUS (top-right)
  const crown2 = crown1.clone(true);
  crown2.name = 'crown-focus';
  crown2.position.set(6.4, 2.4, 0.1);
  crown2.userData.idleSpin = -0.12;
  backGroup.add(crown2);
  const cl2 = makeTextLabel('FOCUS', {fontSize:8, mono:true, bold:true, color:'#252822'});
  cl2.position.set(6.4, 2.9, 0.1); backGroup.add(cl2);

  // gold F/R pusher (right side, like a chrono pusher)
  const pusher = new THREE.Group();
  const pBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,0.24,24), matDark);
  pBase.rotation.x = Math.PI/2;
  pusher.add(pBase);
  const pCap = new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,0.06,24), matGoldCap);
  pCap.rotation.x = Math.PI/2; pCap.position.z = 0.12;
  pusher.add(pCap);
  pusher.position.set(7.6, -2.0, 0.08);
  pusher.name = 'pusher-fr';
  backGroup.add(pusher);
  const pl = makeTextLabel('F-R', {fontSize:7, mono:true, bold:true, color:'#a5864c'});
  pl.position.set(7.6, -1.6, 0.08); backGroup.add(pl);

  // decorative screws at 4 corners around cover
  [ [-7,-7],[7,-7],[-7,7],[7,7] ].forEach(([x,y]) => {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.10,0.10,0.05,10), matDark);
    s.rotation.x = Math.PI/2; s.position.set(x,y,0.02);
    backGroup.add(s);
  });

  backGroup.userData.crowns = [crown1, crown2];
}

// ---------- interactions ----------
function pointerToNdc(e){
  const r = viewport.getBoundingClientRect();
  const x = (e.clientX - r.left)/r.width;
  const y = (e.clientY - r.top)/r.height;
  pointer.x = x*2 - 1;
  pointer.y = -(y*2 - 1);
  return { r, x, y };
}

function getNodeHit(){
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(hoverable.children, false);
  if (hits.length){
    const obj = hits[0].object;
    return obj.userData.nodeId;
  }
  return null;
}

viewport.addEventListener('pointerdown', (e) => {
  pointerDown = { x:e.clientX, y:e.clientY, t:performance.now() };
});
viewport.addEventListener('pointermove', (e) => {
  pointerToNdc(e);
  const id = getNodeHit();
  hoverId = id;
  if (id){
    const nd = data.nodes.find(n => n.id===id);
    tooltipName.textContent = nd?.name || id;
    tooltipId.textContent = nd ? `${nd.kind?.toUpperCase()||''} · ${id}` : id;
    tooltipEl.style.opacity = 1;
    const r = viewport.getBoundingClientRect();
    tooltipEl.style.left = (e.clientX - r.left) + 'px';
    tooltipEl.style.top = (e.clientY - r.top) + 'px';
    renderer.domElement.style.cursor = 'pointer';
  } else {
    tooltipEl.style.opacity = 0;
    renderer.domElement.style.cursor = playing ? 'grab' : 'default';
  }
});
viewport.addEventListener('pointerleave', () => {
  hoverId = null; tooltipEl.style.opacity=0;
});
viewport.addEventListener('pointerup', (e) => {
  const dx = e.clientX - pointerDown.x, dy = e.clientY - pointerDown.y;
  if (Math.hypot(dx,dy) > dragThreshold) return; // was drag
  pointerToNdc(e);
  const id = getNodeHit();
  if (id){
    selectNode(id);
  }
});
viewport.addEventListener('dblclick', () => {
  flipSide();
});

// zoom via ctrl/cmd wheel (page scrolls normally)
viewport.addEventListener('wheel', (e) => {
  if (!(e.ctrlKey || e.metaKey)) return;
  e.preventDefault();
  const dz = e.deltaY > 0 ? 1.08 : 0.92;
  const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
  dir.multiplyScalar(dz);
  const newLen = dir.length();
  if (newLen < 6 || newLen > 26) return;
  camera.position.copy(controls.target).add(dir);
}, {passive:false});

// keyboard
window.addEventListener('keydown', (e) => {
  if (e.target && /input|textarea/i.test(e.target.tagName)) return;
  if (e.code === 'Space'){ e.preventDefault(); togglePlay(); }
  else if (e.key === 'r' || e.key === 'R'){ resetView(); }
  else if (e.key === 'f' || e.key === 'F'){ flipSide(); }
  else if (e.key === '+' || e.key === '='){ zoom(0.9); }
  else if (e.key === '-' || e.key === '_'){ zoom(1.1); }
  else if (e.key === '1'){ setView('reset'); }
  else if (e.key === '2'){ setView('front'); }
  else if (e.key === '3'){ setView('side'); }
  else if (e.key === '4'){ setView('top'); }
  else if (e.key === '5'){ setView('explode'); }
});

function zoom(mult){
  const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
  dir.multiplyScalar(mult);
  if (dir.length() < 6) dir.setLength(6);
  if (dir.length() > 26) dir.setLength(26);
  camera.position.copy(controls.target).add(dir);
}
zoomInBtn.addEventListener('click', ()=>zoom(0.9));
zoomOutBtn.addEventListener('click', ()=>zoom(1.1));
resetBtn.addEventListener('click', resetView);
flipDosBtn.addEventListener('click', flipSide);
zoomNextEvt.addEventListener('click', ()=>{
  // jump timeline to a "proposed" event
  const proposed = data.nodes.filter(n => n.state==='PROPOSED' && n.date).sort((a,b)=>a.date.localeCompare(b.date));
  if (!proposed.length){ toast('Aucun événement proposé à venir.'); return; }
  const now = new Date();
  const next = proposed.find(n => new Date(n.date) >= now) || proposed[0];
  const start = new Date(data.nodes.filter(n=>n.date).map(n=>n.date).sort()[0]);
  const end = new Date(data.nodes.filter(n=>n.date).map(n=>n.date).sort().slice(-1)[0]);
  const t0 = start.getTime(), t1 = Math.max(end.getTime(), t0+1);
  const pct = (new Date(next.date).getTime()-t0)/(t1-t0);
  timelineInput.value = Math.round(pct*1000);
  timeline = pct;
  applyTimeline();
  toast('→ '+next.name);
});

function resetView(){
  ringTargetZ = RING_DEFS.map(()=>0);
  explodeInput.value = 0;
  explodeValue.textContent = '0 %';
  setView('reset');
  side = 'front'; flipTarget = 0;
  toast('Instrument recentré.');
}

playBtn.addEventListener('click', togglePlay);
function togglePlay(){
  playing = !playing;
  playIcon.textContent = playing ? 'Ⅱ' : '▶';
  playText.textContent = playing ? 'Pause' : 'Lecture';
  playBtn.setAttribute('aria-label', playing ? 'Mettre en pause' : 'Lire');
  controls.enabled = playing;
}

explodeInput.addEventListener('input', () => {
  const v = +explodeInput.value/100;
  explodeValue.textContent = Math.round(v*100)+' %';
  RING_DEFS.forEach((d,i)=>{
    ringTargetZ[i] = v * (0.25 + i*0.35); // outer rings go farther back
  });
});

function setView(view){
  activeView = view;
  viewButtons.forEach(b => {
    const on = b.dataset.view === view;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', on?'true':'false');
  });
  const t = controls.target.clone();
  let pos;
  switch(view){
    case 'front': pos = new THREE.Vector3(0, 0.2, 14); break;
    case 'side':  pos = new THREE.Vector3(14, 0.2, 0); break;
    case 'top':   pos = new THREE.Vector3(0.1, 14, 0.001); break;
    case 'explode':
      RING_DEFS.forEach((d,i)=>{ ringTargetZ[i] = 0.4 + i*0.7; });
      explodeInput.value = 60; explodeValue.textContent='60 %';
      pos = new THREE.Vector3(5, 9, 11);
      break;
    default: pos = new THREE.Vector3(0, 6.5, 13);
      ringTargetZ = RING_DEFS.map(()=>0);
      explodeInput.value=0; explodeValue.textContent='0 %';
  }
  animateCamera(pos, new THREE.Vector3(0,0,0));
}
viewButtons.forEach(b => b.addEventListener('click', ()=>setView(b.dataset.view)));

modeButtons.forEach(b => b.addEventListener('click', ()=>{
  activeMode = b.dataset.mode;
  modeButtons.forEach(x => x.classList.toggle('active', x===b));
  const caption = ({instrument:'MÉCANIQUE ORCHESTRÉE', connection:'RÉSEAU DES DÉPENDANCES', consequence:'PROPAGATION DES ONDES'})[activeMode];
  modeCaption.textContent = caption;
  toast('Mode : '+b.querySelector('b').textContent);
}));

// ring toggles
function buildRingControls(){
  ringControls.innerHTML = '';
  RING_DEFS.forEach((d,i) => {
    const btn = document.createElement('button');
    btn.className = 'layer-toggle';
    btn.setAttribute('aria-pressed','true');
    btn.dataset.idx = i;
    const count = data.nodes.filter(n=>n.ringId===d.id).length;
    btn.innerHTML = `<span class="check">✓</span><span>${d.label}</span><span class="count">${String(count).padStart(2,'0')}</span>`;
    btn.addEventListener('click', ()=>{
      ringVisibility[i] = !ringVisibility[i];
      btn.setAttribute('aria-pressed', ringVisibility[i]?'true':'false');
      ringMeshes[i].group.visible = ringVisibility[i];
    });
    ringControls.appendChild(btn);
  });
}
buildRingControls();

// state buttons
stateButtons.forEach(b => b.addEventListener('click', () => {
  const s = b.dataset.state;
  stateButtons.forEach(x => { const on = x===b; x.classList.toggle('active',on); x.setAttribute('aria-pressed', on?'true':'false'); });
  if (selectedNodeId && selectedNodeId !== 'CORE-001'){
    const nd = data.nodes.find(n=>n.id===selectedNodeId);
    if (nd){ nd.state = s; updateNodeStates(); saveLocal(); }
  }
}));

// propagate
propagateBtn.addEventListener('click', () => {
  startPropagation(selectedNodeId);
});

function selectNode(id){
  selectedNodeId = id;
  const nd = data.nodes.find(n=>n.id===id);
  if (!nd) return;
  selId.textContent = nd.id;
  selName.textContent = nd.name;
  selType.textContent = `${nd.ringId.toUpperCase()} · ${(nd.kind||'entité').toUpperCase()}`;
  selDesc.textContent = nd.description || 'Pas de description.';
  const dayEl = document.querySelector('.entity-date');
  if (dayEl) dayEl.textContent = nd.date ? `Enregistré le ${new Date(nd.date).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}.` : '';
  // state button reflect
  stateButtons.forEach(b => { const on = b.dataset.state === nd.state; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on?'true':'false'); });
  // connections
  const links = data.links.filter(l => l.from===id || l.to===id);
  linksCount.textContent = String(links.length).padStart(2,'0');
  connectionList.innerHTML = '';
  links.forEach(l => {
    const otherId = l.from===id ? l.to : l.from;
    const other = data.nodes.find(n=>n.id===otherId);
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.innerHTML = `<span class="arrow">↘</span><span><span class="link-name">${other?.name || otherId}</span><span class="link-kind">${l.kind.toUpperCase()}</span></span><span class="weight">${(l.weight*100).toFixed(0)}%</span>`;
    b.addEventListener('click', ()=>selectNode(otherId));
    li.appendChild(b);
    connectionList.appendChild(li);
  });
  if (!links.length){
    const li = document.createElement('li');
    li.innerHTML = '<div class="empty">Aucune connexion directe.</div>';
    connectionList.appendChild(li);
  }
}

function startPropagation(originId){
  if (!originId) return;
  // Dijkstra over links (weights as 1/strength distance)
  const dist = {}; const prev = {};
  data.nodes.forEach(n => dist[n.id] = Infinity);
  dist[originId] = 0;
  const visited = new Set();
  const Q = data.nodes.map(n => n.id);
  while (Q.length){
    Q.sort((a,b)=>dist[a]-dist[b]);
    const u = Q.shift();
    if (dist[u] === Infinity) break;
    visited.add(u);
    data.links.forEach(l => {
      let v=null;
      if (l.from===u) v=l.to; else if (l.to===u) v=l.from;
      if (!v || visited.has(v)) return;
      const w = 1/Math.max(0.1, l.weight);
      const alt = dist[u] + w;
      if (alt < dist[v]){ dist[v] = alt; prev[v] = u; }
    });
  }
  const reachable = Object.entries(dist).filter(([,d])=>isFinite(d));
  const maxDist = Math.max(...reachable.map(([,d])=>d));
  propagation = { origin:originId, dist, maxDist, startTime:performance.now(), duration: 2800, visitedCount: reachable.length };
  simBadge.hidden = false;
  simText.textContent = `Depuis ${data.nodes.find(n=>n.id===originId)?.name || originId} · ${reachable.length-1} entités atteignables`;
  impactCount.textContent = String(reachable.length-1).padStart(2,'0');
  impactTime.textContent = `${Math.round(maxDist*10)/10} unités`;
  toast('Onde lancée depuis '+ (data.nodes.find(n=>n.id===originId)?.name || originId));
  setTimeout(()=>{ simBadge.hidden = true; }, propagation.duration + 1200);
}

// ---------- timeline ----------
timelineInput.addEventListener('input', applyTimeline);
function applyTimeline(){
  const v = +timelineInput.value/1000;
  timeline = v;
  // compute fictional date between earliest and latest
  const dates = data.nodes.filter(n=>n.date).map(n=>new Date(n.date).getTime()).sort();
  if (dates.length){
    const t0 = dates[0], t1 = dates[dates.length-1];
    const t = new Date(t0 + v*(t1-t0));
    dayLabel.textContent = t.toLocaleDateString('fr-FR',{day:'numeric', month:'long', year:'numeric'});
    const totalMin = 6*60 + v*16*60; // 6:00 -> 22:00
    const hh = Math.floor(totalMin/60);
    const mm = Math.floor(totalMin%60);
    timeLabel.textContent = String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');
  }
}

// ---------- camera animation helpers ----------
let camAnim = null;
function animateCamera(toPos, toTarget){
  const fromPos = camera.position.clone();
  const fromTar = controls.target.clone();
  camAnim = { fromPos, toPos:toPos.clone(), fromTar, toTar:toTarget.clone(), t:0, dur:900 };
}
function easeInOut(t){ return t<0.5 ? 2*t*t : -1+(4-2*t)*t; }

function flipSide(){
  side = side==='front' ? 'back' : 'front';
  flipTarget = side==='front' ? 0 : Math.PI;
  toast(side==='front' ? 'Face (cadran)' : 'Dos (calibre)');
}

// ---------- persistence ----------
function saveLocal(){
  try { localStorage.setItem('ripplecircle-data-v1', JSON.stringify(data)); storageStatus.textContent='Sauvegardé localement · sans compte'; }
  catch(e){ console.warn(e); }
}
function loadLocal(){
  try {
    const s = localStorage.getItem('ripplecircle-data-v1');
    if (s){
      const parsed = JSON.parse(s);
      if (validateData(parsed)){ data = parsed; storageStatus.textContent='Données locales chargées'; sourceLabel.textContent='Données locales'; datasetName.textContent = data.name || 'Projet local'; return true; }
    }
  } catch(e){ console.warn(e); }
  return false;
}
function validateData(obj){
  if (!obj || typeof obj !== 'object') return false;
  if (!Array.isArray(obj.nodes) || !Array.isArray(obj.links)) return false;
  if (!obj.nodes.length) return false;
  const ids = new Set(obj.nodes.map(n=>n.id));
  for (const l of obj.links) if (!ids.has(l.from) || !ids.has(l.to)) return false;
  return true;
}

// ---------- render loop ----------
function onResize(){
  const w = viewport.clientWidth, h = viewport.clientHeight;
  camera.aspect = w/h;
  camera.updateProjectionMatrix();
  renderer.setSize(w,h);
  labelRenderer.setSize(w,h);
}
window.addEventListener('resize', onResize);

function tick(){
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  controls.update();

  // explode animation
  ringMeshes.forEach((r,i) => {
    const z = r.group.position.z;
    const target = ringTargetZ[i];
    r.group.position.z += (target - z)*Math.min(1, dt*6);
    // slow idle rotation for each ring
    if (playing && side==='front'){
      r.group.rotation.z += dt * (0.012 + i*0.003) * (i%2===0 ? 1 : -1);
    }
  });

  // flip
  flipCurrent += (flipTarget - flipCurrent)*Math.min(1, dt*3.2);
  clockRoot.rotation.x = flipCurrent;

  // nucleus
  if (nucleusGroup && playing){
    nucleusGroup.userData.orbit1.rotation.z += dt*0.4;
    nucleusGroup.userData.orbit2.rotation.z -= dt*0.3;
    nucleusGroup.rotation.y = Math.sin(t*0.2)*0.05;
  }
  // hands
  if (handsGroup){
    const dayFrac = timeline;
    handsGroup.userData.hHand.rotation.z = -dayFrac*Math.PI*2;
    handsGroup.userData.mHand.rotation.z = -dayFrac*Math.PI*2*12;
  }

  // back crown idle spin
  if (backGroup.userData.crowns && playing){
    backGroup.userData.crowns.forEach(c => { c.rotation.z += dt*(c.userData.idleSpin||0.1); });
  }

  // propagation pulse visual: glow confirmed/predicted according to distance
  if (propagation){
    const elapsed = performance.now() - propagation.startTime;
    const phase = elapsed/propagation.duration;
    // expand a wave radius on links/nodes
    if (phase < 1){
      // we color nodes within reach based on phase
      const waveR = phase * propagation.maxDist;
      data.nodes.forEach(n => {
        const d = propagation.dist[n.id];
        const entry = nodeMeshById.get(n.id);
        if (!entry || n.id==='CORE-001') return;
        if (d <= waveR){
          // pulse scale briefly
          const k = 1 + Math.max(0, 0.25 - (waveR-d)*0.02);
          entry.sphere.scale.setScalar(k);
        } else {
          entry.sphere.scale.setScalar(1);
        }
      });
    } else {
      data.nodes.forEach(n => {
        const e = nodeMeshById.get(n.id);
        if (e) e.sphere.scale.setScalar(1);
      });
      propagation = null;
    }
  } else {
    // hover highlight
    data.nodes.forEach(n => {
      const e = nodeMeshById.get(n.id); if (!e) return;
      const k = (hoverId===n.id || selectedNodeId===n.id) ? 1.35 : 1;
      e.sphere.scale.lerp(new THREE.Vector3(k,k,k), 0.2);
    });
  }

  // camera anim
  if (camAnim){
    camAnim.t += dt*1000;
    const p = Math.min(1, camAnim.t/camAnim.dur);
    const e = easeInOut(p);
    camera.position.lerpVectors(camAnim.fromPos, camAnim.toPos, e);
    controls.target.lerpVectors(camAnim.fromTar, camAnim.toTar, e);
    if (p>=1) camAnim = null;
  }

  // live status
  const nodesCount = data.nodes.length;
  const linksCount = data.links.length;
  liveStatus.textContent = `${nodesCount} billes · ${linksCount} connexions · ${ringVisibility.filter(Boolean).length}/7 couronnes visibles · ${side==='front'?'FACE':'DOS'}`;

  // frame text (solstice): keep static for now
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
  animFrame = requestAnimationFrame(tick);
}

// ---------- boot ----------
function boot(){
  loadingDetail.textContent = 'Scène · caméra · éclairage studio';
  initScene();
  loadingDetail.textContent = 'Géométrie des 7 couronnes';
  // scene builds synchronously in initScene -> buildFront/buildBack
  loadingDetail.textContent = 'Insertion des billes et du réseau';
  selectNode('CORE-001');
  applyTimeline();
  onResize();
  // remove loading overlay
  setTimeout(()=>{
    loadingEl.style.transition='opacity .5s';
    loadingEl.style.opacity=0;
    setTimeout(()=>loadingEl.hidden=true,500);
  }, 400);
  liveStatus.textContent = 'Instrument prêt.';
  toast('Instrument prêt · glisser pour orbiter · double-clic pour retourner');
  animFrame = requestAnimationFrame(tick);
}

try {
  loadLocal();
  boot();
} catch(e){
  console.error(e);
  loadingTitle.textContent = 'Échec du démarrage';
  loadingDetail.textContent = String(e && e.message || e);
}
