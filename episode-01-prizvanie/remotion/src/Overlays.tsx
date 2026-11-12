// Overlays.tsx — «РУСЬ ЗА 1000 ЛЕТ» серия 1:
// титул «900 · МОСКВЫ НЕ БЫЛО», летопись («земля велика…»), карточки героев,
// гонка «КТО ГЛАВНЫЙ», месть Ольги (город горит), крещение 988, итог века,
// бомба 1237 и эндкард-голосование «золото или раздор».
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { COLORS, FONT } from "./theme";
import { SCENE, line } from "./data";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// ============ TITLE HOOK: 900 · МОСКВЫ НЕ БЫЛО ============
export const TitleHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const slam = spring({ frame: frame - Math.round((SCENE.titleSlam + 0.06) * fps), fps, config: { damping: 15, stiffness: 130 }, durationInFrames: 20 });
  const slam2 = spring({ frame: frame - Math.round((SCENE.titleSlam + 0.24) * fps), fps, config: { damping: 15, stiffness: 130 }, durationInFrames: 20 });
  // титул уходит, когда прилетает брэнд-карточка
  const titleOut = interpolate(t, [SCENE.brandIn + 0.1, SCENE.brandIn + 0.5], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // брэнд-карточка живёт до слова «Племена» следующей реплики
  const brandIn = spring({ frame: frame - Math.round((SCENE.brandIn + 0.05) * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 18 });
  const brandOut = interpolate(t, [SCENE.brandOut - 0.25, SCENE.brandOut + 0.15], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stampDan = spring({ frame: frame - Math.round((SCENE.khanatIn + 0.1) * fps), fps, config: { damping: 12, stiffness: 170 }, durationInFrames: 15 });
  const danOut = interpolate(t, [SCENE.brandIn - 0.4, SCENE.brandIn - 0.05], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* скрим контраста */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(180deg, rgba(8,6,4,0.82) 0%, rgba(8,6,4,0.55) 42%, rgba(8,6,4,0.72) 100%)`,
        opacity: titleOut,
      }} />
      {/* гигантский год */}
      <div style={{
        position: "absolute", top: 330, left: 0, right: 0, textAlign: "center",
        opacity: clamp01(slam) * titleOut, transform: `scale(${0.82 + 0.18 * clamp01(slam)})`,
      }}>
        <span style={{
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 300, letterSpacing: 6,
          color: COLORS.ink, fontVariantNumeric: "tabular-nums",
          textShadow: `0 14px 0 rgba(0,0,0,0.5), 0 0 110px ${COLORS.gold}44`,
          whiteSpace: "nowrap",
        }}>900</span>
      </div>
      {/* титул (две строки — не вылезает за вертикаль) */}
      <div style={{
        position: "absolute", top: 700, left: 0, right: 0, textAlign: "center",
        opacity: clamp01(slam2) * titleOut, transform: `scale(${0.85 + 0.15 * clamp01(slam2)})`,
      }}>
        <span style={{
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 96, letterSpacing: 3,
          color: COLORS.ink, textShadow: `0 10px 0 rgba(0,0,0,0.5), 0 0 80px ${COLORS.red}33`,
          lineHeight: 1.12, display: "block", whiteSpace: "nowrap",
        }}>МОСКВЫ</span>
        <span style={{
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 96, letterSpacing: 3,
          color: COLORS.red, textShadow: `0 10px 0 rgba(0,0,0,0.5), 0 0 80px ${COLORS.red}44`,
          lineHeight: 1.12, display: "block", whiteSpace: "nowrap",
        }}>НЕ БЫЛО</span>
      </div>
      {/* штамп ДАНЬ — чужой империи */}
      <div style={{
        position: "absolute", top: 1010, left: 0, right: 0, display: "flex", justifyContent: "center",
        opacity: clamp01(stampDan) * danOut, transform: `scale(${1.25 - 0.25 * clamp01(stampDan)})`,
      }}>
        <div style={{
          border: `7px solid ${COLORS.red}`, borderRadius: 14, padding: "12px 34px",
          background: "rgba(14,10,8,0.85)", transform: "rotate(-7deg)",
          boxShadow: `0 0 34px ${COLORS.red}55`,
        }}>
          <span style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 84, letterSpacing: 4, color: COLORS.red }}>ДАНЬ</span>
        </div>
      </div>
      {/* брэнд-карточка сериала */}
      <div style={{
        position: "absolute", top: 620, left: 0, right: 0, display: "flex", justifyContent: "center",
        opacity: clamp01(brandIn) * brandOut, transform: `scale(${0.86 + 0.14 * clamp01(brandIn)})`,
      }}>
        <div style={{
          background: "rgba(14,10,8,0.9)", border: `4px solid ${COLORS.gold}`, borderRadius: 20,
          padding: "22px 44px", boxShadow: `0 0 60px ${COLORS.gold}44`, textAlign: "center",
        }}>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 74, letterSpacing: 4, color: COLORS.gold }}>
            РУСЬ ЗА 1000 ЛЕТ
          </div>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 32, letterSpacing: 6, color: COLORS.inkDim, marginTop: 8 }}>
            СЕРИЯ 1 · КАК ВСЁ НАЧАЛОСЬ
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============ STAMP ============
export const Stamp: React.FC<{ t0: number; text: string; x?: number; y?: number; color?: string; dur?: number; size?: number }> = ({
  t0, text, x = 540, y = 720, color = COLORS.red, dur = 1.8, size = 92,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < t0 || t > t0 + dur) return null;
  const inS = spring({ frame: frame - Math.round(t0 * fps), fps, config: { damping: 11, stiffness: 170 }, durationInFrames: 16 });
  const out = interpolate(t, [t0 + dur - 0.25, t0 + dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(-8deg) scale(${1.25 - 0.25 * inS})`,
      opacity: inS * out,
      border: `7px solid ${color}`, borderRadius: 14, padding: "14px 30px",
      background: "rgba(14,10,8,0.82)",
      boxShadow: `0 0 34px ${color}55`,
    }}>
      <span style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: size, letterSpacing: 3, color, whiteSpace: "nowrap" }}>{text}</span>
    </div>
  );
};

