// data.ts — timeline access + scene state + HUD states + SFX cues
// «ТЁМНАЯ РУСЬ» — серия 1 «ОНА СКАЗАЛА "ДА"» (Ольга, 945–964), v3 story-first.
// Три варианта хука (A/B/C) — активный определяется ключом "hook" в timeline.json.
import timelineJson from "./timeline.json";

export type Word = { text: string; start: number; end: number; color?: string | null };
export type Group = { start: number; end: number; words: Word[] };
export type Line = {
  id: string; file?: string; beat: string; tempo: number; text: string;
  start: number; end: number; dur: number;
  words: { text: string; start: number; end: number }[];
  groups: Group[];
};

export const FPS = 30;
export const TIMELINE = timelineJson as {
  voice: string; model: string; fps: number; hook?: string;
  lines: Line[]; totalDuration: number;
};
export const LINES = TIMELINE.lines;
export const TOTAL = TIMELINE.totalDuration;
export const DURATION_IN_FRAMES = Math.ceil(TOTAL * FPS);

const byId: Record<string, Line> = {};
for (const l of LINES) byId[l.id] = l;

export const line = (id: string): Line => byId[id];

/** вариант хука в этой сборке (timeline пишется gen-vo.py per-вариантно) */
export const HOOK_ID = TIMELINE.hook ?? "hookA";
export const HOOK: "A" | "B" | "C" = (HOOK_ID.slice(-1) as "A" | "B" | "C");

/** start/end time of a word by index within a line */
export const wordTime = (id: string, idx: number, edge: "start" | "end" = "start"): number => {
  const l = byId[id];
  const w = l?.words[idx];
  if (!w) return l ? l[edge] : 0;
  return w[edge];
};

// ============ SCENE STATE (все переходы привязаны к словам) ============
// hookA: Ей(0) предложили(1) выйти(2) замуж(3) за(4) убийцу(5) мужа(6) Она(7) сказала(8) да(9)
// hookB: Она(0) сожгла(1) целый(2) город(3) Из(4) за(5) трёх(6) голубей(7)
// hookC: Убийцы(0) мужа(1) сделали(2) ей(3) предложение(4) Через(5) год(6) от(7) них(8) ничего(9) не(10) осталось(11)
// shock-слово хука: «да»(A,9) / «голубей»(B,7) / «осталось»(C,11)
const SHOCK_IDX = HOOK === "A" ? 9 : HOOK === "B" ? 7 : 11;

export const SCENE = {
  // хук: жёсткий кат на 0.0с -> титул к 0.5с -> стоп-момент на shock-слове
  faceIn: line("hook").start,                 // лицо/город сразу, БЕЗ фейда
  hookTitle: wordTime("hook", 0),             // слэм-титул
  hookShock: wordTime("hook", SHOCK_IDX),     // стоп-кадр: ДА / ГОРОД / НЕ СТАЛО
  hookOut: line("hook").end + 0.15,

  // контекст: 945 -> Игорь -> слэш
  hudIn: wordTime("context", 0),              // «Реальная» -> HUD + плашка
  igorIn: wordTime("context", 2),             // «945» -> карточка Игоря (ранний вход, кадр не пустует)
  igorDead: wordTime("context", 8),           // «мужа» -> красный слэш
  contextOut: line("context").end + 0.2,

  // расчёт Мала
  malIn: wordTime("mal", 2),                  // «Мал» -> карточка
  schemeIn: wordTime("mal", 9),               // «жена» -> чип-схема
  malOut: line("mal").end + 0.2,

  // план: ДА + три мести
  daMini: wordTime("plan", 2),                // «да» -> мини-слэм ДА.
  threeIn: wordTime("plan", 7),               // «три» -> счётчик 1·2·3
  planOut: line("plan").end + 0.2,

  // месть 1: лодья -> яма -> закопана -> штамп
  r1Boat: wordTime("revenge1", 3),            // «приплыли» -> драккар плывёт
  r1Pit: wordTime("revenge1", 10),            // «выкопать» -> яма открывается
  r1Sink: wordTime("revenge1", 13),           // «закопала» -> лодья уходит в яму
  r1Stamp: wordTime("revenge1", 15),          // «живьём» -> штамп МЕСТЬ 1/3
  r1Out: line("revenge1").end + 0.25,

  // месть 2: баня -> дверь -> огонь
  r2Banya: wordTime("revenge2", 6),           // «баню» -> сруб с паром
  r2Door: wordTime("revenge2", 8),            // «дверь» -> захлоп + шейк
  r2Fire: wordTime("revenge2", 10),           // «подожгла» -> огонь по срубу
  r2Stamp: wordTime("revenge2", 10) + 0.35,   // штамп МЕСТЬ 2/3
  r2Out: line("revenge2").end + 0.25,

  // месть 3: голубь -> сера -> полёт -> город -> огонь -> штамп
  r3Dove: wordTime("revenge3", 9),            // «голубя» -> голубь крупно
  r3Sulfur: wordTime("revenge3", 13),         // «серу» -> сера на лапах
  r3Fly: wordTime("revenge3", 14),            // «Птицы» -> 3 голубя летят
  r3City: wordTime("revenge3", 16),           // «домой» -> Искоростень
  r3Fire: wordTime("revenge3", 17),           // «Искоростень» -> огонь охватывает
  r3Stamp: wordTime("revenge3", 18),          // «сгорел» -> штамп МЕСТЬ 3/3
  r3Out: line("revenge3").end + 0.3,

  // итог: корона + древлян нет
  aCrown: wordTime("after", 5),               // «первой» -> Ольга в короне
  aGone: wordTime("after", 9),                // «древлян» -> СНЯТЫ С КАРТЫ
  afterOut: line("after").end + 0.2,

  // клифф: Святослав -> ИДУ НА ВЫ
  cSon: wordTime("cliff", 1),                 // «сын» -> карточка Святослава
  cNext: wordTime("cliff", 9),                // «Серия» -> чип СЕРИЯ 2
  cIdu: wordTime("cliff", 11),                // «Иду» -> слэм ИДУ НА ВЫ
  cliffOut: line("cliff").end + 0.15,

  // эндкард-голосование
  tVote: wordTime("teaser", 0),               // «Пиши» -> панель
  tOptA: wordTime("teaser", 3),               // «один» -> опция 1
  tOptB: wordTime("teaser", 6),               // «два» -> опция 2
  tCta: wordTime("teaser", 8, "end") + 0.05,  // CTA после опций
};

