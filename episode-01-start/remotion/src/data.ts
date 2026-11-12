// data.ts — timeline access + scene state + HUD states + SFX cues
// «РУСЬ: БИТВА ЗА 1000 ЛЕТ» — серия 1 «СТАРТ» (862–945), v2 реалити-турнир.
import timelineJson from "./timeline.json";

export type Word = { text: string; start: number; end: number; color?: string | null };
export type Group = { start: number; end: number; words: Word[] };
export type Line = {
  id: string; beat: string; tempo: number; text: string;
  start: number; end: number; dur: number;
  words: { text: string; start: number; end: number }[];
  groups: Group[];
};

export const FPS = 30;
export const TIMELINE = timelineJson as { voice: string; fps: number; lines: Line[]; totalDuration: number };
export const LINES = TIMELINE.lines;
export const TOTAL = TIMELINE.totalDuration;
export const DURATION_IN_FRAMES = Math.ceil(TOTAL * FPS);

const byId: Record<string, Line> = {};
for (const l of LINES) byId[l.id] = l;

export const line = (id: string): Line => byId[id];

/** start/end time of a word by index within a line */
export const wordTime = (id: string, idx: number, edge: "start" | "end" = "start"): number => {
  const l = byId[id];
  const w = l?.words[idx];
  if (!w) return l ? l[edge] : 0;
  return w[edge];
};

// ============ РОСТЕР ИГРОКОВ (сетка 4×3) ============
export const ROSTER = [
  { name: "НОВГОРОД", role: "ТОРГАШ", color: "steel" },
  { name: "КИЕВ", role: "КРАСАВЧИК", color: "gold" },
  { name: "ХАЗАРИЯ", role: "БОСС · ДАНЬ", color: "red" },
  { name: "ВИЗАНТИЯ", role: "ДЕРЖАВА", color: "steel" },
  { name: "БУЛГАР", role: "КОННИЦА", color: "ink" },
  { name: "ПОЛОЦК", role: "СЕВЕР", color: "ink" },
  { name: "ЧЕРНИГОВ", role: "ВОСТОК", color: "ink" },
  { name: "СМОЛЕНСК", role: "ДНЕПР", color: "ink" },
  { name: "ПСКОВ", role: "КРЕПОСТЬ", color: "ink" },
  { name: "МУРОМ", role: "ЛЕС", color: "ink" },
  { name: "РЯЗАНЬ", role: "ЮГ", color: "ink" },
  { name: "?", role: "ПОЗЖЕ", color: "ghost" },  // Москва · 1147
] as const;

// ============ SCENE STATE (все переходы привязаны к словам) ============
// hook: Тысяча(0) лет(1) Двенадцать(2) игроков(3) Выживет(4) один(5) И(6)
//   это(7) будет(8) та(9) которой(10) ещё(11) нет(12) на(13) карте(14)