// ============ HERO CARD (медальон с буквой) ============
export const HeroCard: React.FC<{
  t0: number; tOut: number; glyph: string; title: string; sub: string;
  x: number; y: number; color: string; align?: "left" | "right";
}> = ({ t0, tOut, glyph, title, sub, x, y, color, align = "left" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < t0 || t > tOut) return null;
  const inS = spring({ frame: frame - Math.round(t0 * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 18 });
  const out = interpolate(t, [tOut - 0.3, tOut], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dir = align === "left" ? -1 : 1;
  return (
    <div style={{
      position: "absolute", left: x, top: y,
      transform: `translate(${align === "left" ? "0" : "-100%"}, -50%) translateX(${(1 - inS) * 60 * dir}px) scale(${0.9 + 0.1 * inS})`,
      opacity: inS * out,
      background: "rgba(18,14,10,0.92)", border: `3px solid ${color}`, borderRadius: 18,
      padding: "12px 22px", boxShadow: `0 0 30px ${color}44`,
      display: "flex", alignItems: "center", gap: 18,
    }}>
      <div style={{
        width: 84, height: 84, borderRadius: "50%",
        background: `radial-gradient(circle at 34% 30%, ${COLORS.surfaceHi}, ${COLORS.paperInk})`,
        border: `3px solid ${color}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 44, color: COLORS.paper,
      }}>{glyph}</div>
      <div>
        <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 50, color, whiteSpace: "nowrap", lineHeight: 1.05 }}>{title}</div>
        <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 26, color: COLORS.inkDim, letterSpacing: 2, marginTop: 3, whiteSpace: "nowrap" }}>{sub}</div>
      </div>
    </div>
  );
};

// ============ ГИБНУЩАЯ КАРТОЧКА ИГОРЯ (гаснет и падает) ============
export const FallingCard: React.FC<{ t0: number; title: string; sub: string }> = ({ t0, title, sub }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < t0) return null;
  const inS = spring({ frame: frame - Math.round(t0 * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 16 });
  // «убили»: карточка темнеет и заваливается
  const fall = interpolate(t, [t0 + 0.55, t0 + 1.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.quad) });
  const op = interpolate(t, [t0 + 0.5, t0 + 1.9], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rot = -8 + fall * 74;
  return (
    <div style={{
      position: "absolute", left: 540, top: 470, transform: `translateX(-50%) rotate(${rot}deg) translateY(${fall * 130}px)`,
      opacity: inS * op,
      background: "rgba(18,14,10,0.92)", border: `3px solid ${COLORS.inkDim}`, borderRadius: 18,
      padding: "12px 26px", boxShadow: "0 0 30px rgba(0,0,0,0.5)",
      textAlign: "center",
    }}>
      <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 50, color: interpolate(fall, [0, 1], [1, 0]) > 0.5 ? COLORS.ink : COLORS.inkDim, whiteSpace: "nowrap" }}>{title}</div>
      <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 26, color: COLORS.inkDim, letterSpacing: 2, marginTop: 3, whiteSpace: "nowrap" }}>{sub}</div>
    </div>
  );
};

// ============ ЛЕТОПИСЬ: пергамент + строка печатается ============
const QUOTE = "ЗЕМЛЯ ВЕЛИКА, А ПОРЯДКА НЕТ";
export const QuoteScroll: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < SCENE.quillIn || t > SCENE.scrollOut + 0.4) return null;
  const inS = spring({ frame: frame - Math.round(SCENE.quillIn * fps), fps, config: { damping: 18, stiffness: 140 }, durationInFrames: 22 });
  const out = interpolate(t, [SCENE.scrollOut + 0.05, SCENE.scrollOut + 0.4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // строка летописи печатается на слова «земля велика, а порядка нет»
  const chars = Math.floor(clamp01((t - SCENE.quoteIn) / 1.6) * QUOTE.length);
  const caret = t < SCENE.quoteIn + 1.75 && chars < QUOTE.length;
  return (
    <div style={{
      position: "absolute", top: 560, left: 0, right: 0, display: "flex", justifyContent: "center",
      opacity: inS * out, transform: `scale(${0.9 + 0.1 * inS})`,
    }}>
      <div style={{
        width: 840, background: `linear-gradient(180deg, ${COLORS.paper} 0%, #E7D9B4 100%)`,
        border: `4px solid ${COLORS.paperEdge}`, borderRadius: 10,
        padding: "26px 36px 30px", boxShadow: "0 18px 50px rgba(0,0,0,0.55)",
        transform: "rotate(-1.2deg)",
      }}>
        <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 27, letterSpacing: 4, color: COLORS.paperInk, opacity: 0.7 }}>
          ПОВЕСТЬ ВРЕМЕННЫХ ЛЕТ · 862
        </div>
        <div style={{
          marginTop: 14, fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 58, lineHeight: 1.25,
          color: COLORS.paperInk, letterSpacing: 1,
        }}>
          «{QUOTE.slice(0, Math.max(0, chars))}{caret ? <span style={{ color: COLORS.redDeep }}>▍</span> : null}»
        </div>
      </div>
    </div>
  );
};

// ============ ГОШКА СТОЛБИКОВ: КТО ГЛАВНЫЙ НА КАРТЕ ============
type Bar = { name: string; v: number; color: string };
const BARS: Bar[] = [
  { name: "ХАЗАРИЯ", v: 100, color: COLORS.red },
  { name: "ВИЗАНТИЯ", v: 80, color: COLORS.steel },
  { name: "РУСЬ", v: 15, color: COLORS.gold },
];
export const RacePanel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < SCENE.raceIn || t > SCENE.raceOut) return null;
  const inS = spring({ frame: frame - Math.round(SCENE.raceIn * fps), fps, config: { damping: 18, stiffness: 130 }, durationInFrames: 24 });
  const out = interpolate(t, [SCENE.raceOut - 0.3, SCENE.raceOut], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center",
      opacity: inS * out, transform: `scale(${0.9 + 0.1 * inS})`,
    }}>
      <div style={{
        width: 880, background: "rgba(16,12,8,0.94)", border: `4px solid ${COLORS.border}`, borderRadius: 22,
        padding: "24px 34px 30px", boxShadow: "0 0 50px rgba(0,0,0,0.55)",
      }}>
        <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 40, letterSpacing: 4, color: COLORS.ink, textAlign: "center" }}>
          КТО ГЛАВНЫЙ НА КАРТЕ
        </div>
        {BARS.map((b, i) => {
          const grow = spring({ frame: frame - Math.round((SCENE.raceIn + 0.25 + i * 0.16) * fps), fps, config: { damping: 200 }, durationInFrames: 26 });
          const w = 560 * (b.v / 100) * grow;
          return (
            <div key={b.name} style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 22 }}>
              <div style={{ width: 210, fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 33, letterSpacing: 2, color: b.color, textAlign: "right" }}>
                {b.name}
              </div>
              <div style={{ width: 560, height: 40, background: "rgba(242,232,208,0.07)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ width: w, height: "100%", background: `linear-gradient(90deg, ${b.color}88, ${b.color})`, borderRadius: 10, boxShadow: `0 0 18px ${b.color}55` }} />
              </div>
              <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 33, color: b.color, fontVariantNumeric: "tabular-nums" }}>
                {Math.round(b.v * grow)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============ МЕСТЬ ОЛЬГИ: счётчик 1-2-3 ============
export const RevengeCounter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const base = SCENE.revenge1 - 0.35;
  if (t < base || t > SCENE.dovesIn - 0.1) return null;
  const items = [
    { n: "1", label: "ЛОДЬЯ", at: SCENE.revenge1 },
    { n: "2", label: "БАНЯ", at: SCENE.revenge2 },
    { n: "3", label: "ГОРОД", at: SCENE.revenge3 },
  ];
  const out = interpolate(t, [SCENE.dovesIn - 0.45, SCENE.dovesIn - 0.1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute", top: 640, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 26,
      opacity: out,
    }}>
      {items.map((it) => {
        const s = spring({ frame: frame - Math.round(it.at * fps), fps, config: { damping: 14, stiffness: 170 }, durationInFrames: 14 });
        if (it.at > t) return (
          <div key={it.n} style={{ width: 220, height: 120 }} />
        );
        return (
          <div key={it.n} style={{
            width: 220, opacity: clamp01(s), transform: `scale(${1.35 - 0.35 * clamp01(s)})`,
            background: "rgba(16,12,8,0.92)", border: `3px solid ${COLORS.red}`, borderRadius: 16,
            padding: "12px 0 14px", textAlign: "center", boxShadow: `0 0 26px ${COLORS.red}44`,
          }}>
            <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 56, color: COLORS.red }}>×{it.n}</div>
            <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 25, color: COLORS.inkDim, letterSpacing: 3, marginTop: 2 }}>{it.label}</div>
          </div>
        );
      })}
    </div>
  );
};

