#!/usr/bin/env python3
"""Generate Russian VO for «ТЁМНАЯ РУСЬ» episode 1 «ОНА СКАЗАЛА "ДА"».

v3 «story-first»: одна тёмная драма на серию (формат viral dark-history),
3 варианта хука для A/B-теста первых 3 секунд (research: hook stack,
face-first, 70-85% удержания на 3с => x2.2 просмотров).

Провайдеры озвучки (PROVIDER):
  - "edge": Microsoft edge-tts, голос ru-RU-DmitryNeural (бесплатный).
    Квота ElevenLabs кончилась 2026-11-12 —edge как основной путь.
    Пословные тайминги: SentenceBoundary + распределение по символам с паузами.
  - "elevenlabs": Chris (eleven_multilingual_v2) с character alignment.
    Вернуть PROVIDER="elevenlabs" после сброса квоты — тайминги точные.

Produces: assets/vo/line_XX.wav + timeline-A/B/C.json (A = основной).
"""
import asyncio
import base64
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request

PROVIDER = os.environ.get("VO_PROVIDER", "edge")

# ============ EDGE-TTS (основной провайдер) ============
EDGE_VOICE = "ru-RU-DmitryNeural"   # мужской, низковатый — тёмный рассказчик
EDGE_RATE = "+30%"                  # Dmitry медленнее Chris: держим TikTok-темп
TEMPO = 1.075                       # финальный дожим в ffmpeg (незаметен на речи);
                                     # тайминги слов делятся на TEMPO синхронно

# ============ ELEVENLABS (fallback/возврат к Chris) ============
API_KEY = os.environ.get("ELEVENLABS_API_KEY", "").strip()
VOICE_ID = "iP95p4xoKVk53GoZ742B"  # Chris — Charming, Down-to-Earth
VOICE_NAME = "Chris"
MODEL = "eleven_multilingual_v2"
SETTINGS = {
    "stability": 0.5,
    "similarity_boost": 0.9,
    "style": 0.4,
    "use_speaker_boost": True,
}

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets")
OUT = os.path.join(BASE, "vo")
CACHE = os.path.join(BASE, "tts-cache")
os.makedirs(OUT, exist_ok=True)
os.makedirs(CACHE, exist_ok=True)

# ============ ХУКИ: 3 варианта A/B/C (in medias res, research-backed) ============
# A «любопытство»: предложение + немыслимое «да» (в основную серию)
# B «шок-деталь»: сожгла город из-за трёх голубей (абсурдно-конкретно)
# C «приговор»: предложение убийц -> через год их не стало
HOOKS = dict(
    hookA=dict(id="hookA", file="hookA", gap=340, beat="hook",
               text="Ей предложили выйти замуж — за убийцу мужа. Она сказала: да."),
    hookB=dict(id="hookB", file="hookB", gap=340, beat="hook",
               text="Она сожгла целый город. Из-за трёх голубей."),
    hookC=dict(id="hookC", file="hookC", gap=340, beat="hook",
               text="Убийцы мужа сделали ей предложение. Через год от них ничего не осталось."),
)

# ============ ТЕЛО ИСТОРИИ (одинаково во всех вариантах) ============
BODY = [
    dict(id="context", gap=340, beat="context",
         text="Реальная история. 945 год. Древляне убили князя Игоря — мужа Ольги."),
    dict(id="mal", gap=320, beat="mal",
         text="Их князь Мал сразу позвал её замуж. Расчёт простой: жена всё простит — земли достанутся ему."),
    dict(id="plan", gap=360, beat="plan",
         text="Она сказала «да». А про себя запомнила три мести. Одна страшнее другой."),
    dict(id="revenge1", gap=380, beat="revenge1",
         text="Месть первая. Послы приплыли за ней в лодье. Она велела выкопать яму — и закопала их живьём. Вместе с лодьёй."),
    dict(id="revenge2", gap=360, beat="revenge2",
         text="Месть вторая. Старейшин она отправила в баню. Заперла дверь. И подожгла."),
    dict(id="revenge3", gap=430, beat="revenge3",
         text="Месть третья — гениальная. Она попросила у города по три голубя. К лапам привязала серу. Птицы полетели домой. Искоростень сгорел дотла."),
    dict(id="after", gap=360, beat="after",
         text="Так вдова из летописи стала первой правительницей Руси. А древлян на карте больше нет."),
    dict(id="cliff", gap=400, beat="cliff",
         text="Её сын скажет два слова — и сотрёт целую империю. Серия два: «Иду на вы»."),
    dict(id="teaser", gap=260, beat="teaser",
         text="Пиши в комменты: один — за Святослава, два — за Хазарию."),
]

