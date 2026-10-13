import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Camera, CircleUserRound, Clock, Layers, Music2, Pause, Play, SunMoon, Users } from 'lucide-react';
import { useOrchestra } from '../../hooks/useOrchestra';
import { Ripple, RippleLayer } from './Ripple';
import { sfx } from '../../utils/audio';
import { AccountPage } from './AccountPage';
import { usePersistentState } from '../../hooks/usePersistentState';
import { AccountState, INITIAL_ACCOUNT } from '../../data/account';

type Page = RippleLayer | 'account';

const readLayer = (): Page => {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash === 'account' || hash === 'calendar' || hash === 'journey' || hash === 'day' || hash === 'memory' || hash === 'playlist' || hash === 'people') return hash;
  return 'overview';
};

const NAV: { id: Page; label: string; hash: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Ripple', hash: '', icon: Layers },
  { id: 'calendar', label: 'Calendrier', hash: 'calendar', icon: CalendarDays },
  { id: 'journey', label: 'Parcours', hash: 'journey', icon: Clock },
  { id: 'day', label: 'Jour J', hash: 'day', icon: Clock },
  { id: 'memory', label: 'Memory', hash: 'memory', icon: Camera },
  { id: 'playlist', label: 'Playlist', hash: 'playlist', icon: Music2 },
  { id: 'people', label: 'Plan de tables', hash: 'people', icon: Users },
  { id: 'account', label: 'Compte', hash: 'account', icon: CircleUserRound }
];

export const Landing: React.FC = () => {
  const orchestra = useOrchestra();
  const [layer, setLayer] = useState<Page>(readLayer);
  const [account, setAccount] = usePersistentState<AccountState>('regie.account.v2', INITIAL_ACCOUNT);
  const [accountToast, setAccountToast] = useState<string | null>(null);

  // Orchestra connection/live state (client-side — labeled "démonstration" for clarity).
  const liveState = useMemo(() => {
    if (orchestra.manual) {
      return { label: 'Temps manuel', color: '#FF9F0A', dot: '#FF9F0A', icon: Clock };
    }
    if (orchestra.paused) {
      return { label: 'Pause', color: '#8E8E93', dot: '#AEAEB2', icon: Pause };
    }
    return { label: 'Démonstration', color: '#30D158', dot: '#30D158', icon: Play };
  }, [orchestra.manual, orchestra.paused]);

  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = account.theme === 'night' ? '#0b0b0d' : '#ffffff';
    const onHash = () => setLayer(readLayer());
    window.addEventListener('hashchange', onHash);
    return () => {
      document.body.style.background = prev;
      window.removeEventListener('hashchange', onHash);
    };
  }, [account.theme]);

  const toggleTheme = () => {
    const next = account.theme === 'night' ? 'day' : 'night';
    setAccount((current) => ({ ...current, theme: next }));
    sfx.playNodeClick();
  };

  return (
    <div className={`min-h-screen overflow-x-hidden ${account.theme === 'night' ? 'theme-night' : 'theme-day'}`}>
      <header className="fixed top-0 inset-x-0 z-50 h-[56px] ripple-header backdrop-blur-xl backdrop-saturate-150 border-b">
        <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-[16px] font-semibold tracking-tight shrink-0">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: liveState.dot }}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">Ripple</span>
            <span
              className="hidden sm:inline-flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${liveState.dot}22`, color: liveState.color }}
              aria-live="polite"
            >
              <liveState.icon className="w-3 h-3" />
              {liveState.label}
            </span>
          </span>

          <nav aria-label="Couches du cercle" className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
            {NAV.map((item) => {
              const on = layer === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={on ? 'page' : undefined}
                  onClick={() => {
                    if (on) return;
                    sfx.playNodeClick();
                    window.location.hash = item.hash;
                  }}
                  className="pressable shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[13px] font-semibold transition-colors"
                  style={on ? { background: account.theme === 'night' ? '#f5f5f7' : '#1d1d1f', color: account.theme === 'night' ? '#111' : '#fff' } : undefined}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={account.theme === 'night' ? 'Activer le mode jour' : 'Activer le mode nuit'}
            title={account.theme === 'night' ? 'Mode jour' : 'Mode nuit'}
            className="pressable w-8 h-8 rounded-full flex items-center justify-center shrink-0 ripple-icon-button"
          >
            <SunMoon className="w-4 h-4" />
          </button>

          <span className="hidden lg:inline text-[13px] font-medium text-[#6e6e73] shrink-0">
            Alexandre &amp; Sophie · Chantilly
          </span>
        </div>
      </header>

      <div className="pt-[56px]">
        {layer === 'account' ? (
          <AccountPage
            account={account}
            onChange={setAccount}
            onToast={(message) => {
              setAccountToast(message);
              window.setTimeout(() => setAccountToast(null), 2600);
            }}
            onBackToRipple={() => { window.location.hash = ''; }}
          />
        ) : (
          <Ripple
          activeLayer={layer}
          account={account}
          theme={account.theme}
          minutes={orchestra.minutes}
          paused={orchestra.paused}
          manual={orchestra.manual}
          scene={orchestra.scene}
          slack={orchestra.slack}
          stability={orchestra.stability}
          onScrub={orchestra.scrub}
          onToggle={orchestra.toggle}
          onResume={orchestra.resume}
          />
        )}
      </div>
      {accountToast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[90] px-5 py-3 rounded-full bg-[#1d1d1f] text-white text-[13px] font-semibold shadow-lg news-swap" role="status">
          {accountToast}
        </div>
      )}
    </div>
  );
};