// ============ HUD STATE ============

export type RevengeStep = { t: number; value: number };

export const HUD_REVENGE: RevengeStep[] = [
  { t: SCENE.threeIn, value: 0 },
  { t: SCENE.r1Stamp, value: 1 },
  { t: SCENE.r2Stamp, value: 2 },
  { t: SCENE.r3Stamp, value: 3 },
];

// ============ SFX CUES ============

export type Sfx = { file: string; t: number; gain?: number };

export const SFX_CUES: Sfx[] = [
  // эмбиент ночи (низкий ветер)
  { file: "wind.wav", t: 0.05, gain: 0.42 },
  { file: "wind.wav", t: 9.0, gain: 0.3 },
  { file: "night.wav", t: 30.0, gain: 0.35 },
  // хук: жёсткий кат + титул + стоп-момент
  { file: "boom.wav", t: SCENE.faceIn + 0.02, gain: 0.9 },
  { file: "sting.wav", t: SCENE.hookShock, gain: 0.55 },
  ...(HOOK === "B" ? [{ file: "fire.wav", t: SCENE.faceIn + 0.1, gain: 0.4 } as Sfx] : []),
  // контекст
  { file: "msg.wav", t: SCENE.hudIn, gain: 0.5 },
  { file: "pop2.wav", t: SCENE.igorIn, gain: 0.5 },
  { file: "error.wav", t: SCENE.igorDead, gain: 0.6 },
  { file: "sting.wav", t: SCENE.igorDead + 0.1, gain: 0.4 },
  // мал
  { file: "pop3.wav", t: SCENE.malIn, gain: 0.55 },
  { file: "coin.wav", t: SCENE.schemeIn, gain: 0.45 },
  // план
  { file: "stamp.wav", t: SCENE.daMini, gain: 0.6 },
  { file: "pop1.wav", t: SCENE.threeIn + 0.1, gain: 0.45 },
  { file: "pop2.wav", t: SCENE.threeIn + 0.24, gain: 0.45 },
  { file: "pop3.wav", t: SCENE.threeIn + 0.38, gain: 0.45 },
  // месть 1: лодья
  { file: "whoosh.wav", t: SCENE.r1Boat, gain: 0.45 },
  { file: "knock.wav", t: SCENE.r1Pit, gain: 0.6 },
  { file: "boom.wav", t: SCENE.r1Sink, gain: 0.7 },
  { file: "stamp.wav", t: SCENE.r1Stamp, gain: 0.85 },
  // месть 2: баня
  { file: "pop2.wav", t: SCENE.r2Banya, gain: 0.5 },
  { file: "knock.wav", t: SCENE.r2Door, gain: 0.8 },
  { file: "fire.wav", t: SCENE.r2Fire, gain: 0.7 },
  { file: "stamp.wav", t: SCENE.r2Stamp, gain: 0.7 },
  // месть 3: голуби
  { file: "pop3.wav", t: SCENE.r3Dove, gain: 0.5 },
  { file: "coin.wav", t: SCENE.r3Sulfur, gain: 0.4 },
  { file: "whoosh.wav", t: SCENE.r3Fly, gain: 0.5 },
  { file: "pop1.wav", t: SCENE.r3City, gain: 0.5 },
  { file: "fire.wav", t: SCENE.r3Fire, gain: 0.8 },
  { file: "boom.wav", t: SCENE.r3Fire + 0.3, gain: 0.6 },
  { file: "stamp.wav", t: SCENE.r3Stamp, gain: 0.85 },
  // итог
  { file: "ding.wav", t: SCENE.aCrown, gain: 0.6 },
  { file: "error.wav", t: SCENE.aGone, gain: 0.55 },
  // клифф
  { file: "pop1.wav", t: SCENE.cSon, gain: 0.5 },
  { file: "msg.wav", t: SCENE.cNext, gain: 0.5 },
  { file: "boom.wav", t: SCENE.cIdu, gain: 0.85 },
  // эндкард
  { file: "endcard.wav", t: SCENE.tVote, gain: 0.85 },
  { file: "pop2.wav", t: SCENE.tOptA, gain: 0.5 },
  { file: "pop3.wav", t: SCENE.tOptB, gain: 0.5 },
];

export const CAPTIONS_OFF = SCENE.tVote - 0.08; // эндкард берёт финал на себя
