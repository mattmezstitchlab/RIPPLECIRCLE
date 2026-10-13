import React, { useEffect, useState } from 'react';
import { Landing } from './components/landing/Landing';
import { Ripple3D } from './components/clock3d/Ripple3D';

/**
 * Root App — switches between the established 2D Landing (default) and the
 * new 3D "Clock of Consequences" instrument (accessible via #clock3d hash).
 *
 * Per the preservation directive the 2D Ripple is never deleted nor replaced;
 * the 3D clock is a separate route on the same React tree.
 */
export const App: React.FC = () => {
  const [route, setRoute] = useState<'landing' | 'clock3d'>(() =>
    window.location.hash === '#clock3d' ? 'clock3d' : 'landing'
  );

  useEffect(() => {
    const onHash = () => {
      setRoute(window.location.hash === '#clock3d' ? 'clock3d' : 'landing');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (route === 'clock3d') return <Ripple3D />;
  return <Landing />;
};

export default App;
