// data.ts — timeline access + scene state + HUD states + SFX cues
// «РУСЬ ЗА 1000 ЛЕТ» — серия 1 «МОСКВЫ НЕ БЫЛО» (862–988)
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

// ============ SCENE STATE (derived from narration) ============
// Все переходы привязаны к словам -> детерминированы.
// hook: Москвы(0) не(1) было(2) Ни(3) России(4) ни(5) Кремля(6) Только(7)
//   племена(8) и(9) чужая(10) империя(11) которой(12) платят(13) дань(14)

export const SCENE = {
  // хук: гигантские «900 · МОСКВЫ НЕ БЫЛО» -> карта -> свечение Хазарии
  titleSlam: wordTime("hook", 0, "start"),        // «Москвы» -> 900 + титул
  mapIn: wordTime("hook", 7, "start"),            // «Только» -> россыпь племён
  khanatIn: wordTime("hook", 10, "start"),        // «чужая» -> красное свечение + штамп ДАНЬ
  brandIn: line("hook").end + 0.15,               // пауза -> карточка РУСЬ ЗА 1000 ЛЕТ

  // призвание: 862 + летопись + Рюрик
  hudIn: wordTime("prizvanie", 0, "start"),       // «862» -> HUD въезжает, год 900 -> 862
  quillIn: wordTime("prizvanie", 6, "start"),     // «позвали» -> свиток летописи + перо
  quoteIn: wordTime("prizvanie", 9, "start"),     // «земля» -> строка печатается
  ryurikCard: wordTime("prizvanie", 17, "start"), // «Рюрик» -> карточка героя
  brandOut: wordTime("prizvanie", 2, "start"),    // брэнд-карточка уходит
  scrollOut: wordTime("prizvanie", 14, "start"),  // свиток уходит на «Первый»

  // киев: Новгород -> путь Олега -> Киев -> мать городов -> одна страна
  novgorodIn: wordTime("kiev", 2, "start"),       // «Олег» -> точка НОВГОРОД + карточка
  kievTake: wordTime("kiev", 4, "start"),         // «взял» -> путь прочерчивается, 882
  kievCrown: wordTime("kiev", 5, "start"),        // «Киев» -> корона на точке
  motherStamp: wordTime("kiev", 9, "start"),      // «матерью» -> штамп МАТЬ ГОРОДОВ РУССКИХ
  unify: wordTime("kiev", 15, "start"),           // «впервые» -> путь золотеет, ОДНА СТРАНА

  // щит на воротах Царьграда
  tsarIn: wordTime("shield", 7, "start"),        // «Царьграду» -> золотые ворота + рог
  shieldHit: wordTime("shield", 15, "start"),    // «щит» -> щит слэмится на ворота
  weWereHere: wordTime("shield", 18, "start"),   // «мы» -> штамп МЫ ЗДЕСЬ БЫЛИ

  // кто главный: гонка столбиков + дань мечами + не к добру
  raceIn: wordTime("khazaria", 1, "start"),      // «главный» -> панель гонки
  swordsFly: wordTime("khazaria", 12, "start"),  // «мечи» -> мечи летят в Хазарию
  omen: wordTime("khazaria", 17, "start"),       // «не» -> штамп НЕ К ДОБРУ
  raceOut: wordTime("olga", 0, "start") - 0.2,   // панель уходит перед Ольгой

  // месть Ольги: Игорь падает -> Ольга -> худшая идея -> месть 1-2-3 -> пожар -> пепел
  igorFall: wordTime("olga", 1, "start"),         // «убили» -> карточка Игоря гаснет
  olgaCard: wordTime("olga", 7, "start"),         // «Ольгу» -> карточка Ольги
  worstStamp: wordTime("olga", 9, "start"),       // «Худшая» -> штамп ХУДШАЯ ИДЕЯ
  revenge1: wordTime("olga", 9, "start") + 0.55, // счётчик мести 1..2..3
  revenge2: wordTime("olga", 9, "start") + 0.95,
  revenge3: wordTime("olga", 9, "start") + 1.35,
  dovesIn: wordTime("olga", 15, "start"),         // «голуби» -> птицы летят к городу
  fireIn: wordTime("olga", 16, "start"),          // «сера» -> город горит
  ashIn: wordTime("olga", 17, "start"),           // «пепел» -> угли + штамп ПЕПЕЛ
  olgaOut: wordTime("olga", 17, "end") + 0.5,

  // крещение: 988 -> колокол + крест -> племена сходятся в РУСЬ
  year988: wordTime("baptism", 0, "start"),       // «988» -> золотой слэм года
  crossIn: wordTime("baptism", 2, "start"),       // «крестит» -> колокол + крест + титул
  mergeIn: wordTime("baptism", 8, "start"),       // «Из» -> точки сходятся в контур РУСЬ

  // итог века: панель + Хазария ещё главная + ПОКА.
  scoreIn: wordTime("score", 0, "start"),         // «Итог» -> сводная панель
  stillKhan: wordTime("score", 9, "start"),       // «Главный» -> гонка мигает
  pokaStamp: wordTime("score", 14, "start"),      // «Пока.» -> золотой штамп ПОКА.

  // клифф: золотой век -> бомба -> голосование
  goldCard1: wordTime("cliff", 3, "start"),       // «Киев» -> карточка КИЕВ > ЛОНДОН
  goldCard2: wordTime("cliff", 5, "start"),       // «Лондона» -> карточка АННА · КОРОЛЕВА ФРАНЦИИ
  bombTick: wordTime("cliff", 8, "start"),        // «тикает» -> фитиль + тень 1237
  voteIn: wordTime("cliff", 13, "start"),         // «Голосуй» -> панель голосования
  cardsOut: wordTime("cliff", 13, "start") - 0.1, // превью-карточки ушли

  // эндкард
  endCardIn: wordTime("teaser", 0, "start"),      // «Серия» -> эндкард
};