// ============ ГОРОД ГОРИТ: силуэт + голуби + искры ============
export const CityBurn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < SCENE.dovesIn - 0.1) return null;

  const inS = spring({ frame: frame - Math.round(SCENE.dovesIn * fps), fps, config: { damping: 200 }, durationInFrames: 26 });
  const out = interpolate(t, [SCENE.olgaOut, SCENE.olgaOut + 0.4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // стадия пожара: 0 до fireIn — просто город; fireIn..ashIn — горит; после — угли
  const burn = clamp01(interpolate(t, [SCENE.fireIn, SCENE.fireIn + 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const ash = clamp01(interpolate(t, [SCENE.ashIn, SCENE.ashIn + 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  const buildings = [
    { w: 88, h: 120 }, { w: 66, h: 190 }, { w: 100, h: 90 }, { w: 76, h: 150 },
    { w: 92, h: 110 }, { w: 70, h: 170 }, { w: 96, h: 100 }, { w: 82, h: 140 },
  ];

  // цвет силуэта: тусклый -> огненный -> уголь
  const sil = ash > 0.5 ? "#171310" : burn > 0.5 ? "#3A1712" : "#241D13";
  const glowOp = burn * (1 - ash);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: inS * out, pointerEvents: "none" }}>
      {/* зарево */}
      <div style={{
        position: "absolute", left: 120, right: 120, top: 700, height: 420,
        background: `radial-gradient(ellipse at 50% 100%, rgba(217,72,59,${0.28 * glowOp}) 0%, rgba(217,120,59,${0.12 * glowOp}) 40%, transparent 70%)`,
      }} />
      {/* силуэт города */}
      <div style={{
        position: "absolute", bottom: 720, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 8,
      }}>
        {buildings.map((b, i) => {
          const bIn = spring({ frame: frame - Math.round((SCENE.dovesIn + i * 0.05) * fps), fps, config: { damping: 200 }, durationInFrames: 18 });
          const flame = burn * (1 - ash) * (0.5 + 0.5 * Math.sin(t * 6 + i * 1.7));
          return (
            <div key={i} style={{
              width: b.w, height: b.h * bIn, borderRadius: 6,
              background: `linear-gradient(180deg, ${sil} 0%, ${COLORS.bgTop} 100%)`,
              boxShadow: flame > 0.1 ? `0 0 ${18 + flame * 26}px rgba(230,120,50,${0.5 * flame})` : "none",
            }} />
          );
        })}
      </div>
      {/* искры-угольки */}
      {Array.from({ length: 14 }, (_, i) => {
        if (burn < 0.1) return null;
        const life = 1.9;
        const phase = ((t - SCENE.fireIn) * (0.5 + (i % 5) * 0.14) + i * 0.37) % life;
        const p = phase / life;
        const ex = 240 + ((i * 61) % 600);
        const ey = 1000 - p * (360 + (i % 4) * 40);
        const eop = burn * (1 - ash * 0.75) * (1 - p) * (0.4 + 0.6 * Math.abs(Math.sin(t * 9 + i * 2.3)));
        const esz = 4 + (i % 3) * 3;
        return (
          <div key={i} style={{
            position: "absolute", left: ex + Math.sin(t * 3 + i) * 22, top: ey,
            width: esz, height: esz, borderRadius: "50%",
            background: i % 3 === 0 ? COLORS.gold : "#E87840",
            opacity: eop * 0.9,
            boxShadow: `0 0 12px rgba(230,140,60,0.7)`,
          }} />
        );
      })}
      {/* голуби несут серу: летят к городу справа */}
      {Array.from({ length: 5 }, (_, i) => {
        const start = SCENE.dovesIn + i * 0.14;
        const p = clamp01(interpolate(t, [start, start + 0.85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) }));
        const bx = 900 - p * (260 + i * 30);
        const by = 780 - Math.sin(p * Math.PI) * (120 + i * 14) + i * 8;
        return (
          <div key={i} style={{
            position: "absolute", left: bx, top: by,
            width: 26, height: 8, borderTop: `4px solid ${COLORS.paper}`, borderRadius: "50%",
            opacity: (1 - p) * 0.85 + 0.1,
            transform: `rotate(${-14 + Math.sin(t * 10 + i) * 6}deg)`,
          }} />
        );
      })}
    </div>
  );
};

// ============ КРЕЩЕНИЕ: крест + титул ============
export const BaptismTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < SCENE.year988 - 0.05) return null;
  // уходим ДО итоговой панели — без наложений
  const out = interpolate(t, [SCENE.scoreIn - 0.5, SCENE.scoreIn - 0.1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s1 = spring({ frame: frame - Math.round((SCENE.year988 + 0.06) * fps), fps, config: { damping: 15, stiffness: 130 }, durationInFrames: 20 });
  const s2 = spring({ frame: frame - Math.round((SCENE.crossIn + 0.2) * fps), fps, config: { damping: 15, stiffness: 130 }, durationInFrames: 20 });
  return (
    <AbsoluteFill style={{ opacity: out, pointerEvents: "none" }}>
      {/* крест над картой */}
      <div style={{
        position: "absolute", top: 540, left: 0, right: 0, display: "flex", justifyContent: "center",
        opacity: clamp01(s2) * 0.95,
      }}>
        <div style={{ position: "relative", width: 90, height: 130, transform: `scale(${0.8 + 0.2 * clamp01(s2)})` }}>
          <div style={{
            position: "absolute", left: 34, top: 0, width: 22, height: 130, borderRadius: 8,
            background: `linear-gradient(180deg, ${COLORS.paper}, ${COLORS.gold})`,
            boxShadow: `0 0 44px ${COLORS.gold}99`,
          }} />
          <div style={{
            position: "absolute", left: 0, top: 34, width: 90, height: 22, borderRadius: 8,
            background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.paper})`,
            boxShadow: `0 0 34px ${COLORS.gold}88`,
          }} />
        </div>
      </div>
      {/* титул */}
      <div style={{
        position: "absolute", top: 710, left: 0, right: 0, textAlign: "center",
        opacity: clamp01(s2), transform: `scale(${0.86 + 0.14 * clamp01(s2)})`,
      }}>
        <span style={{
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 86, letterSpacing: 5,
          color: COLORS.paper, textShadow: `0 8px 0 rgba(0,0,0,0.5), 0 0 70px ${COLORS.gold}55`,
          whiteSpace: "nowrap",
        }}>КРЕЩЕНИЕ <span style={{ color: COLORS.gold }}>РУСИ</span></span>
      </div>
      {/* год крупно (под HUD, над крестом) */}
      <div style={{
        position: "absolute", top: 350, left: 0, right: 0, textAlign: "center",
        opacity: clamp01(s1) * 0.9,
      }}>
        <span style={{
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 130, color: COLORS.gold,
          fontVariantNumeric: "tabular-nums", letterSpacing: 4,
          textShadow: `0 10px 0 rgba(0,0,0,0.5), 0 0 90px ${COLORS.gold}44`,
        }}>988</span>
      </div>
    </AbsoluteFill>
  );
};

// ============ ИТОГ ВЕКА: сводная панель ============
export const ScorePanel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < SCENE.scoreIn) return null;
  const out = interpolate(t, [SCENE.goldCard1 + 0.3, SCENE.goldCard1 + 0.7], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const inS = spring({ frame: frame - Math.round(SCENE.scoreIn * fps), fps, config: { damping: 16, stiffness: 140 }, durationInFrames: 22 });
  const cells = [
    { label: "ГОД", value: "988", color: COLORS.gold },
    { label: "ГОРОДА", value: "20+", color: COLORS.paper },
    { label: "НАСЕЛЕНИЕ", value: "≈1 МЛН", color: COLORS.green },
    { label: "ГЛАВНЫЙ", value: "ХАЗАРИЯ", color: COLORS.red },
  ];
  return (
    <div style={{
      position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center",
      opacity: inS * out, transform: `scale(${0.9 + 0.1 * inS})`,
    }}>
      <div style={{
        width: 900, background: "rgba(16,12,8,0.94)", border: `4px solid ${COLORS.border}`, borderRadius: 24,
        padding: "28px 34px 32px", boxShadow: "0 0 50px rgba(0,0,0,0.55)",
      }}>
        <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 44, letterSpacing: 4, color: COLORS.ink, textAlign: "center" }}>
          ИТОГ ВЕКА
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 24 }}>
          {cells.map((c, i) => {
            const cIn = spring({ frame: frame - Math.round((SCENE.scoreIn + 0.2 + i * 0.13) * fps), fps, config: { damping: 200 }, durationInFrames: 20 });
            return (
              <div key={c.label} style={{
                flex: 1, opacity: cIn, transform: `translateY(${(1 - cIn) * 16}px)`,
                background: "rgba(242,232,208,0.05)", border: `2.5px solid ${c.color}55`, borderRadius: 16,
                padding: "16px 8px 18px", textAlign: "center",
              }}>
                <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 24, color: COLORS.inkDim, letterSpacing: 2 }}>{c.label}</div>
                <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 42, color: c.color, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>{c.value}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============ КЛИФФ: превью золотого века + бомба 1237 ============
export const CliffPack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const out = interpolate(t, [SCENE.cardsOut, SCENE.cardsOut + 0.35], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const c1 = spring({ frame: frame - Math.round(SCENE.goldCard1 * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 18 });
  const c2 = spring({ frame: frame - Math.round(SCENE.goldCard2 * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 18 });

  // бомба: фитиль + тень 1237 — всё НИЖЕ сабтитров (сабтитры до y≈1390)
  const bombIn = clamp01(interpolate(t, [SCENE.bombTick, SCENE.bombTick + 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const fuseP = clamp01(interpolate(t, [SCENE.bombTick, SCENE.endCardIn - 0.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const sparkX = 940 - fuseP * 180;
  const sparkY = 1560 - fuseP * 40;
  const pulse = 1 + Math.sin((t - SCENE.bombTick) * 8) * 0.05;

  return (
    <AbsoluteFill style={{ opacity: out, pointerEvents: "none" }}>
      {/* превью-карточки золотого века */}
      <div style={{
        position: "absolute", top: 460, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 30,
      }}>
        <div style={{
          opacity: clamp01(c1), transform: `translateX(${(1 - clamp01(c1)) * -60}px) scale(${0.9 + 0.1 * clamp01(c1)})`,
          width: 420, background: "rgba(16,12,8,0.94)", border: `3px solid ${COLORS.gold}`, borderRadius: 18,
          padding: "20px 24px", boxShadow: `0 0 34px ${COLORS.gold}33`, textAlign: "center",
        }}>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 46, color: COLORS.gold, whiteSpace: "nowrap" }}>КИЕВ &gt; ЛОНДОН</div>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 26, color: COLORS.inkDim, letterSpacing: 2, marginTop: 6 }}>ЗОЛОТОЙ ВЕК · 988–1147</div>
        </div>
        <div style={{
          opacity: clamp01(c2), transform: `translateX(${(1 - clamp01(c2)) * 60}px) scale(${0.9 + 0.1 * clamp01(c2)})`,
          width: 420, background: "rgba(16,12,8,0.94)", border: `3px solid ${COLORS.steel}`, borderRadius: 18,
          padding: "20px 24px", boxShadow: `0 0 34px ${COLORS.steel}33`, textAlign: "center",
        }}>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 42, color: COLORS.steel, whiteSpace: "nowrap" }}>АННА · КОРОЛЕВА</div>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 26, color: COLORS.inkDim, letterSpacing: 2, marginTop: 6 }}>ДОЧЬ КНЯЗЯ · ФРАНЦИЯ</div>
        </div>
      </div>
      {/* фитиль бомбы */}
      {bombIn > 0.01 && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <path
            d="M 940 1560 Q 880 1530 760 1520"
            stroke="rgba(242,232,208,0.5)" strokeWidth={7} fill="none" strokeLinecap="round"
          />
          <circle cx={sparkX} cy={sparkY} r={11} fill={COLORS.gold}
            style={{ filter: `drop-shadow(0 0 14px ${COLORS.gold})` }} />
          <circle cx={sparkX} cy={sparkY} r={20} fill="none" stroke={COLORS.gold} strokeWidth={2} opacity={0.5 + 0.5 * Math.sin(t * 14)} />
        </svg>
      )}
      {/* сфера-тень 1237 */}
      {bombIn > 0.5 && (
        <div style={{
          position: "absolute", left: 760, top: 1480, transform: `translate(-50%,-50%) scale(${pulse * bombIn})`,
          width: 140, height: 140, borderRadius: "50%",
          background: `radial-gradient(circle at 38% 32%, #4A1512, ${COLORS.redDeep} 70%)`,
          border: `3px solid ${COLORS.red}`,
          boxShadow: `0 0 44px ${COLORS.red}66`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 44, color: COLORS.paper, fontVariantNumeric: "tabular-nums" }}>1237</span>
        </div>
      )}
      {/* подпись бомбы */}
      {bombIn > 0.7 && (
        <div style={{
          position: "absolute", top: 1595, left: 0, right: 0, textAlign: "center",
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 32, letterSpacing: 4, color: COLORS.red,
          opacity: bombIn * out,
        }}>ТИКАЕТ 249 ЛЕТ</div>
      )}
    </AbsoluteFill>
  );
};

