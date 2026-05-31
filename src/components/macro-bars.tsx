type Macro = { label: string; have: number; goal: number; color: string };

export function MacroBars({ macros }: { macros: Macro[] }) {
  return (
    <div className="space-y-2 px-4">
      {macros.map((m) => {
        const pct = Math.min(100, Math.round((m.have / m.goal) * 100));
        return (
          <div key={m.label}>
            <div className="flex justify-between text-sm">
              <span>{m.label}</span>
              <span className="tabular-nums text-stone-600">{m.have} / {m.goal} g</span>
            </div>
            <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full" style={{ width: `${pct}%`, backgroundColor: m.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
