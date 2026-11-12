// RusScene.tsx — постоянная сцена «РУСЬ ЗА 1000 ЛЕТ» серия 1:
// пергаментная тьма, нижняя шкала веков 862—1991, абстрактная карта племён.
// Карта — стилизованная россыпь точек (не географически точная): это язык сериала.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { COLORS, FONT } from "./theme";
import { SCENE, HUD_YEAR, HudStep } from "./data";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** псевдослучайное [0..1) без state — как Dust в AI-TOK */
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** текущий год с роллом (для шкалы веков) */
const useYear = (): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const steps = HUD_YEAR;
  let idx = 0;
  for (let i = 0; i < steps.length; i++) if (t >= steps[i].t) idx = i;
  const cur = steps[idx];
  const prev = steps[Math.max(0, idx - 1)];
  if (idx === 0) return (cur as HudStep).value;
  const p = interpolate(t, [cur.t, cur.t + 0.55], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad),
  });
  return prev.value + (cur.value - prev.value) * p;
};

// ============ НИЖНЯЯ ШКАЛА ВЕКОВ ============
const CENTURIES = [862, 988, 1240, 1480, 1812, 1991];
const X0 = 90;      // левый край шкалы
const X1 = 990;     // правый край
const yearToX = (y: number) => X0 + ((y - 862) / (1991 - 862)) * (X1 - X0);

export const CenturyStrip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const year = useYear();

  const inS = spring({ frame: frame - Math.round((SCENE.hudIn + 0.2) * fps), fps, config: { damping: 200 }, durationInFrames: 26 });
  const px = yearToX(year);
  const y = 1690;

  return (
    <div style={{
      position: "absolute", left: 0, right: 0, top: y, height: 120,
      opacity: inS, pointerEvents: "none",
    }}>
      {/* базовая линия */}
      <div style={{
        position: "absolute", left: X0, top: 34, width: X1 - X0, height: 3,
        background: "rgba(242,232,208,0.18)", borderRadius: 2,
      }} />
      {/* пройденный отрезок */}
      <div style={{
        position: "absolute", left: X0, top: 34, width: Math.max(0, px - X0), height: 3,
        background: `linear-gradient(90deg, ${COLORS.goldDeep}, ${COLORS.gold})`,
        borderRadius: 2, boxShadow: `0 0 14px ${COLORS.gold}55`,
      }} />
      {/* деления и подписи веков */}
      {CENTURIES.map((c, i) => {
        const cx = yearToX(c);
        const passed = year >= c;
        const col = passed ? COLORS.gold : "rgba(242,232,208,0.35)";
        const tickFlash = Math.abs(year - c) < 26 ? 1 : 0;
        return (
          <div key={c} style={{ position: "absolute", left: cx, top: 0, transform: "translateX(-50%)", textAlign: "center" }}>
            <div style={{
              width: 3, height: tickFlash ? 26 : 18, margin: "0 auto",
              background: col, borderRadius: 2,
              opacity: tickFlash ? 1 : 0.8,
              boxShadow: tickFlash ? `0 0 12px ${COLORS.gold}` : "none",
            }} />
            <div style={{
              fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 23, marginTop: 9,
              color: col, letterSpacing: 1, fontVariantNumeric: "tabular-nums",
            }}>{c}</div>
          </div>
        );
      })}
      {/* маркер текущего года */}
      <div style={{
        position: "absolute", left: px, top: 22, transform: "translateX(-50%)",
        width: 18, height: 18, borderRadius: "50%",
        background: COLORS.gold,
        boxShadow: `0 0 22px ${COLORS.gold}`,
        opacity: 0.95,
      }} />
    </div>
  );
};

// ============ КАРТА ПЛЕМЁН ============
// Города: НОВГОРОД (240, 560) -> КИЕВ (560, 1090); ЦАРЬГРАД (905, 1155); Хазария: свечение (820, 900).

const NOVG = { x: 240, y: 560 };
const KIEV = { x: 560, y: 1090 };
const TSAR = { x: 905, y: 1150 };
const KHAN = { x: 810, y: 870 };

