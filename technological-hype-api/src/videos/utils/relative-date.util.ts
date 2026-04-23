const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

type Unit = { seconds: number; singular: string; plural: string };

const UNITS: Unit[] = [
  { seconds: YEAR, singular: 'año', plural: 'años' },
  { seconds: MONTH, singular: 'mes', plural: 'meses' },
  { seconds: DAY, singular: 'día', plural: 'días' },
  { seconds: HOUR, singular: 'hora', plural: 'horas' },
  { seconds: MINUTE, singular: 'minuto', plural: 'minutos' },
  { seconds: SECOND, singular: 'segundo', plural: 'segundos' },
];

export function toRelativeSpanish(
  isoDate: string,
  now: Date = new Date(),
): string {
  const published = new Date(isoDate);
  if (Number.isNaN(published.getTime())) {
    return 'Fecha desconocida';
  }

  const diffSeconds = Math.floor((now.getTime() - published.getTime()) / 1000);

  if (diffSeconds < 5) {
    return 'Hace un momento';
  }

  for (const unit of UNITS) {
    const value = Math.floor(diffSeconds / unit.seconds);
    if (value >= 1) {
      const label = value === 1 ? unit.singular : unit.plural;
      return `Hace ${value} ${label}`;
    }
  }

  return 'Hace un momento';
}
