// Overlays.tsx — «ТЁМНАЯ РУСЬ» серия 1 «ОНА СКАЗАЛА "ДА"»:
// хук-стек A/B/C (лицо с 0.0 с), контекст (Игорь), расчёт Мала,
// план (ДА + 1·2·3), три мести (лодья→яма, баня→огонь, голуби→город),
// итог (корона), клифф «ИДУ НА ВЫ», эндкард-голосование.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { COLORS, FONT } from "./theme";
import { SCENE, HOOK, line } from "./data";
import { OlgaFace, IgorFace, MalFace, SvyatFace } from "./Faces";
import { Drakkar, PitBurial, Banya, Dove, Iskorosten } from "./Objects";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** псевдослучайное [0..1) без state */
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** затухающая тряска для слэмов */
const shake = (t: number, t0: number, amp = 12, dur = 0.35): { x: number; y: number } => {
  if (t < t0 || t > t0 + dur) return { x: 0, y: 0 };
  const p = 1 - (t - t0) / dur;
  return { x: Math.sin((t - t0) * 90) * amp * p, y: Math.cos((t - t0) * 77) * amp * 0.6 * p };
};

/** камера: punch-зумы на слэмах + медленный push */
const Cam: React.FC<{ punches?: number[]; push?: [number, number]; children: React.ReactNode }> = ({ punches = [], push, children }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let s = 1;
  for (const p of punches) {
    if (t >= p && t < p + 0.55) {
      const k = 1 - (t - p) / 0.55;
      s *= 1 + 0.06 * k * k;
    }
  }
  if (push && t > push[0]) {
    s *= 1 + 0.035 * clamp01((t - push[0]) / Math.max(0.1, push[1] - push[0]));
  }
  return (
    <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: "50% 52%" }}>
      {children}
    </AbsoluteFill>
  );
};

// ============ СЛАМ-ТЕКСТ (гигантское слово) ============
const Slam: React.FC<{ t0: number; tOut: number; text: string; y?: number; size?: number; color?: string }> = ({ t0, tOut, text, y = 760, size = 220, color = COLORS.gold }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < t0) return null;
  const inS = spring({ frame: frame - Math.round((t0 + 0.03) * fps), fps, config: { damping: 14, stiffness: 150 }, durationInFrames: 16 });
  const out = interpolate(t, [tOut - 0.3, tOut], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sh = shake(t, t0 + 0.05, 13, 0.4);
  return (
    <div style={{
      position: "absolute", top: y, left: 0, right: 0, textAlign: "center",
      opacity: clamp01(inS) * out, transform: `scale(${1.3 - 0.3 * clamp01(inS)}) translate(${sh.x}px, ${sh.y}px)`,
      pointerEvents: "none",
    }}>
      <span style={{
        fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: size, letterSpacing: 4,
        color, textShadow: `0 14px 0 rgba(0,0,0,0.55), 0 0 130px ${color}66`,
        whiteSpace: "nowrap",
      }}>{text}</span>
    </div>
  );
};

// ============ ШТАМП ============
const Stamp: React.FC<{ t0: number; text: string; y?: number; color?: string; dur?: number; size?: number }> = ({ t0, text, y = 500, color = COLORS.red, dur = 1.8, size = 74 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < t0 || t > t0 + dur) return null;
  const inS = spring({ frame: frame - Math.round(t0 * fps), fps, config: { damping: 11, stiffness: 170 }, durationInFrames: 16 });
  const out = interpolate(t, [t0 + dur - 0.25, t0 + dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sh = shake(t, t0 + 0.03, 9, 0.3);
  return (
    <div style={{
      position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center",
      opacity: inS * out, pointerEvents: "none",
    }}>
      <div style={{
        transform: `rotate(-6deg) scale(${1.22 - 0.22 * inS}) translate(${sh.x}px, ${sh.y}px)`,
        border: `6px solid ${color}`, borderRadius: 14, padding: "12px 28px",
        background: "rgba(11,8,6,0.88)", boxShadow: `0 0 34px ${color}55`,
      }}>
        <span style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: size, letterSpacing: 2, color, whiteSpace: "nowrap" }}>{text}</span>
      </div>
    </div>
  );
};

