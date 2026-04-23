import { toRelativeSpanish } from './relative-date.util';

const NOW = new Date('2026-04-22T12:00:00Z');

const atDiff = (unit: 's' | 'm' | 'h' | 'd' | 'mo' | 'y', amount: number) => {
  const secondsByUnit = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
    mo: 30 * 86400,
    y: 365 * 86400,
  } as const;
  return new Date(NOW.getTime() - amount * secondsByUnit[unit] * 1000).toISOString();
};

describe('toRelativeSpanish', () => {
  it('returns "Hace un momento" for diffs below 5 seconds', () => {
    expect(toRelativeSpanish(atDiff('s', 0), NOW)).toBe('Hace un momento');
    expect(toRelativeSpanish(atDiff('s', 4), NOW)).toBe('Hace un momento');
  });

  it('uses singular forms for diff of 1 unit', () => {
    expect(toRelativeSpanish(atDiff('m', 1), NOW)).toBe('Hace 1 minuto');
    expect(toRelativeSpanish(atDiff('h', 1), NOW)).toBe('Hace 1 hora');
    expect(toRelativeSpanish(atDiff('d', 1), NOW)).toBe('Hace 1 día');
    expect(toRelativeSpanish(atDiff('mo', 1), NOW)).toBe('Hace 1 mes');
    expect(toRelativeSpanish(atDiff('y', 1), NOW)).toBe('Hace 1 año');
  });

  it('uses plural forms for diff > 1 unit', () => {
    expect(toRelativeSpanish(atDiff('s', 15), NOW)).toBe('Hace 15 segundos');
    expect(toRelativeSpanish(atDiff('m', 7), NOW)).toBe('Hace 7 minutos');
    expect(toRelativeSpanish(atDiff('h', 3), NOW)).toBe('Hace 3 horas');
    expect(toRelativeSpanish(atDiff('d', 5), NOW)).toBe('Hace 5 días');
    expect(toRelativeSpanish(atDiff('mo', 2), NOW)).toBe('Hace 2 meses');
    expect(toRelativeSpanish(atDiff('y', 4), NOW)).toBe('Hace 4 años');
  });

  it('picks the largest unit that fits', () => {
    // 90 minutes → 1 hour (not 90 minutos)
    expect(toRelativeSpanish(atDiff('m', 90), NOW)).toBe('Hace 1 hora');
    // 400 days → 1 año
    expect(toRelativeSpanish(atDiff('d', 400), NOW)).toBe('Hace 1 año');
  });

  it('returns "Fecha desconocida" for invalid input', () => {
    expect(toRelativeSpanish('not-a-date', NOW)).toBe('Fecha desconocida');
  });
});
