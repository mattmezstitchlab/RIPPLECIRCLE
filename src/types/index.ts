export type StakeholderStatus = 'DELAY' | 'MONITORING' | 'ADJUSTING' | 'NORMAL' | 'ACTIVE';

export interface Stakeholder {
  id: string;
  name: string;
  subtitle: string;
  role: string;
  avatarUrl: string;
  status?: StakeholderStatus;
  statusColor: string; // hex for glowing border and ring
  ringColor: string;
  badgeText?: string;
  badgeBg?: string;
  badgeTextColor?: string;
  angle: number; // 0-360 degrees for positioning on the radar orbit
  distanceFactor?: number; // 1 = standard orbit radius
  battery: number;
  walkieChannel: string;
  location: string;
  currentTask: string;
  pendingTasks: string[];
  alertMessage?: string;
  phone: string;
}

export interface TimelinePhase {
  id: string;
  title: string;
  status: 'Done' | 'Active' | 'Upcoming';
  statusColor: 'green' | 'blue' | 'amber';
  startTime: string;
  endTime: string;
  targetDuration: string;
  responsible: string[];
  description: string;
  location: string;
  delayMinutes: number;
}

export interface WeddingScenario {
  id: string;
  name: string;
  tagline: string;
  stabilityPercent: number;
  globalSlackMinutes: number; // e.g. +12
  currentTime: string;
  activePhaseId: string;
  incidentNote?: string;
  hasCateringDelay: boolean;
}

export interface ActivityLog {
  id: string;
  time: string;
  actor: string;
  actorRole: string;
  message: string;
  type: 'alert' | 'update' | 'radio' | 'milestone';
  badgeColor?: string;
}

export interface CueItem {
  id: string;
  time: string;
  phase: string;
  title: string;
  owner: string;
  location: string;
  status: 'terminee' | 'en_cours' | 'a_venir' | 'alerte';
  musicCue?: string;
  lightingCue?: string;
  notes: string;
}