// ============ ЧИП-ПЛАШКА ============
const Chip: React.FC<{ t0: number; text: string; y?: number; color?: string; tOut?: number }> = ({ t0, text, y = 980, color = COLORS.gold, tOut }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < t0) return null;
  const out = tOut ? interpolate(t, [tOut - 0.2, tOut], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const inS = spring({ frame: frame - Math.round(t0 * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 18 });
  return (
    <div style={{
      position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center",
      opacity: clamp01(inS) * out, transform: `translateY(${(1 - clamp01(inS)) * 22}px)`, pointerEvents: "none",
    }}>
      <div style={{
        fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 46, letterSpacing: 2,
        color, whiteSpace: "nowrap", padding: "14px 32px",
        background: "rgba(11,8,6,0.9)", border: `3.5px solid ${color}`, borderRadius: 18,
        boxShadow: `0 0 40px ${color}33`,
      }}>{text}</div>
    </div>
  );
};

// ============ ХУК: ЖЁСТКИЙ КАТ 0.0с, ТИТУЛ К 0.5с, СТОП-МОМЕНТ ============
export const HookStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < SCENE.faceIn) return null;   // до 0.0с — ничего: первый кадр уже лицо
  const out = interpolate(t, [SCENE.hookOut, SCENE.hookOut + 0.4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const title = HOOK === "A" ? "ОНА СКАЗАЛА «ДА»" : HOOK === "B" ? "ОНА СОЖГЛА ГОРОД" : "ПОТОМ ИХ НЕ СТАЛО";
  const titleIn = spring({ frame: frame - Math.round((SCENE.hookTitle + 0.04) * fps), fps, config: { damping: 15, stiffness: 160 }, durationInFrames: 14 });
  const sh = shake(t, SCENE.faceIn + 0.02, 15, 0.4);

  // стоп-момент на shock-слове: всё гаснет, слово — гигантом
  const dim = clamp01(interpolate(t, [SCENE.hookShock - 0.12, SCENE.hookShock + 0.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const shockText = HOOK === "A" ? "ДА." : HOOK === "B" ? "ИЗ-ЗА ГОЛУБЕЙ" : "НИЧЕГО";
  const shockSize = HOOK === "A" ? 300 : HOOK === "B" ? 96 : 150;

  return (
    <AbsoluteFill style={{ opacity: out, pointerEvents: "none" }}>
      {/* красная виньетка хука */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(126,31,22,0.28) 100%)",
        opacity: 0.9 - dim * 0.5,
      }} />
      <AbsoluteFill style={{ background: "rgba(4,3,2,0.35)", opacity: dim }} />

      {/* ВАРИАНТ A/C: лицо Ольги с 0.0 секунды */}
      {HOOK !== "B" ? (
        <div style={{
          position: "absolute", top: 430, left: 0, right: 0, display: "flex", justifyContent: "center",
          transform: `translate(${sh.x}px, ${sh.y}px) scale(${1 - dim * 0.12})`,
          filter: `brightness(${HOOK === "C" ? 0.62 : 1})`,
          opacity: 1 - dim,
        }}>
          <OlgaFace size={640} />
        </div>
      ) : (
        /* ВАРИАНТ B: горящий город + голуби с 0.0 секунды */
        <div style={{ position: "absolute", top: 620, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `translate(${sh.x}px, ${sh.y}px)`, opacity: 1 - dim * 0.55 }}>
          <Iskorosten fire={clamp01((t - 0.2) / 1.4)} size={920} />
        </div>
      )}
      {HOOK === "B" && [0, 1, 2].map((i) => {
        const p = clamp01((t - 0.35 - i * 0.22) / 1.1);
        return (
          <div key={i} style={{
            position: "absolute",
            left: 120 + p * (600 + i * 90), top: 480 + Math.sin(p * Math.PI * 1.6 + i) * 90 - p * 60,
            opacity: clamp01(p * 2) * (1 - clamp01((p - 0.88) / 0.12)),
          }}>
            <Dove size={110} flame />
          </div>
        );
      })}

      {/* титул к 0.5 с (у C строка длиннее — кегль меньше) */}
      <div style={{
        position: "absolute", top: 205, left: 0, right: 0, textAlign: "center",
        opacity: clamp01(titleIn) * (1 - dim), transform: `scale(${0.86 + 0.14 * clamp01(titleIn)})`,
      }}>
        <span style={{
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: HOOK === "C" ? 74 : 88, letterSpacing: 1,
          color: COLORS.ink, textShadow: `0 8px 0 rgba(0,0,0,0.55), 0 0 90px ${COLORS.gold}44`,
          whiteSpace: "nowrap",
        }}>{title}</span>
      </div>

      {/* стоп-момент */}
      {t >= SCENE.hookShock && (
        <Slam t0={SCENE.hookShock} tOut={SCENE.hookOut + 0.45} text={shockText} y={720} size={shockSize} />
      )}
    </AbsoluteFill>
  );
};

// ============ КОНТЕКСТ: РЕАЛЬНАЯ ИСТОРИЯ · 945 · ИГОРЬ ============
export const ContextStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < SCENE.hudIn) return null;
  const out = interpolate(t, [SCENE.contextOut, SCENE.contextOut + 0.35], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const igorIn = spring({ frame: frame - Math.round(SCENE.igorIn * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 16 });
  // смерть: слэш + затемнение + падение карточки
  const dead = clamp01(interpolate(t, [SCENE.igorDead, SCENE.igorDead + 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const deadSh = shake(t, SCENE.igorDead + 0.03, 12, 0.4);

  return (
    <AbsoluteFill style={{ opacity: out, pointerEvents: "none" }}>
      <Cam push={[SCENE.hudIn, SCENE.contextOut]}>
        {/* плашка «реальная история» */}
        <Chip t0={SCENE.hudIn + 0.1} text="РЕАЛЬНАЯ ИСТОРИЯ · 945" y={430} color={COLORS.paper} />

        {/* карточка Игоря */}
        <div style={{
          position: "absolute", top: 550, left: 0, right: 0, display: "flex", justifyContent: "center",
          opacity: clamp01(igorIn),
          transform: `translateY(${(1 - clamp01(igorIn)) * 40}px + ${dead * 60}px) rotate(${dead * 5}deg)`,
          filter: `brightness(${1 - dead * 0.55}) grayscale(${dead * 0.7})`,
        }}>
          <div style={{
            background: "rgba(17,12,8,0.92)", border: `3.5px solid ${COLORS.inkDim}`, borderRadius: 22,
            padding: "20px 34px 26px", boxShadow: "0 0 40px rgba(0,0,0,0.6)",
            textAlign: "center",
          }}>
            <IgorFace size={340} />
            <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 46, color: COLORS.ink, marginTop: 6 }}>ИГОРЬ</div>
            <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 24, color: COLORS.inkDim, letterSpacing: 2 }}>КНЯЗЬ КИЕВА · МУЖ ОЛЬГИ</div>
          </div>
        </div>

        {/* штамп смерти поверх карточки */}
        {dead > 0.25 && (
          <div style={{
            position: "absolute", top: 790, left: 0, right: 0, display: "flex", justifyContent: "center",
            transform: `translate(${deadSh.x}px, ${deadSh.y}px)`,
            opacity: dead, pointerEvents: "none",
          }}>
            <div style={{
              transform: "rotate(-10deg)",
              border: `7px solid ${COLORS.red}`, borderRadius: 14, padding: "10px 26px",
              background: "rgba(11,8,6,0.92)",
              boxShadow: `0 0 30px ${COLORS.red}44`,
            }}>
              <span style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 92, letterSpacing: 3, color: COLORS.red, whiteSpace: "nowrap" }}>УБИТ · 945</span>
            </div>
          </div>
        )}
      </Cam>
    </AbsoluteFill>
  );
};

