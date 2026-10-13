import {describe,it,expect} from 'vitest';
import {MONTHS_FR,bookingEmailUrl,dateSummary,daysInMonth,isoDay,publicAvailability,validFutureDay} from '../bookingCalendar';
describe('RIPPLECIRCLE V8: date publique et confidentialité',()=>{
  it('préserve une année de 12 mois et le 29 février',()=>{
    expect(MONTHS_FR).toHaveLength(12);
    expect(daysInMonth(2028,1)).toBe(29);
    expect(daysInMonth(2027,1)).toBe(28);
    expect(isoDay(2027,4,9)).toBe('2027-05-09');
  });
  it('refuse dates invalides ou passées',()=>{
    expect(validFutureDay('2027-02-29','2026-10-14')).toBe(false);
    expect(validFutureDay('2028-02-29','2026-10-14')).toBe(true);
    expect(validFutureDay('2026-01-01','2026-10-14')).toBe(false);
    expect(validFutureDay('2027-07-04','2026-10-14')).toBe(true);
  });
  it('ne prétend pas savoir si Matt est disponible',()=>{
    expect(publicAvailability('2027-05-22')).toBe('unknown');
    expect(publicAvailability('2028-08-01')).toBe('unknown');
  });
  it('prépare un courriel avec une date, jamais une réservation implicite',()=>{
    const uri=bookingEmailUrl({day:'2027-05-22',city:'Lille',moment:'Cocktail',firstName:'Camille'});
    expect(uri).toContain('mailto:bookingmattmezsax@gmail.com');
    expect(decodeURIComponent(uri!)).toContain('2027-05-22');
    expect(decodeURIComponent(uri!)).toContain('Lille');
    expect(uri).not.toContain('confirmed');
    expect(bookingEmailUrl({day:'2020-01-01',city:'',moment:'',firstName:''})).toBeNull();
  });
  it('fournit une date lisible sans prétendre à une disponibilité',()=>{
    const result=dateSummary('2028-02-29');
    expect(result?.heading).toContain('29 février 2028');
    expect(result?.weekday).toBe('mardi');
  });
});