export const SCENE = {
  // хук: слэм «1000 ЛЕТ» -> «12 ИГРОКОВ» -> «ВЫЖИВЕТ ОДИН» -> слот «?»
  titleSlam: wordTime("hook", 0, "start"),        // «Тысяча» -> 1000 ЛЕТ + boom
  playersIn: wordTime("hook", 2, "start"),        // «Двенадцать» -> 12 ИГРОКОВ
  surviveStamp: wordTime("hook", 4, "start"),     // «Выживет» -> ВЫЖИВЕТ ОДИН
  slotIn: wordTime("hook", 10, "start"),          // «которой» -> слот №12 «?»
  hookOut: line("hook").end + 0.12,               // хук уходит

  // ростер: сетка 4×3 -> роли -> призрак вылетает
  hudIn: wordTime("roster", 0, "start"),          // «Правила» -> HUD + сетка
  ghostOut: wordTime("roster", 6, "start"),       // «вылетают» -> тайл гаснет с ✕
  kievHi: wordTime("roster", 8, "start"),         // «Киев» -> КРАСАВЧИК
  novgorodHi: wordTime("roster", 10, "start"),    // «Новгород» -> ТОРГАШ
  khazariaHi: wordTime("roster", 12, "start"),    // «Хазария» -> БОСС
  rosterOut: line("roster").end + 0.25,           // сетка уходит

  // призвание: 862 -> племена дерутся -> наняли -> цитата
  year862: wordTime("invite", 0, "start"),        // «862» -> слэм года
  tribesFight: wordTime("invite", 2, "start"),    // «Племена» -> точки дерутся
  hireCard: wordTime("invite", 13, "start"),      // «наняли» -> РЮРИК · АУТСОРС
  quoteIn: wordTime("invite", 16, "start"),       // «Земля» -> пергамент печатается
  quoteOut: wordTime("oleg", 0, "start") - 0.15,  // свиток уходит перед Олегом

  // олег: путь -> хозяева гаснут -> склеил -> РУСЬ
  olegCard: wordTime("oleg", 2, "start"),         // «Олег» -> карточка + НОВГОРОД
  kievIn: wordTime("oleg", 5, "start"),           // «Киев» -> КИЕВ + путь прочерчивается
  ownersOut: wordTime("oleg", 6, "start"),        // «вырезал» -> точки хозяев гаснут
  glueIn: wordTime("oleg", 9, "start"),           // «склеил» -> нить золотеет
  rusSlam: wordTime("oleg", 16, "start"),         // «появилась» -> слэм РУСЬ
  olegOut: line("oleg").end + 0.2,

  // царьград: ворота -> ладьи -> щит -> оттиск
  year907: wordTime("tsargrad", 0, "start"),      // «907» -> слэм года
  boatsIn: wordTime("tsargrad", 2, "start"),      // «бьёт» -> ладьи плывут
  tsarIn: wordTime("tsargrad", 5, "start"),       // «Царьграду» -> ворота + чип
  shieldHit: wordTime("tsargrad", 12, "start"),   // «прибил» -> щит слэмится
  weStamp: wordTime("tsargrad", 16, "start"),     // «мы» -> МЫ БЫЛИ ЗДЕСЬ
  tsarOut: line("tsargrad").end + 0.2,

  // топ карты: борд -> Хазария -> мечи -> по мечу с дома
  boardIn: wordTime("top", 1, "start"),           // «топ» -> панель ТОП КАРТЫ
  khanatGlow: wordTime("top", 7, "start"),        // «Хазария» -> корона + свечение
  swordsFly: wordTime("top", 12, "start"),        // «мечами» -> мечи летят
  tributeStamp: wordTime("top", 14, "start"),     // «мечу» -> ПО МЕЧУ С ДОМА
  boardOut: line("top").end + 0.2,

  // игорь: 945 -> карточка -> плохой ход -> падение
  year945: wordTime("igor", 0, "start"),          // «945» -> слэм года
  igorCard: wordTime("igor", 3, "start"),         // «Игорь» -> карточка + дань
  badMove: wordTime("igor", 10, "start"),         // «Плохой» -> штамп ПЛОХОЙ ХОД
  igorFall: wordTime("igor", 13, "start"),        // «убили» -> карточка падает
  igorOut: line("igor").end + 0.2,

  // клифф: Ольга -> конверт -> ДА. -> следующая серия
  olgaCard: wordTime("cliff", 6, "start"),        // «Ольгу» -> карточка из тени
  inviteEnv: wordTime("cliff", 7, "start"),       // «замуж» -> конверт с печатью
  daSlam: wordTime("cliff", 13, "start"),         // «да» -> гигантское ДА.
  nextSeries: wordTime("cliff", 19, "start"),     // «следующей» -> СЕРИЯ 2 →
  cliffOut: line("cliff").end + 0.15,

  // эндкард-голосование
  voteIn: wordTime("teaser", 0, "start"),         // «Пиши» -> панель голосования
  optA: wordTime("teaser", 3, "start"),           // «месть» -> опция 1
  optB: wordTime("teaser", 6, "start"),           // «конец» -> опция 2
  endCardIn: wordTime("teaser", 8, "start"),      // «Серия» -> эндкард + CTA
};

// ============ HUD STATE ============

export type HudStep = { t: number; value: number; flash?: string };

export const HUD_YEAR: HudStep[] = [
  { t: SCENE.hudIn - 0.02, value: 900 },                     // часы заводятся
  { t: SCENE.hudIn + 0.05, value: 862, flash: "yellow" },     // старт сезона
  { t: SCENE.kievIn + 0.05, value: 882, flash: "yellow" },    // Олег в Киеве
  { t: SCENE.year907 + 0.03, value: 907, flash: "yellow" },   // поход на Царьград
  { t: SCENE.year945 + 0.03, value: 945, flash: "yellow" },   // смерть Игоря
];

export const HUD_IN_GAME: HudStep[] = [
  { t: SCENE.hudIn, value: 12 },                              // в сезоне 1 никто не вылетел
];

export type MainStep = { t: number; value: string; flash?: string };

export const HUD_MAIN: MainStep[] = [
  { t: SCENE.hudIn, value: "—" },
  { t: SCENE.khanatGlow, value: "ХАЗАРИЯ", flash: "red" },    // босс подтверждён
];

export const fmtYear = (n: number): string => String(Math.round(n));

// ============ SFX CUES ============

export type Sfx = { file: string; t: number; gain?: number };