// ============ РАСЧЁТ МАЛА ============
export const MalStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < SCENE.malIn) return null;
  const out = interpolate(t, [SCENE.malOut, SCENE.malOut + 0.35], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const malIn = spring({ frame: frame - Math.round(SCENE.malIn * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 16 });
  return (
    <AbsoluteFill style={{ opacity: out, pointerEvents: "none" }}>
      <Cam push={[SCENE.malIn, SCENE.malOut]}>
        <div style={{
          position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center",
          opacity: clamp01(malIn), transform: `translateY(${(1 - clamp01(malIn)) * 40}px)`,
        }}>
          <div style={{
            background: "rgba(17,12,8,0.92)", border: `3.5px solid ${COLORS.wood}`, borderRadius: 22,
            padding: "20px 34px 26px", boxShadow: "0 0 40px rgba(0,0,0,0.6)", textAlign: "center",
          }}>
            <MalFace size={340} />
            <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 46, color: COLORS.ink, marginTop: 6 }}>МАЛ</div>
            <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 24, color: COLORS.inkDim, letterSpacing: 2 }}>КНЯЗЬ ДРЕВЛЯН · УБИЙЦА</div>
          </div>
        </div>
        <Chip t0={SCENE.schemeIn} text="ЖЕНА ПРОСТИТ → ЗЕМЛИ ЕГО" y={1120} color={COLORS.gold} />
      </Cam>
    </AbsoluteFill>
  );
};

