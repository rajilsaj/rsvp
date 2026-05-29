"use client";

// Colour palette — Black · White · Burgundy · Gold
const C = {
  burgundydark: "#4A1520",
  burgundy:     "#722F37",
  burgundymid:  "#8E3D47",
  mauvedark:    "#7A5060",
  mauve:        "#A07080",
  mauvelight:   "#C09098",
  leafdark:     "#2A2015",
  leafmid:      "#5A4020",
  leaflight:    "#8A6838",
  white:        "#FFF8F0",
  whiteShade:   "#F0DED0",
  gold:         "#B8920A",
  goldLight:    "#D4AF37",
};

// ── Petal: ellipse whose "stem" sits at origin, tip points up ──────────────
function Petal({ ry, rx, rot, fill, opacity = 1 }: {
  rx: number; ry: number; rot: number; fill: string; opacity?: number;
}) {
  return (
    <ellipse
      cx={0} cy={-ry}
      rx={rx} ry={ry}
      fill={fill}
      opacity={opacity}
      transform={`rotate(${rot})`}
    />
  );
}

// ── Full rose, centered at origin ─────────────────────────────────────────
function Rose({ scale = 1, colors }: {
  scale?: number;
  colors: { outer: string; mid: string; inner: string; center: string };
}) {
  const outer   = { rx: 10, ry: 20 };
  const middle  = { rx: 8,  ry: 15 };
  const inner   = { rx: 5,  ry: 10 };
  const nOuter  = 9;
  const nMiddle = 8;
  const nInner  = 6;
  return (
    <g transform={`scale(${scale})`}>
      {/* outer petals */}
      {Array.from({ length: nOuter }).map((_, i) => (
        <Petal key={`o${i}`} {...outer} rot={i * (360 / nOuter)} fill={i % 2 ? colors.outer : colors.mid} opacity={0.88} />
      ))}
      {/* middle petals (offset) */}
      {Array.from({ length: nMiddle }).map((_, i) => (
        <Petal key={`m${i}`} {...middle} rot={i * (360 / nMiddle) + 20} fill={i % 2 ? colors.mid : colors.inner} opacity={0.92} />
      ))}
      {/* inner petals */}
      {Array.from({ length: nInner }).map((_, i) => (
        <Petal key={`i${i}`} {...inner} rot={i * (360 / nInner) + 10} fill={colors.inner} opacity={0.96} />
      ))}
      {/* center */}
      <circle cx={0} cy={0} r={7}  fill={colors.center} />
      <circle cx={0} cy={0} r={4}  fill={colors.center} opacity={0.85} />
      <circle cx={0} cy={0} r={2}  fill={C.burgundydark} opacity={0.9} />
    </g>
  );
}

// ── Leaf ──────────────────────────────────────────────────────────────────
function Leaf({ len, width, rot, fill }: { len: number; width: number; rot: number; fill: string }) {
  return (
    <g transform={`rotate(${rot})`}>
      <ellipse cx={0} cy={-len / 2} rx={width} ry={len / 2} fill={fill} opacity={0.88} />
      {/* centre vein */}
      <line x1={0} y1={0} x2={0} y2={-len} stroke={C.leafdark} strokeWidth={0.8} opacity={0.5} />
    </g>
  );
}

// ── Small 5-petal blossom ─────────────────────────────────────────────────
function Blossom({ scale = 1 }: { scale?: number }) {
  return (
    <g transform={`scale(${scale})`}>
      {[0, 72, 144, 216, 288].map((rot, i) => (
        <Petal key={i} rx={5} ry={9} rot={rot} fill={C.white} opacity={0.9} />
      ))}
      <circle cx={0} cy={0} r={4} fill={C.gold} opacity={0.85} />
      <circle cx={0} cy={0} r={2} fill={C.goldLight} />
    </g>
  );
}

