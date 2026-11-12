// Faces.tsx — SVG-портреты героев «ТЁМНОЙ РУСИ» (серия 1).
// Плоская векторная «тёмная сказка»: жирный контур, свечная палитра.
// Живость: моргание каждые ~3.2 с, микродыхание, дрейф взгляда.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "./theme";

const S = COLORS.skinLine;       // контур
const SKIN = COLORS.skin;
const SKIN_SH = COLORS.skinShade;

/** моргание: 0..1 (1 = глаз закрыт) */
export const useBlink = (t: number, phase: number): number => {
  const cyc = (t * 0.31 + phase) % 1;
  if (cyc < 0.022) return Math.sin((cyc / 0.022) * Math.PI);
  return 0;
};

/** дрейф взгляда по горизонтали, px в системе viewBox */
const gaze = (t: number, phase: number) => Math.sin(t * 0.5 + phase) * 2.2;

type FaceProps = { size?: number; className?: string; style?: React.CSSProperties };

// ============ ОБЩИЕ ДЕТАЛИ ============
/** глаз: белок, радужка, зрачок, веко (моргание) */
const Eye: React.FC<{ cx: number; cy: number; r: number; iris: string; lid: number; gazeX: number }> = ({ cx, cy, r, iris, lid, gazeX }) => (
  <g>
    <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.82} fill="#F6EFE2" stroke={S} strokeWidth={3.5} />
    <circle cx={cx + gazeX} cy={cy + r * 0.08} r={r * 0.5} fill={iris} stroke={S} strokeWidth={2.5} />
    <circle cx={cx + gazeX} cy={cy + r * 0.08} r={r * 0.22} fill="#171008" />
    <circle cx={cx + gazeX - r * 0.16} cy={cy - r * 0.12} r={r * 0.1} fill="#FFFFFF" opacity={0.85} />
    {/* веко: скин-цвет, закрывает глаз при blink */}
    <rect x={cx - r - 3} y={cy - r - 4} width={r * 2 + 6} height={(r * 0.95 + 4) * lid} rx={7} fill={SKIN} />
    <line x1={cx - r} y1={cy - r * 0.8 + lid * r * 0.85} x2={cx + r} y2={cy - r * 0.8 + lid * r * 0.85} stroke={S} strokeWidth={3} opacity={lid > 0.25 ? 1 : 0} />
  </g>
);

const Neck: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <path d={`M ${x - 34} ${y} q 34 26 68 0 L ${x + 44} ${y + 90} L ${x - 44} ${y + 90} Z`} fill={SKIN_SH} stroke={S} strokeWidth={5} />
  </g>
);

