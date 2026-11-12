import type { Art } from "@/lib/products";
import { colorOf } from "@/lib/products";

// Ilustrações vetoriais com sombreamento de "plástico" + linhas de camada (cara de impressão 3D).
// Pra usar foto real: coloque /public/produtos/<slug>.webp e troque o <ProductArt> por <Image>.

type Props = { art: Art; color: string; className?: string; id: string; shadow?: boolean };

export default function ProductArt({ art, color, className, id, shadow = true }: Props) {
  const c = colorOf(color);
  const k = `${id}-${color}`.replace(/[^a-zA-Z0-9-]/g, "");
  const F = `url(#p-${k})`; // corpo (plástico)
  const W = `url(#w-${k})`; // asa / secundário
  const L = `url(#l-${k})`; // linhas de camada
  const S = "rgba(20,10,40,.18)";

  // corpo segmentado ao longo de uma curva
  const chain = (pts: { x: number; y: number; r: number }[]) =>
    pts.map((s, i) => (
      <g key={i}>
        <ellipse cx={s.x} cy={s.y} rx={s.r} ry={s.r * 0.86} fill={F} stroke={S} strokeWidth={1} />
        <ellipse cx={s.x} cy={s.y} rx={s.r} ry={s.r * 0.86} fill={L} />
      </g>
    ));
  const eye = (x: number, y: number, r = 4.2) => (
    <g>
      <circle cx={x} cy={y} r={r} fill="#fff" />
      <circle cx={x + r * 0.2} cy={y + r * 0.1} r={r * 0.6} fill="#15121f" />
      <circle cx={x + r * 0.4} cy={y - r * 0.25} r={r * 0.2} fill="#fff" />
    </g>
  );
  const blob = (d: string) => (
    <g>
      <path d={d} fill={F} stroke={S} strokeWidth={1} />
      <path d={d} fill={L} />
    </g>
  );

  let body: React.ReactNode = null;
  let ground = { cx: 100, cy: 172, rx: 56 };

  switch (art) {
    case "dragon": {
      const pts = Array.from({ length: 15 }, (_, i) => {
        const t = i / 14;
        return { x: 70 + t * 92 + Math.sin(t * Math.PI * 1.6) * 6, y: 112 + Math.sin(t * Math.PI * 1.25) * 30 - t * 4, r: 15 - t * 10 };
      });
      body = (
        <g>
          {/* asa de trás */}
          <path d="M96 104 C100 60 128 34 158 30 C150 46 152 52 162 58 C148 62 146 70 152 80 C136 80 126 92 120 110Z" fill={W} stroke={S} opacity={0.75} />
          {chain(pts)}
          {/* ponta do rabo */}
          <path d={`M${pts[14].x + 2} ${pts[14].y} l14 -9 l-3 12 l12 3 l-16 6Z`} fill={F} stroke={S} />
          {/* asa da frente */}
          <path d="M104 100 C96 64 74 40 46 34 C56 46 54 52 46 60 C60 62 62 70 58 80 C72 78 84 88 90 106Z" fill={W} stroke={S} />
          <path d="M100 98 C90 72 72 52 52 42 M96 100 C86 84 72 72 58 66 M92 104 C84 94 76 88 64 84" stroke="rgba(255,255,255,.55)" strokeWidth={2} fill="none" />
          {/* pescoço + cabeça */}
          {chain([{ x: 64, y: 98, r: 13 }, { x: 56, y: 86, r: 12 }])}
          {blob("M30 70 C30 58 44 52 56 56 C66 59 70 68 66 78 C62 86 50 88 40 86 C30 84 22 80 20 76 C22 72 26 72 30 70Z")}
          <path d="M50 56 L58 38 L60 58Z M58 60 L72 46 L68 64Z" fill={W} stroke={S} />
          {eye(48, 68, 5)}
          <circle cx={25} cy={76} r={1.6} fill="#15121f" />
          <path d="M24 82 q8 3 16 0" stroke="#15121f" strokeWidth={1.6} fill="none" strokeLinecap="round" />
          {/* patas */}
          {[[86, 136], [120, 140]].map(([x, y]) => (
            <path key={x} d={`M${x} ${y - 8} q-2 14 -8 18 h14 q-2 -8 2 -18Z`} fill={F} stroke={S} />
          ))}
        </g>
      );
      ground = { cx: 104, cy: 166, rx: 70 };
      break;
    }
    case "egg":
      body = (
        <g>
          {blob("M100 34 C140 34 154 98 152 128 C150 158 128 172 100 172 C72 172 50 158 48 128 C46 98 60 34 100 34Z")}
          {Array.from({ length: 21 }, (_, i) => (
            <path key={i} d={`M${60 + (i % 7) * 13} ${70 + Math.floor(i / 7) * 22 + (i % 2) * 6} q6.5 -8 13 0`} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth={2} />
          ))}
          <path d="M50 120 L64 108 L78 122 L92 106 L106 122 L120 106 L134 122 L150 110" fill="none" stroke="#fff" strokeWidth={3.5} strokeLinejoin="round" />
          <ellipse cx={100} cy={142} rx={22} ry={14} fill="rgba(255,255,255,.25)" />
          {eye(92, 140, 4)}
          {eye(108, 140, 4)}
        </g>
      );
      break;
    case "dino":
      body = (
        <g>
          {chain(Array.from({ length: 10 }, (_, i) => ({ x: 120 - i * 10.5, y: 112 + i * 3 + Math.sin(i * 0.6) * 3, r: 17 - i * 1.3 })))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M${112 - i * 11} ${96 + i * 3} l5 -10 l5 10Z`} fill={W} />
          ))}
          {chain([{ x: 130, y: 98, r: 13 }])}
          {blob("M120 70 C124 56 150 52 166 60 C176 66 176 80 166 86 C156 92 136 92 126 88 C118 84 118 76 120 70Z")}
          <path d="M146 80 L170 80" stroke="rgba(20,10,40,.4)" strokeWidth={2} strokeLinecap="round" />
          {[150, 156, 162].map((x) => <path key={x} d={`M${x} 80 l2 4 l2 -4`} fill="#fff" />)}
          {eye(144, 68, 5)}
          <rect x={132} y={102} width={9} height={14} rx={4} fill={F} stroke={S} />
          {[[104, 124], [128, 124]].map(([x, y]) => (
            <g key={x}>
              <rect x={x - 6} y={y} width={13} height={34} rx={6} fill={F} stroke={S} />
              <ellipse cx={x + 1} cy={y + 34} rx={10} ry={4} fill={F} stroke={S} />
            </g>
          ))}
        </g>
      );
      break;
    case "axolotl":
      body = (
        <g>
          {chain(Array.from({ length: 9 }, (_, i) => ({ x: 100 + Math.sin(i * 0.7) * 6, y: 102 + i * 8.5, r: 16 - i * 1.3 })))}
          {[-1, 1].map((s) => (
            <g key={s}>
              {[[-14, 0], [-4, 2], [8, 4]].map(([dy, dx], j) => (
                <g key={j}>
                  <path d={`M${100 + s * 26} ${78 + dy} l${s * (18 + dx)} ${-8 + j * 7}`} stroke={c.b} strokeWidth={7} strokeLinecap="round" />
                  <path d={`M${100 + s * 26} ${78 + dy} l${s * (18 + dx)} ${-8 + j * 7}`} stroke="rgba(255,255,255,.35)" strokeWidth={2.5} strokeLinecap="round" />
                </g>
              ))}
            </g>
          ))}
          {blob("M72 80 C72 64 86 56 100 56 C114 56 128 64 128 80 C128 94 116 102 100 102 C84 102 72 94 72 80Z")}
          {eye(88, 78, 5)}
          {eye(112, 78, 5)}
          <ellipse cx={82} cy={88} rx={5} ry={3} fill="#ff8fab" opacity={0.7} />
          <ellipse cx={118} cy={88} rx={5} ry={3} fill="#ff8fab" opacity={0.7} />
          <path d="M93 89 q7 6 14 0" stroke="#15121f" strokeWidth={2} fill="none" strokeLinecap="round" />
        </g>
      );
      break;
    case "capybara":
      body = (
        <g>
          {[72, 92, 116, 134].map((x) => (
            <rect key={x} x={x - 6} y={130} width={13} height={26} rx={6} fill={F} stroke={S} />
          ))}
          {chain([0, 1, 2, 3, 4].map((i) => ({ x: 68 + i * 15, y: 116 - Math.sin(i * 0.8) * 3, r: 26 })))}
          {blob("M118 92 C122 78 150 76 166 84 C178 90 178 110 168 118 C156 126 130 126 122 118 C116 110 116 100 118 92Z")}
          <ellipse cx={126} cy={80} rx={6} ry={5} fill={F} stroke={S} />
          {eye(144, 96, 3.6)}
          <ellipse cx={170} cy={104} rx={3.5} ry={2.5} fill="#15121f" />
          <ellipse cx={92} cy={88} rx={13} ry={6} fill="#ff9a3c" />
          <path d="M92 82 l0 -6" stroke="#2fbf71" strokeWidth={3} strokeLinecap="round" />
        </g>
      );
      break;
    case "shark":
      body = (
        <g>
          <path d="M110 94 L120 54 L138 96Z" fill={F} stroke={S} />
          {chain(Array.from({ length: 11 }, (_, i) => ({ x: 152 - i * 10.5, y: 106 + Math.sin(i * 0.6) * 9, r: 18 - i * 1.3 })))}
          <path d="M46 104 L22 78 L32 106 L20 132Z" fill={F} stroke={S} />
          <path d="M128 118 L120 140 L140 122Z" fill={F} stroke={S} />
          <path d="M150 116 q12 6 22 -2" stroke="#fff" strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <ellipse cx={140} cy={116} rx={26} ry={8} fill="rgba(255,255,255,.3)" />
          {eye(160, 98, 4)}
        </g>
      );
      break;
    case "snake":
      body = (
        <g>
          {chain(Array.from({ length: 28 }, (_, i) => ({ x: 34 + i * 5.2, y: 104 + Math.sin(i * 0.42) * 30, r: 9.5 - i * 0.18 })))}
          {blob("M14 100 C14 90 26 84 38 88 C46 91 48 100 44 106 C40 112 26 112 20 110 C16 108 14 104 14 100Z")}
          <path d="M14 102 l-9 -4 m9 4 l-9 4" stroke="#ff4d6d" strokeWidth={2} strokeLinecap="round" />
          {eye(30, 96, 3.5)}
        </g>
      );
      break;
    case "octopus":
      body = (
        <g>
          {Array.from({ length: 8 }, (_, t) => {
            const side = t < 4 ? -1 : 1;
            const j = t % 4;
            return chain(
              Array.from({ length: 6 }, (_, i) => ({
                x: 100 + side * (8 + j * 7 + i * (1.5 + j * 1.3)) + Math.sin(i * 0.9 + j) * 3,
                y: 114 + i * 9 - j * 2,
                r: 7.5 - i * 0.85,
              })),
            );
          })}
          {blob("M62 92 C62 62 80 46 100 46 C120 46 138 62 138 92 C138 112 122 120 100 120 C78 120 62 112 62 92Z")}
          {eye(86, 92, 7)}
          {eye(114, 92, 7)}
          <path d="M94 106 q6 5 12 0" stroke="#15121f" strokeWidth={2} fill="none" strokeLinecap="round" />
        </g>
      );
      break;
    case "cat":
      body = (
        <g>
          {chain(Array.from({ length: 10 }, (_, i) => ({ x: 108 + i * 6.5, y: 152 - Math.sin(i * 0.45) * 30, r: 6.5 - i * 0.3 })))}
          {chain(Array.from({ length: 6 }, (_, i) => ({ x: 92 + i * 1, y: 104 + i * 9, r: 18 - i * 0.8 })))}
          {blob("M68 78 C68 62 80 54 92 54 C104 54 116 62 116 78 C116 92 106 100 92 100 C78 100 68 92 68 78Z")}
          <path d="M72 68 L70 42 L88 58Z M112 68 L114 42 L96 58Z" fill={F} stroke={S} />
          <path d="M74 62 L73 50 L82 58Z M110 62 L111 50 L102 58Z" fill="#ffb3c7" />
          {eye(84, 76, 4.6)}
          {eye(100, 76, 4.6)}
          <path d="M90 86 l2 2 l2 -2" stroke="#15121f" strokeWidth={1.8} fill="none" />
          <path d="M70 84 h-12 M70 88 h-11 M114 84 h12 M114 88 h11" stroke="rgba(20,10,40,.35)" strokeWidth={1.2} />
        </g>
      );
      break;
    case "gear": {
      const gear = (cx: number, cy: number, r: number, teeth: number, rot: number) => (
        <g transform={`rotate(${rot} ${cx} ${cy})`}>
          {Array.from({ length: teeth }, (_, i) => (
            <rect key={i} x={cx - 5} y={cy - r - 8} width={10} height={14} rx={3} fill={F} stroke={S} transform={`rotate(${(360 / teeth) * i} ${cx} ${cy})`} />
          ))}
          <circle cx={cx} cy={cy} r={r} fill={F} stroke={S} />
          <circle cx={cx} cy={cy} r={r} fill={L} />
          <circle cx={cx} cy={cy} r={r * 0.62} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={r * 0.3} fill="#fff" stroke={S} />
        </g>
      );
      body = (
        <g>
          {gear(76, 92, 32, 12, 0)}
          {gear(134, 128, 25, 10, 18)}
          {gear(136, 64, 17, 8, 8)}
        </g>
      );
      break;
    }
    case "slider":
      body = (
        <g>
          <rect x={34} y={74} width={132} height={52} rx={26} fill="#fff" stroke="rgba(20,10,40,.12)" strokeWidth={2} />
          <rect x={34} y={74} width={132} height={52} rx={26} fill={L} />
          <rect x={42} y={82} width={76} height={36} rx={18} fill={F} stroke={S} />
          {[58, 70, 82, 94].map((x) => (
            <line key={x} x1={x} y1={92} x2={x} y2={108} stroke="rgba(255,255,255,.7)" strokeWidth={3} strokeLinecap="round" />
          ))}
          <path d="M130 100 h22 m-7 -7 l7 7 -7 7" stroke="rgba(20,10,40,.35)" strokeWidth={3} fill="none" strokeLinecap="round" />
        </g>
      );
      break;
    case "keychain":
      body = (
        <g>
          <circle cx={100} cy={40} r={15} fill="none" stroke="#b8b4c4" strokeWidth={5} />
          <circle cx={100} cy={40} r={15} fill="none" stroke="#fff" strokeWidth={1.5} strokeDasharray="6 30" />
          <path d="M100 55 v12" stroke="#b8b4c4" strokeWidth={4} strokeLinecap="round" />
          {chain(Array.from({ length: 9 }, (_, i) => ({ x: 100 + Math.sin(i * 0.8) * 10, y: 98 + i * 8.5, r: 11 - i * 0.8 })))}
          {blob("M84 82 C84 72 92 66 100 66 C108 66 116 72 116 82 C116 92 108 96 100 96 C92 96 84 92 84 82Z")}
          {eye(94, 80, 3.4)}
          {eye(106, 80, 3.4)}
        </g>
      );
      break;
    case "name":
      body = (
        <g>
          <circle cx={40} cy={100} r={11} fill="none" stroke="#b8b4c4" strokeWidth={4.5} />
          <rect x={50} y={76} width={124} height={48} rx={16} fill={W} stroke={S} />
          <rect x={50} y={76} width={124} height={48} rx={16} fill={L} />
          <text x={112} y={110} textAnchor="middle" fontSize={28} fontWeight={800} fill={c.a} fontFamily="system-ui" letterSpacing={1}>
            LUNA
          </text>
        </g>
      );
      break;
    case "lamp":
      body = (
        <g>
          <circle cx={100} cy={90} r={78} fill="#ffd66b" opacity={0.18} />
          <path d="M56 40 Q100 28 144 40 V138 H56Z" fill="#fff6dc" stroke="rgba(20,10,40,.12)" />
          <circle cx={100} cy={76} r={18} fill="#d9a066" opacity={0.75} />
          <path d="M66 134 q34 -54 68 0" fill="#c98a4e" opacity={0.65} />
          <path d="M56 40 Q100 28 144 40 V138 H56Z" fill={L} />
          <rect x={48} y={136} width={104} height={22} rx={8} fill={F} stroke={S} />
          <circle cx={136} cy={147} r={3} fill="#9cff8f" />
        </g>
      );
      break;
    case "box":
      body = (
        <g>
          <rect x={50} y={88} width={100} height={72} rx={10} fill={F} stroke={S} />
          <rect x={50} y={88} width={100} height={72} rx={10} fill={L} />
          <rect x={44} y={72} width={112} height={22} rx={8} fill={W} stroke={S} />
          <rect x={93} y={72} width={14} height={88} fill="#fff" opacity={0.92} />
          <path d="M100 72 C84 46 62 58 86 72 M100 72 C116 46 138 58 114 72" stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" />
          <text x={100} y={138} textAnchor="middle" fontSize={30} fontWeight={900} fill="#fff" fontFamily="system-ui">?</text>
        </g>
      );
      break;
    case "party": {
      const cols = ["#ff6b5b", "#6d4aff", "#2fbf71", "#ffc93c", "#22b8f0"];
      body = (
        <g>
          <path d="M24 40 Q100 70 176 40" stroke="#15121f" strokeWidth={2} fill="none" opacity={0.4} />
          {[40, 70, 100, 130, 160].map((x, i) => (
            <path key={x} d={`M${x - 10} ${44 + Math.sin((i / 4) * Math.PI) * 12} l10 18 l10 -18Z`} fill={cols[i]} />
          ))}
          {[
            [62, 104, 0],
            [100, 92, 1],
            [138, 104, 2],
            [80, 140, 3],
            [122, 140, 4],
          ].map(([x, y, ci]) => (
            <g key={ci}>
              <circle cx={x} cy={y - 18} r={6} fill="none" stroke="#b8b4c4" strokeWidth={2.5} />
              {Array.from({ length: 5 }, (_, i) => (
                <circle key={i} cx={x + Math.sin(i * 0.9) * 4} cy={y - 6 + i * 6} r={7 - i * 0.9} fill={cols[ci]} stroke="rgba(20,10,40,.15)" />
              ))}
            </g>
          ))}
        </g>
      );
      ground = { cx: 100, cy: 176, rx: 64 };
      break;
    }
  }

  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Ilustração do produto">
      <defs>
        <radialGradient id={`p-${k}`} cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#fff" stopOpacity={0.9} />
          <stop offset="0.18" stopColor={c.b} />
          <stop offset="0.75" stopColor={c.a} />
          <stop offset="1" stopColor={c.a} stopOpacity={0.95} />
        </radialGradient>
        <linearGradient id={`w-${k}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c.b} />
          <stop offset="1" stopColor={c.a} />
        </linearGradient>
        <pattern id={`l-${k}`} width="4" height="2.2" patternUnits="userSpaceOnUse">
          <rect width="4" height="0.7" fill="rgba(255,255,255,.14)" />
        </pattern>
      </defs>
      {shadow && <ellipse cx={ground.cx} cy={ground.cy + 14} rx={ground.rx} ry={7} fill="rgba(20,10,40,.10)" />}
      {body}
    </svg>
  );
}