// ============ HUD STATE ============

export type HudStep = { t: number; value: number; flash?: string };

export const HUD_YEAR: HudStep[] = [
  { t: SCENE.hudIn - 0.02, value: 900 },                     // стартовый ролл
  { t: SCENE.hudIn + 0.03, value: 862, flash: "yellow" },     // 862
  { t: SCENE.kievTake + 0.02, value: 882, flash: "yellow" },  // Олег в Киеве
  { t: SCENE.tsarIn + 0.02, value: 907, flash: "yellow" },    // поход на Царьград
  { t: SCENE.igorFall + 0.02, value: 945, flash: "yellow" },   // гибель Игоря
  { t: SCENE.year988 + 0.02, value: 988, flash: "yellow" },   // крещение
];

export const HUD_POP: HudStep[] = [
  // население ≈, тыс. человек (ролл целыми числами, показ в млн)
  { t: SCENE.hudIn, value: 300 },                    // 0,3 млн
  { t: SCENE.kievTake + 0.02, value: 400 },           // 0,4 млн
  { t: SCENE.year988 + 0.02, value: 700 },
  { t: SCENE.mergeIn + 0.02, value: 1000, flash: "green" }, // ≈1 млн
];

export type MainStep = { t: number; value: string; flash?: string };

export const HUD_MAIN: MainStep[] = [
  { t: SCENE.hudIn, value: "ХАЗАРИЯ" },
  { t: SCENE.raceIn, value: "ХАЗАРИЯ", flash: "red" },      // подтверждено гонкой
  { t: SCENE.stillKhan, value: "ХАЗАРИЯ", flash: "red" },   // всё ещё
  { t: SCENE.pokaStamp, value: "ПОКА ХАЗАРИЯ", flash: "gold" }, // «ПОКА.»
];

export const fmt = (n: number): string => n.toLocaleString("ru-RU").replace(/\u00A0/g, " ");
export const fmtYear = (n: number): string => String(Math.round(n));

/** тыс. человек -> «0,3 МЛН» / «1 МЛН» */
export const fmtPop = (v: number): string => {
  const m = v / 1000;
  const s = Math.abs(m % 1) < 0.05 ? String(Math.round(m)) : m.toFixed(1).replace(".", ",");
  return `${s} МЛН`;
};

// ============ SFX CUES ============

export type Sfx = { file: string; t: number; gain?: number };

