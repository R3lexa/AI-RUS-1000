#!/usr/bin/env python3
"""Generate Russian VO for «РУСЬ ЗА 1000 ЛЕТ» episode 1 via ElevenLabs.

Voice: Chris (Charming, Down-to-Earth), model eleven_multilingual_v2.
Natural pace, no post speed-up (keeps the voice human).
Word timings come from the character alignment of the /with-timestamps endpoint.

Requires: ELEVENLABS_API_KEY environment variable (never commit it!).
Produces: assets/vo/line_XX.wav + timeline.json with word timings.
"""
import base64
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request

API_KEY = os.environ.get("ELEVENLABS_API_KEY", "").strip()
if not API_KEY:
    sys.exit("Set ELEVENLABS_API_KEY env var (create key at elevenlabs.io — do NOT commit it).")

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

# Each line: id, tts text (spoken), gap after line (ms), beat key
LINES = [
    dict(id="hook",      gap=420, beat="hook",
         text="Москвы не было. Ни России, ни Кремля — только племена и чужая империя, которой платят дань."),
    dict(id="prizvanie", gap=420, beat="prizvanie",
         text="862 год. Племена устали воевать и позвали викингов княжить: земля велика, а порядка нет. Первый князь Руси — Рюрик."),
    dict(id="kiev",      gap=400, beat="kiev",
         text="Его родич Олег хитростью взял Киев и объявил его матерью городов русских. Север и юг впервые — одна страна."),
    dict(id="shield",    gap=420, beat="shield",
         text="Через сорок пять лет Русь бьёт по Царьграду — столице богатейшей империи. Олег, по легенде, прибил щит к воротам: мы здесь были."),
    dict(id="khazaria",  gap=420, beat="khazaria",
         text="Но главный на карте — не Русь, а Хазарский каганат. Даже дань полян — мечи с домов. Хазарские старцы: не к добру."),
    dict(id="olga",      gap=420, beat="olga",
         text="Древляне убили князя Игоря и позвали вдову Ольгу замуж. Худшая идея в их истории. Финал — голуби, сера, пепел."),
    dict(id="baptism",   gap=400, beat="baptism",
         text="988. Владимир крестит Русь: одна вера, одна письменность. Из племён — один народ."),
    dict(id="score",     gap=420, beat="score",
         text="Итог века: двадцать с лишним городов, жителей — около миллиона. Главный — всё ещё не Русь. Пока."),
    dict(id="cliff",     gap=400, beat="cliff",
         text="Впереди — золотой век: Киев больше Лондона. Но уже тикает бомба, которая всё сожжёт. Голосуй: золото или раздор?"),
    dict(id="teaser",    gap=280, beat="teaser",
         text="Серия два — по твоему голосу."),
]

# Semantic word highlighting per line: word index -> color
# (indexes count words WITHOUT punctuation, standalone dashes skipped)
# hook: Москвы(0) не(1) было(2) Ни(3) России(4) ни(5) Кремля(6) Только(7) племена(8)
#   и(9) чужая(10) империя(11) которой(12) платят(13) дань(14)
HL = {
    "hook":     {0: "red", 2: "red", 6: "cyan", 8: "cyan", 10: "red", 11: "red", 14: "yellow"},
    # prizvanie: 862(0) год(1) Племена(2) устали(3) воевать(4) и(5) позвали(6) викингов(7)
    #   княжить(8) земля(9) велика(10) а(11) порядка(12) нет(13) Первый(14) князь(15)
    #   Руси(16) Рюрик(17)
    "prizvanie": {0: "yellow", 2: "cyan", 6: "cyan", 7: "cyan", 8: "cyan", 9: "green", 10: "green", 12: "red", 13: "red", 14: "yellow", 17: "cyan"},
    # kiev: Его(0) родич(1) Олег(2) хитростью(3) взял(4) Киев(5) и(6) объявил(7) его(8)
    #   матерью(9) городов(10) русских(11) Север(12) и(13) юг(14) впервые(15) одна(16) страна(17)
    "kiev":     {2: "cyan", 4: "red", 5: "cyan", 9: "yellow", 10: "yellow", 11: "yellow", 15: "green", 16: "green", 17: "green"},
    # shield: Через(0) сорок(1) пять(2) лет(3) Русь(4) бьёт(5) по(6) Царьграду(7)
    #   столице(8) богатейшей(9) империи(10) Олег(11) по(12) легенде(13) прибил(14)
    #   щит(15) к(16) воротам(17) мы(18) здесь(19) были(20)
    "shield":  {1: "yellow", 2: "yellow", 4: "cyan", 7: "cyan", 10: "red", 13: "cyan", 14: "red", 15: "yellow", 18: "cyan", 19: "cyan", 20: "cyan"},
    # khazaria: Но(0) главный(1) на(2) карте(3) не(4) Русь(5) а(6) Хазарский(7)
    #   каганат(8) Даже(9) дань(10) полян(11) мечи(12) с(13) домов(14) Хазарские(15)
    #   старцы(16) не(17) к(18) добру(19)
    "khazaria": {1: "yellow", 3: "yellow", 5: "cyan", 7: "red", 8: "red", 10: "yellow", 11: "cyan", 12: "yellow", 17: "red", 19: "red"},
    # olga: Древляне(0) убили(1) князя(2) Игоря(3) и(4) позвали(5) вдову(6) Ольгу(7)
    #   замуж(8) Худшая(9) идея(10) в(11) их(12) истории(13) Финал(14) голуби(15)
    #   сера(16) пепел(17)
    "olga":     {0: "cyan", 1: "red", 3: "cyan", 7: "cyan", 9: "red", 10: "red", 15: "cyan", 17: "red"},
    # baptism: 988(0) Владимир(1) крестит(2) Русь(3) одна(4) вера(5) одна(6)
    #   письменность(7) Из(8) племён(9) один(10) народ(11)
    "baptism":  {0: "yellow", 1: "cyan", 2: "green", 4: "green", 7: "green", 9: "cyan", 10: "green", 11: "green"},
    # score: Итог(0) века(1) двадцать(2) с(3) лишним(4) городов(5) жителей(6)
    #   около(7) миллиона(8) Главный(9) всё(10) ещё(11) не(12) Русь(13) Пока(14)
    "score":    {2: "yellow", 5: "cyan", 8: "yellow", 9: "red", 13: "cyan", 14: "yellow"},
    # cliff: Впереди(0) золотой(1) век(2) Киев(3) больше(4) Лондона(5) Но(6) уже(7)
    #   тикает(8) бомба(9) которая(10) всё(11) сожжёт(12) Голосуй(13) золото(14)
    #   или(15) раздор(16)
    "cliff":    {1: "yellow", 3: "cyan", 4: "green", 5: "cyan", 8: "red", 9: "red", 12: "red", 13: "green", 14: "yellow", 16: "red"},
    # teaser: Серия(0) два(1) по(2) твоему(3) голосу(4)
    "teaser":   {1: "yellow", 3: "green", 4: "green"},
}

