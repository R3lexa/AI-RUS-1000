// theme.ts — palette, typography, layout constants
// «РУСЬ: БИТВА ЗА 1000 ЛЕТ»: тёмная арена турнира, одна гарнитура (Montserrat).
// Акценты несут смысл: gold = Русь/победа, red = Хазария/угроза,
// green = рост/фракция, steel = Византия/Запад, ghost = слот Москвы.

export const COLORS = {
  bgTop: "#0D0A07",
  bgBottom: "#171209",
  surface: "#221A10",
  surfaceHi: "#2E2518",
  border: "#463A26",
  ink: "#F2E8D0",
  inkDim: "#B8AB8C",
  gold: "#E5B84B",
  goldDeep: "#B98F2E",
  red: "#D9483B",
  redDeep: "#8E2418",
  green: "#6FBF73",
  steel: "#7FA8C9",
  amber: "#D4A94E",
  amberDim: "#B98A4A",
  // пергамент цитаты
  paper: "#EFE3C4",
  paperInk: "#4A3F2C",
  paperEdge: "#C4B285",
  // карта
  mapDot: "rgba(242,232,208,0.30)",
  cityGold: "#E5B84B",
  cityKiev: "#F5D06A",
  khanatGlow: "rgba(217,72,59,0.20)",
  // слот Москвы (пустой игрок)
  ghost: "#8C8272",
  // прожектор арены
  spot: "rgba(255, 226, 160, 0.06)",
};

export const FONT = "Montserrat";

export const LAYOUT = {
  width: 1080,
  height: 1920,
  // TikTok safe zones: ничего в верхних 168px, текст в полосе 168..1330
  hudTop: 205,
  captionCenterY: 1270,
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
