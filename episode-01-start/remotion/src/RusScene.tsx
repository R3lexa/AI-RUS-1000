// RusScene.tsx — постоянная сцена «ТЁМНАЯ РУСЬ»:
// ночь, свечное свечение, редкие угли, виньетка. Вся драма — в Overlays.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "./theme";
import { SCENE } from "./data";
import { Embers } from "./Objects";

const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const RusScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // драматический свет усиливается к мести
  const heat = t > SCENE.r2Fire ? 1 : t > SCENE.r1Pit ? 0.5 : 0;
  const breathe = 0.85 + Math.sin(t * 0.9) * 0.15;

  return (
    <AbsoluteFill style={{ fontFamily: "Montserrat, sans-serif" }}>
      {/* ночь */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${COLORS.bgTop} 0%, ${COLORS.bgBottom} 58%, ${COLORS.bgTop} 100%)` }} />
      {/* свечные пятна — живут */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse 620px 1000px at 50% 100%, rgba(255,166,66,${0.05 + heat * 0.05}) 0%, transparent 62%),
                     radial-gradient(ellipse 420px 700px at 18% 6%, rgba(229,184,75,${0.05 * breathe}) 0%, transparent 60%),
                     radial-gradient(ellipse 420px 700px at 82% 6%, rgba(229,184,75,${0.04 * breathe}) 0%, transparent 60%)`,
      }} />
      {/* редкие пылинки-угли во всей серии */}
      <AbsoluteFill>
        <Embers count={4 + Math.round(heat * 4)} width={1080} height={1500} bottom={0.62} />
      </AbsoluteFill>
      {/* тонкая текстура */}
      <AbsoluteFill style={{
        background: `repeating-linear-gradient(0deg, rgba(242,232,208,0.012) 0px, rgba(242,232,208,0.012) 1px, transparent 1px, transparent 7px)`,
      }} />
      {/* виньетка */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse at 50% 44%, transparent 50%, rgba(4,3,2,0.72) 100%)",
      }} />
    </AbsoluteFill>
  );
};

export default RusScene;
