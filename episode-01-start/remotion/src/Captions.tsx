// Captions.tsx — karaoke-style captions with word highlighting (TikTok style)
// Groups of <=4 words, active word pops + takes semantic color.
import React from "react";
import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { COLORS, FONT, LAYOUT } from "./theme";
import { LINES, CAPTIONS_OFF } from "./data";

const ACTIVE_COLORS: Record<string, string> = {
  yellow: COLORS.gold,   // «жёлтая» подсветка = золото темы
  red: COLORS.red,
  green: COLORS.green,
  cyan: COLORS.steel,    // «циановая» подсветка = сталь (Византия/Запад)
};

const CaptionGroup: React.FC<{ words: { text: string; start: number; end: number; color?: string | null }[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const inS = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 9 });
  const out = interpolate(frame, [0, 5], [0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      opacity: inS * out,
      transform: `translateY(${(1 - inS) * 14}px)`,
      display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline",
      columnGap: 22, rowGap: 6, maxWidth: 940,
    }}>
      {words.map((w, i) => {
        const active = t >= w.start && t < w.end + 0.08;
        const spoken = t >= w.end;
        const col = ACTIVE_COLORS[w.color ?? ""];
        const pop = active ? spring({ frame: frame - Math.round(w.start * fps), fps, config: { damping: 16, stiffness: 190 }, durationInFrames: 10 }) : 0;
        return (
          <span key={i} style={{
            fontFamily: `${FONT}, sans-serif`,
            fontWeight: 800,
            fontSize: 66,
            lineHeight: 1.22,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            color: active ? (col ?? COLORS.ink) : spoken ? (col ? col : "rgba(244,247,255,0.86)") : "rgba(244,247,255,0.55)",
            transform: `scale(${1 + pop * 0.05})`,
            textShadow: `0 5px 0 rgba(0,0,0,0.55), 0 0 18px rgba(0,0,0,0.35), 2px 0 0 rgba(10,15,30,0.9), -2px 0 0 rgba(10,15,30,0.9), 0 2px 0 rgba(10,15,30,0.9), 0 -2px 0 rgba(10,15,30,0.9)`,
            transition: "none",
          }}>
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // end card carries the final words — captions step aside
  if (t >= CAPTIONS_OFF) return null;

  // find current group — strictly one at a time:
// visible from (start - 0.06) until min(end + 0.35, next group start)
  let current: { words: { text: string; start: number; end: number; color?: string | null }[]; key: string } | null = null;
  const flat: { grp: (typeof LINES)[number]["groups"][number]; key: string }[] = [];
  for (const l of LINES) {
    for (let g = 0; g < l.groups.length; g++) {
      flat.push({ grp: l.groups[g], key: `${l.id}-${g}` });
    }
  }
  for (let i = 0; i < flat.length; i++) {
    const { grp, key } = flat[i];
    const next = flat[i + 1];
    const visibleUntil = next ? Math.min(grp.end + 0.35, next.grp.start - 0.02) : grp.end + 0.35;
    if (t >= grp.start - 0.06 && t < visibleUntil) {
      current = { words: grp.words, key };
    }
  }
  if (!current) return null;

  return (
    <div style={{
      position: "absolute",
      top: LAYOUT.captionCenterY,
      left: 0, right: 0,
      display: "flex", justifyContent: "center",
      padding: "0 60px",
    }}>
      <CaptionGroup key={current.key} words={current.words} />
    </div>
  );
};

export default Captions;