# Semantic word highlighting per line: word index -> color
# (indexes count words WITHOUT punctuation, standalone dashes skipped)
# hookA: Ей(0) предложили(1) выйти(2) замуж(3) за(4) убийцу(5) мужа(6)
#   Она(7) сказала(8) да(9)
HL = {
    "hookA": {3: "yellow", 5: "red", 6: "red", 7: "cyan", 8: "cyan", 9: "yellow"},
    # hookB: Она(0) сожгла(1) целый(2) город(3) Из(4) за(5) трёх(6) голубей(7)
    "hookB": {1: "red", 2: "red", 3: "red", 6: "yellow", 7: "cyan"},
    # hookC: Убийцы(0) мужа(1) сделали(2) ей(3) предложение(4) Через(5) год(6)
    #   от(7) них(8) ничего(9) не(10) осталось(11)
    "hookC": {0: "red", 1: "red", 4: "yellow", 6: "cyan", 11: "red"},
    # context: Реальная(0) история(1) 945(2) год(3) Древляне(4) убили(5)
    #   князя(6) Игоря(7) мужа(8) Ольги(9)
    "context": {0: "green", 1: "green", 2: "yellow", 4: "red", 5: "red", 7: "cyan", 9: "cyan"},
    # mal: Их(0) князь(1) Мал(2) сразу(3) позвал(4) её(5) замуж(6) Расчёт(7)
    #   простой(8) жена(9) всё(10) простит(11) земли(12) достанутся(13) ему(14)
    "mal": {2: "cyan", 6: "yellow", 7: "yellow", 8: "yellow", 9: "red", 12: "yellow", 13: "yellow"},
    # plan: Она(0) сказала(1) да(2) А(3) про(4) себя(5) запомнила(6) три(7)
    #   мести(8) Одна(9) страшнее(10) другой(11)
    "plan": {2: "yellow", 6: "cyan", 7: "red", 8: "red", 10: "red"},
    # revenge1: Месть(0) первая(1) Послы(2) приплыли(3) за(4) ней(5) в(6)
    #   лодье(7) Она(8) велела(9) выкопать(10) яму(11) и(12) закопала(13)
    #   их(14) живьём(15) Вместе(16) с(17) лодьёй(18)
    "revenge1": {0: "yellow", 1: "yellow", 7: "cyan", 11: "yellow", 13: "red", 15: "red"},
    # revenge2: Месть(0) вторая(1) Старейшин(2) она(3) отправила(4) в(5)
    #   баню(6) Заперла(7) дверь(8) И(9) подожгла(10)
    "revenge2": {0: "yellow", 1: "yellow", 6: "cyan", 8: "yellow", 10: "red"},
    # revenge3: Месть(0) третья(1) гениальная(2) Она(3) попросила(4) у(5)
    #   города(6) по(7) три(8) голубя(9) К(10) лапам(11) привязала(12) серу(13)
    #   Птицы(14) полетели(15) домой(16) Искоростень(17) сгорел(18) дотла(19)
    "revenge3": {0: "yellow", 1: "yellow", 2: "green", 8: "cyan", 9: "cyan", 13: "yellow", 14: "cyan", 15: "cyan", 16: "cyan", 17: "red", 18: "red", 19: "red"},
    # after: Так(0) вдова(1) из(2) летописи(3) стала(4) первой(5)
    #   правительницей(6) Руси(7) А(8) древлян(9) на(10) карте(11) больше(12) нет(13)
    "after": {1: "cyan", 5: "yellow", 6: "yellow", 7: "yellow", 9: "red", 13: "red"},
    # cliff: Её(0) сын(1) скажет(2) два(3) слова(4) и(5) сотрёт(6) целую(7)
    #   империю(8) Серия(9) два(10) Иду(11) на(12) вы(13)
    "cliff": {1: "cyan", 3: "yellow", 4: "yellow", 6: "red", 8: "red", 10: "yellow", 11: "green", 12: "green", 13: "green"},
    # teaser: Пиши(0) в(1) комменты(2) один(3) за(4) Святослава(5) два(6)
    #   за(7) Хазарию(8)
    "teaser": {2: "yellow", 3: "green", 5: "cyan", 6: "green", 8: "red"},
}

