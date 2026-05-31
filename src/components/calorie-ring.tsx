type Props = { remaining: number; goal: number };

export function CalorieRing({ remaining, goal }: Props) {
  const pct = Math.max(0, Math.min(1, (goal - remaining) / goal));
  const C = 2 * Math.PI * 70;
  const offset = C * (1 - pct);
  return (
    <div className="relative h-44 w-44 mx-auto">
      <svg viewBox="0 0 160 160" className="-rotate-90 h-full w-full">
        <circle cx="80" cy="80" r="70" stroke="#E8DDD0" strokeWidth="14" fill="none" />
        <circle
          cx="80" cy="80" r="70"
          stroke="#1A1A1A" strokeWidth="14" fill="none"
          strokeDasharray={C} strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold tabular-nums">{remaining}</div>
        <div className="text-xs uppercase tracking-wide text-stone-500">remaining</div>
      </div>
    </div>
  );
}
