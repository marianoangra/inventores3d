import type { Art } from "@/lib/products";
import { colorOf } from "@/lib/products";

// Ilustrações vetoriais dos produtos — placeholder elegante até chegarem as fotos reais.
// Para usar foto: coloque /public/produtos/<slug>.jpg e troque o <ProductArt> por <Image>.

type Props = { art: Art; color: string; className?: string; id: string };

export default function ProductArt({ art, color, className, id }: Props) {
  const c = colorOf(color);
  const g = `g-${id}-${color}`;
  const fill = `url(#${g})`;
  const seg = (n: number, f: (i: number) => { x: number; y: number; r: number }) =>
    Array.from({ length: n }, (_, i) => {
      const s = f(i);
      return <ellipse key={i} cx={s.x} cy={s.y} rx={s.r} ry={s.r * 0.78} fill={fill} stroke="#0003" strokeWidth={1.2} />;
    });
  const eye = (x: number, y: number, r = 4) => (
    <g>
      <circle cx={x} cy={y} r={r} fill="#fff" />
      <circle cx={x + r * 0.25} cy={y} r={r * 0.55} fill="#111" />
    </g>
  );

  let body: React.ReactNode = null;
  switch (art) {
    case "dragon":
      body = (
        <g>
          <path d="M92 92 L40 40 L70 90 L30 70 L78 104Z" fill={fill} opacity={0.75} stroke="#0003" />
          <path d="M112 92 L164 40 L134 90 L174 70 L126 104Z" fill={fill} opacity={0.75} stroke="#0003" />
          {seg(12, (i) => ({ x: 100 + Math.sin(i * 0.6) * 18, y: 92 + i * 7.5, r: 12 - i * 0.7 }))}
          <ellipse cx={100} cy={76} rx={17} ry={14} fill={fill} stroke="#0003" />
          <path d="M88 66 L84 50 L94 63Z M112 66 L116 50 L106 63Z" fill={fill} stroke="#0003" />
          {eye(93, 74)}
          {eye(107, 74)}
        </g>
      );
      break;
    case "egg":
      body = (
        <g>
          <path d="M100 38 C138 38 152 100 150 130 C148 160 126 172 100 172 C74 172 52 160 50 130 C48 100 62 38 100 38Z" fill={fill} stroke="#0003" />
          {Array.from({ length: 18 }, (_, i) => (
            <path key={i} d={`M${62 + (i % 6) * 15} ${80 + Math.floor(i / 6) * 26} q7 -9 14 0`} fill="none" stroke="#fff6" strokeWidth={2} />
          ))}
          <path d="M52 118 L66 108 L80 120 L94 106 L108 120 L122 106 L136 120 L148 110" fill="none" stroke="#fff" strokeWidth={3} />
          <circle cx={100} cy={100} r={9} fill="#fff9" />
          {eye(96, 100, 3)}
          {eye(106, 100, 3)}
        </g>
      );
      break;
    case "dino":
      body = (
        <g>
          {seg(9, (i) => ({ x: 128 - i * 10, y: 110 + Math.sin(i * 0.5) * 4 + i * 2.5, r: 15 - i * 1.2 }))}
          <ellipse cx={136} cy={78} rx={22} ry={15} fill={fill} stroke="#0003" />
          <rect x={120} y={88} width={14} height={20} rx={6} fill={fill} stroke="#0003" />
          <rect x={112} y={124} width={10} height={30} rx={5} fill={fill} stroke="#0003" />
          <rect x={132} y={124} width={10} height={30} rx={5} fill={fill} stroke="#0003" />
          <path d="M118 84 L156 84" stroke="#0005" strokeWidth={2} />
          {eye(144, 72)}
        </g>
      );
      break;
    case "axolotl":
      body = (
        <g>
          {seg(8, (i) => ({ x: 100, y: 96 + i * 9, r: 15 - i * 1.3 }))}
          <ellipse cx={100} cy={80} rx={28} ry={20} fill={fill} stroke="#0003" />
          {[-1, 1].map((s) => (
            <g key={s}>
              <path d={`M${100 + s * 26} 70 l${s * 18} -12`} stroke={c.b} strokeWidth={6} strokeLinecap="round" />
              <path d={`M${100 + s * 28} 78 l${s * 22} -2`} stroke={c.b} strokeWidth={6} strokeLinecap="round" />
              <path d={`M${100 + s * 26} 86 l${s * 18} 10`} stroke={c.b} strokeWidth={6} strokeLinecap="round" />
            </g>
          ))}
          {eye(90, 78)}
          {eye(110, 78)}
          <path d="M94 88 q6 5 12 0" stroke="#111" strokeWidth={2} fill="none" />
        </g>
      );
      break;
    case "capybara":
      body = (
        <g>
          {seg(5, (i) => ({ x: 70 + i * 14, y: 118, r: 22 }))}
          <rect x={120} y={88} width={44} height={36} rx={16} fill={fill} stroke="#0003" />
          <circle cx={128} cy={86} r={6} fill={fill} stroke="#0003" />
          {[72, 92, 112, 132].map((x) => (
            <rect key={x} x={x - 5} y={134} width={10} height={20} rx={4} fill={fill} stroke="#0003" />
          ))}
          <circle cx={140} cy={100} r={3} fill="#111" />
          <ellipse cx={160} cy={110} rx={3} ry={2} fill="#111" />
          <ellipse cx={92} cy={98} rx={10} ry={4} fill="#f97316" />
        </g>
      );
      break;
    case "shark":
      body = (
        <g>
          {seg(10, (i) => ({ x: 150 - i * 11, y: 104 + Math.sin(i * 0.7) * 8, r: 16 - i * 1.1 }))}
          <path d="M112 90 L124 56 L134 92Z" fill={fill} stroke="#0003" />
          <path d="M46 100 L28 78 L34 104 L26 126Z" fill={fill} stroke="#0003" />
          <path d="M152 112 q10 4 18 -2" stroke="#fff" strokeWidth={2} fill="none" />
          {eye(158, 98, 3.5)}
        </g>
      );
      break;
    case "snake":
      body = (
        <g>
          {seg(26, (i) => ({ x: 30 + i * 5.6, y: 100 + Math.sin(i * 0.45) * 30, r: 8 - i * 0.12 }))}
          <ellipse cx={26} cy={98} rx={12} ry={9} fill={fill} stroke="#0003" />
          <path d="M14 100 l-8 -3 m8 3 l-8 3" stroke="#e11d48" strokeWidth={2} />
          {eye(24, 94, 3)}
        </g>
      );
      break;
    case "octopus":
      body = (
        <g>
          {Array.from({ length: 8 }, (_, k) => {
            const a = Math.PI * (0.15 + (k / 7) * 0.7);
            return Array.from({ length: 6 }, (_, i) => (
              <circle key={`${k}-${i}`} cx={100 + Math.cos(a) * (28 + i * 9) * (k < 4 ? -1 : 1) * (k < 4 ? 1 : 1)} cy={110 + Math.sin(a) * (14 + i * 9)} r={7 - i * 0.8} fill={fill} stroke="#0003" />
            ));
          })}
          <ellipse cx={100} cy={88} rx={36} ry={32} fill={fill} stroke="#0003" />
          {eye(88, 88, 6)}
          {eye(112, 88, 6)}
          <path d="M94 102 q6 5 12 0" stroke="#111" strokeWidth={2} fill="none" />
        </g>
      );
      break;
    case "cat":
      body = (
        <g>
          {seg(6, (i) => ({ x: 90 - i * 2, y: 104 + i * 9, r: 16 - i }))}
          {seg(9, (i) => ({ x: 104 + i * 7, y: 150 - Math.sin(i * 0.5) * 24, r: 6 - i * 0.3 }))}
          <circle cx={92} cy={78} r={22} fill={fill} stroke="#0003" />
          <path d="M74 66 L72 44 L88 58Z M110 66 L112 44 L96 58Z" fill={fill} stroke="#0003" />
          {eye(84, 76)}
          {eye(100, 76)}
          <path d="M92 86 l-3 3 m3 -3 l3 3" stroke="#111" strokeWidth={2} />
        </g>
      );
      break;
    case "gear": {
      const gear = (cx: number, cy: number, r: number, teeth: number, rot: number) => (
        <g transform={`rotate(${rot} ${cx} ${cy})`}>
          {Array.from({ length: teeth }, (_, i) => (
            <rect key={i} x={cx - 4} y={cy - r - 7} width={8} height={12} rx={2} fill={fill} transform={`rotate(${(360 / teeth) * i} ${cx} ${cy})`} />
          ))}
          <circle cx={cx} cy={cy} r={r} fill={fill} stroke="#0003" />
          <circle cx={cx} cy={cy} r={r * 0.35} fill="#fff" opacity={0.85} />
        </g>
      );
      body = (
        <g>
          {gear(78, 86, 30, 12, 0)}
          {gear(132, 122, 24, 10, 18)}
          {gear(132, 62, 16, 8, 8)}
        </g>
      );
      break;
    }
    case "slider":
      body = (
        <g>
          <rect x={40} y={78} width={120} height={44} rx={22} fill="#0001" stroke="#0002" />
          <rect x={46} y={84} width={70} height={32} rx={16} fill={fill} stroke="#0003" />
          {[60, 72, 84, 96].map((x) => (
            <line key={x} x1={x} y1={92} x2={x} y2={108} stroke="#fff8" strokeWidth={3} strokeLinecap="round" />
          ))}
          <path d="M128 100 h20 m-6 -6 l6 6 -6 6" stroke="#0006" strokeWidth={3} fill="none" />
        </g>
      );
      break;
    case "keychain":
      body = (
        <g>
          <circle cx={100} cy={44} r={14} fill="none" stroke="#9ca3af" strokeWidth={5} />
          <line x1={100} y1={58} x2={100} y2={74} stroke="#9ca3af" strokeWidth={4} />
          {seg(8, (i) => ({ x: 100 + Math.sin(i * 0.8) * 10, y: 96 + i * 9, r: 10 - i * 0.7 }))}
          <ellipse cx={100} cy={84} rx={14} ry={12} fill={fill} stroke="#0003" />
          {eye(94, 82, 3)}
          {eye(106, 82, 3)}
        </g>
      );
      break;
    case "name":
      body = (
        <g>
          <circle cx={46} cy={100} r={10} fill="none" stroke="#9ca3af" strokeWidth={4} />
          <rect x={54} y={78} width={112} height={44} rx={14} fill={c.b} stroke="#0003" />
          <text x={110} y={110} textAnchor="middle" fontSize={26} fontWeight={800} fill={c.a} fontFamily="system-ui">
            LUNA
          </text>
        </g>
      );
      break;
    case "lamp":
      body = (
        <g>
          <rect x={56} y={40} width={88} height={100} rx={6} fill="#fef3c7" stroke="#0002" />
          <circle cx={100} cy={78} r={18} fill="#d6a76c" opacity={0.7} />
          <path d="M68 132 q32 -48 64 0" fill="#c08a4f" opacity={0.6} />
          <rect x={48} y={140} width={104} height={20} rx={6} fill={fill} />
          <circle cx={100} cy={90} r={70} fill="#fde68a" opacity={0.18} />
        </g>
      );
      break;
    case "box":
      body = (
        <g>
          <rect x={52} y={88} width={96} height={70} rx={6} fill={fill} stroke="#0003" />
          <rect x={46} y={74} width={108} height={20} rx={5} fill={fill} stroke="#0003" />
          <rect x={94} y={74} width={12} height={84} fill="#fff" opacity={0.9} />
          <path d="M100 74 C84 50 66 62 86 74 M100 74 C116 50 134 62 114 74" stroke="#fff" strokeWidth={6} fill="none" />
          <text x={100} y={136} textAnchor="middle" fontSize={30} fontWeight={900} fill="#fff">?</text>
        </g>
      );
      break;
    case "party":
      body = (
        <g>
          {[
            [60, 70, "#f43f5e"],
            [100, 56, "#3b82f6"],
            [140, 70, "#22c55e"],
            [76, 118, "#f59e0b"],
            [124, 118, "#a855f7"],
          ].map(([x, y, col], k) => (
            <g key={k}>
              {Array.from({ length: 5 }, (_, i) => (
                <circle key={i} cx={(x as number) + Math.sin(i) * 4} cy={(y as number) + i * 6} r={6 - i * 0.6} fill={col as string} />
              ))}
            </g>
          ))}
          <path d="M40 160 L100 140 L160 160" stroke={c.a} strokeWidth={4} fill="none" />
          {[52, 76, 100, 124, 148].map((x, i) => (
            <path key={x} d={`M${x - 8} ${150 - Math.abs(2 - i) * -0} l8 14 l8 -14Z`} fill={["#f43f5e", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7"][i]} />
          ))}
        </g>
      );
      break;
  }

  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Ilustração do produto">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c.a} />
          <stop offset="1" stopColor={c.b} />
        </linearGradient>
      </defs>
      {body}
    </svg>
  );
}