export const SFX_CUES: Sfx[] = [
  // ветер эпохи: подложка хука и призвания (3 проигрыша покрывают ~14 с)
  { file: "wind.wav", t: 0.05, gain: 0.5 },
  { file: "wind.wav", t: 7.15, gain: 0.42 },
  { file: "wind.wav", t: 14.35, gain: 0.3 },
  // хук: титул + карта + дань
  { file: "whoosh.wav", t: SCENE.titleSlam, gain: 0.55 },
  { file: "pop1.wav", t: SCENE.mapIn, gain: 0.5 },
  { file: "sting.wav", t: SCENE.khanatIn, gain: 0.5 },
  { file: "pop2.wav", t: SCENE.brandIn, gain: 0.5 },
  // призвание: 862 + перо + Рюрик
  { file: "stamp.wav", t: SCENE.hudIn, gain: 0.85 },
  { file: "pop1.wav", t: SCENE.hudIn + 0.06, gain: 0.4 },
  { file: "quill.wav", t: SCENE.quillIn, gain: 0.55 },
  { file: "pop2.wav", t: SCENE.ryurikCard, gain: 0.55 },
  // киев: путь + мать городов + одна страна
  { file: "pop1.wav", t: SCENE.novgorodIn, gain: 0.5 },
  { file: "whoosh.wav", t: SCENE.kievTake, gain: 0.5 },
  { file: "pop2.wav", t: SCENE.kievCrown, gain: 0.5 },
  { file: "stamp.wav", t: SCENE.motherStamp, gain: 0.85 },
  { file: "ding.wav", t: SCENE.unify, gain: 0.65 },
  // царьград + щит
  { file: "horn.wav", t: SCENE.tsarIn, gain: 0.7 },
  { file: "sword.wav", t: SCENE.shieldHit, gain: 0.8 },
  { file: "stamp.wav", t: SCENE.weWereHere, gain: 0.8 },
  // гонка столбиков + мечи + предсказание
  { file: "pop1.wav", t: SCENE.raceIn, gain: 0.5 },
  { file: "sword.wav", t: SCENE.swordsFly, gain: 0.6 },
  { file: "sting.wav", t: SCENE.omen, gain: 0.55 },
  // Ольга: гибель Игоря -> карточка -> худшая идея -> месть 1-2-3
  { file: "error.wav", t: SCENE.igorFall, gain: 0.7 },
  { file: "pop2.wav", t: SCENE.olgaCard, gain: 0.6 },
  { file: "stamp.wav", t: SCENE.worstStamp, gain: 0.8 },
  { file: "pop1.wav", t: SCENE.revenge1, gain: 0.6 },
  { file: "pop2.wav", t: SCENE.revenge2, gain: 0.6 },
  { file: "pop3.wav", t: SCENE.revenge3, gain: 0.6 },
  { file: "whoosh.wav", t: SCENE.dovesIn, gain: 0.4 },
  { file: "fire.wav", t: SCENE.fireIn, gain: 0.75 },
  { file: "sting.wav", t: SCENE.ashIn, gain: 0.45 },
  // крещение
  { file: "stamp.wav", t: SCENE.year988, gain: 0.85 },
  { file: "bell.wav", t: SCENE.crossIn, gain: 0.8 },
  { file: "ding.wav", t: SCENE.mergeIn, gain: 0.65 },
  // итог века
  { file: "pop1.wav", t: SCENE.scoreIn, gain: 0.5 },
  { file: "sting.wav", t: SCENE.stillKhan, gain: 0.4 },
  { file: "stamp.wav", t: SCENE.pokaStamp, gain: 0.9 },
  // клифф: превью + бомба + голосование
  { file: "pop2.wav", t: SCENE.goldCard1, gain: 0.55 },
  { file: "pop3.wav", t: SCENE.goldCard2, gain: 0.55 },
  { file: "sting.wav", t: SCENE.bombTick, gain: 0.6 },
  { file: "msg.wav", t: SCENE.voteIn, gain: 0.7 },
  // эндкард
  { file: "endcard.wav", t: SCENE.endCardIn, gain: 0.85 },
];

export const CAPTIONS_OFF = SCENE.endCardIn - 0.1; // end card takes over
