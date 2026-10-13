import React, { useEffect, useState } from 'react';
import { CircleUserRound } from 'lucide-react';
import { useOrchestra } from '../../hooks/useOrchestra';
import { Ripple, RippleLayer } from './Ripple';
import { AccountPage } from './AccountPage';
import { SaxBookingLanding } from './SaxBookingLanding';
import { usePersistentState } from '../../hooks/usePersistentState';
import { AccountState, INITIAL_ACCOUNT, migrateAccountLightOnly } from '../../data/account';

type Page = RippleLayer | 'account' | 'booking';

const readLayer = (): Page => {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash || hash === 'booking') return 'booking';
  if (hash === 'explore' || hash === 'instrument') return 'overview';
  if (hash === 'account' || hash === 'calendar' || hash === 'journey' || hash === 'day' || hash === 'memory' || hash === 'playlist' || hash === 'people') return hash;
  return 'booking';
};

export const Landing: React.FC = () => {
  const orchestra = useOrchestra();
  const [layer, setLayer] = useState<Page>(readLayer);
  const [account, setAccount] = usePersistentState<AccountState>('regie.account.v2', INITIAL_ACCOUNT);
  const [accountToast, setAccountToast] = useState<string | null>(null);

  useEffect(() => {
    const onHash = () => setLayer(readLayer());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Migrate browser profiles: old theme value is dropped, other fields survive.
  useEffect(() => {
    if (Object.prototype.hasOwnProperty.call(account, 'theme')) {
      setAccount(migrateAccountLightOnly(account));
    }
  }, [account, setAccount]);

  return (
    <div className="ripple-app min-h-screen overflow-x-hidden">
      <header className="fixed top-0 inset-x-0 z-50 h-[56px] ripple-header backdrop-blur-xl backdrop-saturate-150 border-b">
        <div className="max-w-[1680px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
          <a href="#booking" className="min-w-0 flex items-center gap-2.5" aria-label="Accueil Matt Mez Sax">
            <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#0A84FF]" aria-hidden="true" />
            <span className="font-bold text-[14px] sm:text-[16px] tracking-[0.01em]">{layer === 'booking' ? 'MATT MEZ SAX' : 'RIPPLECIRCLE'}</span>
            <span className="hidden sm:inline text-[11px] tracking-[0.08em] uppercase opacity-50">{layer === 'booking' ? 'Réservation · mariage' : 'Instrument causal · 2D'}</span>
          </a>
          <button
            type="button"
            onClick={() => { if (layer !== 'account') window.location.hash = 'account'; }}
            aria-current={layer === 'account' ? 'page' : undefined}
            className="pressable flex items-center gap-2 h-9 px-3.5 rounded-[10px] shrink-0 text-[13px] font-semibold ripple-icon-button"
          >
            <CircleUserRound className="w-4 h-4" />
            {layer === 'booking' ? 'Compte démo' : 'Compte'}
          </button>
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
        ) : layer === 'booking' ? (
          <SaxBookingLanding />
        ) : (
          <Ripple
            activeLayer={layer}
            account={account}
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
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[90] px-5 py-3 rounded-[10px] bg-[#1d1d1f] text-white text-[13px] font-semibold shadow-lg news-swap" role="status">
          {accountToast}
        </div>
      )}
    </div>
  );
};