MAX_CHUNK = 4  # words per caption group
ATTEMPTS = 6

# Паузы после знаков (сек) для раскидки слов внутри предложения
PAUSE = {".": 0.26, "!": 0.26, "?": 0.26, "…": 0.26, ",": 0.14, ":": 0.16, ";": 0.16, "—": 0.18}


def synth_edge(text: str):
    """edge-tts -> (mp3_bytes, words list).
    WordBoundary у endpoint не работает (NoAudioReceived) — берём
    SentenceBoundary и раскидываем слова по длине символов + паузам.
    """
    import edge_tts

    async def run():
        comm = edge_tts.Communicate(text, EDGE_VOICE, rate=EDGE_RATE)
        audio = bytearray()
        sentences = []
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                audio.extend(chunk["data"])
            elif chunk["type"] == "SentenceBoundary":
                sentences.append(dict(
                    text=chunk["text"],
                    start=chunk["offset"] / 1e7,
                    dur=chunk["duration"] / 1e7,
                ))
        return bytes(audio), sentences

    for attempt in range(4):
        try:
            audio, sentences = asyncio.run(run())
            if len(audio) > 3000:
                break
            raise RuntimeError(f"short audio ({len(audio)})")
        except Exception as e:
            if attempt == 3:
                raise RuntimeError(f"edge-tts failed: {e}")
            time.sleep(min(12, 4 + attempt * 3))  # фаст-фэйл: цикл снаружи добьёт
    if not sentences:  # один без разбивки — весь текст одной «фразой»
        sentences = [dict(text=text, start=0.0, dur=None)]

    words = []
    for s in sentences:
        # токены: слово + следующий за ним знак препинания
        import re
        tokens = re.findall(r"[А-Яа-яЁёA-Za-z0-9]+[.,!?…:;—«»\"]*", s["text"])
        if not tokens:
            continue
        weights = []
        pauses = []
        for tok in tokens:
            body = re.sub(r"[^А-Яа-яЁёA-Za-z0-9]", "", tok)
            weights.append(len(body) + 1.6)
            pauses.append(PAUSE.get(tok[-1], 0.0) if len(tok) > len(body) else 0.0)
        dur = s["dur"] if s["dur"] else 1.0
        pause_total = sum(pauses)
        speech = max(0.2, dur - pause_total)
        wsum = sum(weights)
        t = s["start"]
        for i, tok in enumerate(tokens):
            body = re.sub(r"[^А-Яа-яЁёA-Za-z0-9]", "", tok)
            w_dur = speech * weights[i] / wsum
            words.append(dict(text=body, start=round(t, 3), end=round(t + w_dur, 3)))
            t += w_dur + pauses[i]
    # конец последнего слова не дальше конца аудио; тайминги под atempo
    return bytes(audio), [
        dict(text=w["text"], start=round(w["start"] / TEMPO, 3), end=round(w["end"] / TEMPO, 3))
        for w in words
    ]


def synth_elevenlabs(text: str):
    """POST /text-to-speech/{id}/with-timestamps -> (mp3_bytes, alignment dict)."""

ALL_LINES = list(HOOKS.values()) + BODY
_total_chars = sum(len(l["text"]) for l in ALL_LINES)
print(f"Сценарий: {len(BODY)} строк тела + {len(HOOKS)} хука, {_total_chars} символов")