MAX_CHUNK = 4  # words per caption group
ATTEMPTS = 6

_total_chars = sum(len(l["text"]) for l in LINES)
print(f"Сценарий: {len(LINES)} строк, {_total_chars} символов (квота ключа расходуется только на новых синтезах)")


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


def main():
    timeline = {"voice": f"elevenlabs:{VOICE_NAME}", "model": MODEL, "fps": 30, "lines": []}
    t = 0.35  # lead-in
    for i, spec in enumerate(LINES):
        cachef = os.path.join(CACHE, f"el_{i:02d}_{spec['id']}.json")
        rawf = os.path.join(CACHE, f"el_{i:02d}_{spec['id']}.mp3")
        wavf = os.path.join(OUT, f"line_{i:02d}_{spec['id']}.wav")

        cached = None
        if os.path.exists(cachef) and os.path.getsize(cachef) > 100:
            cached = json.load(open(cachef))
            if cached.get("text") != spec["text"]:
                cached = None  # text changed -> re-synthesize

        if cached is not None:
            audio = None
            words = cached["words"]
            print(f"[{i+1}/{len(LINES)}] {spec['id']}: cached", flush=True)
        else:
            print(f"[{i+1}/{len(LINES)}] synth «{spec['id']}»", flush=True)
            audio, align = synth(spec["text"])
            with open(rawf, "wb") as f:
                f.write(audio)
            words = words_from_alignment(align)
            with open(cachef, "w") as f:
                json.dump({"text": spec["text"], "voice": VOICE_ID,
                           "model": MODEL, "words": words}, f, ensure_ascii=False)
            time.sleep(1.0)

        if audio is not None or not os.path.exists(wavf) or os.path.getsize(wavf) < 1000:
            src = rawf if os.path.exists(rawf) else None
            if src is None:
                raise RuntimeError("no raw audio for " + spec["id"])
            # studio chain: broadcast loudness, 48 kHz mono; NO tempo change
            r = subprocess.run(
                ["ffmpeg", "-y", "-v", "error", "-i", src,
                 "-af", "highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=9",
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
        groups = []
        for j in range(0, len(scaled), MAX_CHUNK):
            chunk = scaled[j:j + MAX_CHUNK]
            groups.append(dict(
                start=round(start + chunk[0]["start"], 3),
                end=round(start + chunk[-1]["end"] + 0.18, 3),
                words=[dict(text=w["text"],
                            start=round(start + w["start"], 3),
                            end=round(start + w["end"], 3),
                            color=HL.get(spec["id"], {}).get(j + k))
                       for k, w in enumerate(chunk)],
            ))
        timeline["lines"].append(dict(
            id=spec["id"], beat=spec["beat"], tempo=1.0,
            text=spec["text"], start=start, end=end, dur=round(dur, 3),
            words=[dict(text=w["text"], start=round(start + w["start"], 3),
                        end=round(start + w["end"], 3)) for w in scaled],
            groups=groups,
        ))
        t = end + spec["gap"] / 1000.0
        print(f"[{i+1}/{len(LINES)}] {spec['id']}: dur={dur:.2f}s start={start:.2f} words={len(scaled)}", flush=True)

    timeline["totalDuration"] = round(t + 1.7, 3)
    with open(os.path.join(OUT, "timeline.json"), "w") as f:
        json.dump(timeline, f, ensure_ascii=False, indent=1)
    print(f"\nTOTAL: {timeline['totalDuration']}s")


if __name__ == "__main__":
    main()
