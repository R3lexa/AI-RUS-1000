// Objects.tsx — детальные SVG-объекты «ТЁМНОЙ РУСИ» (серия 1):
// драккар, яма-захоронение, сруб-баня, голубь с серой, город Искоростень,
// огонь/угли/дым. Живость: покачивание, мерцание пламени, пар, частицы.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "./theme";

const S = COLORS.skinLine;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ============ ДРАККАР (лодья послов) ============
export const Drakkar: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 520, style }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const bob = Math.sin(t * 1.7) * 4;
  const tilt = Math.sin(t * 1.7 + 0.8) * 1.4;

  return (
    <svg width={size} height={size * 0.46} viewBox="0 0 420 194" style={{ transform: `translateY(${bob}px) rotate(${tilt}deg)`, ...style }}>
      <g>
        {/* корпус: киль с изгибом */}
        <path d="M 28 108 Q 60 152 130 162 L 290 162 Q 360 152 396 96 L 380 92 Q 340 138 286 144 L 132 144 Q 74 138 42 100 Z" fill={COLORS.woodDeep} stroke={S} strokeWidth={5} />
        <path d="M 44 108 Q 80 138 134 142 L 286 142 Q 342 136 380 96" fill="none" stroke={COLORS.wood} strokeWidth={3} opacity={0.7} />
        <path d="M 52 120 Q 88 128 140 130 L 280 130 Q 340 126 366 104" fill="none" stroke={COLORS.wood} strokeWidth={2.5} opacity={0.5} />
        {/* борт-планки */}
        <path d="M 28 108 Q 90 132 210 136 Q 330 132 396 96 L 392 86 Q 320 118 210 122 Q 96 118 34 98 Z" fill={COLORS.wood} stroke={S} strokeWidth={4} />
        {/* нос: драконья голова */}
        <path d="M 396 96 Q 414 66 404 42 Q 396 30 388 44 Q 382 58 392 74 Q 398 84 388 92 Z" fill={COLORS.woodDeep} stroke={S} strokeWidth={4.5} />
        <circle cx={398} cy={52} r={3.4} fill={COLORS.red} />
        <path d="M 388 44 Q 374 40 368 52" fill="none" stroke={S} strokeWidth={3.5} />
        {/* корма: завиток */}
        <path d="M 28 108 Q 8 88 14 66 Q 20 50 30 60 Q 38 70 26 84 Q 22 94 32 100 Z" fill={COLORS.woodDeep} stroke={S} strokeWidth={4.5} />
        {/* щиты на борту */}
        {[86, 138, 190, 242, 294].map((x, i) => (
          <g key={x}>
            <circle cx={x} cy={118} r={17} fill={i % 2 ? COLORS.redDeep : COLORS.goldDeep} stroke={S} strokeWidth={4} />
            <circle cx={x} cy={118} r={4.5} fill={COLORS.gold} stroke={S} strokeWidth={2.5} />
            <circle cx={x} cy={107} r={2} fill={COLORS.inkDim} />
            <circle cx={x + 11} cy={118} r={2} fill={COLORS.inkDim} />
            <circle cx={x} cy={129} r={2} fill={COLORS.inkDim} />
            <circle cx={x - 11} cy={118} r={2} fill={COLORS.inkDim} />
          </g>
        ))}
        {/* мачта и парус */}
        <line x1={210} y1={30} x2={210} y2={128} stroke={COLORS.woodDeep} strokeWidth={7} />
        <path d="M 210 34 Q 268 52 272 108 Q 244 118 210 116 Z" fill={COLORS.paper} stroke={S} strokeWidth={4} />
        <path d="M 234 44 L 240 112" stroke={COLORS.red} strokeWidth={9} opacity={0.85} />
        <line x1={206} y1={30} x2={176} y2={124} stroke={COLORS.wood} strokeWidth={3} />
        <line x1={214} y1={30} x2={246} y2={122} stroke={COLORS.wood} strokeWidth={3} />
        {/* вёсла */}
        <path d="M 96 124 L 76 168" stroke={COLORS.woodHi} strokeWidth={5} strokeLinecap="round" />
        <path d="M 164 128 L 152 172" stroke={COLORS.woodHi} strokeWidth={5} strokeLinecap="round" />
        <path d="M 256 128 L 268 172" stroke={COLORS.woodHi} strokeWidth={5} strokeLinecap="round" />
        <path d="M 324 124 L 344 168" stroke={COLORS.woodHi} strokeWidth={5} strokeLinecap="round" />
      </g>
    </svg>
  );
};