// ── Gold sparkle dot ──────────────────────────────────────────────────────
function Sparkle({ x, y, r = 2 }: { x: number; y: number; r?: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={r} fill={C.goldLight} opacity={0.7} />
      <line x1={x - r * 2} y1={y} x2={x + r * 2} y2={y} stroke={C.gold} strokeWidth={0.6} opacity={0.6} />
      <line x1={x} y1={y - r * 2} x2={x} y2={y + r * 2} stroke={C.gold} strokeWidth={0.6} opacity={0.6} />
    </>
  );
}

// ── Leaf cluster helper ───────────────────────────────────────────────────
function LeafCluster({ cx, cy, baseRot }: { cx: number; cy: number; baseRot: number }) {
  return (
    <g transform={`translate(${cx},${cy})`}>
      <Leaf len={28} width={8} rot={baseRot - 20} fill={C.leafmid} />
      <Leaf len={24} width={7} rot={baseRot + 15} fill={C.leaflight} />
      <Leaf len={20} width={6} rot={baseRot}      fill={C.leafdark} />
      <Leaf len={18} width={5} rot={baseRot + 35} fill={C.leafmid} />
    </g>
  );
}

const burgundyRose = { outer: C.burgundymid, mid: C.burgundy, inner: C.burgundydark, center: C.burgundydark };
const mauveRose    = { outer: C.mauvelight,  mid: C.mauve,    inner: C.mauvedark,    center: C.mauvedark    };

// ── TOP-LEFT cluster ──────────────────────────────────────────────────────
function TopLeft() {
  return (
    <svg className="absolute top-0 left-0 w-52 h-52 sm:w-64 sm:h-64 pointer-events-none select-none" viewBox="0 0 200 200" overflow="visible">
      {/* leaves behind */}
      <LeafCluster cx={60}  cy={80}  baseRot={130} />
      <LeafCluster cx={100} cy={50}  baseRot={150} />
      <LeafCluster cx={30}  cy={110} baseRot={110} />

      {/* blossoms */}
      <g transform="translate(85,38)"><Blossom scale={0.8} /></g>
      <g transform="translate(38,90)"><Blossom scale={0.7} /></g>
      <g transform="translate(110,70)"><Blossom scale={0.65}/></g>

      {/* mauve rose */}
      <g transform="translate(95,90)"><Rose scale={1.0} colors={mauveRose} /></g>

      {/* burgundy roses */}
      <g transform="translate(40,50)"><Rose scale={1.2} colors={burgundyRose} /></g>
      <g transform="translate(120,40)"><Rose scale={1.0} colors={burgundyRose} /></g>

      {/* sparkles */}
      <Sparkle x={70}  y={30} r={1.5} />
      <Sparkle x={130} y={60} r={1.2} />
      <Sparkle x={50}  y={130} r={1.0} />
      <Sparkle x={150} y={90} r={1.3} />
    </svg>
  );
}

// ── TOP-RIGHT cluster ─────────────────────────────────────────────────────
function TopRight() {
  return (
    <svg className="absolute top-0 right-0 w-44 h-44 sm:w-56 sm:h-56 pointer-events-none select-none" viewBox="0 0 180 180" overflow="visible">
      <LeafCluster cx={120} cy={70}  baseRot={40} />
      <LeafCluster cx={80}  cy={45}  baseRot={60} />
      <LeafCluster cx={150} cy={100} baseRot={30} />

      <g transform="translate(75,35)"><Blossom scale={0.75}/></g>
      <g transform="translate(145,75)"><Blossom scale={0.65}/></g>

      <g transform="translate(85,80)"><Rose scale={0.95} colors={mauveRose} /></g>
      <g transform="translate(140,40)"><Rose scale={1.1} colors={burgundyRose} /></g>
      <g transform="translate(50,48)"><Rose scale={0.9} colors={burgundyRose} /></g>

      <Sparkle x={60}  y={28} r={1.4} />
      <Sparkle x={115} y={110} r={1.1} />
      <Sparkle x={155} y={55} r={1.3} />
    </svg>
  );
}

