// Overlays.tsx — «РУСЬ: БИТВА ЗА 1000 ЛЕТ» серия 1 «СТАРТ» (v2 реалити-турнир):
// хук-слэм «1000 ЛЕТ · 12 ИГРОКОВ · ВЫЖИВЕТ ОДИН», слот №12 «?»,
// сетка ростера 4×3 с ролями, Рюрик-аутсорс + цитата, РУСЬ-слэм,
// Царьград (ворота, ладьи, щит), ТОП КАРТЫ (Хазария-босс, мечи дани),
// Игорь «ПЛОХОЙ ХОД», клифф «ДА.» и эндкард-голосование.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { COLORS, FONT } from "./theme";
import { SCENE, ROSTER, line } from "./data";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** затухающая тряска для слэмов */
const shake = (t: number, t0: number, amp = 12, dur = 0.35): { x: number; y: number } => {
  if (t < t0 || t > t0 + dur) return { x: 0, y: 0 };
  const p = 1 - (t - t0) / dur;
  return { x: Math.sin((t - t0) * 90) * amp * p, y: Math.cos((t - t0) * 77) * amp * 0.6 * p };
};

// ============ ХУК: 1000 ЛЕТ · 12 ИГРОКОВ · ВЫЖИВЕТ ОДИН · СЛОТ ? ============
export const TitleHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const slam = spring({ frame: frame - Math.round((SCENE.titleSlam + 0.04) * fps), fps, config: { damping: 15, stiffness: 130 }, durationInFrames: 20 });
  const subIn = spring({ frame: frame - Math.round((SCENE.playersIn + 0.04) * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 16 });
  const survIn = spring({ frame: frame - Math.round((SCENE.surviveStamp + 0.04) * fps), fps, config: { damping: 15, stiffness: 160 }, durationInFrames: 14 });
  const slotIn = spring({ frame: frame - Math.round((SCENE.slotIn + 0.04) * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 18 });
  const out = interpolate(t, [SCENE.hookOut, SCENE.hookOut + 0.4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sh = shake(t, SCENE.titleSlam + 0.05, 14, 0.4);
  const shS = shake(t, SCENE.surviveStamp + 0.05, 8, 0.3);
  // слот «?» пульсирует — гэг всей серии
  const slotPulse = 1 + Math.sin((t - SCENE.slotIn) * 4.6) * 0.045;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: out }}>
      {/* скрим контраста */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(180deg, rgba(5,4,2,0.85) 0%, rgba(5,4,2,0.55) 42%, rgba(5,4,2,0.75) 100%)`,
        opacity: out,
      }} />
      {/* гигантский «1000 ЛЕТ» */}
      <div style={{
        position: "absolute", top: 380, left: 0, right: 0, textAlign: "center",
        opacity: clamp01(slam), transform: `scale(${0.82 + 0.18 * clamp01(slam)}) translate(${sh.x}px, ${sh.y}px)`,
      }}>
        <span style={{
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 188, letterSpacing: 2,
          color: COLORS.ink, fontVariantNumeric: "tabular-nums",
          textShadow: `0 14px 0 rgba(0,0,0,0.5), 0 0 120px ${COLORS.gold}44`,
          whiteSpace: "nowrap",
        }}>1000 ЛЕТ</span>
      </div>
      {/* «12 ИГРОКОВ» */}
      <div style={{
        position: "absolute", top: 700, left: 0, right: 0, textAlign: "center",
        opacity: clamp01(subIn), transform: `translateY(${(1 - clamp01(subIn)) * 20}px)`,
      }}>
        <span style={{
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 78, letterSpacing: 5,
          color: COLORS.gold, textShadow: `0 8px 0 rgba(0,0,0,0.5), 0 0 60px ${COLORS.gold}44`,
          whiteSpace: "nowrap",
        }}>12 ИГРОКОВ</span>
      </div>
      {/* «ВЫЖИВЕТ ОДИН» */}
      <div style={{
        position: "absolute", top: 812, left: 0, right: 0, textAlign: "center",
        opacity: clamp01(survIn), transform: `scale(${1.2 - 0.2 * clamp01(survIn)}) translate(${shS.x}px, ${shS.y}px)`,
      }}>
        <span style={{
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 92, letterSpacing: 3,
          color: COLORS.red, textShadow: `0 8px 0 rgba(0,0,0,0.5), 0 0 80px ${COLORS.red}55`,
          whiteSpace: "nowrap",
        }}>ВЫЖИВЕТ ОДИН</span>
      </div>
      {/* слот №12 «?» — победитель, которого ещё нет */}
      <div style={{
        position: "absolute", top: 960, left: 0, right: 0, display: "flex", justifyContent: "center",
        opacity: clamp01(slotIn), transform: `scale(${(0.9 + 0.1 * clamp01(slotIn)) * slotPulse})`,
      }}>
        <div style={{
          width: 400, border: `4px dashed ${COLORS.gold}`, borderRadius: 20,
          background: "rgba(13,10,7,0.88)", padding: "18px 30px 20px",
          boxShadow: `0 0 44px ${COLORS.gold}33`, textAlign: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <span style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 34, color: COLORS.inkDim }}>№12</span>
            <span style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 84, color: COLORS.gold, textShadow: `0 0 40px ${COLORS.gold}66` }}>?</span>
          </div>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 27, letterSpacing: 3, color: COLORS.inkDim, marginTop: 4 }}>
            ПРИСОЕДИНИТСЯ ПОЗЖЕ
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============ СЕТКА РОСТЕРА 4×3 ============
const ROLE_COLORS: Record<string, string> = {
  gold: COLORS.gold, red: COLORS.red, steel: COLORS.steel, ink: COLORS.inkDim, ghost: COLORS.ghost,
};

export const RosterGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < SCENE.hudIn || t > SCENE.rosterOut + 0.4) return null;

  const out = interpolate(t, [SCENE.rosterOut, SCENE.rosterOut + 0.35], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const TW = 240, TH = 170, GAP = 14;
  const GX = (1080 - (TW * 4 + GAP * 3)) / 2;  // ~39
  const GY = 470;
  const GHOST_IDX = 9; // МУРОМ — призрак «вылетают навсегда»

  return (
    <div style={{ position: "absolute", inset: 0, opacity: out, pointerEvents: "none" }}>
      {/* затемнение под сетку */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(5,4,2,0.3) 0%, rgba(5,4,2,0.5) 45%, rgba(5,4,2,0.35) 100%)",
      }} />
      {ROSTER.map((p, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        const tileIn = spring({ frame: frame - Math.round((SCENE.hudIn + 0.1 + i * 0.045) * fps), fps, config: { damping: 200 }, durationInFrames: 14 });
        const accent = ROLE_COLORS[p.color] ?? COLORS.inkDim;

        // подсветки ролей по словам
        const hiK = clamp01(spring({ frame: frame - Math.round((SCENE.kievHi + 0.03) * fps), fps, config: { damping: 16, stiffness: 170 }, durationInFrames: 14 }));
        const hiN = clamp01(spring({ frame: frame - Math.round((SCENE.novgorodHi + 0.03) * fps), fps, config: { damping: 16, stiffness: 170 }, durationInFrames: 14 }));
        const hiH = clamp01(spring({ frame: frame - Math.round((SCENE.khazariaHi + 0.03) * fps), fps, config: { damping: 16, stiffness: 170 }, durationInFrames: 14 }));
        let hi = 0;
        if (i === 1) hi = hiK;            // КИЕВ
        else if (i === 0) hi = hiN;       // НОВГОРОД
        else if (i === 2) hi = hiH;       // ХАЗАРИЯ

        // призрак: МУРОМ гаснет с крестом на «вылетают навсегда»
        const ghost = i === GHOST_IDX
          ? clamp01(interpolate(t, [SCENE.ghostOut, SCENE.ghostOut + 0.5], [1, 0.22], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))
          : 1;
        const ghostX = i === GHOST_IDX && t > SCENE.ghostOut;

        const isQ = p.name === "?";
        return (
          <div key={p.name} style={{
            position: "absolute",
            left: GX + col * (TW + GAP), top: GY + row * (TH + GAP),
            width: TW, height: TH,
            opacity: tileIn,
            transform: `scale(${0.9 + 0.1 * tileIn + hi * 0.09})`,
            zIndex: hi > 0.3 ? 2 : 1,
          }}>
            <div style={{
              width: "100%", height: "100%",
              background: hi > 0.3 ? "rgba(18,14,9,0.96)" : "rgba(20,16,10,0.86)",
              border: `${hi > 0.3 ? 4 : 2.5}px solid ${hi > 0.3 ? accent : "rgba(70,58,38,0.9)"}`,
              borderStyle: isQ ? "dashed" : "solid",
              borderRadius: 16,
              boxShadow: hi > 0.3 ? `0 0 30px ${accent}55` : "none",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 6, opacity: ghost,
            }}>
              <div style={{
                fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 34, letterSpacing: 2,
                color: isQ ? COLORS.ghost : hi > 0.3 ? accent : COLORS.ink,
                textShadow: hi > 0.3 ? `0 0 24px ${accent}66` : "none",
              }}>{p.name}</div>
              <div style={{
                fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: isQ ? 20 : 22, letterSpacing: 2,
                color: COLORS.inkDim, opacity: hi > 0.3 ? 1 : 0.55,
                padding: hi > 0.3 ? "3px 12px" : 0,
                background: hi > 0.3 ? "rgba(242,232,208,0.07)" : "transparent",
                borderRadius: 8, whiteSpace: "nowrap",
              }}>{p.role}</div>
              {ghostX && (
                <div style={{
                  position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 96, color: COLORS.red,
                  textShadow: `0 0 30px ${COLORS.red}`, opacity: 0.85,
                }}>✕</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
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
  const sh = shake(t, t0 + 0.03, 9, 0.3);
  return (
    <div style={{
      position: "absolute", left: x, top: y,
      transform: `translate(-50%,-50%) rotate(-8deg) scale(${1.25 - 0.25 * inS}) translate(${sh.x}px, ${sh.y}px)`,
      opacity: inS * out,
      border: `7px solid ${color}`, borderRadius: 14, padding: "14px 30px",
      background: "rgba(13,10,7,0.85)",
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

// ============ ЦИТАТА-ПЕРГАМЕНТ (печатается) ============
const QUOTE = "ЗЕМЛЯ ВЕЛИКА, А ПОРЯДКА НЕТ";
export const QuoteScroll: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < SCENE.quoteIn - 0.1 || t > SCENE.quoteOut + 0.4) return null;
  const inS = spring({ frame: frame - Math.round(SCENE.quoteIn * fps), fps, config: { damping: 18, stiffness: 140 }, durationInFrames: 22 });
  const out = interpolate(t, [SCENE.quoteOut + 0.05, SCENE.quoteOut + 0.4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const chars = Math.floor(clamp01((t - SCENE.quoteIn - 0.15) / 1.6) * QUOTE.length);
  const caret = t < SCENE.quoteIn + 1.85 && chars < QUOTE.length;
  return (
    <div style={{
      position: "absolute", top: 880, left: 0, right: 0, display: "flex", justifyContent: "center",
      opacity: inS * out, transform: `scale(${0.9 + 0.1 * inS})`,
    }}>
      <div style={{
        width: 840, background: `linear-gradient(180deg, ${COLORS.paper} 0%, #E7D9B4 100%)`,
        border: `4px solid ${COLORS.paperEdge}`, borderRadius: 10,
        padding: "24px 36px 28px", boxShadow: "0 18px 50px rgba(0,0,0,0.55)",
        transform: "rotate(-1.2deg)",
      }}>
        <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 27, letterSpacing: 4, color: COLORS.paperInk, opacity: 0.7 }}>
          ПОВЕСТЬ ВРЕМЕННЫХ ЛЕТ · 862
        </div>
        <div style={{
          marginTop: 14, fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 56, lineHeight: 1.25,
          color: COLORS.paperInk, letterSpacing: 1,
        }}>
          «{QUOTE.slice(0, Math.max(0, chars))}{caret ? <span style={{ color: COLORS.redDeep }}>▍</span> : null}»
        </div>
      </div>
    </div>
  );
};