export const SFX_CUES: Sfx[] = [
  // ветер эпохи: подложка хука и ростера (3 проигрыша покрывают ~14 с)
  { file: "wind.wav", t: 0.05, gain: 0.5 },
  { file: "wind.wav", t: 7.15, gain: 0.42 },
  { file: "wind.wav", t: 14.35, gain: 0.3 },
  // хук: слэмы
  { file: "boom.wav", t: SCENE.titleSlam, gain: 0.9 },
  { file: "pop1.wav", t: SCENE.playersIn, gain: 0.5 },
  { file: "sting.wav", t: SCENE.surviveStamp, gain: 0.55 },
  { file: "msg.wav", t: SCENE.slotIn, gain: 0.6 },
  // ростер: сетка + роли + вылет призрака
  { file: "pop1.wav", t: SCENE.hudIn + 0.05, gain: 0.5 },
  { file: "error.wav", t: SCENE.ghostOut, gain: 0.55 },
  { file: "pop2.wav", t: SCENE.kievHi, gain: 0.6 },
  { file: "pop3.wav", t: SCENE.novgorodHi, gain: 0.6 },
  { file: "stamp.wav", t: SCENE.khazariaHi, gain: 0.85 },
  // призвание: 862 + драка + найм + цитата
  { file: "stamp.wav", t: SCENE.year862, gain: 0.8 },
  { file: "sword.wav", t: SCENE.tribesFight, gain: 0.5 },
  { file: "sword.wav", t: SCENE.tribesFight + 0.85, gain: 0.4 },
  { file: "pop2.wav", t: SCENE.hireCard, gain: 0.6 },
  { file: "coin.wav", t: SCENE.hireCard + 0.12, gain: 0.45 },
  { file: "quill.wav", t: SCENE.quoteIn, gain: 0.55 },
  // олег: путь + хозяева + склейка + РУСЬ
  { file: "pop1.wav", t: SCENE.olegCard, gain: 0.5 },
  { file: "whoosh.wav", t: SCENE.kievIn, gain: 0.5 },
  { file: "error.wav", t: SCENE.ownersOut, gain: 0.45 },
  { file: "ding.wav", t: SCENE.glueIn, gain: 0.6 },
  { file: "stamp.wav", t: SCENE.rusSlam, gain: 0.85 },
  { file: "boom.wav", t: SCENE.rusSlam + 0.04, gain: 0.7 },
  // царьград: ворота + ладьи + щит + оттиск
  { file: "stamp.wav", t: SCENE.year907, gain: 0.8 },
  { file: "whoosh.wav", t: SCENE.boatsIn, gain: 0.4 },
  { file: "horn.wav", t: SCENE.tsarIn, gain: 0.65 },
  { file: "sword.wav", t: SCENE.shieldHit, gain: 0.85 },
  { file: "stamp.wav", t: SCENE.weStamp, gain: 0.8 },
  // топ карты
  { file: "pop1.wav", t: SCENE.boardIn, gain: 0.5 },
  { file: "sting.wav", t: SCENE.khanatGlow, gain: 0.6 },
  { file: "sword.wav", t: SCENE.swordsFly, gain: 0.6 },
  { file: "coin.wav", t: SCENE.swordsFly + 0.25, gain: 0.45 },
  { file: "stamp.wav", t: SCENE.tributeStamp, gain: 0.75 },
  // игорь
  { file: "stamp.wav", t: SCENE.year945, gain: 0.8 },
  { file: "pop2.wav", t: SCENE.igorCard, gain: 0.55 },
  { file: "coin.wav", t: SCENE.igorCard + 0.15, gain: 0.5 },
  { file: "error.wav", t: SCENE.badMove, gain: 0.75 },
  { file: "error.wav", t: SCENE.igorFall, gain: 0.7 },
  { file: "sting.wav", t: SCENE.igorFall + 0.12, gain: 0.4 },
  // клифф: Ольга + конверт + ДА.
  { file: "pop2.wav", t: SCENE.olgaCard, gain: 0.6 },
  { file: "msg.wav", t: SCENE.inviteEnv, gain: 0.6 },
  { file: "boom.wav", t: SCENE.daSlam, gain: 0.9 },
  { file: "msg.wav", t: SCENE.nextSeries, gain: 0.5 },
  // эндкард
  { file: "endcard.wav", t: SCENE.voteIn, gain: 0.85 },
  { file: "pop2.wav", t: SCENE.optA, gain: 0.5 },
  { file: "pop3.wav", t: SCENE.optB, gain: 0.5 },
];

export const CAPTIONS_OFF = SCENE.endCardIn - 0.1; // end card takes over
