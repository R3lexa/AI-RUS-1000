// Hud.tsx — верхняя панель «ТЁМНОЙ РУСИ»: слева 945 · РУСЬ, справа МЕСТЬ x/3
// (машина досматривания), под ними полоса прогресса серии.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT, LAYOUT } from "./theme";
import { SCENE, HUD_REVENGE, TOTAL } from "./data";

export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // эндкард забирает кадр
  if (t < SCENE.hudIn || t >= SCENE.tVote) return null;

  const inS = spring({ frame: frame - Math.round((SCENE.hudIn + 0.05) * fps), fps, config: { damping: 200 }, durationInFrames: 22 });

  // счётчик местей
  let n = 0;
  let changeT = -1;
  for (const s of HUD_REVENGE) {
    if (t >= s.t + 0.05) { if (s.value > n) { n = s.value; changeT = s.t; } }
  }
  const pop = spring({ frame: frame - Math.round((changeT + 0.05) * fps), fps, config: { damping: 14, stiffness: 160 }, durationInFrames: 14 });

  // прогресс серии
  const prog = interpolate(t, [0, TOTAL], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const warm = n >= 3;

  return (
    <div style={{ position: "absolute", top: LAYOUT.hudTop - 26, left: 0, right: 0, opacity: inS }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 46px", alignItems: "center" }}>
        {/* год и место */}
        <div style={{
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 38, letterSpacing: 2,
          color: COLORS.paper, background: "rgba(11,8,6,0.82)",
          border: `2.5px solid ${COLORS.border}`, borderRadius: 14, padding: "10px 22px",
          fontVariantNumeric: "tabular-nums",
        }}>945 · РУСЬ</div>
        {/* счётчик местей */}
        <div style={{
          fontFamily: `${FONT}, sans-serif`, fontWeight: 800, fontSize: 38, letterSpacing: 2,
          color: warm ? COLORS.fireHi : COLORS.red, background: "rgba(11,8,6,0.82)",
          border: `2.5px solid ${warm ? COLORS.fireMid : COLORS.red}`, borderRadius: 14,
          padding: "10px 22px", whiteSpace: "nowrap",
          transform: `scale(${1 + (changeT > 0 ? pop * 0.09 : 0)})`,
          boxShadow: `0 0 ${10 + n * 8}px ${warm ? COLORS.fireMid : COLORS.red}55`,
        }}>
          МЕСТЬ <span style={{ color: COLORS.ink }}>{n}</span>/3
        </div>
      </div>
      {/* полоса прогресса серии — тонкая золотая линия */}
      <div style={{ margin: "12px 46px 0", height: 5, background: "rgba(242,232,208,0.14)", borderRadius: 3 }}>
        <div style={{
          width: `${prog * 100}%`, height: "100%",
          background: `linear-gradient(90deg, ${COLORS.red}, ${COLORS.fireMid}, ${COLORS.gold})`,
          borderRadius: 3, boxShadow: `0 0 12px ${COLORS.fireMid}66`,
        }} />
      </div>
    </div>
  );
};

export default Hud;