// ── BOTTOM-RIGHT cluster (largest) ───────────────────────────────────────
function BottomRight() {
  return (
    <svg className="absolute bottom-0 right-0 w-60 h-60 sm:w-72 sm:h-72 pointer-events-none select-none" viewBox="0 0 230 230" overflow="visible">
      <LeafCluster cx={100} cy={140} baseRot={-30} />
      <LeafCluster cx={140} cy={110} baseRot={-50} />
      <LeafCluster cx={75}  cy={105} baseRot={-15} />
      <LeafCluster cx={170} cy={145} baseRot={-40} />

      <g transform="translate(65,85)"><Blossom scale={0.8} /></g>
      <g transform="translate(160,90)"><Blossom scale={0.75}/></g>
      <g transform="translate(185,160)"><Blossom scale={0.7} /></g>
      <g transform="translate(50,145)"><Blossom scale={0.65}/></g>

      {/* mauve roses */}
      <g transform="translate(90,165)"><Rose scale={1.15} colors={mauveRose} /></g>
      <g transform="translate(170,110)"><Rose scale={1.0} colors={mauveRose} /></g>

      {/* burgundy roses */}
      <g transform="translate(145,175)"><Rose scale={1.35} colors={burgundyRose} /></g>
      <g transform="translate(75,110)"><Rose scale={1.2} colors={burgundyRose} /></g>
      <g transform="translate(195,170)"><Rose scale={1.0} colors={burgundyRose} /></g>

      <Sparkle x={50}  y={80}  r={1.5} />
      <Sparkle x={130} y={90}  r={1.2} />
      <Sparkle x={210} y={130} r={1.4} />
      <Sparkle x={60}  y={185} r={1.0} />
      <Sparkle x={185} y={200} r={1.3} />
    </svg>
  );
}

// ── Scattered background sparkles ─────────────────────────────────────────
function BackgroundSparkles() {
  const dots = [
    { x: 25, y: 35 }, { x: 75, y: 20 }, { x: 40, y: 60 },
    { x: 85, y: 45 }, { x: 15, y: 75 }, { x: 60, y: 80 },
    { x: 90, y: 70 }, { x: 35, y: 85 }, { x: 70, y: 55 },
  ];
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-50" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="sparkleGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={C.goldLight} />
          <stop offset="100%" stopColor={C.gold} stopOpacity="0" />
        </radialGradient>
      </defs>
      {dots.map((d, i) => (
        <circle key={i} cx={`${d.x}%`} cy={`${d.y}%`} r="3" fill="url(#sparkleGrad)" />
      ))}
    </svg>
  );
}

// ── Shared gradient — deep dark burgundy ──────────────────────────────────
export const floralGradient = `radial-gradient(ellipse at 50% 40%,
  #1A0810 0%, #2B1018 28%, #3F1522 52%, #531A2C 72%, #672035 88%, #7A2940 100%)`;

const parchmentTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

// ── Reusable background decoration layer (place inside a relative container) ─
export function FloralBackground() {
  return (
    <>
      {/* Parchment texture */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: parchmentTexture, backgroundSize: "200px 200px" }} />
      {/* Gold border frame */}
      <div className="absolute pointer-events-none z-[1]"
        style={{ inset: "14px", border: "1px solid rgba(212,175,55,0.5)", boxShadow: "inset 0 0 0 1px rgba(212,175,55,0.18)" }} />
      {/* Corner floral clusters + sparkles */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <TopLeft />
        <TopRight />
        <BottomRight />
        <BackgroundSparkles />
      </div>
    </>
  );
}

// ── Full-page wrapper for /rsvp — softened burgundy, no floral SVGs ────────
export function RsvpFloral({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #8E3D4E 0%, #722F37 35%, #571E2C 65%, #380F1A 100%)" }}>
      {/* Very subtle parchment texture for warmth */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: parchmentTexture, backgroundSize: "180px 180px" }} />
      {/* Thin gold frame inset */}
      <div className="absolute pointer-events-none hidden sm:block"
        style={{ inset: "18px", border: "1px solid rgba(212,175,55,0.28)", borderRadius: "4px" }} />
      {/* Soft vignette at corners */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(30,8,14,0.55) 100%)" }} />
      <div className="relative z-10 flex items-center justify-center min-h-[100dvh] px-4 py-8">
        {children}
      </div>
    </div>
  );
}