def synth(text: str):
    """POST /text-to-speech/{id}/with-timestamps -> (mp3_bytes, alignment dict)."""
    body = json.dumps({
        "text": text,
        "model_id": MODEL,
        "voice_settings": SETTINGS,
    }).encode()
    last_err = None
    for attempt in range(ATTEMPTS):
        req = urllib.request.Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/with-timestamps",
            data=body,
            headers={"xi-api-key": API_KEY, "Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                data = json.load(r)
            audio = base64.b64decode(data["audio_base64"])
            align = data.get("alignment", {})
            if len(audio) > 5000 and align.get("characters"):
                return audio, align
            raise RuntimeError(f"short/empty response (audio={len(audio)})")
        except urllib.error.HTTPError as e:
            detail = e.read().decode(errors="replace")[:200]
            last_err = f"HTTP {e.code}: {detail}"
            if e.code in (400, 401, 402, 422):
                raise RuntimeError(last_err)  # won't fix by retrying
            time.sleep(5 + attempt * 2)  # 429/5xx — backoff
        except Exception as e:
            last_err = str(e)
            time.sleep(3)
    raise RuntimeError(f"ElevenLabs failed after {ATTEMPTS} attempts: {last_err}")


def words_from_alignment(align: dict):
    """Aggregate character timings into word timings.

    Tokenization: punctuation dropped, standalone dashes skipped —
    word indexes in remotion/src/data.ts point at these words.
    """
    chars = align.get("characters", [])
    starts = align.get("character_start_times_seconds", [])
    ends = align.get("character_end_times_seconds", [])
    words = []
    cur, cur_start, cur_end = "", None, None

    def flush():
        nonlocal cur, cur_start, cur_end
        if cur:
            words.append(dict(text=cur, start=round(cur_start, 3), end=round(cur_end, 3)))
        cur, cur_start, cur_end = "", None, None

    for c, s, e in zip(chars, starts, ends):
        if not c.strip():          # whitespace -> word boundary
            flush()
        elif c.isalnum():          # letters/digits build the word
            if cur_start is None:
                cur_start = s
            cur += c
            cur_end = e
        # punctuation (.,:—!?«»…) skipped entirely
    flush()
    return words


def ffprobe_dur(path: str) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", path],
        capture_output=True, text=True)
    return float(out.stdout.strip())