// ============ РУСЬ-СЛЭМ (появление фракции) ============
export const RusSlam: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < SCENE.rusSlam) return null;
  const out = interpolate(t, [SCENE.olegOut, SCENE.olegOut + 0.35], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = spring({ frame: frame - Math.round((SCENE.rusSlam + 0.04) * fps), fps, config: { damping: 15, stiffness: 130 }, durationInFrames: 20 });
  const sh = shake(t, SCENE.rusSlam + 0.06, 14, 0.4);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: out, pointerEvents: "none" }}>
      <div style={{
        position: "absolute", top: 760, left: 0, right: 0, textAlign: "center",
        opacity: clamp01(s), transform: `scale(${0.8 + 0.2 * clamp01(s)}) translate(${sh.x}px, ${sh.y}px)`,
      }}>
        <span style={{
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 175, letterSpacing: 16,
          color: COLORS.gold, textShadow: `0 12px 0 rgba(0,0,0,0.5), 0 0 110px ${COLORS.gold}66`,
          whiteSpace: "nowrap",
        }}>РУСЬ</span>
        <div style={{
          fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 30, letterSpacing: 6,
          color: COLORS.paper, marginTop: 8, textShadow: "0 3px 0 rgba(0,0,0,0.5)",
        }}>СЕВЕР + ЮГ · ОДНА ФРАКЦИЯ</div>
      </div>
    </div>
  );
};

