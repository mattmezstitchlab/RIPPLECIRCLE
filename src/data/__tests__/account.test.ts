import { describe, expect, it } from 'vitest';
import { INITIAL_ACCOUNT, freshDemoAccount, migrateAccountLightOnly } from '../account';

describe('Compte RIPPLECIRCLE — thème clair unique', () => {
  it('supprime le thème nuit hérité sans effacer la saisie locale', () => {
    const old = { ...freshDemoAccount(), first: 'Camille', email:'camille@example.fr',
      rsvp:'maybe' as const, journey:[{id:'j-custom', date:'2026-10-01',
      title:'Étape personnalisée', detail:'Donnée locale', kind:'autre' as const,
      shared:false}], theme:'night' };
    const clean = migrateAccountLightOnly(old);
    expect(clean).not.toHaveProperty('theme');
    expect(clean.first).toBe('Camille');
    expect(clean.email).toBe('camille@example.fr');
    expect(clean.rsvp).toBe('maybe');
    expect(clean.journey).toEqual(old.journey);
    expect(old.theme).toBe('night');
  });
  it('réinitialise le seul profil fictif avec des collections non partagées', () => {
    const a = freshDemoAccount(), b = freshDemoAccount();
    a.journey.pop();a.interests.pop();
    expect(b).toEqual(INITIAL_ACCOUNT);
    expect(a.journey).not.toBe(b.journey);
    expect(a.interests).not.toBe(b.interests);
    expect(INITIAL_ACCOUNT).not.toHaveProperty('theme');
  });
});
