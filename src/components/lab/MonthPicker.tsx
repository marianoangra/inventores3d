import Link from "next/link";

const shift = (key: string, d: number) => {
  const [y, m] = key.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1 + d, 1));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}`;
};

export default function MonthPicker({ path, monthKey, label }: { path: string; monthKey: string; label: string }) {
  const btn = "grid h-10 w-10 place-items-center rounded-full border border-lab-line bg-lab-card text-lab-muted hover:text-lab-text";
  return (
    <div className="flex items-center gap-2">
      <Link href={`${path}?m=${shift(monthKey, -1)}`} className={btn} aria-label="Mês anterior">‹</Link>
      <p className="min-w-40 text-center font-display font-extrabold">{label}</p>
      <Link href={`${path}?m=${shift(monthKey, 1)}`} className={btn} aria-label="Próximo mês">›</Link>
    </div>
  );
}
