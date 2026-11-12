// Hud.tsx — persistent 3-chip scoreboard (retention machine, ref-style)
// «РУСЬ: БИТВА ЗА 1000 ЛЕТ»: ГОД (ролл) · В ИГРЕ (счётчик вылетов) · ЛИДЕР (строка).
// Chips enter as ONE unit (40-80ms stagger inside), counters roll on change.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { COLORS, LAYOUT } from "./theme";
import { HUD_YEAR, HUD_IN_GAME, HUD_MAIN, fmtYear, SCENE, HudStep } from "./data";

const useCount = (steps: HudStep[]): { text: string; changeT: number; flash?: string } => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  let idx = 0;
  for (let i = 0; i < steps.length; i++) if (t >= steps[i].t) idx = i;
  const cur = steps[idx];
  const prev = steps[Math.max(0, idx - 1)];
  if (idx === 0) return { text: fmtYear(cur.value), changeT: -1 };
  const p = interpolate(t, [cur.t, cur.t + 0.55], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad),
  });
  const v = Math.round(prev.value + (cur.value - prev.value) * p);
  return { text: fmtYear(v), changeT: cur.t, flash: cur.flash };
};

const useMain = (): { text: string; changeT: number; flash?: string } => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let idx = 0;
  for (let i = 0; i < HUD_MAIN.length; i++) if (t >= HUD_MAIN[i].t) idx = i;
  const cur = HUD_MAIN[idx];
  return { text: cur.value, changeT: idx === 0 ? -1 : cur.t, flash: cur.flash };
};

const FLASH_COLORS: Record<string, string> = {
  red: COLORS.red,
  green: COLORS.green,
  yellow: COLORS.gold,
  gold: COLORS.gold,
};

const Chip: React.FC<{
  label: string; value: string; accent: string; delay: number; flash?: string | null; flashNow?: boolean;
}> = ({ label, value, accent, delay, flash, flashNow }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = Math.round((SCENE.hudIn + delay) * fps);
  const inS = spring({ frame: frame - base, fps, config: { damping: 200 }, durationInFrames: 22 });
  const pop = spring({ frame: frame - base - 6, fps, config: { damping: 14, stiffness: 160 }, durationInFrames: 14 });
  const s = inS * (1 + (flashNow ? pop * 0.07 : 0));
  return (
    <div style={{
      opacity: inS,
      transform: `scale(${s})`,
      background: "rgba(20,16,10,0.88)",
      border: `2.5px solid ${flash ?? COLORS.border}`,
      borderRadius: 18,
      padding: "10px 16px 12px",
      width: 318,
      boxShadow: `0 6px 24px rgba(0,0,0,0.45)${flash ? `, 0 0 26px ${flash}44` : ""}`,
      textAlign: "center",
    }}>
      <div style={{ color: COLORS.inkDim, fontSize: 24, fontWeight: 700, letterSpacing: 1.6 }}>{label}</div>
      <div style={{ color: accent, fontSize: value.length > 8 ? 33 : 44, fontWeight: 800, lineHeight: 1.08, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{value}</div>
    </div>
  );
};

export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const year = useCount(HUD_YEAR);
  const inGame = useCount(HUD_IN_GAME);
  const main = useMain();

  // end card takes the full stage — HUD steps aside
  if (t >= SCENE.endCardIn) return null;

  const yearFlash = year.changeT > 0 && t - year.changeT < 0.8 ? FLASH_COLORS[year.flash ?? "yellow"] : null;
  const mainFlash = main.changeT > 0 && t - main.changeT < 0.8 ? FLASH_COLORS[main.flash ?? "red"] : null;

  return (
    <div style={{
      position: "absolute", top: LAYOUT.hudTop, left: 0, right: 0,
      display: "flex", justifyContent: "center", gap: 13,
    }}>
      <Chip label="ГОД" value={year.text} accent={COLORS.gold} delay={0}
        flashNow={year.changeT > 0 && t - year.changeT < 0.6} flash={yearFlash} />
      <Chip label="В ИГРЕ" value={String(inGame.text)} accent={COLORS.paper} delay={0.07}
        flashNow={inGame.changeT > 0 && t - inGame.changeT < 0.6} />
      <Chip label="ЛИДЕР" value={main.text} accent={main.changeT > 0 ? (main.flash === "red" ? COLORS.red : COLORS.gold) : COLORS.inkDim} delay={0.14}
        flashNow={main.changeT > 0 && t - main.changeT < 0.6} flash={mainFlash} />
    </div>
  );
};

export default Hud;
