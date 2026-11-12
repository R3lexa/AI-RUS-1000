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
    dict(id="hook",      gap=380, beat="hook",
         text="Тысяча лет. Двенадцать игроков. Выживет один. И это будет та, которой ещё нет на карте."),
    dict(id="roster",    gap=360, beat="roster",
         text="Правила простые: города воюют, предают и вылетают навсегда. Киев — красавчик. Новгород — торгаш. Хазария — босс, и ей платят все."),
    dict(id="invite",    gap=380, beat="invite",
         text="862 год. Племена устали резать друг друга и сделали ход, который изменил всё: наняли викинга рулить. Земля велика, а порядка нет."),
    dict(id="oleg",      gap=360, beat="oleg",
         text="Его родич Олег заехал в Киев, вырезал хозяев и склеил север с югом. Так на карте появилась Русь."),
    dict(id="tsargrad",  gap=380, beat="tsargrad",
         text="907 год. Русь бьёт по Царьграду — богатейшему городу планеты. По легенде, Олег прибил щит к воротам: мы были здесь."),
    dict(id="top",       gap=360, beat="top",
         text="Но топ карты — не Русь. Номер один — Хазария. Даже дань она берёт мечами. По мечу с дома."),
    dict(id="igor",      gap=400, beat="igor",
         text="945 год. Князь Игорь взял дань и вернулся за добавкой. Плохой ход. Древляне убили его."),
    dict(id="cliff",     gap=420, beat="cliff",
         text="И тут же позвали его вдову Ольгу — замуж. За убийцу мужа. Она сказала: да. Что она сделала дальше — в следующей серии."),
    dict(id="teaser",    gap=280, beat="teaser",
         text="Пиши в комменты: месть Ольги или конец Хазарии. Серия два — по твоему голосу."),
]

# Semantic word highlighting per line: word index -> color
# (indexes count words WITHOUT punctuation, standalone dashes skipped)
# hook: Тысяча(0) лет(1) Двенадцать(2) игроков(3) Выживет(4) один(5) И(6)
#   это(7) будет(8) та(9) которой(10) ещё(11) нет(12) на(13) карте(14)
HL = {
    "hook":     {0: "yellow", 1: "yellow", 2: "cyan", 3: "cyan", 4: "red", 5: "red", 12: "red", 14: "cyan"},
    # roster: Правила(0) простые(1) города(2) воюют(3) предают(4) и(5) вылетают(6)
    #   навсегда(7) Киев(8) красавчик(9) Новгород(10) торгаш(11) Хазария(12)
    #   босс(13) и(14) ей(15) платят(16) все(17)
    "roster":   {6: "red", 7: "red", 8: "yellow", 9: "cyan", 10: "yellow", 11: "cyan", 12: "red", 13: "red", 16: "yellow", 17: "red"},
    # invite: 862(0) год(1) Племена(2) устали(3) резать(4) друг(5) друга(6)
    #   и(7) сделали(8) ход(9) который(10) изменил(11) всё(12) наняли(13)
    #   викинга(14) рулить(15) Земля(16) велика(17) а(18) порядка(19) нет(20)
    "invite":   {0: "yellow", 4: "red", 9: "yellow", 11: "green", 12: "green", 13: "cyan", 14: "cyan", 15: "cyan", 16: "yellow", 17: "yellow", 19: "red", 20: "red"},
    # oleg: Его(0) родич(1) Олег(2) заехал(3) в(4) Киев(5) вырезал(6) хозяев(7)
    #   и(8) склеил(9) север(10) с(11) югом(12) Так(13) на(14) карте(15)
    #   появилась(16) Русь(17)
    "oleg":     {2: "cyan", 5: "cyan", 6: "red", 9: "green", 16: "yellow", 17: "yellow"},
    # tsargrad: 907(0) год(1) Русь(2) бьёт(3) по(4) Царьграду(5) богатейшему(6)
    #   городу(7) планеты(8) По(9) легенде(10) Олег(11) прибил(12) щит(13)
    #   к(14) воротам(15) мы(16) были(17) здесь(18)
    "tsargrad": {0: "yellow", 5: "cyan", 6: "yellow", 7: "yellow", 8: "yellow", 10: "cyan", 12: "red", 13: "yellow", 16: "cyan", 17: "cyan", 18: "cyan"},
    # top: Но(0) топ(1) карты(2) не(3) Русь(4) Номер(5) один(6) Хазария(7)
    #   Даже(8) дань(9) она(10) берёт(11) мечами(12) По(13) мечу(14) с(15)
    #   дома(16)
    "top":      {1: "yellow", 2: "yellow", 4: "cyan", 5: "yellow", 6: "yellow", 7: "red", 9: "yellow", 12: "yellow", 14: "yellow", 16: "cyan"},
    # igor: 945(0) год(1) Князь(2) Игорь(3) взял(4) дань(5) и(6) вернулся(7)
    #   за(8) добавкой(9) Плохой(10) ход(11) Древляне(12) убили(13) его(14)
    "igor":     {0: "yellow", 3: "cyan", 5: "yellow", 9: "red", 10: "red", 11: "red", 13: "red"},
    # cliff: И(0) тут(1) же(2) позвали(3) его(4) вдову(5) Ольгу(6) замуж(7)
    #   За(8) убийцу(9) мужа(10) Она(11) сказала(12) да(13) Что(14) она(15)
    #   сделала(16) дальше(17) в(18) следующей(19) серии(20)
    "cliff":    {6: "cyan", 7: "yellow", 9: "red", 10: "red", 11: "cyan", 12: "cyan", 13: "yellow", 17: "red", 19: "green", 20: "green"},
    # teaser: Пиши(0) в(1) комменты(2) месть(3) Ольги(4) или(5) конец(6)
    #   Хазарии(7) Серия(8) два(9) по(10) твоему(11) голосу(12)
    "teaser":   {2: "yellow", 3: "red", 4: "cyan", 6: "red", 7: "red", 9: "yellow", 11: "green", 12: "green"},
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
