import React, { useEffect, useRef, useState } from 'react';
import { FileAudio, Pause, Play, RotateCcw } from 'lucide-react';
import type { ScheduledTrack } from '../../data/playlist';
import { previewLimit, PREVIEW_LIMIT_SECONDS, isSupportedAudioFile } from '../../utils/previewAudio';

interface Props {
  track: ScheduledTrack;
  onLevel: (level: number) => void;
}

const clock = (value: number) => {
  const seconds = Math.max(0, Math.floor(value));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
};

/** Audio local seulement : aucun flux externe, aucune persistance, aucune lecture automatique. */
export const AudioPreview: React.FC<Props> = ({ track, onLevel }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const frameRef = useRef<number>(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(PREVIEW_LIMIT_SECONDS);
  const [error, setError] = useState<string | null>(null);

  const stopAnimation = () => {
    window.cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
    onLevel(0);
  };

  const dispose = () => {
    stopAnimation();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audio.onplay = null;
      audio.onpause = null;
      audio.ontimeupdate = null;
      audio.onloadedmetadata = null;
      audio.onended = null;
      audio.onerror = null;
    }
    audioRef.current = null;
    analyserRef.current = null;
    if (ctxRef.current) void ctxRef.current.close().catch(() => {});
    ctxRef.current = null;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
  };

  useEffect(() => () => dispose(), []); // keyed by track.id in the 2D parent

  const animate = () => {
    const audio = audioRef.current;
    if (!audio || audio.paused) { stopAnimation(); return; }
    if (audio.currentTime >= PREVIEW_LIMIT_SECONDS) {
      audio.pause();
      audio.currentTime = PREVIEW_LIMIT_SECONDS;
      setElapsed(PREVIEW_LIMIT_SECONDS);
      stopAnimation();
      return;
    }
    const analyser = analyserRef.current;
    if (analyser) {
      const spectrum = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(spectrum);
      const usable = spectrum.subarray(0, Math.min(48, spectrum.length));
      const level = usable.reduce((sum, value) => sum + value * value, 0) / Math.max(1, usable.length);
      onLevel(Math.min(1, Math.sqrt(level) / 155));
    }
    frameRef.current = window.requestAnimationFrame(animate);
  };

  const load = (file?: File) => {
    if (!file) return;
    if (!isSupportedAudioFile(file.name, file.type) || file.size > 50 * 1024 * 1024) {
      setError('Choisir un fichier audio MP3, WAV, M4A, AAC, OGG, FLAC ou WebM de moins de 50 Mo.');
      return;
    }
    dispose();
    setError(null);
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    const audio = new Audio(url);
    audio.preload = 'metadata';
    audio.volume = 0.7;
    audioRef.current = audio;
    setFileName(file.name);
    setElapsed(0);
    setDuration(PREVIEW_LIMIT_SECONDS);
    setPlaying(false);
    audio.onloadedmetadata = () => setDuration(previewLimit(audio.duration));
    audio.ontimeupdate = () => {
      const progress = Math.min(PREVIEW_LIMIT_SECONDS, audio.currentTime);
      setElapsed(progress);
      if (audio.currentTime >= PREVIEW_LIMIT_SECONDS) audio.pause();
    };
    audio.onplay = () => setPlaying(true);
    audio.onpause = () => { setPlaying(false); stopAnimation(); };
    audio.onended = () => { setPlaying(false); stopAnimation(); };
    audio.onerror = () => { setError('Ce format ne peut pas être lu dans ce navigateur.'); setPlaying(false); stopAnimation(); };
  };

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) { audio.pause(); return; }
    if (audio.currentTime >= previewLimit(audio.duration) - 0.05) audio.currentTime = 0;
    try {
      if (!ctxRef.current && typeof AudioContext !== 'undefined') {
        try {
          const ctx = new AudioContext();
          const source = ctx.createMediaElementSource(audio);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          analyser.connect(ctx.destination);
          ctxRef.current = ctx;
          analyserRef.current = analyser;
        } catch {
          // Une absence d'AnalyserNode ne bloque pas la lecture audio HTML native.
        }
      }
      if (ctxRef.current?.state === 'suspended') void ctxRef.current.resume();
      await audio.play(); // uniquement après une interaction utilisateur
      stopAnimation();
      animate();
    } catch {
      setError('Lecture impossible. Vérifier le format du fichier ou les autorisations audio.');
    }
  };

  const restart = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setElapsed(0);
    stopAnimation();
  };

  return (
    <section aria-label="Extrait audio local" className="rounded-[16px] border p-4 space-y-3" style={{ background: 'var(--ripple-surface, #fff)', borderColor: 'var(--ripple-line, rgba(0,0,0,0.1))', color: 'var(--ripple-ink, #1d1d1f)' }}>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest opacity-70">Écoute · fichier local</p>
        <p className="text-[14px] font-bold mt-1">{track.title}</p>
        <p className="text-[12px] opacity-70">{track.artist} · 30 s maximum</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac,.webm"
        className="sr-only"
        aria-label={`Choisir un extrait audio local pour ${track.title}`}
        onChange={(e) => { load(e.currentTarget.files?.[0]); e.currentTarget.value = ''; }}
      />
      <button type="button" onClick={() => inputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-[12px] font-bold" style={{ borderColor: 'var(--ripple-line, rgba(0,0,0,0.2))' }}>
        <FileAudio className="w-4 h-4" /> {fileName ? 'Remplacer le fichier' : 'Choisir un fichier audio'}
      </button>
      {fileName && (
        <>
          <p className="text-[12px] truncate opacity-70" title={fileName}>{fileName} · sur cet appareil uniquement</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggle} aria-label={playing ? 'Mettre en pause l’extrait' : 'Lire l’extrait'} className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center bg-[#0A84FF] text-white">
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <progress aria-label="Progression de l’extrait" max={duration} value={Math.min(elapsed, duration)} className="flex-1 h-2 min-w-0 accent-[#0A84FF]" />
            <span className="text-[11px] tabular-nums whitespace-nowrap">{clock(elapsed)} / {clock(duration)}</span>
            <button type="button" onClick={restart} aria-label="Recommencer l’extrait" className="w-8 h-8 shrink-0 rounded-lg border flex items-center justify-center" style={{ borderColor: 'var(--ripple-line, rgba(0,0,0,0.2))' }}>
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
      {error && <p role="alert" className="text-[12px] text-[#C7342B]">{error}</p>}
      <p className="text-[11px] leading-snug opacity-65">
        Extrait fourni par vous, sans téléversement. L'anneau réagit au signal sonore si votre navigateur le permet. La régie reste une simulation distincte.
      </p>
    </section>
  );
};
