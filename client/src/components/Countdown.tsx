import { useEffect, useState } from 'react';

interface Props {
  target: string;
  className?: string;
}

const DAY = 86_400_000;

/**
 * Dias contados pelo calendário do lugar da festa (o fuso vem do próprio horário-alvo, ex.: "-03:00"):
 * na véspera falta 1 dia, a qualquer hora. Horas e minutos só aparecem no dia da festa.
 */
export function diffParts(targetIso: string, now = Date.now()) {
  const target = new Date(targetIso).getTime();
  const ms = target - now;
  if (ms <= 0) return null;
  const tz = /([+-])(\d{2}):?(\d{2})$/.exec(targetIso);
  const offset = tz ? (tz[1] === '-' ? -1 : 1) * (Number(tz[2]) * 60 + Number(tz[3])) * 60_000 : 0;
  const localDay = (t: number) => Math.floor((t + offset) / DAY);
  const days = localDay(target) - localDay(now);
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return { days, hours, minutes };
}

export function Countdown({ target, className = '' }: Props) {
  const targetMs = new Date(target).getTime();
  const [parts, setParts] = useState(() => diffParts(target));

  useEffect(() => {
    const id = window.setInterval(() => setParts(diffParts(target)), 30_000);
    return () => window.clearInterval(id);
  }, [target]);

  if (!parts) {
    const sinceMs = Date.now() - targetMs;
    const isToday = sinceMs < 12 * 3_600_000;
    return (
      <div className={`font-script text-4xl text-olive-dark ${className}`}>
        {isToday ? 'É hoje!' : 'Foi lindo!'}
      </div>
    );
  }

  // Antes do dia da festa: só os dias (pelo calendário). No dia: horas e minutos até a cerimônia.
  const items =
    parts.days >= 1
      ? [{ v: parts.days, l: parts.days === 1 ? 'dia' : 'dias' }]
      : [
          { v: parts.hours, l: parts.hours === 1 ? 'hora' : 'horas' },
          { v: parts.minutes, l: 'min' },
        ];
  const prefix = parts.days >= 1 ? (parts.days === 1 ? 'Falta' : 'Faltam') : 'É hoje! Faltam';

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="text-xs font-semibold tracking-[0.25em] text-olive uppercase">{prefix}</div>
      <div className="flex items-end justify-center gap-4">
        {items.map((it) => (
          <div key={it.l} className="text-center">
            <div className="font-serif text-4xl leading-none font-semibold text-olive-dark tabular-nums">{it.v}</div>
            <div className="mt-1 text-[11px] font-semibold tracking-widest text-olive uppercase">{it.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
