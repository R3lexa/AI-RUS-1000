// RusScene.tsx — постоянная сцена «РУСЬ: БИТВА ЗА 1000 ЛЕТ» серия 1 «СТАРТ»:
// тёмная арена с прожекторами, нижняя шкала веков 862—1991 + метка СЕРИЯ 1/8,
// абстрактная карта племён (стилизованная россыпь точек — язык сериала).
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

// ============ НИЖНЯЯ ШКАЛА ВЕКОВ + СЕРИЯ 1/8 ============
const CENTURIES = [862, 945, 1240, 1480, 1991];
const X0 = 90;
const X1 = 990;
const yearToX = (y: number) => X0 + ((y - 862) / (1991 - 862)) * (X1 - X0);

export const CenturyStrip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const year = useYear();

  const inS = spring({ frame: frame - Math.round((SCENE.hudIn + 0.2) * fps), fps, config: { damping: 200 }, durationInFrames: 26 });
  const px = yearToX(year);
  const y = 1660;

  return (
    <div style={{
      position: "absolute", left: 0, right: 0, top: y, height: 150,
      opacity: inS, pointerEvents: "none",
    }}>
      {/* метка сезона — ретеншн: сколько серий осталось */}
      <div style={{
        position: "absolute", left: X0, top: -42,
        fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 26, letterSpacing: 3,
        color: COLORS.gold, opacity: 0.9,
      }}>СЕРИЯ 1<span style={{ color: COLORS.inkDim }}>/8</span></div>
      <div style={{
        position: "absolute", right: 90, top: -42, textAlign: "right",
        fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 26, letterSpacing: 2,
        color: COLORS.inkDim, opacity: 0.75,
      }}>БИТВА ЗА 1000 ЛЕТ</div>
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
      {CENTURIES.map((c) => {
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
// НОВГОРОД (240, 560) -> КИЕВ (560, 1090); ЦАРЬГРАД (905, 1150); Хазария (810, 870).
// Племена дерутся у центра (540, 800) с invite до найма Рюрика.

const NOVG = { x: 240, y: 560 };
const KIEV = { x: 560, y: 1090 };
const TSAR = { x: 905, y: 1150 };
const KHAN = { x: 810, y: 870 };

/** точки-племена, которые дерутся до найма */
const TRIBES = [
  { x: 460, y: 760 }, { x: 640, y: 740 }, { x: 520, y: 900 }, { x: 660, y: 880 },
];

export const PlemenaMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // подложка и деревни появляются сразу со слэмом «862» — кадр не пустует
  const mapIn = spring({ frame: frame - Math.round((SCENE.year862 + 0.5) * fps), fps, config: { damping: 200 }, durationInFrames: 26 });
  // города
  const novIn = spring({ frame: frame - Math.round(SCENE.olegCard * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 18 });
  const kievIn = spring({ frame: frame - Math.round(SCENE.kievIn * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 18 });
  const tsarIn = spring({ frame: frame - Math.round(SCENE.tsarIn * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 18 });
  const glueIn = spring({ frame: frame - Math.round(SCENE.glueIn * fps), fps, config: { damping: 200 }, durationInFrames: 20 });

  // драка племён: точки появляются спокойно после «862 год», джиттер с «Племена устали»
  const fightRamp = clamp01(interpolate(t, [SCENE.tribesFight, SCENE.tribesFight + 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const fight = fightRamp * clamp01(interpolate(t, [SCENE.hireCard, SCENE.hireCard + 0.5], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  // хозяева Киева (Аскольд и Дир): две тусклые точки гаснут на «вырезал»
  const ownersOp = clamp01(interpolate(t, [SCENE.ownersOut, SCENE.ownersOut + 0.5], [0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))
    * clamp01(interpolate(t, [SCENE.kievIn - 0.2, SCENE.kievIn + 0.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  // свечение Хазарии: пульс с «Номер один — Хазария»
  const khanIn = clamp01(interpolate(t, [SCENE.khanatGlow, SCENE.khanatGlow + 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const khanPulse = 0.75 + 0.25 * Math.sin(t * 2.1);
  // красный гаснет перед Игорем (уступает место драме)
  const khanFade = clamp01(interpolate(t, [SCENE.year945, SCENE.year945 + 0.6], [1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  // путь Олега: прочерчивание линии
  const pathP = clamp01(interpolate(t, [SCENE.kievIn, SCENE.kievIn + 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) }));
  const pathLen = Math.hypot(KIEV.x - NOVG.x, KIEV.y - NOVG.y);
  const dash = pathLen * (1 - pathP);

  // карта чуть гаснет после РУСЬ-слэма (фокус на слове), возвращается к Царьграду
  const mapDim = clamp01(interpolate(t, [SCENE.rusSlam, SCENE.rusSlam + 0.4], [1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))
    * clamp01(interpolate(t, [SCENE.year907, SCENE.year907 + 0.6], [0.35, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* мягкая подложка карты */}
      <div style={{
        position: "absolute", left: 60, right: 60, top: 470, height: 700,
        background: "radial-gradient(ellipse at 50% 45%, rgba(46,37,24,0.55) 0%, rgba(23,18,9,0.0) 70%)",
        opacity: mapIn * mapDim,
      }} />

      {/* племена: появляются после «862 год», дерутся с «Племена устали» */}
      {TRIBES.map((p, i) => {
        const dotIn = spring({ frame: frame - Math.round((SCENE.year862 + 0.45 + i * 0.08) * fps), fps, config: { damping: 200 }, durationInFrames: 14 });
        const jx = fight * Math.sin(t * 17 + i * 2.4) * 16;
        const jy = fight * Math.cos(t * 15 + i * 1.7) * 13;
        const clash = fight > 0.4 && Math.sin(t * 9 + i * 2.2) > 0.86;
        return (
          <div key={i} style={{ position: "absolute", left: p.x + jx, top: p.y + jy, opacity: dotIn * (0.5 + fight * 0.3) }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%", background: COLORS.ink,
              transform: "translate(-50%,-50%)",
              boxShadow: `0 0 12px rgba(242,232,208,0.35)`,
            }} />
            {clash && (
              <div style={{
                position: "absolute", left: 10, top: -22,
                fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 40, color: COLORS.red,
                textShadow: `0 0 14px ${COLORS.red}`,
              }}>✕</div>
            )}
          </div>
        );
      })}

      {/* россыпь деревень */}
      {Array.from({ length: 14 }, (_, i) => {
        const dx = 150 + rnd(i * 3 + 1) * 780;
        const dy = 520 + rnd(i * 3 + 2) * 580;
        const dotIn = spring({ frame: frame - Math.round((SCENE.year862 + 0.7 + i * 0.03) * fps), fps, config: { damping: 200 }, durationInFrames: 16 });
        const size = 7 + rnd(i * 3 + 3) * 6;
        return (
          <div key={i} style={{
            position: "absolute", left: dx, top: dy,
            width: size, height: size,
            borderRadius: "50%", background: COLORS.ink,
            opacity: dotIn * (0.25 + rnd(i * 7) * 0.15) * mapDim,
          }} />
        );
      })}

      {/* хозяева Киева (гаснут без насилия — этика канала) */}
      {ownersOp > 0.01 && (
        <>
          <div style={{ position: "absolute", left: KIEV.x - 26, top: KIEV.y - 18, width: 14, height: 14, borderRadius: "50%", background: COLORS.inkDim, opacity: ownersOp, transform: "translate(-50%,-50%)" }} />
          <div style={{ position: "absolute", left: KIEV.x + 24, top: KIEV.y - 26, width: 14, height: 14, borderRadius: "50%", background: COLORS.inkDim, opacity: ownersOp, transform: "translate(-50%,-50%)" }} />
        </>
      )}

      {/* свечение Хазарии */}
      {khanIn > 0.01 && (
        <div style={{
          position: "absolute", left: KHAN.x, top: KHAN.y,
          width: 420, height: 420, transform: "translate(-50%,-50%)",
          background: `radial-gradient(circle, ${COLORS.khanatGlow} 0%, rgba(142,36,24,0.10) 45%, transparent 70%)`,
          opacity: khanIn * khanPulse * khanFade,
        }} />
      )}
      {khanIn > 0.5 && (
        <div style={{
          position: "absolute", left: KHAN.x, top: KHAN.y + 118,
          transform: "translateX(-50%)",
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 30, letterSpacing: 3,
          color: COLORS.red, opacity: khanIn * khanFade,
          textShadow: `0 0 20px rgba(217,72,59,0.4)`,
        }}>ХАЗАРИЯ</div>
      )}

      {/* путь Олега Новгород -> Киев */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: mapIn }}>
        <line
          x1={NOVG.x} y1={NOVG.y} x2={KIEV.x} y2={KIEV.y}
          stroke={glueIn > 0.01 ? COLORS.gold : "rgba(242,232,208,0.55)"}
          strokeWidth={glueIn > 0.01 ? 7 : 5}
          strokeDasharray={pathLen}
          strokeDashoffset={dash}
          strokeLinecap="round"
          opacity={pathP > 0.01 ? mapDim : 0}
        />
      </svg>

      {/* НОВГОРОД */}
      <div style={{ position: "absolute", left: NOVG.x, top: NOVG.y, opacity: novIn * mapIn * mapDim }}>
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
        }}>НОВГОРОД</div>
      </div>

      {/* КИЕВ */}
      <div style={{ position: "absolute", left: KIEV.x, top: KIEV.y, opacity: kievIn * mapIn * mapDim }}>
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: COLORS.cityKiev,
          boxShadow: `0 0 34px ${COLORS.gold}`,
          border: `3px solid ${COLORS.paper}`,
          transform: `translate(-50%,-50%) scale(${1 + glueIn * 0.25})`,
          position: "absolute", left: 0, top: 0,
        }} />
        <div style={{
          position: "absolute", left: 0, top: 30, transform: "translateX(-50%)",
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 36, letterSpacing: 3,
          color: COLORS.gold,
          textShadow: `0 0 24px ${COLORS.gold}55`,
        }}>КИЕВ</div>
      </div>

      {/* ЦАРЬГРАД */}
      <div style={{ position: "absolute", left: TSAR.x, top: TSAR.y, opacity: tsarIn * mapIn * mapDim }}>
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
    </AbsoluteFill>
  );
};

// ============ СЦЕНА ============
export const RusScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // драматический прожектор на «ДА.» — сцена гаснет
  const spotDa = clamp01(interpolate(t, [SCENE.daSlam - 0.15, SCENE.daSlam + 0.25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill style={{ fontFamily: `${FONT}, sans-serif` }}>
      {/* фон: тёмная арена */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${COLORS.bgTop} 0%, ${COLORS.bgBottom} 52%, ${COLORS.bgTop} 100%)` }} />
      {/* прожекторы арены (два мягких конуса) */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse 480px 900px at 24% 0%, ${COLORS.spot} 0%, transparent 60%),
                     radial-gradient(ellipse 480px 900px at 76% 0%, ${COLORS.spot} 0%, transparent 60%)`,
      }} />
      {/* тонкая текстура */}
      <AbsoluteFill style={{
        background: `repeating-linear-gradient(0deg, rgba(242,232,208,0.015) 0px, rgba(242,232,208,0.015) 1px, transparent 1px, transparent 7px)`,
      }} />
      {/* виньетка */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse at 50% 42%, transparent 52%, rgba(5,4,2,0.6) 100%)",
      }} />
      {/* затемнение сцены под «ДА.» */}
      <AbsoluteFill style={{ background: "rgba(5,4,2,0.45)", opacity: spotDa }} />

      <PlemenaMap />
      <CenturyStrip />
    </AbsoluteFill>
  );
};

export default RusScene;
