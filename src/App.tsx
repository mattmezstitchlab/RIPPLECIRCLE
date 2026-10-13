import React from 'react';
import { Landing } from './components/landing/Landing';

/**
 * RIPPLECIRCLE — point d'entrée unique du cadran interactif SVG 2D.
 * Les onglets restent pilotés par les ancres dans Landing.
 */
export const App: React.FC = () => <Landing />;

export default App;