// ============ ЦАРЬГРАД: ворота + ладьи + щит ============
export const TsarPack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < SCENE.year907) return null;
  const out = interpolate(t, [SCENE.tsarOut, SCENE.tsarOut + 0.35], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const gateIn = spring({ frame: frame - Math.round((SCENE.tsarIn + 0.05) * fps), fps, config: { damping: 16, stiffness: 140 }, durationInFrames: 22 });
  const chipIn = spring({ frame: frame - Math.round((SCENE.tsarIn + 0.35) * fps), fps, config: { damping: 200 }, durationInFrames: 18 });
  // щит: влёт + слэм + тряска
  const shieldIn = spring({ frame: frame - Math.round((SCENE.shieldHit + 0.02) * fps), fps, config: { damping: 13, stiffness: 170 }, durationInFrames: 15 });
  const sh = shake(t, SCENE.shieldHit + 0.04, 12, 0.4);

  return (
    <AbsoluteFill style={{ opacity: out, pointerEvents: "none" }}>
      {/* ладьи плывут к воротам */}
      {[0, 1, 2].map((i) => {
        const p = clamp01(interpolate(t, [SCENE.boatsIn + i * 0.35, SCENE.shieldHit + 0.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) }));
        const bx = 220 + p * (520 + i * 40);
        const by = 1060 + i * 52 - Math.sin(p * Math.PI * 2.2) * 14;
        return (
          <div key={i} style={{ position: "absolute", left: bx, top: by, opacity: clamp01(p * 2) * (1 - clamp01((p - 0.85) / 0.15)) }}>
            <div style={{
              width: 74, height: 26, background: COLORS.inkDim, borderRadius: "0 0 18px 18px",
              boxShadow: "0 4px 0 rgba(0,0,0,0.4)",
            }} />
            <div style={{
              position: "absolute", left: 25, top: -34, width: 24, height: 34,
              background: COLORS.paper, opacity: 0.9, clipPath: "polygon(0% 100%, 0% 0%, 100% 0%, 78% 100%)",
            }} />
          </div>
        );
      })}

      {/* золотые ворота Царьграда */}
      <div style={{
        position: "absolute", left: 790, top: 950, width: 230, height: 240,
        opacity: clamp01(gateIn), transform: `translateY(${(1 - clamp01(gateIn)) * 40}px)`,
      }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 62, height: 240, background: `linear-gradient(180deg, ${COLORS.gold}, ${COLORS.goldDeep})`, borderRadius: 8, boxShadow: `0 0 30px ${COLORS.gold}44` }} />
        <div style={{ position: "absolute", right: 0, top: 0, width: 62, height: 240, background: `linear-gradient(180deg, ${COLORS.gold}, ${COLORS.goldDeep})`, borderRadius: 8, boxShadow: `0 0 30px ${COLORS.gold}44` }} />
        <div style={{ position: "absolute", left: 62, top: 60, right: 62, bottom: 0, background: "rgba(127,168,201,0.22)", border: `3px solid ${COLORS.steel}`, borderBottom: "none", borderRadius: "70px 70px 0 0" }} />
      </div>
      {/* чип богатства */}
      <div style={{
        position: "absolute", left: 905, top: 1215, transform: "translateX(-50%)",
        opacity: clamp01(chipIn),
        fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 24, letterSpacing: 2,
        color: COLORS.steel, whiteSpace: "nowrap",
        padding: "6px 16px", background: "rgba(13,10,7,0.85)", border: `2.5px solid ${COLORS.steel}66`, borderRadius: 12,
      }}>ТОП-1 БОГАТСТВО</div>

      {/* щит Олега слэмится в ворота */}
      <div style={{
        position: "absolute", left: 905, top: 1060,
        transform: `translate(-50%,-50%) scale(${2.1 - 1.1 * clamp01(shieldIn)}) translate(${sh.x}px, ${sh.y}px)`,
        opacity: clamp01(shieldIn),
      }}>
        <div style={{
          width: 130, height: 130, borderRadius: "50%",
          background: `radial-gradient(circle at 40% 32%, #C89838, ${COLORS.redDeep})`,
          border: `6px solid ${COLORS.gold}`,
          boxShadow: `0 0 50px ${COLORS.gold}88`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: COLORS.gold, boxShadow: `0 0 20px ${COLORS.gold}` }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============ ТОП КАРТЫ: лидерборд сезона ============
type Rank = { n: string; name: string; note: string; color: string };
const RANKS: Rank[] = [
  { n: "1", name: "ХАЗАРИЯ", note: "БОСС КАРТЫ", color: COLORS.red },
  { n: "2", name: "ВИЗАНТИЯ", note: "ДЕНЬГИ · ВЕРА", color: COLORS.steel },
  { n: "3", name: "РУСЬ", note: "НОВЫЙ ИГРОК ↑", color: COLORS.gold },
  { n: "12", name: "?", note: "ЕЩЁ НЕТ НА КАРТЕ", color: COLORS.ghost },
];

export const TopBoard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < SCENE.boardIn) return null;
  const out = interpolate(t, [SCENE.boardOut, SCENE.boardOut + 0.35], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const inS = spring({ frame: frame - Math.round(SCENE.boardIn * fps), fps, config: { damping: 16, stiffness: 140 }, durationInFrames: 22 });

  // корона над №1 на «Хазария»
  const crownIn = spring({ frame: frame - Math.round((SCENE.khanatGlow + 0.05) * fps), fps, config: { damping: 14, stiffness: 160 }, durationInFrames: 16 });
  const crownPulse = 1 + Math.sin((t - SCENE.khanatGlow) * 5) * 0.05;

  // мечи дани летят к Хазарии (по мечу с дома)
  const swords = [0, 1, 2].map((i) => {
    const p = clamp01(interpolate(t, [SCENE.swordsFly + i * 0.18, SCENE.swordsFly + 0.85 + i * 0.18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) }));
    return { p, i };
  });

  return (
    <AbsoluteFill style={{ opacity: out, pointerEvents: "none" }}>
      {/* панель лидерборда */}
      <div style={{
        position: "absolute", top: 560, left: 0, right: 0, display: "flex", justifyContent: "center",
        opacity: inS, transform: `scale(${0.9 + 0.1 * inS})`,
      }}>
        <div style={{
          width: 880, background: "rgba(13,10,7,0.94)", border: `4px solid ${COLORS.border}`, borderRadius: 22,
          padding: "24px 34px 26px", boxShadow: "0 0 50px rgba(0,0,0,0.55)",
        }}>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 42, letterSpacing: 5, color: COLORS.ink, textAlign: "center" }}>
            ТОП КАРТЫ
          </div>
          {RANKS.map((r, i) => {
            const rIn = spring({ frame: frame - Math.round((SCENE.boardIn + 0.22 + i * 0.14) * fps), fps, config: { damping: 200 }, durationInFrames: 20 });
            const isBoss = i === 0;
            const bossFlash = isBoss ? clamp01(interpolate(t, [SCENE.khanatGlow, SCENE.khanatGlow + 0.25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })) : 0;
            const dashed = r.n === "12";
            return (
              <div key={r.n} style={{
                display: "flex", alignItems: "center", gap: 22, marginTop: 16,
                opacity: rIn, transform: `translateX(${(1 - rIn) * -24}px)`,
                background: bossFlash > 0.5 ? `linear-gradient(90deg, ${COLORS.redDeep}33, transparent)` : "rgba(242,232,208,0.04)",
                border: `${dashed ? 2.5 : 2}px ${dashed ? "dashed" : "solid"} ${r.color}55`,
                borderRadius: 14, padding: "12px 22px",
                position: "relative",
              }}>
                <div style={{
                  fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 44, color: r.color,
                  width: 56, textAlign: "center", fontVariantNumeric: "tabular-nums",
                  textShadow: isBoss ? `0 0 26px ${COLORS.red}` : "none",
                }}>{r.n}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 40, letterSpacing: 2,
                    color: dashed ? COLORS.ghost : r.color,
                    textShadow: isBoss ? `0 0 30px ${COLORS.red}88` : "none",
                  }}>{r.name}</div>
                </div>
                <div style={{
                  fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 24, letterSpacing: 2,
                  color: COLORS.inkDim, whiteSpace: "nowrap",
                }}>{r.note}</div>
                {/* корона босса */}
                {isBoss && (
                  <div style={{
                    position: "absolute", left: 74, top: -34,
                    transform: `translateX(-50%) scale(${clamp01(crownIn) * crownPulse})`,
                    width: 64, height: 38, background: COLORS.gold,
                    clipPath: "polygon(0% 100%, 0% 35%, 22% 62%, 50% 8%, 78% 62%, 100% 35%, 100% 100%)",
                    filter: `drop-shadow(0 0 12px ${COLORS.gold}88)`,
                    opacity: clamp01(crownIn),
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* мечи дани: летят по полосе ПОД панелью (не перекрывают строки) */}
      {swords.map(({ p, i }) => {
        const sx = 150 + p * 500;
        const sy = 1180 - p * 110;
        return (
          <div key={i} style={{
            position: "absolute", left: sx, top: sy,
            transform: `translate(-50%,-50%) rotate(${38 + p * 52}deg)`,
            opacity: clamp01(p * 3) * (1 - clamp01((p - 0.72) / 0.28)),
          }}>
            <div style={{ width: 10, height: 92, background: `linear-gradient(180deg, ${COLORS.paper}, ${COLORS.inkDim})`, borderRadius: 5 }} />
            <div style={{ position: "absolute", left: -16, top: 62, width: 42, height: 9, background: COLORS.gold, borderRadius: 4 }} />
            <div style={{ position: "absolute", left: -5, top: 74, width: 20, height: 16, background: COLORS.goldDeep, borderRadius: 4 }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ============ КАРТОЧКА ИГОРЯ (живёт до «убили», потом падает) ============
export const IgorCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < SCENE.igorCard) return null;
  const inS = spring({ frame: frame - Math.round(SCENE.igorCard * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 16 });
  // «убили»: карточка темнеет и заваливается
  const fall = interpolate(t, [SCENE.igorFall + 0.1, SCENE.igorFall + 1.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.quad) });
  const op = interpolate(t, [SCENE.igorFall + 0.1, SCENE.igorFall + 1.4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rot = -6 + fall * 78;
  // монеты дани выпадают при падении
  const coins = fall > 0.2;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: inS, pointerEvents: "none" }}>
      <div style={{
        position: "absolute", left: 540, top: 480,
        transform: `translateX(-50%) rotate(${rot}deg) translateY(${fall * 140}px)`,
        opacity: op,
        background: "rgba(18,14,10,0.92)", border: `3px solid ${COLORS.inkDim}`, borderRadius: 18,
        padding: "14px 30px", boxShadow: "0 0 30px rgba(0,0,0,0.5)",
        textAlign: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, justifyContent: "center" }}>
          <div style={{
            width: 78, height: 78, borderRadius: "50%",
            background: `radial-gradient(circle at 34% 30%, ${COLORS.surfaceHi}, ${COLORS.paperInk})`,
            border: `3px solid ${COLORS.inkDim}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 40, color: COLORS.paper,
            opacity: interpolate(fall, [0, 1], [1, 0.3]),
          }}>И</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 52, color: COLORS.ink, whiteSpace: "nowrap" }}>ИГОРЬ</div>
            <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 26, color: COLORS.inkDim, letterSpacing: 2, marginTop: 3, whiteSpace: "nowrap" }}>КНЯЗЬ №3 · ВЗЯЛ ДАНЬ</div>
          </div>
        </div>
      </div>
      {/* монеты выкатились из карточки */}
      {coins && [0, 1, 2].map((i) => {
        const cp = clamp01((t - SCENE.igorFall - 0.25 - i * 0.08) / 0.7);
        return (
          <div key={i} style={{
            position: "absolute", left: 420 + i * 120 + cp * (60 + i * 30), top: 560 + cp * (120 + i * 26),
            width: 26, height: 26, borderRadius: "50%",
            background: `radial-gradient(circle at 35% 30%, ${COLORS.gold}, ${COLORS.goldDeep})`,
            boxShadow: `0 0 14px ${COLORS.gold}66`,
            opacity: (1 - cp) * 0.9,
          }} />
        );
      })}
    </div>
  );
};

// ============ КЛИФФ: Ольга + конверт + ДА. + следующая серия ============
export const CliffPack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < SCENE.olgaCard - 0.05) return null;

  const out = interpolate(t, [SCENE.cliffOut, SCENE.cliffOut + 0.35], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // конверт-приглашение от древлян
  const envIn = spring({ frame: frame - Math.round((SCENE.inviteEnv + 0.05) * fps), fps, config: { damping: 15, stiffness: 150 }, durationInFrames: 18 });
  const envOut = interpolate(t, [SCENE.daSlam - 0.2, SCENE.daSlam + 0.1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // «ДА.» — стоп-кадр всей серии
  const daIn = spring({ frame: frame - Math.round((SCENE.daSlam + 0.03) * fps), fps, config: { damping: 14, stiffness: 150 }, durationInFrames: 16 });
  const sh = shake(t, SCENE.daSlam + 0.06, 14, 0.45);

  // «СЛЕДУЮЩАЯ СЕРИЯ →»
  const nextIn = spring({ frame: frame - Math.round((SCENE.nextSeries + 0.04) * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 18 });

  return (
    <AbsoluteFill style={{ opacity: out, pointerEvents: "none" }}>
      {/* конверт с печатью */}
      <div style={{
        position: "absolute", left: 770, top: 500,
        opacity: clamp01(envIn) * envOut,
        transform: `rotate(6deg) scale(${0.85 + 0.15 * clamp01(envIn)})`,
      }}>
        <div style={{
          width: 240, height: 160, background: `linear-gradient(180deg, ${COLORS.paper}, #E2D3AC)`,
          border: `3px solid ${COLORS.paperEdge}`, borderRadius: 10,
          boxShadow: "0 14px 40px rgba(0,0,0,0.5)",
          position: "relative",
        }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{
              width: 0, height: 0,
              borderLeft: "120px solid rgba(74,63,44,0.16)",
              borderRight: "120px solid rgba(74,63,44,0.16)",
              borderBottom: "90px solid transparent",
              borderBottomColor: "rgba(74,63,44,0.10)",
            }} />
          </div>
          <div style={{
            position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
            width: 52, height: 52, borderRadius: "50%",
            background: COLORS.redDeep, border: `3px solid ${COLORS.red}`,
            boxShadow: `0 0 20px ${COLORS.red}66`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 24, color: COLORS.paper,
          }}>М</div>
        </div>
        <div style={{
          textAlign: "center", marginTop: 10,
          fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 22, letterSpacing: 2,
          color: COLORS.inkDim,
        }}>ПРИГЛАШЕНИЕ · ДРЕВЛЯНЕ</div>
      </div>

      {/* гигантское «ДА.» — стоп-кадр */}
      <div style={{
        position: "absolute", top: 620, left: 0, right: 0, textAlign: "center",
        opacity: clamp01(daIn), transform: `scale(${1.35 - 0.35 * clamp01(daIn)}) translate(${sh.x}px, ${sh.y}px)`,
      }}>
        <div style={{
          display: "inline-block", position: "relative",
          background: `radial-gradient(ellipse at 50% 50%, rgba(229,184,75,0.16) 0%, transparent 70%)`,
          padding: "40px 90px",
        }}>
          <span style={{
            fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 290, letterSpacing: 6,
            color: COLORS.gold,
            textShadow: `0 16px 0 rgba(0,0,0,0.5), 0 0 140px ${COLORS.gold}77`,
            whiteSpace: "nowrap",
          }}>ДА.</span>
        </div>
      </div>

      {/* СЛЕДУЮЩАЯ СЕРИЯ → */}
      <div style={{
        position: "absolute", top: 1040, left: 0, right: 0, display: "flex", justifyContent: "center",
        opacity: clamp01(nextIn), transform: `translateY(${(1 - clamp01(nextIn)) * 24}px)`,
      }}>
        <div style={{
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 44, letterSpacing: 3,
          color: COLORS.ink, whiteSpace: "nowrap",
          padding: "14px 36px", background: "rgba(13,10,7,0.9)",
          border: `3px solid ${COLORS.gold}`, borderRadius: 18,
          boxShadow: `0 0 40px ${COLORS.gold}33`,
        }}>СЛЕДУЮЩАЯ СЕРИЯ →</div>
      </div>
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
  const oA = spring({ frame: frame - Math.round((SCENE.optA + 0.05) * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 18 });
  const oB = spring({ frame: frame - Math.round((SCENE.optB + 0.05) * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 18 });
  const ctaIn = spring({ frame: frame - Math.round((SCENE.endCardIn + 0.35) * fps), fps, config: { damping: 200 }, durationInFrames: 20 });
  const endFade = interpolate(t, [tl.end + 0.9, tl.end + 1.5], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: `rgba(5,4,2,${veil})`, opacity: Math.min(1, veil * 2) * endFade }}>
      <div style={{ position: "absolute", top: 440, left: 0, right: 0, textAlign: "center" }}>
        <div style={{
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 56, color: COLORS.inkDim,
          letterSpacing: 4, opacity: clamp01(s1), transform: `scale(${0.9 + 0.1 * clamp01(s1)})`,
        }}>СЕРИЯ 2 — ВЫБИРАЕШЬ ТЫ</div>
      </div>
      {/* опции голосования */}
      <div style={{
        position: "absolute", top: 620, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 34,
      }}>
        <div style={{
          width: 440, opacity: clamp01(oA), transform: `translateX(${(1 - clamp01(oA)) * -70}px)`,
          background: "rgba(18,14,10,0.95)", border: `4px solid ${COLORS.red}`, borderRadius: 22,
          padding: "26px 24px 30px", textAlign: "center", boxShadow: `0 0 44px ${COLORS.red}33`,
        }}>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 110, color: COLORS.red, lineHeight: 1 }}>1</div>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 42, color: COLORS.ink, letterSpacing: 2, marginTop: 6 }}>МЕСТЬ ОЛЬГИ</div>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 26, color: COLORS.inkDim, letterSpacing: 2, marginTop: 8 }}>945–964 · ТРИ ХОДА</div>
        </div>
        <div style={{
          width: 440, opacity: clamp01(oB), transform: `translateX(${(1 - clamp01(oB)) * 70}px)`,
          background: "rgba(18,14,10,0.95)", border: `4px solid ${COLORS.gold}`, borderRadius: 22,
          padding: "26px 24px 30px", textAlign: "center", boxShadow: `0 0 44px ${COLORS.gold}33`,
        }}>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 110, color: COLORS.gold, lineHeight: 1 }}>2</div>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 42, color: COLORS.ink, letterSpacing: 2, marginTop: 6 }}>КОНЕЦ ХАЗАРИИ</div>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 25, color: COLORS.inkDim, letterSpacing: 2, marginTop: 8 }}>965 · ИДУ НА ВЫ</div>
        </div>
      </div>
      {/* CTA появляется с эндкардом */}
      <div style={{ position: "absolute", top: 1070, left: 0, right: 0, textAlign: "center", opacity: clamp01(ctaIn) }}>
        <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 46, color: COLORS.paper, letterSpacing: 1 }}>
          ПИШИ 1 ИЛИ 2 В КОММЕНТЫ
        </div>
        <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 42, color: COLORS.gold, marginTop: 18 }}>
          ПОДПИШИСЬ — СЕРИЯ 2 ЗАВТРА
        </div>
        <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 30, color: COLORS.inkDim, marginTop: 14, letterSpacing: 2 }}>
          РУСЬ: БИТВА ЗА 1000 ЛЕТ · #русь1000
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============ ПЫЛЬ АРЕНЫ (лёгкая, всегда) ============
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
      <RosterGrid />

      {/* призвание: Рюрик-аутсорс + цитата летописи */}
      <HeroCard t0={SCENE.hireCard} tOut={SCENE.quoteOut + 0.1} glyph="Р" title="РЮРИК" sub="ВИКИНГ · КНЯЗЬ №1" x={120} y={440} color={COLORS.gold} align="left" />
      <Stamp t0={SCENE.hireCard + 0.3} text="АУТСОРС" x={300} y={660} dur={2.4} size={62} color={COLORS.gold} />
      <QuoteScroll />

      {/* олег: карточка + РУСЬ-слэм (карта в RusScene) */}
      <HeroCard t0={SCENE.olegCard} tOut={SCENE.rusSlam + 1.2} glyph="О" title="ОЛЕГ" sub="ВЕЩИЙ · КНЯЗЬ №2" x={960} y={450} color={COLORS.gold} align="right" />
      <RusSlam />

      {/* царьград: ворота + ладьи + щит + оттиск */}
      <TsarPack />
      <Stamp t0={SCENE.weStamp} text="МЫ БЫЛИ ЗДЕСЬ" x={500} y={620} dur={1.9} size={58} color={COLORS.steel} />

      {/* топ карты: Хазария-босс + мечи дани */}
      <TopBoard />
      <Stamp t0={SCENE.tributeStamp} text="ПО МЕЧУ С ДОМА" x={540} y={425} dur={1.7} size={54} color={COLORS.redDeep} />

      {/* игорь: карточка + плохой ход + падение */}
      <IgorCard />
      <Stamp t0={SCENE.badMove} text="ПЛОХОЙ ХОД" x={540} y={700} dur={2.0} size={80} color={COLORS.red} />

      {/* клифф: Ольга + конверт + ДА. */}
      <HeroCard t0={SCENE.olgaCard} tOut={SCENE.daSlam + 0.35} glyph="О" title="ОЛЬГА" sub="ВДОВА · КНЯГИНЯ" x={120} y={450} color={COLORS.red} align="left" />
      <CliffPack />

      {/* финал */}
      <EndCard />

      <Dust />
    </AbsoluteFill>
  );
};

export default Overlays;