// ============ ПЛАН: ДА + ТРИ МЕСТИ ============
export const PlanStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < SCENE.daMini) return null;
  const out = interpolate(t, [SCENE.planOut, SCENE.planOut + 0.35], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: out, pointerEvents: "none" }}>
      <Slam t0={SCENE.daMini} tOut={SCENE.daMini + 1.15} text="ДА." y={620} size={210} />
      {/* счётчик 1·2·3 */}
      <div style={{
        position: "absolute", top: 900, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 26,
        pointerEvents: "none",
      }}>
        {[0, 1, 2].map((i) => {
          const t0 = SCENE.threeIn + 0.1 + i * 0.14;
          const inS = spring({ frame: frame - Math.round(t0 * fps), fps, config: { damping: 13, stiffness: 170 }, durationInFrames: 14 });
          return (
            <div key={i} style={{
              width: 110, height: 110, borderRadius: "50%",
              background: "rgba(17,12,8,0.94)", border: `4px solid ${COLORS.red}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 58, color: COLORS.red,
              opacity: clamp01(inS), transform: `scale(${1.5 - 0.5 * clamp01(inS)})`,
              boxShadow: `0 0 30px ${COLORS.red}44`,
            }}>{i + 1}</div>
          );
        })}
      </div>
      <Chip t0={SCENE.threeIn + 0.55} text="ТРИ МЕСТИ" y={1065} color={COLORS.red} />
    </AbsoluteFill>
  );
};

// ============ МЕСТЬ 1: ЛОДЬЯ → ЯМА ============
export const R1Stage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < SCENE.r1Boat) return null;
  const out = interpolate(t, [SCENE.r1Out, SCENE.r1Out + 0.35], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // фаза ямы: с «выкопать» лодья уже над ямой; с «закопала» уходит в землю
  const pitProg = clamp01(interpolate(t, [SCENE.r1Sink, SCENE.r1Sink + 1.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.quad) }));
  const sailing = clamp01(interpolate(t, [SCENE.r1Boat, SCENE.r1Boat + 1.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill style={{ opacity: out, pointerEvents: "none" }}>
      <Cam punches={[SCENE.r1Sink]} push={[SCENE.r1Boat, SCENE.r1Out]}>
        {t < SCENE.r1Pit ? (
          // лодья плывёт
          <div style={{
            position: "absolute", top: 660, left: 0, right: 0, display: "flex", justifyContent: "center",
            transform: `translateX(${(sailing - 0.5) * 130}px)`,
          }}>
            <Drakkar size={560} />
          </div>
        ) : (
          // яма + лодья уходит в землю
          <div style={{
            position: "absolute", top: 640, left: 0, right: 0, display: "flex", justifyContent: "center",
          }}>
            <PitBurial prog={pitProg} size={640} />
          </div>
        )}
        <Stamp t0={SCENE.r1Stamp} text="МЕСТЬ 1/3 · ЛОДЬЯ" y={480} color={COLORS.red} />
      </Cam>
    </AbsoluteFill>
  );
};

// ============ МЕСТЬ 2: БАНЯ → ОГОНЬ ============
export const R2Stage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < SCENE.r2Banya) return null;
  const out = interpolate(t, [SCENE.r2Out, SCENE.r2Out + 0.35], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const inS = spring({ frame: frame - Math.round(SCENE.r2Banya * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 18 });
  const fire = clamp01(interpolate(t, [SCENE.r2Fire, SCENE.r2Fire + 1.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const doorSh = shake(t, SCENE.r2Door + 0.02, 10, 0.3);
  const banyaIn = clamp01(inS);

  return (
    <AbsoluteFill style={{ opacity: out, pointerEvents: "none" }}>
      <Cam punches={[SCENE.r2Fire]} push={[SCENE.r2Banya, SCENE.r2Out]}>
        <div style={{
          position: "absolute", top: 620, left: 0, right: 0, display: "flex", justifyContent: "center",
          opacity: banyaIn, transform: `translateY(${(1 - banyaIn) * 40}px) translate(${doorSh.x}px, ${doorSh.y}px)`,
        }}>
          <Banya fire={fire} size={580} />
        </div>
        <Chip t0={SCENE.r2Door} text="ДВЕРЬ ЗАПЕРТА" y={440} color={COLORS.inkDim} tOut={SCENE.r2Fire - 0.05} />
        <Stamp t0={SCENE.r2Stamp} text="МЕСТЬ 2/3 · БАНЯ" y={530} color={COLORS.red} />
      </Cam>
    </AbsoluteFill>
  );
};

// ============ МЕСТЬ 3: ГОЛУБИ → ГОРОД ============
export const R3Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < SCENE.r3Dove) return null;
  const out = interpolate(t, [SCENE.r3Out, SCENE.r3Out + 0.35], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const doveIn = spring({ frame: frame - Math.round(SCENE.r3Dove * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 16 });
  const sulfur = t >= SCENE.r3Sulfur;
  // голубь уходит в полёт: масштаб вниз + смещение к верхнему правому
  const flyP = clamp01(interpolate(t, [SCENE.r3Fly, SCENE.r3Fly + 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const cityIn = spring({ frame: frame - Math.round(SCENE.r3City * fps), fps, config: { damping: 16, stiffness: 140 }, durationInFrames: 20 });
  const fire = clamp01(interpolate(t, [SCENE.r3Fire, SCENE.r3Fire + 1.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill style={{ opacity: out, pointerEvents: "none" }}>
      <Cam punches={[SCENE.r3Fire, SCENE.r3Stamp]} push={[SCENE.r3Dove, SCENE.r3Out]}>
        {/* голубь крупно → улетает */}
        <div style={{
          position: "absolute", top: 600 - flyP * 180, left: 0, right: 0, display: "flex", justifyContent: "center",
          opacity: clamp01(doveIn) * (1 - clamp01((flyP - 0.75) / 0.25)),
          transform: `scale(${(1 - flyP * 0.45) * (0.9 + 0.1 * clamp01(doveIn))}) translateX(${flyP * 320}px)`,
        }}>
          <Dove size={260} flame={sulfur} />
        </div>

        {/* трио в полёте к городу */}
        {t >= SCENE.r3Fly + 0.15 && [0, 1, 2].map((i) => {
          const p = clamp01((t - SCENE.r3Fly - 0.15 - i * 0.18) / 1.25);
          return (
            <div key={i} style={{
              position: "absolute",
              left: 90 + p * (620 + i * 80), top: 560 + Math.sin(p * Math.PI * 1.8 + i * 0.9) * 110 - p * 160,
              opacity: clamp01(p * 2.5) * (1 - clamp01((p - 0.9) / 0.1)),
            }}>
              <Dove size={96} flame />
            </div>
          );
        })}

        {/* город появляется и горит */}
        {t >= SCENE.r3City && (
          <div style={{
            position: "absolute", top: 690, left: 0, right: 0, display: "flex", justifyContent: "center",
            opacity: clamp01(cityIn), transform: `translateY(${(1 - clamp01(cityIn)) * 50}px)`,
          }}>
            <Iskorosten fire={fire} size={880} />
          </div>
        )}

        <Chip t0={SCENE.r3Dove + 0.25} text="ПО 3 ГОЛУБЯ С ДВОРА" y={440} color={COLORS.paper} tOut={SCENE.r3Sulfur} />
        <Chip t0={SCENE.r3Sulfur + 0.05} text="СЕРА НА ЛАПАХ" y={440} color={COLORS.fireMid} tOut={SCENE.r3Fly} />
        <Stamp t0={SCENE.r3Stamp} text="МЕСТЬ 3/3 · ГОРОД" y={530} color={COLORS.red} />
      </Cam>
    </AbsoluteFill>
  );
};

// ============ ИТОГ: ПЕРВАЯ ПРАВИТЕЛЬНИЦА ============
export const AfterStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < SCENE.aCrown) return null;
  const out = interpolate(t, [SCENE.afterOut, SCENE.afterOut + 0.35], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const inS = spring({ frame: frame - Math.round(SCENE.aCrown * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 18 });
  return (
    <AbsoluteFill style={{ opacity: out, pointerEvents: "none" }}>
      <Cam push={[SCENE.aCrown, SCENE.afterOut]}>
        <div style={{
          position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center",
          opacity: clamp01(inS), transform: `translateY(${(1 - clamp01(inS)) * 40}px)`,
        }}>
          <div style={{
            background: "rgba(17,12,8,0.92)", border: `3.5px solid ${COLORS.gold}`, borderRadius: 22,
            padding: "20px 34px 26px", boxShadow: `0 0 60px ${COLORS.gold}22`, textAlign: "center",
          }}>
            <OlgaFace size={340} />
            <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 46, color: COLORS.gold, marginTop: 6 }}>ОЛЬГА</div>
            <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 24, color: COLORS.inkDim, letterSpacing: 2 }}>ПЕРВАЯ ПРАВИТЕЛЬНИЦА РУСИ</div>
          </div>
        </div>
        <Chip t0={SCENE.aGone} text="ДРЕВЛЯНЕ: СНЯТЫ С КАРТЫ" y={1120} color={COLORS.red} />
      </Cam>
    </AbsoluteFill>
  );
};

// ============ КЛИФФ: СВЯТОСЛАВ · ИДУ НА ВЫ ============
export const CliffStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < SCENE.cSon) return null;
  const out = interpolate(t, [SCENE.cliffOut, SCENE.cliffOut + 0.35], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const inS = spring({ frame: frame - Math.round(SCENE.cSon * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 16 });
  const dim = clamp01(interpolate(t, [SCENE.cIdu - 0.15, SCENE.cIdu + 0.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill style={{ opacity: out, pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "rgba(4,3,2,0.4)", opacity: dim }} />
      <div style={{
        position: "absolute", top: 440, left: 0, right: 0, display: "flex", justifyContent: "center",
        opacity: clamp01(inS) * (1 - dim * 0.5), transform: `translateY(${(1 - clamp01(inS)) * 40 - dim * 60}px) scale(${(1 - dim * 0.1) * (1 - dim * 0.22)})`,
      }}>
        <div style={{
          background: "rgba(17,12,8,0.92)", border: `3.5px solid ${COLORS.steel}`, borderRadius: 22,
          padding: "20px 34px 26px", boxShadow: "0 0 40px rgba(0,0,0,0.6)", textAlign: "center",
        }}>
          <SvyatFace size={340} />
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 46, color: COLORS.steel, marginTop: 6 }}>СВЯТОСЛАВ</div>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 24, color: COLORS.inkDim, letterSpacing: 2 }}>ЕЁ СЫН · СЕРИЯ 2</div>
        </div>
      </div>
      <Slam t0={SCENE.cIdu} tOut={SCENE.cliffOut + 0.45} text="ИДУ НА ВЫ" y={960} size={132} />
      <Chip t0={SCENE.cNext + 0.1} text="СЕРИЯ 2 →" y={1120} color={COLORS.gold} />
    </AbsoluteFill>
  );
};

// ============ ЭНДКАРД-ГОЛОСОВАНИЕ ============
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const tl = line("teaser");
  if (t < SCENE.tVote - 0.05) return null;

  const veilVote = interpolate(t, [SCENE.tVote, SCENE.tVote + 0.45], [0, 0.72], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const veilFull = clamp01(interpolate(t, [SCENE.tCta, SCENE.tCta + 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const veil = Math.max(veilVote, veilFull * 0.9);

  const hIn = spring({ frame: frame - Math.round((SCENE.tVote + 0.1) * fps), fps, config: { damping: 15, stiffness: 130 }, durationInFrames: 20 });
  const oA = spring({ frame: frame - Math.round((SCENE.tOptA + 0.04) * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 16 });
  const oB = spring({ frame: frame - Math.round((SCENE.tOptA + 0.16) * fps), fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 16 });
  const ctaIn = spring({ frame: frame - Math.round((SCENE.tCta + 0.1) * fps), fps, config: { damping: 200 }, durationInFrames: 18 });
  const endFade = interpolate(t, [tl.end + 0.9, tl.end + 1.5], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: `rgba(4,3,2,${veil})`, opacity: Math.min(1, veil * 2) * endFade }}>
      <div style={{ position: "absolute", top: 430, left: 0, right: 0, textAlign: "center" }}>
        <div style={{
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 68, color: COLORS.paper,
          letterSpacing: 4, opacity: clamp01(hIn), textShadow: "0 4px 0 rgba(0,0,0,0.5)",
        }}>КТО СИЛЬНЕЕ?</div>
      </div>
      <div style={{ position: "absolute", top: 610, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 34 }}>
        <div style={{
          width: 430, opacity: clamp01(oA), transform: `translateX(${(1 - clamp01(oA)) * -70}px)`,
          background: "rgba(28,20,12,0.97)", border: `5px solid ${COLORS.steel}`, borderRadius: 22,
          padding: "26px 22px 30px", textAlign: "center", boxShadow: `0 0 60px ${COLORS.steel}55`,
        }}>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 104, color: COLORS.steel, lineHeight: 1 }}>1</div>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 40, color: COLORS.ink, letterSpacing: 1.5, marginTop: 6 }}>ЗА СВЯТОСЛАВА</div>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 26, color: COLORS.paper, opacity: 0.8, letterSpacing: 2, marginTop: 8 }}>РУСЬ · «ИДУ НА ВЫ»</div>
        </div>
        <div style={{
          width: 430, opacity: clamp01(oB), transform: `translateX(${(1 - clamp01(oB)) * 70}px)`,
          background: "rgba(28,20,12,0.97)", border: `5px solid ${COLORS.red}`, borderRadius: 22,
          padding: "26px 22px 30px", textAlign: "center", boxShadow: `0 0 60px ${COLORS.red}55`,
        }}>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 104, color: COLORS.red, lineHeight: 1 }}>2</div>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 40, color: COLORS.ink, letterSpacing: 1.5, marginTop: 6 }}>ЗА ХАЗАРИЮ</div>
          <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 26, color: COLORS.paper, opacity: 0.8, letterSpacing: 2, marginTop: 8 }}>КАГАНАТ · ДАНЬ МЕЧАМИ</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 1080, left: 0, right: 0, textAlign: "center", opacity: clamp01(ctaIn) }}>
        <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 44, color: COLORS.paper }}>ПИШИ 1 ИЛИ 2 В КОММЕНТЫ</div>
        <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 40, color: COLORS.gold, marginTop: 16 }}>ПОДПИШИСЬ — СЕРИЯ 2 ЗАВТРА</div>
        <div style={{ fontFamily: `${FONT}, sans-serif`, fontWeight: 700, fontSize: 30, color: COLORS.inkDim, marginTop: 14, letterSpacing: 2 }}>ТЁМНАЯ РУСЬ · #тёмнаярусь</div>
      </div>
    </AbsoluteFill>
  );
};

// ============ ПЫЛЬ (живая сцена) ============
export const Dust: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: 12 }, (_, i) => {
        const y = 380 + rnd(i + 20) * 950;
        const speed = 7 + rnd(i + 50) * 12;
        const x = ((rnd(i + 80) * 1080 + t * speed * (rnd(i + 110) > 0.5 ? 1 : -1)) % 1080 + 1080) % 1080;
        const size = 3 + rnd(i + 140) * 4;
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y + Math.sin(t * 0.7 + rnd(i + 170) * 6.28) * 18,
            width: size, height: size, borderRadius: "50%", background: COLORS.paper,
            opacity: 0.06 + rnd(i + 200) * 0.08,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

// ============ СБОРКА ============
export const Overlays: React.FC = () => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <HookStage />
      <ContextStage />
      <MalStage />
      <PlanStage />
      <R1Stage />
      <R2Stage />
      <R3Scene />
      <AfterStage />
      <CliffStage />
      <EndCard />
      <Dust />
    </AbsoluteFill>
  );
};

export default Overlays;