// ============ ЭНДКАРД + ГОЛОСОВАНИЕ ============
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const tl = line("teaser");
  if (t < SCENE.voteIn - 0.05) return null;

  // вуаль: голосование чуть поднимает занавес, эндкард — полностью
  const veilVote = interpolate(t, [SCENE.voteIn, SCENE.voteIn + 0.45], [0, 0.62], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const veilFull = clamp01(interpolate(t, [SCENE.endCardIn, SCENE.endCardIn + 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const veil = Math.max(veilVote, veilFull * 0.96);

  const s1 = spring({ frame: frame - Math.round((SCENE.voteIn + 0.1) * fps), fps, config: { damping: 15, stiffness: 130 }, durationInFrames: 22 });
  const oA = spring({ frame: frame - Math.round((SCENE.voteIn + 0.4) * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 18 });
  const oB = spring({ frame: frame - Math.round((SCENE.voteIn + 0.58) * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 18 });
  const ctaIn = spring({ frame: frame - Math.round((SCENE.endCardIn + 0.35) * fps), fps, config: { damping: 200 }, durationInFrames: 20 });
  const endFade = interpolate(t, [tl.end + 0.9, tl.end + 1.5], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: `rgba(8,6,4,${veil})`, opacity: Math.min(1, veil * 2) * endFade }}>
      <div style={{ position: "absolute", top: 470, left: 0, right: 0, textAlign: "center" }}>
        <div style={{
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 52, color: COLORS.inkDim,
          letterSpacing: 4, opacity: clamp01(s1), transform: `scale(${0.9 + 0.1 * clamp01(s1)})`,
        }}>СЕРИЯ 2 — ВЫБИРАЕТЕ ВЫ</div>
      </div>
      {/* превью-карточки золотого века: улетают до голосования */}
      {/* опции голосования */}
      <div style={{
        position: "absolute", top: 640, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 34,
      }}>
        <div style={{
          width: 430, opacity: clamp01(oA), transform: `translateX(${(1 - clamp01(oA)) * -70}px)`,
          background: "rgba(18,14,10,0.95)", border: `4px solid ${COLORS.gold}`, borderRadius: 22,
          padding: "26px 26px 30px", textAlign: "center", boxShadow: `0 0 44px ${COLORS.gold}33`,
        }}>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 120, color: COLORS.gold, lineHeight: 1 }}>1</div>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 40, color: COLORS.ink, letterSpacing: 2, marginTop: 4 }}>ЗОЛОТО КИЕВА</div>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 27, color: COLORS.inkDim, letterSpacing: 2, marginTop: 8 }}>988–1147</div>
        </div>
        <div style={{
          width: 430, opacity: clamp01(oB), transform: `translateX(${(1 - clamp01(oB)) * 70}px)`,
          background: "rgba(18,14,10,0.95)", border: `4px solid ${COLORS.red}`, borderRadius: 22,
          padding: "26px 26px 30px", textAlign: "center", boxShadow: `0 0 44px ${COLORS.red}33`,
        }}>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 120, color: COLORS.red, lineHeight: 1 }}>2</div>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 40, color: COLORS.ink, letterSpacing: 2, marginTop: 4 }}>РАЗДРОБ</div>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 27, color: COLORS.inkDim, letterSpacing: 2, marginTop: 8 }}>1147–1237</div>
        </div>
      </div>
      {/* CTA появляется с эндкардом */}
      <div style={{ position: "absolute", top: 1080, left: 0, right: 0, textAlign: "center", opacity: clamp01(ctaIn) }}>
        <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 44, color: COLORS.paper, letterSpacing: 1 }}>
          ПИШИ 1 ИЛИ 2 В КОММЕНТЫ
        </div>
        <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 40, color: COLORS.gold, marginTop: 18 }}>
          ПОДПИШИСЬ — СЕРИЯ 2 ЗАВТРА
        </div>
        <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 30, color: COLORS.inkDim, marginTop: 14, letterSpacing: 2 }}>
          РУСЬ ЗА 1000 ЛЕТ · #русь1000
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============ ПЫЛЬ ВЕКОВ (лёгкая, всегда) ============
export const Dust: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const rnd2 = (i: number) => {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: 10 }, (_, i) => {
        const y = 420 + rnd2(i + 20) * 900;
        const speed = 7 + rnd2(i + 50) * 12;
        const x = ((rnd2(i + 80) * 1080 + t * speed * (rnd2(i + 110) > 0.5 ? 1 : -1)) % 1080 + 1080) % 1080;
        const size = 3 + rnd2(i + 140) * 4;
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y + Math.sin(t * 0.7 + rnd2(i + 170) * 6.28) * 18,
            width: size, height: size, borderRadius: "50%", background: COLORS.paper,
            opacity: 0.07 + rnd2(i + 200) * 0.09,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

// ============ COMPOSITE OVERLAYS ============
export const Overlays: React.FC = () => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <TitleHook />

      {/* призвание: Рюрик */}
      <HeroCard t0={SCENE.ryurikCard} tOut={SCENE.ryurikCard + 2.6} glyph="Р" title="РЮРИК" sub="КНЯЗЬ №1 · С 862 ГОДА" x={130} y={450} color={COLORS.gold} align="left" />
      {/* киев: Олег */}
      <HeroCard t0={SCENE.novgorodIn + 0.12} tOut={SCENE.motherStamp + 1.6} glyph="О" title="ОЛЕГ" sub="ВЕЩИЙ · КНЯЗЬ №2" x={950} y={450} color={COLORS.gold} align="right" />
      <Stamp t0={SCENE.motherStamp} text="МАТЬ ГОРОДОВ РУССКИХ" x={540} y={960} dur={2.2} size={56} color={COLORS.gold} />

      {/* царьград: щит */}
      <Stamp t0={SCENE.weWereHere} text="МЫ ЗДЕСЬ БЫЛИ" x={610} y={560} dur={1.9} size={58} color={COLORS.steel} />

      {/* хазария */}
      <RacePanel />
      <Stamp t0={SCENE.omen} text="НЕ К ДОБРУ" x={540} y={1050} dur={2.1} size={72} color={COLORS.redDeep} />

      {/* Ольга */}
      <FallingCard t0={SCENE.igorFall} title="ИГОРЬ" sub="КНЯЗЬ №3 · 945" />
      <HeroCard t0={SCENE.olgaCard} tOut={SCENE.fireIn + 0.5} glyph="О" title="ОЛЬГА" sub="КНЯГИНЯ · МЕСТЬ ×3" x={950} y={450} color={COLORS.red} align="right" />
      <Stamp t0={SCENE.worstStamp} text="ХУДШАЯ ИДЕЯ" x={540} y={435} dur={1.9} size={66} color={COLORS.red} />
      <RevengeCounter />
      <CityBurn />
      <Stamp t0={SCENE.ashIn} text="ПЕПЕЛ" x={540} y={590} dur={1.8} size={84} color={COLORS.redDeep} />

      {/* крещение */}
      <BaptismTitle />

      {/* итог века */}
      <ScorePanel />
      <Stamp t0={SCENE.pokaStamp} text="ПОКА." x={540} y={900} dur={2.1} size={110} color={COLORS.gold} />

      {/* клифф + бомба */}
      <CliffPack />

      {/* финал */}
      <EndCard />

      <Dust />
    </AbsoluteFill>
  );
};

export default Overlays;