// ============ ЯМА + ЛОДЬЯ УХОДИТ В ЗЕМЛЮ ============
/** prog 0..1 — насколько лодья ушла в яму (клипается передним слоем земли) */
export const PitBurial: React.FC<{ prog: number; size?: number }> = ({ prog, size = 620 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const sink = clamp01(prog) * 210;
  const W = 620, H = 420;
  const groundY = 210;

  return (
    <div style={{ position: "relative", width: size, height: size * (H / W) }}>
      <svg width={size} height={size * (H / W)} viewBox={`0 0 ${W} ${H}`}>
        {/* земля-фон */}
        <rect x={0} y={groundY} width={W} height={H - groundY} fill="#241708" />
        <rect x={0} y={groundY - 6} width={W} height={10} rx={5} fill="#31200E" />
        {/* травинки */}
        {Array.from({ length: 16 }, (_, i) => {
          const x = 20 + rnd(i * 5 + 2) * (W - 40);
          return <path key={i} d={`M ${x} ${groundY} q ${rnd(i) * 6 - 3} -12 ${rnd(i + 9) * 8 - 4} -18`} stroke="#4A3A1C" strokeWidth={3} fill="none" strokeLinecap="round" />;
        })}
        {/* яма: тёмный провал */}
        <path d={`M ${W / 2 - 150} ${groundY} Q ${W / 2} ${groundY + 26} ${W / 2 + 150} ${groundY} L ${W / 2 + 104} ${groundY + 168} Q ${W / 2} ${groundY + 196} ${W / 2 - 104} ${groundY + 168} Z`} fill="#0A0603" stroke={S} strokeWidth={4} />
      </svg>
      {/* лодья (клippetся передним слоем земли ниже groundY) */}
      <div style={{
        position: "absolute", left: "50%", top: groundY - 96 + sink,
        transform: "translateX(-50%)",
        width: size, height: 240,
        overflow: "hidden",
        clipPath: `polygon(0 0, 100% 0, 100% ${Math.max(0.1, (groundY + 30) / 240 * 100)}%, 0 ${Math.max(0.1, (groundY + 30) / 240 * 100)}%)`,
      }}>
        <div style={{ transform: `translateY(${-sink}px)` }}>
          <Drakkar size={size * 0.82} />
        </div>
      </div>
      {/* передний слой земли: закрывает лодью */}
      <svg width={size} height={size * (H / W)} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <path
          fillRule="evenodd"
          d={`M 0 ${groundY + 30} L 0 ${H} L ${W} ${H} L ${W} ${groundY + 30}
              Q ${W / 2 + 120} ${groundY + 26} ${W / 2 + 60} ${groundY + 44}
              Q ${W / 2} ${groundY + 58} ${W / 2 - 60} ${groundY + 44}
              Q ${W / 2 - 120} ${groundY + 26} 0 ${groundY + 30} Z`}
          fill="#2A1A09"
        />
        <path d={`M 0 ${groundY + 30} Q ${W / 2} ${groundY + 40} ${W} ${groundY + 30}`} fill="none" stroke="#3A2712" strokeWidth={5} />
      </svg>
      {/* земля летит при закапывании */}
      {prog > 0.1 && Array.from({ length: 8 }, (_, i) => {
        const p = clamp01((prog - 0.1 - i * 0.04) / 0.7);
        return (
          <div key={i} style={{
            position: "absolute",
            left: `${38 + rnd(i * 3) * 24}%`,
            top: groundY - p * 90 - rnd(i * 7) * 40,
            width: 10 + rnd(i) * 8, height: 8 + rnd(i + 3) * 6,
            borderRadius: 3, background: COLORS.woodDeep,
            transform: `rotate(${p * 160 + rnd(i) * 90}deg)`,
            opacity: (1 - p) * 0.9,
          }} />
        );
      })}
    </div>
  );
};

// ============ СРУБ-БАНЯ ============
export const Banya: React.FC<{ fire: number; size?: number }> = ({ fire, size = 560 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const f = clamp01(fire);

  return (
    <div style={{ position: "relative", width: size, height: size * 0.82 }}>
      <svg width={size} height={size * 0.82} viewBox="0 0 440 360">
        <g>
          {/* сруб: брёвна */}
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect x={40} y={252 + i * 20} width={360} height={18} rx={9} fill={i % 2 ? COLORS.wood : COLORS.woodHi} stroke={S} strokeWidth={3.5} />
              <circle cx={58 + (i % 2) * 326} cy={261 + i * 20} r={5.5} fill={COLORS.woodDeep} stroke={S} strokeWidth={2.5} />
            </g>
          ))}
          {/* фронтон из брёвен */}
          {[0, 1, 2].map((i) => (
            <rect key={i} x={92 + i * 44} y={252 - 22 - i * 44} width={256 - i * 88} height={18} rx={9} fill={i % 2 ? COLORS.woodHi : COLORS.wood} stroke={S} strokeWidth={3.5} />
          ))}
          {/* крыша — дранка */}
          <path d="M 24 200 L 220 84 L 416 200 L 396 200 L 220 106 L 44 200 Z" fill={COLORS.woodDeep} stroke={S} strokeWidth={4.5} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={70 + i * 30} y1={196 - i * 2} x2={220} y2={112 + i * 3} stroke={S} strokeWidth={2} opacity={0.4} />
          ))}
          <line x1={70} y1={194} x2={370} y2={194} stroke={S} strokeWidth={2.5} opacity={0.5} />
          {/* конёк */}
          <rect x={196} y={74} width={48} height={12} rx={6} fill={COLORS.wood} stroke={S} strokeWidth={3.5} />
          {/* труба */}
          <rect x={286} y={122} width={34} height={58} fill={COLORS.woodDeep} stroke={S} strokeWidth={4} />
          <rect x={280} y={114} width={46} height={12} rx={5} fill={COLORS.wood} stroke={S} strokeWidth={3.5} />
          {/* дверь */}
          <rect x={186} y={266} width={70} height={84} rx={8} fill="#2E1D10" stroke={S} strokeWidth={4.5} />
          <circle cx={240} cy={310} r={5} fill={COLORS.gold} stroke={S} strokeWidth={2} />
          {/* оконце */}
          <rect x={278} y={272} width={44} height={36} rx={6} fill={f > 0.2 ? COLORS.fireMid : "#1C120A"} stroke={S} strokeWidth={4} />
          {f > 0.2 && <rect x={278} y={272} width={44} height={36} rx={6} fill={COLORS.fireHi} opacity={0.35 + Math.sin(t * 9) * 0.15} />}
          {/* ступенька */}
          <rect x={182} y={352} width={80} height={10} rx={4} fill={COLORS.woodDeep} stroke={S} strokeWidth={3} />
        </g>
      </svg>
      {/* дым из трубы */}
      {[0, 1, 2].map((i) => {
        const p = ((t * 0.22 + i * 0.33) % 1);
        return (
          <div key={i} style={{
            position: "absolute",
            left: `${68 + i * 3}%`,
            top: `${18 - p * 26}%`,
            width: 26 + p * 56, height: 26 + p * 56,
            borderRadius: "50%",
            background: f > 0.3 ? `rgba(70,50,40,${(1 - p) * 0.5})` : `rgba(190,190,190,${(1 - p) * 0.28})`,
            filter: "blur(6px)",
          }} />
        );
      })}
      {/* пар от двери (до пожара) */}
      {f < 0.2 && [0, 1].map((i) => {
        const p = ((t * 0.3 + i * 0.5) % 1);
        return (
          <div key={i} style={{
            position: "absolute", left: `${44 + i * 10}%`, top: `${66 - p * 18}%`,
            width: 34 + p * 40, height: 34 + p * 40, borderRadius: "50%",
            background: `rgba(230,230,230,${(1 - p) * 0.22})`, filter: "blur(8px)",
          }} />
        );
      })}
      {/* огонь: крыша + окна + поднимающееся пламя */}
      {f > 0.15 && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{
              position: "absolute",
              left: `${18 + i * 22}%`,
              bottom: `${34 + Math.sin(t * 6 + i * 2) * 2}%`,
              width: 60, height: 90 + Math.sin(t * 7 + i) * 16,
              background: `radial-gradient(ellipse at 50% 100%, ${COLORS.fireHi} 0%, ${COLORS.fireMid} 40%, ${COLORS.fireDeep} 70%, transparent 78%)`,
              opacity: clamp01(f * 1.4 - i * 0.12) * (0.75 + Math.sin(t * 8 + i * 1.7) * 0.25),
              borderRadius: "50% 50% 42% 42%",
              filter: "blur(1px)",
            }} />
          ))}
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(ellipse at 50% 90%, rgba(226,88,34,${0.35 * f}), transparent 60%)`,
          }} />
        </>
      )}
      <Embers count={Math.round(f * 10)} width={size} height={size * 0.9} bottom={0.5} />
    </div>
  );
};

// ============ ГОЛУБЬ С СЕРОЙ ============
export const Dove: React.FC<{ size?: number; flame?: boolean; style?: React.CSSProperties }> = ({ size = 180, flame = false, style }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const flap = Math.sin(t * 9) * 14;

  return (
    <div style={{ position: "relative", width: size, height: size * 0.78, ...style }}>
      <svg width={size} height={size * 0.78} viewBox="0 0 200 156">
        <g>
          {/* тело */}
          <path d="M 60 96 Q 66 66 104 64 Q 142 66 152 92 Q 156 112 138 120 Q 104 132 74 122 Q 58 112 60 96 Z" fill="#DDE1E6" stroke={S} strokeWidth={5} />
          {/* голова */}
          <circle cx={150} cy={64} r={20} fill="#DDE1E6" stroke={S} strokeWidth={5} />
          <path d="M 168 62 L 186 66 L 168 72 Z" fill={COLORS.goldDeep} stroke={S} strokeWidth={3.5} />
          <circle cx={154} cy={58} r={3.4} fill="#171008" />
          {/* хвост */}
          <path d="M 62 96 L 18 84 L 30 104 L 14 112 L 40 118 L 58 112 Z" fill="#C8CDD4" stroke={S} strokeWidth={4.5} />
          {/* крыло (машет) */}
          <path
            d={`M 96 82 Q 84 ${44 - flap * 0.6} 116 ${34 - flap} Q 140 ${44 - flap * 0.5} 128 84 Q 112 94 96 82 Z`}
            fill="#C8CDD4" stroke={S} strokeWidth={4.5}
          />
          {/* лапки + сера */}
          <path d="M 112 120 L 108 138 M 124 120 L 126 138" stroke={COLORS.goldDeep} strokeWidth={4} strokeLinecap="round" />
          {flame && (
            <>
              <circle cx={116} cy={142} r={9 + Math.sin(t * 10) * 2} fill={COLORS.fireMid} opacity={0.9} />
              <circle cx={116} cy={142} r={5} fill={COLORS.fireHi} />
              <path d={`M 116 ${148 + Math.sin(t * 12) * 3} q ${Math.sin(t * 9) * 4} 12 ${Math.sin(t * 7) * 2} 16`} stroke={COLORS.fireDeep} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
            </>
          )}
        </g>
      </svg>
    </div>
  );
};

// ============ ИСКОРСТЕНЬ (город) ============
/** fire 0..1 — охват огнём */
export const Iskorosten: React.FC<{ fire: number; size?: number }> = ({ fire, size = 900 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const f = clamp01(fire);
  const W = 640, H = 330;

  return (
    <div style={{ position: "relative", width: size, height: size * (H / W) }}>
      <svg width={size} height={size * (H / W)} viewBox={`0 0 ${W} ${H}`}>
        <g>
          {/* частокол */}
          {Array.from({ length: 21 }, (_, i) => (
            <rect key={i} x={10 + i * 30} y={206} width={20} height={78} rx={4} fill={i % 2 ? COLORS.woodDeep : COLORS.wood} stroke={S} strokeWidth={3} />
          ))}
          {/* ворота-башня */}
          <rect x={288} y={168} width={62} height={116} fill={COLORS.woodDeep} stroke={S} strokeWidth={4.5} />
          <path d="M 282 168 L 319 138 L 356 168 Z" fill={COLORS.wood} stroke={S} strokeWidth={4} />
          <rect x={306} y={216} width={26} height={68} rx={4} fill="#180F07" stroke={S} strokeWidth={3.5} />
          {/* избы за стеной */}
          <path d="M 96 214 L 60 214 L 78 168 Z" fill={COLORS.woodDeep} stroke={S} strokeWidth={3.5} />
          <rect x={62} y={214} width={38} height={30} fill={COLORS.wood} stroke={S} strokeWidth={3.5} />
          <path d="M 168 200 L 122 200 L 145 148 Z" fill={COLORS.woodDeep} stroke={S} strokeWidth={3.5} />
          <rect x={126} y={200} width={44} height={44} fill={COLORS.wood} stroke={S} strokeWidth={3.5} />
          <rect x={138} y={212} width={18} height={18} fill={f > 0.1 ? COLORS.fireMid : "#180F07"} stroke={S} strokeWidth={3} />
          {/* высокая башня с куполом */}
          <rect x={452} y={128} width={56} height={156} fill={COLORS.woodDeep} stroke={S} strokeWidth={4.5} />
          <path d="M 446 128 L 514 128 L 480 84 Z" fill={COLORS.wood} stroke={S} strokeWidth={4} />
          <circle cx={480} cy={80} r={12} fill={COLORS.goldDeep} stroke={S} strokeWidth={3.5} />
          <rect x={466} y={168} width={26} height={30} fill={f > 0.25 ? COLORS.fireMid : "#180F07"} stroke={S} strokeWidth={3} />
          {/* ели */}
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${560 + i * 34} ${210} L ${546 + i * 34} ${170} L ${554 + i * 34} ${170} L ${542 + i * 34} ${140} L ${552 + i * 34} ${140} L ${538 + i * 34} ${112} L ${564 + i * 34} ${112} L ${552 + i * 34} ${140} L ${562 + i * 34} ${140} L ${550 + i * 34} ${170} L ${558 + i * 34} ${170} Z`} fill="#1E2416" stroke={S} strokeWidth={2.5} />
          ))}
          {/* земля */}
          <rect x={0} y={282} width={W} height={H - 282} fill="#241708" />
          <line x1={0} y1={284} x2={W} y2={284} stroke={S} strokeWidth={3} opacity={0.6} />
        </g>
      </svg>
      {/* огонь охватывает */}
      {f > 0.05 && Array.from({ length: 9 }, (_, i) => {
        const p = clamp01(f * 1.3 - i * 0.09);
        if (p <= 0) return null;
        return (
          <div key={i} style={{
            position: "absolute",
            left: `${4 + i * 10.5 + rnd(i) * 3}%`,
            bottom: `${8 + rnd(i + 5) * 22}%`,
            width: 40 + rnd(i + 2) * 30,
            height: 66 + Math.sin(t * 7 + i * 1.3) * 14 + rnd(i) * 30,
            background: `radial-gradient(ellipse at 50% 100%, ${COLORS.fireHi} 0%, ${COLORS.fireMid} 38%, ${COLORS.fireDeep} 68%, transparent 78%)`,
            borderRadius: "50% 50% 40% 40%",
            opacity: p * (0.7 + Math.sin(t * 8.5 + i * 1.9) * 0.3),
          }} />
        );
      })}
      {f > 0.3 && (
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 50% 100%, rgba(226,88,34,${0.4 * f}), transparent 62%)`,
        }} />
      )}
      {/* дым столбом */}
      {f > 0.5 && [0, 1, 2].map((i) => {
        const p = ((t * 0.2 + i * 0.33) % 1);
        return (
          <div key={i} style={{
            position: "absolute", left: `${30 + i * 22}%`, top: `${-4 - p * 34}%`,
            width: 60 + p * 120, height: 60 + p * 120, borderRadius: "50%",
            background: `rgba(60,44,38,${(1 - p) * 0.5})`, filter: "blur(10px)",
          }} />
        );
      })}
      <Embers count={Math.round(f * 14)} width={size} height={size * (H / W)} bottom={0.35} />
    </div>
  );
};

// ============ УГЛИ (частицы) ============
export const Embers: React.FC<{ count: number; width: number; height: number; bottom?: number }> = ({ count, width, height, bottom = 0 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  if (count <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, bottom: `${bottom * 100}%`, width, height, pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const speed = 40 + rnd(i * 3 + 1) * 60;
        const p = ((t * (speed / 100) + rnd(i * 3 + 2)) % 1);
        const x = rnd(i * 3) * width + Math.sin(t * 1.4 + i) * 18;
        const size = 3 + rnd(i * 7 + 3) * 5;
        return (
          <div key={i} style={{
            position: "absolute",
            left: x, top: height - p * height,
            width: size, height: size * 1.4,
            borderRadius: "50% 50% 60% 60%",
            background: p < 0.7 ? COLORS.fireHi : COLORS.fireDeep,
            opacity: (1 - p) * (0.5 + rnd(i) * 0.4),
            boxShadow: `0 0 ${size * 2}px ${COLORS.ember}`,
          }} />
        );
      })}
    </div>
  );
};

// ============ ПЛАМЯ (одиночное, для штампов-акцентов) ============
export const Flame: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 90, style }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <div style={{
      width: size, height: size * 1.3, position: "relative", ...style,
      background: `radial-gradient(ellipse at 50% 85%, ${COLORS.fireHi} 0%, ${COLORS.fireMid} 42%, ${COLORS.fireDeep} 72%, transparent 80%)`,
      borderRadius: "50% 50% 42% 42%",
      transform: `scaleY(${1 + Math.sin(t * 8) * 0.08}) scaleX(${1 + Math.sin(t * 6.3 + 1) * 0.05})`,
      filter: "blur(0.5px)",
    }} />
  );
};