def build_line(i: int, spec: dict, t: float):
    """Synth/cache one line, return timeline dict + end time."""
    cachef = os.path.join(CACHE, f"el_{spec['id']}.json")
    rawf = os.path.join(CACHE, f"el_{spec['id']}.mp3")
    wavf = os.path.join(OUT, f"line_{i:02d}_{spec.get('file', spec['id'])}.wav")

    cached = None
    if os.path.exists(cachef) and os.path.getsize(cachef) > 100:
        cached = json.load(open(cachef))
        if cached.get("text") != spec["text"] or cached.get("rate") != EDGE_RATE:
            cached = None  # text changed -> re-synthesize

    if cached is not None:
        audio = None
        words = cached["words"]
        print(f"  {spec['id']}: cached", flush=True)
    else:
        print(f"  synth «{spec['id']}» ({PROVIDER})", flush=True)
        if PROVIDER == "edge":
            audio, words = synth_edge(spec["text"])
        else:
            audio, align = synth_elevenlabs(spec["text"])
            words = words_from_alignment(align)
        with open(rawf, "wb") as f:
            f.write(audio)
        with open(cachef, "w") as f:
            json.dump({"text": spec["text"], "rate": EDGE_RATE, "voice": EDGE_VOICE if PROVIDER == "edge" else VOICE_ID,
                       "provider": PROVIDER, "model": MODEL, "words": words}, f, ensure_ascii=False)
        time.sleep(0.4)

    if audio is not None or not os.path.exists(wavf) or os.path.getsize(wavf) < 1000:
        src = rawf if os.path.exists(rawf) else None
        if src is None:
            raise RuntimeError("no raw audio for " + spec["id"])
        # studio chain: broadcast loudness, 48 kHz mono; NO tempo change
        r = subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-i", src,
             "-af", f"highpass=f=70,atempo={TEMPO},loudnorm=I=-16:TP=-1.5:LRA=9" if PROVIDER == "edge" else "highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=9",
             "-ar", "48000", "-ac", "1", wavf])
        if r.returncode != 0:
            raise RuntimeError("ffmpeg failed for " + spec["id"])

    dur = ffprobe_dur(wavf)
    scaled = [dict(text=w["text"],
                   start=round(w["start"], 3),
                   end=round(min(w["end"], dur), 3))
              for w in words]

    start = round(t, 3)
    end = round(t + dur, 3)
    # группировка <=4 слов; группа НЕ должна кончаться предлогом/союзом —
    # иначе караоке-строка обрывается на «...ПО МЕЧУ С» и выглядит битой
    PREPS = {"с", "в", "и", "а", "к", "о", "у", "на", "за", "до", "из", "от", "по", "не", "но", "что", "или"}
    idx_groups = []
    cur = []
    for j, w in enumerate(scaled):
        cur.append(j)
        if len(cur) >= MAX_CHUNK and j < len(scaled) - 1:
            if w["text"].lower() in PREPS and len(cur) > 1:
                idx_groups.append(cur[:-1])
                cur = [j]
            else:
                idx_groups.append(cur)
                cur = []
    if cur:
        idx_groups.append(cur)
    groups = []
    for g in idx_groups:
        chunk = [scaled[k] for k in g]
        groups.append(dict(
            start=round(start + chunk[0]["start"], 3),
            end=round(start + chunk[-1]["end"] + 0.18, 3),
            words=[dict(text=w["text"],
                        start=round(start + w["start"], 3),
                        end=round(start + w["end"], 3),
                        color=HL.get(spec["id"], {}).get(k))
                   for k, w in zip(g, chunk)],
        ))
    tl = dict(
        id="hook", file=spec["file"], beat=spec["beat"], tempo=1.0,
        text=spec["text"], start=start, end=end, dur=round(dur, 3),
        words=[dict(text=w["text"], start=round(start + w["start"], 3),
                    end=round(start + w["end"], 3)) for w in scaled],
        groups=groups,
    ) if spec in HOOKS.values() else dict(
        id=spec["id"], beat=spec["beat"], tempo=1.0,
        text=spec["text"], start=start, end=end, dur=round(dur, 3),
        words=[dict(text=w["text"], start=round(start + w["start"], 3),
                    end=round(start + w["end"], 3)) for w in scaled],
        groups=groups,
    )
    print(f"  {spec['id']}: dur={dur:.2f}s start={start:.2f} words={len(scaled)}", flush=True)
    return tl, end


def build_timeline(hook_key: str):
    """hook_key + BODY -> готовый timeline dict."""
    timeline = {"voice": f"elevenlabs:{VOICE_NAME}", "model": MODEL, "fps": 30,
                "lines": [], "hook": hook_key}
    t = 0.22  # lead-in: хук должен ударить в первую четверть секунды
    tl_hook, end = build_line(0, HOOKS[hook_key], t)
    timeline["lines"].append(tl_hook)
    t = end + HOOKS[hook_key]["gap"] / 1000.0
    for i, spec in enumerate(BODY, start=1):
        tl, end = build_line(i, spec, t)
        timeline["lines"].append(tl)
        t = end + spec["gap"] / 1000.0
    timeline["totalDuration"] = round(t + 1.9, 3)
    return timeline


def main():
    os.makedirs(os.path.join(OUT, "..", "..", "remotion", "src", "timelines"), exist_ok=True)
    for variant in ("A", "B", "C"):
        print(f"=== TIMELINE {variant} ===")
        tl = build_timeline(f"hook{variant}")
        path = os.path.join(OUT, f"timeline-{variant}.json")
        with open(path, "w") as f:
            json.dump(tl, f, ensure_ascii=False, indent=1)
        # копии для remotion (swap перед рендером варианта)
        for p in (os.path.join(OUT, "..", "..", "remotion", "src", "timelines", f"timeline-{variant}.json"),):
            with open(p, "w") as f:
                json.dump(tl, f, ensure_ascii=False, indent=1)
        print(f"  -> timeline-{variant}.json  TOTAL: {tl['totalDuration']}s")
    # основной (по умолчанию A) — его импортирует data.ts
    with open(os.path.join(OUT, "timeline.json"), "w") as f:
        json.dump(json.load(open(os.path.join(OUT, "timeline-A.json"))), f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
