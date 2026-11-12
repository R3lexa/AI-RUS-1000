// theme.ts — palette, typography, layout constants
// «ТЁМНАЯ РУСЬ»: ночь и свеча. gold = победа/венец, blood = месть/угроза,
// candle = свет/жизнь, steel = чужие. Гарнитура Montserrat.

export const COLORS = {
  bgTop: "#0B0806",
  bgBottom: "#120C08",
  surface: "#1D150E",
  surfaceHi: "#2A1F13",
  border: "#463A26",
  ink: "#F2E8D0",
  inkDim: "#B8AB8C",
  gold: "#E5B84B",
  goldDeep: "#B98F2E",
  red: "#C03A2E",
  redDeep: "#7E1F16",
  green: "#6FBF73",
  steel: "#7FA8C9",
  amber: "#D4A94E",
  amberDim: "#B98A4A",
  // кожа лиц
  skin: "#E9C6A0",
  skinShade: "#D4A87E",
  skinLine: "#2A1B10",
  hairDark: "#241812",
  // огонь
  fireHi: "#FFD166",
  fireMid: "#FF9738",
  fireDeep: "#E25822",
  ember: "#FFB84D",
  // дерево
  wood: "#6B4A2C",
  woodHi: "#8A6238",
  woodDeep: "#4A3018",
  paper: "#EFE3C4",
  paperInk: "#4A3F2C",
  ghost: "#8C8272",
};

export const FONT = "Montserrat";

export const LAYOUT = {
  width: 1080,
  height: 1920,
  // TikTok safe zones: ничего в верхних 168px, текст в полосе 168..1330
  hudTop: 205,
  captionCenterY: 1250,
};

export const EASE = {
  // Emil Kowalski: strong ease-out for entrances, ease-in-out for on-screen moves
  out: [0.23, 1, 0.32, 1] as [number, number, number, number],
  inOut: [0.77, 0, 0.175, 1] as [number, number, number, number],
};

export const SPRING = {
  smooth: { damping: 200 }, // premium, no bounce
  snappy: { damping: 20, stiffness: 200 },
  bouncy: { damping: 12, stiffness: 160 }, // stamps only
};