export const PlemenaMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const mapIn = spring({ frame: frame - Math.round(SCENE.mapIn * fps), fps, config: { damping: 200 }, durationInFrames: 30 });
  const novIn = spring({ frame: frame - Math.round(SCENE.novgorodIn * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 18 });
  const kievIn = spring({ frame: frame - Math.round(SCENE.kievTake * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 18 });
  const kievLabel = spring({ frame: frame - Math.round(SCENE.kievCrown * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 16 });
  const tsarIn = spring({ frame: frame - Math.round(SCENE.tsarIn * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 18 });
  const unifyIn = spring({ frame: frame - Math.round(SCENE.unify * fps), fps, config: { damping: 200 }, durationInFrames: 20 });
  const mergeIn = spring({ frame: frame - Math.round(SCENE.mergeIn * fps), fps, config: { damping: 200 }, durationInFrames: 26 });

  // свечение Хазарии: пульс
  const khanIn = clamp01(interpolate(t, [SCENE.khanatIn, SCENE.khanatIn + 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const khanPulse = 0.75 + 0.25 * Math.sin(t * 2.1);

  // путь Олега: прочерчивание линии
  const pathP = clamp01(interpolate(t, [SCENE.kievTake, SCENE.kievTake + 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) }));
  const pathLen = Math.hypot(KIEV.x - NOVG.x, KIEV.y - NOVG.y);
  const dash = pathLen * (1 - pathP);

  const rusGlow = clamp01(mergeIn);
  // РУСЬ гаснет перед клиффом (уступает место превью золотого века)
  const rusFadeOut = clamp01(interpolate(t, [SCENE.goldCard1 - 0.6, SCENE.goldCard1 - 0.1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* мягкая подложка карты */}
      <div style={{
        position: "absolute", left: 60, right: 60, top: 470, height: 700,
        background: "radial-gradient(ellipse at 50% 45%, rgba(46,37,24,0.55) 0%, rgba(28,22,16,0.0) 70%)",
        opacity: mapIn,
      }} />

      {/* россыпь племён */}
      {Array.from({ length: 18 }, (_, i) => {
        const dx = 140 + rnd(i * 3 + 1) * 800;
        const dy = 500 + rnd(i * 3 + 2) * 620;
        const dotIn = spring({ frame: frame - Math.round((SCENE.mapIn + 0.05 + i * 0.03) * fps), fps, config: { damping: 200 }, durationInFrames: 16 });
        const size = 7 + rnd(i * 3 + 3) * 6;
        // при «из племён — один народ» точки стягиваются к центру
        const cx = 540, cy = 800;
        const mProg = clamp01(mergeIn);
        const mx = dx + (cx - dx) * mProg * 0.82;
        const my = dy + (cy - dy) * mProg * 0.82;
        const dotOp = (0.32 + rnd(i * 7) * 0.2) * clamp01(1 - mProg * 1.25);
        return (
          <div key={i} style={{
            position: "absolute", left: mx, top: my,
            width: size * (1 - mProg * 0.5), height: size * (1 - mProg * 0.5),
            borderRadius: "50%", background: COLORS.ink,
            opacity: dotIn * dotOp,
            boxShadow: rusGlow > 0.4 ? `0 0 10px ${COLORS.gold}66` : "none",
          }} />
        );
      })}

      {/* свечение Хазарии */}
      {khanIn > 0.01 && (
        <div style={{
          position: "absolute", left: KHAN.x, top: KHAN.y,
          width: 420, height: 420, transform: "translate(-50%,-50%)",
          background: `radial-gradient(circle, ${COLORS.khanatGlow} 0%, rgba(142,36,24,0.10) 45%, transparent 70%)`,
          opacity: khanIn * khanPulse * clamp01(1 - rusGlow * 1.25),
        }} />
      )}

      {/* ярлык Хазарии */}
      {khanIn > 0.5 && (
        <div style={{
          position: "absolute", left: KHAN.x, top: KHAN.y + 128,
          transform: "translateX(-50%)",
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 30, letterSpacing: 3,
          color: COLORS.red, opacity: khanIn * clamp01(1 - rusGlow * 1.25),
          textShadow: `0 0 20px rgba(217,72,59,0.4)`,
        }}>ХАЗАРСКИЙ КАГАНАТ</div>
      )}

      {/* путь Олега Новгород -> Киев */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: mapIn }}>
        <line
          x1={NOVG.x} y1={NOVG.y} x2={KIEV.x} y2={KIEV.y}
          stroke={unifyIn > 0.01 ? COLORS.gold : "rgba(242,232,208,0.55)"}
          strokeWidth={unifyIn > 0.01 ? 7 : 5}
          strokeDasharray={pathLen}
          strokeDashoffset={dash}
          strokeLinecap="round"
          opacity={pathP > 0.01 ? clamp01(1 - rusGlow * 0.85) : 0}
        />
      </svg>

      {/* НОВГОРОД */}
      <div style={{ position: "absolute", left: NOVG.x, top: NOVG.y, opacity: novIn * mapIn }}>
        <div style={{
          width: 26, height: 26, borderRadius: "50%", background: COLORS.cityGold,
          boxShadow: `0 0 26px ${COLORS.gold}66`,
          transform: "translate(-50%,-50%)",
          position: "absolute", left: 0, top: 0,
        }} />
        <div style={{
          position: "absolute", left: 0, top: 26, transform: "translateX(-50%)",
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 32, letterSpacing: 2.5,
          color: COLORS.ink, textShadow: "0 3px 0 rgba(0,0,0,0.5)",
          opacity: clamp01(1 - rusGlow * 1.25),
        }}>НОВГОРОД</div>
      </div>

      {/* КИЕВ */}
      <div style={{ position: "absolute", left: KIEV.x, top: KIEV.y, opacity: kievIn * mapIn }}>
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: COLORS.cityKiev,
          boxShadow: `0 0 34px ${COLORS.gold}`,
          border: `3px solid ${COLORS.paper}`,
          transform: `translate(-50%,-50%) scale(${1 + unifyIn * 0.25})`,
          position: "absolute", left: 0, top: 0,
        }} />
        {/* корона Киева: «мать городов русских» (CSS: три зубца) */}
        <div style={{
          position: "absolute", left: 0, top: -52, transform: `translateX(-50%) scale(${kievLabel})`,
          width: 56, height: 34,
          background: COLORS.gold,
          clipPath: "polygon(0% 100%, 0% 35%, 22% 62%, 50% 8%, 78% 62%, 100% 35%, 100% 100%)",
          filter: `drop-shadow(0 0 12px ${COLORS.gold}88)`,
          opacity: kievLabel * clamp01(1 - rusGlow * 1.25),
        }} />
        <div style={{
          position: "absolute", left: 0, top: 30, transform: "translateX(-50%)",
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 36, letterSpacing: 3,
          color: COLORS.gold,
          textShadow: `0 0 24px ${COLORS.gold}55`,
          opacity: kievLabel * clamp01(1 - rusGlow * 1.25),
        }}>КИЕВ</div>
      </div>

      {/* ЦАРЬГРАД */}
      <div style={{ position: "absolute", left: TSAR.x, top: TSAR.y, opacity: tsarIn * mapIn * (1 - rusGlow * 0.55) }}>
        <div style={{
          width: 22, height: 22, transform: "translate(-50%,-50%) rotate(45deg)",
          background: COLORS.steel, boxShadow: `0 0 22px ${COLORS.steel}88`,
          position: "absolute", left: 0, top: 0,
        }} />
        <div style={{
          position: "absolute", left: 0, top: 26, transform: "translateX(-50%)",
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 28, letterSpacing: 2.5,
          color: COLORS.steel, textShadow: "0 3px 0 rgba(0,0,0,0.5)",
        }}>ЦАРЬГРАД</div>
      </div>

      {/* РУСЬ — результат крещения: слияние племён (ниже титула КРЕЩЕНИЕ РУСИ) */}
      {rusGlow > 0.15 && (
        <div style={{
          position: "absolute", left: 540, top: 900, transform: `translate(-50%,-50%) scale(${0.8 + 0.2 * rusGlow})`,
          textAlign: "center", opacity: clamp01((rusGlow - 0.15) / 0.85) * rusFadeOut,
        }}>
          <div style={{
            fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 110, letterSpacing: 14,
            color: COLORS.gold, textShadow: `0 0 60px ${COLORS.gold}77, 0 8px 0 rgba(0,0,0,0.45)`,
          }}>РУСЬ</div>
          <div style={{
            fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 28, letterSpacing: 6,
            color: COLORS.paper, marginTop: 6, textShadow: "0 3px 0 rgba(0,0,0,0.5)",
          }}>ОДИН НАРОД · С 988</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ============ СЦЕНА ============
export const RusScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // тёплый свет крещения: смягчает сцену после 988
  const baptismLight = clamp01(interpolate(t, [SCENE.crossIn, SCENE.crossIn + 1.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill style={{ fontFamily: `${FONT}, sans-serif` }}>
      {/* фон: пергаментная тьма */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${COLORS.bgTop} 0%, ${COLORS.bgBottom} 52%, ${COLORS.bgTop} 100%)` }} />
      {/* текстура волокон пергамента */}
      <AbsoluteFill style={{
        background: `repeating-linear-gradient(0deg, rgba(242,232,208,0.018) 0px, rgba(242,232,208,0.018) 1px, transparent 1px, transparent 7px)`,
      }} />
      {/* тёплый отблеск свечи после крещения */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at 50% 30%, ${COLORS.candleGlow} 0%, transparent 55%)`,
        opacity: baptismLight * 0.5,
      }} />
      {/* виньетка */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse at 50% 42%, transparent 52%, rgba(8,6,4,0.55) 100%)",
      }} />

      <PlemenaMap />
      <CenturyStrip />
    </AbsoluteFill>
  );
};

export default RusScene;
