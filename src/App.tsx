import React, { useEffect, useState } from 'react';
import { Landing } from './components/landing/Landing';
import { Ripple3D } from './components/clock3d/Ripple3D';

/**
 * Root App — default 2D Landing. The 3D "Clock of Consequences" instrument is
 * served as a standalone static page at `/clock3d/` (see public/clock3d/). When
 * the hash is `#clock3d` we bump the browser to that static URL so the mature
 * vanilla-three.js build runs isolated from the React tree.
 *
 * Per the preservation directive the 2D Ripple is never deleted nor replaced;
 * the 3D clock remains accessible via the "HORLOGE 3D" entry point on the
 * landing page, and the 3D page offers a "← RETOUR 2D" link back to `/`.
 */
export const App: React.FC = () => {
  const [route, setRoute] = useState<'landing' | 'clock3d-react'>(() =>
    window.location.hash === '#clock3d-react' ? 'clock3d-react' : 'landing'
  );

  useEffect(() => {
    // If the legacy #clock3d hash is requested, redirect to the standalone
    // static 3D instrument. Keep a #clock3d-react escape hatch for development.
    if (window.location.hash === '#clock3d') {
      window.location.replace('/clock3d/index.html');
      return;
    }
    const onHash = () => {
      if (window.location.hash === '#clock3d') {
        window.location.replace('/clock3d/index.html');
        return;
      }
      setRoute(window.location.hash === '#clock3d-react' ? 'clock3d-react' : 'landing');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (route === 'clock3d-react') return <Ripple3D />;
  return <Landing />;
};

export default App;