// ============ ОЛЬГА — протагонист ============
export const OlgaFace: React.FC<FaceProps> = ({ size = 420, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const lid = useBlink(t, 0.13);
  const gx = gaze(t, 0.7);
  const breathe = 1 + Math.sin(t * 1.15) * 0.006;

  return (
    <svg width={size} height={size * 1.22} viewBox="0 0 240 292" style={style}>
      <g transform={`scale(${breathe})`} style={{ transformOrigin: "120px 150px" }}>
        {/* волосы сзади */}
        <path d="M 52 96 Q 30 170 44 236 Q 74 252 120 250 Q 166 252 196 236 Q 210 170 188 96 Z" fill={COLORS.hairDark} stroke={S} strokeWidth={5} />
        {/* шея и плечи */}
        <Neck x={120} y={188} />
        <path d="M 34 292 Q 120 236 206 292 Z" fill="#3A2417" stroke={S} strokeWidth={5} />
        <circle cx={92} cy={272} r={4} fill={COLORS.gold} />
        <circle cx={148} cy={272} r={4} fill={COLORS.gold} />
        {/* лицо */}
        <path d="M 120 44 Q 176 46 182 118 Q 184 176 148 204 Q 132 216 120 216 Q 108 216 92 204 Q 56 176 58 118 Q 64 46 120 44 Z" fill={SKIN} stroke={S} strokeWidth={5} />
        {/* височные пряди */}
        <path d="M 58 104 Q 54 150 70 178 Q 58 140 66 104 Z" fill={COLORS.hairDark} stroke={S} strokeWidth={3.5} />
        <path d="M 182 104 Q 186 150 170 178 Q 182 140 174 104 Z" fill={COLORS.hairDark} stroke={S} strokeWidth={3.5} />
        {/* кокошник */}
        <path d="M 66 74 Q 120 6 174 74 Q 148 88 120 88 Q 92 88 66 74 Z" fill={COLORS.goldDeep} stroke={S} strokeWidth={5} />
        <path d="M 78 66 Q 120 22 162 66" fill="none" stroke={COLORS.gold} strokeWidth={6} />
        {[86, 103, 120, 137, 154].map((x, i) => (
          <circle key={i} cx={x} cy={62 - Math.abs(i - 2) * -8} r={5.5} fill="#F6EFE2" stroke={S} strokeWidth={2.5} />
        ))}
        {/* подниз (жемчужная сетка на лбу) */}
        {[0, 1, 2].map(row => (
          <g key={row}>
            {[0, 1, 2, 3].map(col => (
              <circle key={col} cx={96 + col * 16 + (row % 2) * 8} cy={92 + row * 11} r={3} fill="#F6EFE2" opacity={0.9} />
            ))}
          </g>
        ))}
        {/* брови — строгие, внутренние концы вниз */}
        <path d="M 78 122 Q 94 116 106 122" fill="none" stroke={COLORS.hairDark} strokeWidth={6} strokeLinecap="round" />
        <path d="M 134 122 Q 146 116 162 122" fill="none" stroke={COLORS.hairDark} strokeWidth={6} strokeLinecap="round" />
        {/* глаза — узкие, цепкие */}
        <Eye cx={93} cy={140} r={13} iris="#5E6B3C" lid={lid} gazeX={gx * 0.6} />
        <Eye cx={147} cy={140} r={13} iris="#5E6B3C" lid={lid} gazeX={gx * 0.6} />
        {/* нос */}
        <path d="M 120 148 Q 116 168 112 174 Q 118 180 126 176" fill="none" stroke={S} strokeWidth={4} strokeLinecap="round" />
        {/* рот — сжатая полуухмылка */}
        <path d="M 102 192 Q 120 188 138 192 Q 128 199 114 197" fill={COLORS.redDeep} stroke={S} strokeWidth={4} strokeLinejoin="round" />
        {/* уши + серьги */}
        <ellipse cx={58} cy={152} rx={10} ry={15} fill={SKIN} stroke={S} strokeWidth={4} />
        <ellipse cx={182} cy={152} rx={10} ry={15} fill={SKIN} stroke={S} strokeWidth={4} />
        <circle cx={58} cy={174} r={5.5} fill={COLORS.red} stroke={S} strokeWidth={2.5} />
        <circle cx={182} cy={174} r={5.5} fill={COLORS.red} stroke={S} strokeWidth={2.5} />
        {/* румянец еле заметный */}
        <ellipse cx={84} cy={172} rx={10} ry={6} fill={COLORS.redDeep} opacity={0.12} />
        <ellipse cx={156} cy={172} rx={10} ry={6} fill={COLORS.redDeep} opacity={0.12} />
      </g>
    </svg>
  );
};

// ============ ИГОРЬ — убитый муж ============
export const IgorFace: React.FC<FaceProps> = ({ size = 420, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const lid = useBlink(t, 0.55);
  const gx = gaze(t, 1.9);

  return (
    <svg width={size} height={size * 1.22} viewBox="0 0 240 292" style={style}>
      <g>
        {/* шея и плечи */}
        <Neck x={120} y={188} />
        <path d="M 30 292 Q 120 232 210 292 Z" fill="#4A3018" stroke={S} strokeWidth={5} />
        <circle cx={72} cy={282} r={4.5} fill={COLORS.gold} />
        <circle cx={168} cy={282} r={4.5} fill={COLORS.gold} />
        {/* лицо шире, чем у Ольги */}
        <path d="M 120 40 Q 184 44 190 120 Q 192 180 150 208 Q 132 218 120 218 Q 108 218 86 208 Q 48 180 50 120 Q 56 44 120 40 Z" fill={SKIN} stroke={S} strokeWidth={5} />
        {/* лысина + боковые волосы */}
        <path d="M 120 40 Q 184 44 190 120 L 178 118 Q 172 60 120 54 Q 68 60 62 118 L 50 120 Q 56 44 120 40 Z" fill={COLORS.hairDark} stroke={S} strokeWidth={4} opacity={0.95} />
        {/* великокняжеская шапка-столбик */}
        <path d="M 74 62 L 84 8 L 156 8 L 166 62 Q 120 76 74 62 Z" fill={COLORS.woodDeep} stroke={S} strokeWidth={5} />
        <path d="M 84 8 L 156 8 L 152 -14 L 88 -14 Z" transform="translate(0,16)" fill={COLORS.goldDeep} stroke={S} strokeWidth={4} />
        <circle cx={120} cy={14} r={6} fill={COLORS.gold} stroke={S} strokeWidth={3} />
        {/* брови — усталые, наружу вниз */}
        <path d="M 76 124 Q 92 118 104 126" fill="none" stroke={COLORS.hairDark} strokeWidth={6.5} strokeLinecap="round" />
        <path d="M 136 126 Q 148 118 164 124" fill="none" stroke={COLORS.hairDark} strokeWidth={6.5} strokeLinecap="round" />
        {/* глаза */}
        <Eye cx={92} cy={142} r={12.5} iris="#4E5E6E" lid={lid} gazeX={gx} />
        <Eye cx={148} cy={142} r={12.5} iris="#4E5E6E" lid={lid} gazeX={gx} />
        {/* мешки под глазами */}
        <path d="M 80 156 Q 92 162 104 156" fill="none" stroke={S} strokeWidth={2.5} opacity={0.4} />
        <path d="M 136 156 Q 148 162 160 156" fill="none" stroke={S} strokeWidth={2.5} opacity={0.4} />
        {/* нос */}
        <path d="M 120 150 Q 114 170 110 178 Q 118 184 128 178" fill="none" stroke={S} strokeWidth={4} strokeLinecap="round" />
        {/* борода седоватая квадратная */}
        <path d="M 74 172 Q 78 234 120 244 Q 162 234 166 172 Q 150 186 120 186 Q 90 186 74 172 Z" fill="#5A5048" stroke={S} strokeWidth={5} />
        <path d="M 96 200 Q 120 212 144 200" fill="none" stroke={S} strokeWidth={3} opacity={0.5} />
        {/* усы */}
        <path d="M 96 188 Q 120 196 144 188 Q 132 200 120 198 Q 108 200 96 188 Z" fill="#5A5048" stroke={S} strokeWidth={4} />
      </g>
    </svg>
  );
};

// ============ МАЛ — древлянский князь, самодовольный ============
export const MalFace: React.FC<FaceProps> = ({ size = 420, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const lid = useBlink(t, 0.82);
  const gx = gaze(t, 3.3);

  return (
    <svg width={size} height={size * 1.22} viewBox="0 0 240 292" style={style}>
      <g>
        {/* шея и плечи */}
        <Neck x={120} y={188} />
        <path d="M 28 292 Q 120 230 212 292 Z" fill="#3A2417" stroke={S} strokeWidth={5} />
        {/* меховая шапка */}
        <path d="M 66 78 L 78 20 L 162 20 L 174 78 Q 120 94 66 78 Z" fill="#6B4A2C" stroke={S} strokeWidth={5} />
        {[28, 44, 60].map((y, i) => (
          <line key={i} x1={76 + i * 1.5} y1={y} x2={164 - i * 1.5} y2={y} stroke={S} strokeWidth={3} opacity={0.45} />
        ))}
        <path d="M 66 78 Q 120 94 174 78 Q 120 100 66 78 Z" fill={COLORS.hairDark} stroke={S} strokeWidth={4} />
        {/* лицо круглое */}
        <path d="M 120 48 Q 178 52 184 124 Q 186 184 148 208 Q 132 216 120 216 Q 108 216 92 208 Q 54 184 56 124 Q 62 52 120 48 Z" fill={SKIN} stroke={S} strokeWidth={5} />
        {/* брови: одна поднята (ухмылка) */}
        <path d="M 76 122 Q 92 112 106 122" fill="none" stroke={COLORS.hairDark} strokeWidth={6} strokeLinecap="round" />
        <path d="M 134 116 Q 150 108 164 118" fill="none" stroke={COLORS.hairDark} strokeWidth={6} strokeLinecap="round" />
        {/* глаза */}
        <Eye cx={92} cy={140} r={12} iris="#5E4A34" lid={lid} gazeX={gx} />
        <Eye cx={148} cy={138} r={12} iris="#5E4A34" lid={lid} gazeX={gx} />
        {/* нос картошкой */}
        <path d="M 120 148 Q 112 168 110 174 Q 116 182 130 176 Q 126 166 122 148" fill={SKIN_SH} stroke={S} strokeWidth={4} strokeLinejoin="round" />
        {/* усы + ухмылка */}
        <path d="M 92 186 Q 106 180 116 186 Q 120 190 124 186 Q 134 180 148 186" fill="none" stroke={COLORS.hairDark} strokeWidth={6} strokeLinecap="round" />
        <path d="M 100 196 Q 120 206 142 194 Q 132 208 118 206 Q 106 206 100 196 Z" fill={COLORS.redDeep} stroke={S} strokeWidth={4} />
        {/* борода короткая рыжеватая */}
        <path d="M 82 196 Q 90 240 120 246 Q 150 240 158 196 Q 140 214 120 214 Q 100 214 82 196 Z" fill="#7A4A26" stroke={S} strokeWidth={5} />
        {/* румянец самодовольный */}
        <ellipse cx={82} cy={168} rx={11} ry={7} fill={COLORS.redDeep} opacity={0.18} />
        <ellipse cx={158} cy={166} rx={11} ry={7} fill={COLORS.redDeep} opacity={0.18} />
      </g>
    </svg>
  );
};

// ============ СВЯТОСЛАВ — сын, «иду на вы» ============
export const SvyatFace: React.FC<FaceProps> = ({ size = 420, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const lid = useBlink(t, 0.3);
  const gx = gaze(t, 4.6);

  return (
    <svg width={size} height={size * 1.22} viewBox="0 0 240 292" style={style}>
      <g>
        {/* шея и плечи — кольчуга */}
        <Neck x={120} y={188} />
        <path d="M 28 292 Q 120 228 212 292 Z" fill="#55524A" stroke={S} strokeWidth={5} />
        {[246, 262, 278].map((y, i) => (
          <path key={i} d={`M ${34 + i * 4} ${y} Q 120 ${y - 16} ${206 - i * 4} ${y}`} fill="none" stroke={S} strokeWidth={3} opacity={0.55} />
        ))}
        {/* бритая голова + оселедец */}
        <path d="M 120 40 Q 182 44 188 118 Q 190 172 152 200 Q 132 210 120 210 Q 108 210 88 200 Q 50 172 52 118 Q 58 44 120 40 Z" fill={SKIN} stroke={S} strokeWidth={5} />
        <path d="M 120 40 Q 100 12 78 18 Q 66 46 92 52" fill={COLORS.hairDark} stroke={S} strokeWidth={5} />
        <circle cx={120} cy={48} r={9} fill={SKIN_SH} stroke={S} strokeWidth={3.5} />
        {/* брови — прямые, жёсткие */}
        <path d="M 74 120 L 108 124" stroke={COLORS.hairDark} strokeWidth={7} strokeLinecap="round" />
        <path d="M 132 124 L 166 120" stroke={COLORS.hairDark} strokeWidth={7} strokeLinecap="round" />
        {/* глаза — холодные */}
        <Eye cx={92} cy={140} r={12.5} iris="#4E6E86" lid={lid} gazeX={gx * 0.4} />
        <Eye cx={148} cy={140} r={12.5} iris="#4E6E86" lid={lid} gazeX={gx * 0.4} />
        {/* шрам на левой скуле */}
        <path d="M 72 158 L 84 176" stroke={COLORS.redDeep} strokeWidth={4} strokeLinecap="round" opacity={0.8} />
        {/* нос */}
        <path d="M 120 148 Q 114 168 110 176 Q 118 182 128 176" fill="none" stroke={S} strokeWidth={4} strokeLinecap="round" />
        {/* длинные усы воина, бороды нет */}
        <path d="M 118 190 Q 96 194 74 186 Q 92 204 116 198 Z" fill={COLORS.hairDark} stroke={S} strokeWidth={4} />
        <path d="M 122 190 Q 144 194 166 186 Q 148 204 124 198 Z" fill={COLORS.hairDark} stroke={S} strokeWidth={4} />
        {/* рот прямой */}
        <line x1={106} y1={206} x2={134} y2={206} stroke={S} strokeWidth={4.5} strokeLinecap="round" />
        {/* ухо + серьга */}
        <ellipse cx={52} cy={152} rx={9} ry={14} fill={SKIN} stroke={S} strokeWidth={4} />
        <circle cx={52} cy={172} r={5.5} fill={COLORS.gold} stroke={S} strokeWidth={2.5} />
      </g>
    </svg>
  );
};
