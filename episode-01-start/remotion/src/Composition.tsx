// Composition.tsx — main assembly: scene + HUD + captions + overlays + full audio mix
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig, delayRender, continueRender } from "remotion";
import RusScene from "./RusScene";
import Hud from "./Hud";
import Captions from "./Captions";
import Overlays from "./Overlays";
import { LINES, SFX_CUES, TOTAL, FPS } from "./data";

export const Main: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    const delay = delayRender("Montserrat");
    const face = new FontFace(
      "Montserrat",
      `url(${staticFile("fonts/Montserrat-VF.ttf")})`,
      { weight: "100 900", style: "normal" }
    );
    face.load()
      .then(() => {
        (document.fonts as FontFaceSet & { add: (f: FontFace) => void }).add(face);
        continueRender(delay);
        setFontReady(true);
      })
      .catch(() => continueRender(delay));
  }, []);

  if (!fontReady) return null;

  return (
    <AbsoluteFill style={{ backgroundColor: "#100D08", fontFamily: "Montserrat, sans-serif" }}>
      <RusScene />
      <Hud />
      <Overlays />
      <Captions />

      {/* ===== AUDIO ===== */}
      {/* VO lines */}
      {LINES.map((l, i) => {
        const from = Math.round(l.start * FPS);
        const dur = Math.ceil((l.end - l.start) * FPS) + 2;
        if (from >= durationInFrames) return null;
        return (
          <Sequence key={l.id} from={from} durationInFrames={dur}>
            <Audio src={staticFile(`assets/vo/line_${String(i).padStart(2, "0")}_${l.id}.wav`)} volume={1} />
          </Sequence>
        );
      })}

      {/* SFX cues (длинные — wind/typing/bell/fire до 9 с) */}
      {SFX_CUES.map((s, i) => {
        const from = Math.round(s.t * FPS);
        if (from >= durationInFrames) return null;
        return (
          <Sequence key={`sfx-${i}`} from={from} durationInFrames={Math.ceil(9.5 * FPS)}>
            <Audio src={staticFile(`assets/sfx/${s.file}`)} volume={s.gain ?? 0.8} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export default Main;
