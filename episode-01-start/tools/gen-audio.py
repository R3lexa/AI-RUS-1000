#!/usr/bin/env python3
"""Synthesize SFX for «РУСЬ ЗА 1000 ЛЕТ» ep.1 with numpy.
All files: 48kHz mono WAV -> assets/sfx/
VO + SFX only (no music bed).
Inherited 1-16 identical to AI-TOK / AI-STARTUP-300 (deterministic seeds).
New for the history serial:
  17. bell.wav  — церковный колокол (крещение 988)
  18. fire.wav  — пожар Искоростеня (месть Ольги)
  19. sword.wav — металл: щит на воротах / дань мечами
  20. wind.wav  — ветер степи (эмбиент-подложка хука, ~7 с)
  21. quill.wav — перо по пергаменту (летопись, письмо племён)
  22. horn.wav  — рог войны (поход на Царьград)"""
import numpy as np
import os
from scipy.io import wavfile
from scipy import signal as sp

SR = 48000
BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets")
SFX = os.path.join(BASE, "sfx")
os.makedirs(SFX, exist_ok=True)


def env_ad(n, a, d, curve=3.0):
    """attack-decay envelope, exponential-ish decay"""
    t = np.arange(n) / SR
    e = np.minimum(t / a, 1.0)
    dec = np.exp(-curve * np.maximum(t - a, 0) / d)
    return e * dec


def save(name, x, gain=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * gain
    x16 = (x * 32767).astype(np.int16)
    wavfile.write(os.path.join(SFX, name), SR, x16)
    print(f"  {name}: {len(x)/SR:.2f}s")


def tone(freq, dur, harm=(1.0,), detune=0.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.zeros_like(t)
    for i, a in enumerate(harm):
        f = freq * (i + 1) * (1 + detune * i)
        x += a * np.sin(2 * np.pi * f * t)
    return x


def noise(dur):
    return np.random.default_rng(7).uniform(-1, 1, int(dur * SR))


def lowpass(x, cutoff, order=2):
    b, a = sp.butter(order, cutoff / (SR / 2), "low")
    return sp.lfilter(b, a, x)


def highpass(x, cutoff, order=2):
    b, a = sp.butter(order, cutoff / (SR / 2), "high")
    return sp.lfilter(b, a, x)


rng = np.random.default_rng(11)

# ---------- 1. slap.wav ----------
n = int(0.28 * SR)
clap = lowpass(noise(0.28), 2600) * env_ad(n, 0.002, 0.05, curve=9)
thump = tone(115, 0.28, harm=(1.0, 0.55, 0.3)) * env_ad(n, 0.003, 0.09, curve=7)
save("slap.wav", clap * 0.85 + thump * 0.8, gain=0.95)

# ---------- 2. whoosh.wav ----------
n = int(0.5 * SR)
w = noise(0.5)
w = sp.lfilter(*sp.butter(2, [400 / (SR/2), 3200 / (SR/2)], "bandpass"), w)
sweep = np.linspace(0.6, 1.4, n)
save("whoosh.wav", w * env_ad(n, 0.12, 0.3, curve=4) * sweep, gain=0.5)

# ---------- 3. stamp.wav ----------
n = int(0.35 * SR)
paper = highpass(noise(0.35), 900) * env_ad(n, 0.001, 0.03, curve=10)
hit = tone(92, 0.35, harm=(1.0, 0.7, 0.45)) * env_ad(n, 0.002, 0.07, curve=8)
save("stamp.wav", paper * 0.5 + hit, gain=0.9)

# ---------- 4. cash.wav ----------
ding = tone(1180, 0.5, harm=(1.0, 0.35, 0.12)) * env_ad(int(0.5 * SR), 0.002, 0.16, curve=5)
ding2 = tone(1568, 0.42, harm=(1.0, 0.3)) * env_ad(int(0.42 * SR), 0.002, 0.12, curve=5)
receipt = highpass(noise(0.4), 2400) * env_ad(int(0.4 * SR), 0.05, 0.16, curve=3)
out = np.zeros(int(0.75 * SR))
out[:len(ding)] += ding * 0.8
out[int(0.07*SR):int(0.07*SR)+len(ding2)] += ding2 * 0.6
out[int(0.16*SR):int(0.16*SR)+len(receipt)] += receipt * 0.35
save("cash.wav", out, gain=0.85)

# ---------- 5. coin.wav ----------
n = int(0.4 * SR)
c1 = tone(2093, 0.4, harm=(1.0, 0.5, 0.28, 0.12)) * env_ad(n, 0.001, 0.09, curve=7)
c2 = np.zeros(n)
c2_t = tone(2637, 0.32, harm=(1.0, 0.45, 0.2)) * env_ad(int(0.32 * SR), 0.001, 0.08, curve=7)
c2[int(0.055*SR):int(0.055*SR)+len(c2_t)] += c2_t * 0.6
save("coin.wav", c1 * 0.75 + c2 * 0.6, gain=0.75)

# ---------- 6. pop1-3.wav ----------
for i, f in enumerate([540, 660, 800]):
    n = int(0.16 * SR)
    sweep = np.linspace(f, f * 1.9, n)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * sweep * t) * env_ad(n, 0.004, 0.07, curve=6)
    save(f"pop{i+1}.wav", x, gain=0.6)

# ---------- 7. typing.wav (~9 c) ----------
dur = 9.0
n = int(dur * SR)
typ = np.zeros(n)
t_next = 0.0
while t_next < dur - 0.05:
    click = highpass(noise(0.03), 1800) * env_ad(int(0.03 * SR), 0.001, 0.012, curve=9)
    i0 = int(t_next * SR)
    typ[i0:i0+len(click)] += click * rng.uniform(0.4, 0.9)
    t_next += rng.uniform(0.11, 0.34)
    if rng.random() < 0.16:
        t_next += rng.uniform(0.3, 0.7)
typ = lowpass(typ, 5000)
save("typing.wav", typ, gain=0.5)

# ---------- 8. boing.wav ----------
n = int(0.5 * SR)
f0, f1 = 320, 690
t = np.arange(n) / SR
sweep = f0 * (f1 / f0) ** (t / 0.4)
x = np.sin(2 * np.pi * sweep * t) * env_ad(n, 0.008, 0.22, curve=4)
save("boing.wav", x, gain=0.55)

# ---------- 9. ding.wav ----------
n = int(0.9 * SR)
d = tone(1245, 0.9, harm=(1.0, 0.4, 0.18, 0.08)) * env_ad(n, 0.002, 0.3, curve=4)
d2 = np.zeros(n)
d2_t = tone(1661, 0.7, harm=(1.0, 0.35, 0.1)) * env_ad(int(0.7 * SR), 0.002, 0.22, curve=4)
d2[int(0.14*SR):int(0.14*SR)+len(d2_t)] += d2_t * 0.55
save("ding.wav", d * 0.8 + d2 * 0.55, gain=0.7)

# ---------- 10. night.wav (~7 c) ----------
dur = 7.0
n = int(dur * SR)
amb = lowpass(noise(dur), 420) * 0.16
tick_at = np.arange(0.35, dur, 1.0)
for tt in tick_at:
    tk = highpass(noise(0.02), 3200) * env_ad(int(0.02 * SR), 0.001, 0.008, curve=9)
    i0 = int(tt * SR)
    amb[i0:i0+len(tk)] += tk * 0.22
save("night.wav", amb, gain=0.42)

# ---------- 11. sting.wav ----------
n = int(1.6 * SR)
t = np.arange(n) / SR
drone = (np.sin(2*np.pi*58*t) + 0.5*np.sin(2*np.pi*87.5*t) + 0.22*np.sin(2*np.pi*117*t))
riser = lowpass(noise(1.6), 2000) * np.linspace(0.15, 0.75, n)
x = drone * np.linspace(0.5, 1.0, n) * env_ad(n, 0.5, 1.1, curve=2) + riser * env_ad(n, 0.7, 0.7, curve=2)
save("sting.wav", x, gain=0.55)

# ---------- 12. endcard.wav ----------
n = int(0.8 * SR)
hit = tone(140, 0.8, harm=(1.0, 0.6, 0.32)) * env_ad(n, 0.004, 0.2, curve=6)
spark_t = tone(1046, 0.6, harm=(1.0, 0.3)) * env_ad(int(0.6 * SR), 0.002, 0.18, curve=5)
spark = np.zeros(n)
spark[:len(spark_t)] += spark_t
save("endcard.wav", hit * 0.8 + spark * 0.35, gain=0.8)

# ---------- 13. msg.wav ----------
n = int(0.34 * SR)
b1 = tone(880, 0.34, harm=(1.0, 0.3)) * env_ad(n, 0.002, 0.09, curve=6)
b2 = np.zeros(n)
b2_t = tone(1318, 0.26, harm=(1.0, 0.25)) * env_ad(int(0.26 * SR), 0.002, 0.08, curve=6)
i0 = int(0.10 * SR)
b2[i0:i0 + len(b2_t)] += b2_t[:len(b2) - i0] * 0.8
save("msg.wav", b1 * 0.7 + b2, gain=0.6)

# ---------- 14. error.wav ----------
n = int(0.9 * SR)
t = np.arange(n) / SR
f0 = np.linspace(220, 68, n)
buzz = np.sign(np.sin(2 * np.pi * f0 * t)) * 0.6 + np.sin(2 * np.pi * f0 * 2 * t) * 0.4
buzz = lowpass(buzz, 900) * env_ad(n, 0.004, 0.3, curve=4)
thud = tone(70, 0.9, harm=(1.0, 0.5)) * env_ad(n, 0.003, 0.22, curve=6)
save("error.wav", buzz * 0.8 + thud * 0.9, gain=0.8)

# ---------- 15. knock.wav ----------
dur = 1.05
out = np.zeros(int(dur * SR))
for k, tt in enumerate([0.0, 0.27, 0.58]):
    n = int(0.22 * SR)
    knock = tone(96 + k * 6, 0.22, harm=(1.0, 0.6, 0.35, 0.18)) * env_ad(n, 0.0025, 0.07, curve=8)
    kn = lowpass(noise(0.22), 1400) * env_ad(n, 0.002, 0.035, curve=10)
    i0 = int(tt * SR)
    seg = knock * 0.9 + kn * 0.5
    out[i0:i0+len(seg)] += seg[:len(out) - i0]
save("knock.wav", out, gain=0.9)

# ---------- 16. can.wav ----------
dur = 1.15
out = np.zeros(int(dur * SR))
n = int(0.34 * SR)
w = noise(0.34)
bp = sp.lfilter(*sp.butter(2, [2200 / (SR/2), 6800 / (SR/2)], "bandpass"), w)
fall = np.linspace(1.25, 0.82, n)
t = np.arange(n) / SR
psht = bp * env_ad(n, 0.006, 0.16, curve=5) * fall
out[:n] += psht * 0.95
click = highpass(noise(0.03), 3000) * env_ad(int(0.03 * SR), 0.001, 0.012, curve=9)
out[:len(click)] += click * 0.6
for k, tt in enumerate([0.44, 0.62, 0.80]):
    ng = int(0.12 * SR)
    f_g = 190 + k * 40
    gulp = tone(f_g, 0.12, harm=(1.0, 0.55, 0.3)) * env_ad(ng, 0.012, 0.05, curve=6)
    jitter = tone(f_g * 7.3, 0.12, harm=(1.0,)) * env_ad(ng, 0.012, 0.045, curve=6) * 0.25
    i0 = int(tt * SR)
    seg = gulp * 0.8 + jitter
    out[i0:i0+len(seg)] += seg[:len(out) - i0]
save("can.wav", out, gain=0.85)

# ========== НОВЫЕ ДЛЯ «РУСЬ ЗА 1000 ЛЕТ» ==========

# ---------- 17. bell.wav — колокол (988) ----------
# Удар + длинный негармонический хвост (партиалы ксилофона/колокола:
# 0.5f (гуммингтон), f, 1.2f, 1.5f, 2f), биения от расстроенных партиалов.
dur = 3.4
n = int(dur * SR)
t = np.arange(n) / SR
x = np.zeros(n)
partials = [
    (0.5, 1.00, 3.4, 0.55),   # (множитель f0, амплитуда, время затухания, детюн биений)
    (1.0, 0.85, 2.6, 0.30),
    (1.183, 0.45, 2.0, 0.00),
    (1.506, 0.35, 1.6, 0.00),
    (2.0, 0.28, 1.2, 0.20),
    (2.662, 0.18, 0.9, 0.00),
    (3.011, 0.12, 0.7, 0.00),
]
f0 = 233  # близко к Bb3 — «благовест»
for mult, amp, dec, beat in partials:
    f = f0 * mult
    env = np.exp(-t / dec)
    if beat > 0:
        f2 = f * (1 + beat / f * 4)  # лёгкие биения пары колоколов
        x += amp * (np.sin(2*np.pi*f*t) + 0.4*np.sin(2*np.pi*f2*t)) * env
    else:
        x += amp * np.sin(2*np.pi*f*t) * env
# удар молота: короткий щелчок + шум
strike = highpass(noise(0.05), 1500) * env_ad(int(0.05 * SR), 0.001, 0.02, curve=8)
x[:len(strike)] += strike * 0.5
# второй, далёкий колокол (эхо-благовест) — тихий, с задержкой
echo_at = int(1.7 * SR)
n2 = n - echo_at
t2 = np.arange(n2) / SR
for mult, amp, dec, beat in partials[:4]:
    x[echo_at:] += 0.25 * amp * np.sin(2*np.pi*f0*mult*t2) * np.exp(-t2 / (dec * 0.7))
save("bell.wav", x, gain=0.8)

# ---------- 18. fire.wav — пожар (~3 с) ----------
dur = 3.0
n = int(dur * SR)
t = np.arange(n) / SR
# рычание пламени: коричневый шум (интегрированный белый) с медленной модуляцией
rumble = np.cumsum(np.random.default_rng(23).uniform(-1, 1, n))
rumble = lowpass(rumble, 320) * 0.5
gust = 0.6 + 0.4 * np.sin(2*np.pi*0.7*t) * np.sin(2*np.pi*0.31*t + 1.2)
flame = rumble * gust
# треск: редкие резкие щелчки по всей длине
crackle = np.zeros(n)
tt = 0.0
while tt < dur - 0.02:
    pop_n = int(rng.uniform(0.008, 0.03) * SR)
    pop = highpass(noise(0.03), 2500)[:pop_n] * env_ad(pop_n, 0.001, 0.006, curve=8)
    i0 = int(tt * SR)
    crackle[i0:i0+pop_n] += pop * rng.uniform(0.25, 0.7)
    tt += rng.uniform(0.04, 0.16)
save("fire.wav", flame * 0.8 + crackle * 0.6, gain=0.7)

# ---------- 19. sword.wav — металл (щит / дань мечами) ----------
dur = 0.85
n = int(dur * SR)
t = np.arange(n) / SR
# «шинг»: быстрый восходящий шум + негармонический звон
rise = np.linspace(2400, 5200, n)
shing = np.sin(2*np.pi*rise*t) * env_ad(n, 0.004, 0.10, curve=6) * 0.5
ring = np.zeros(n)
for f, amp, dec in [(1897, 0.7, 0.55), (2846, 0.5, 0.42), (4311, 0.32, 0.30), (5720, 0.2, 0.22)]:
    ring += amp * np.sin(2*np.pi*f*t) * np.exp(-t/dec)
impact = lowpass(noise(0.06), 3000) * env_ad(int(0.06*SR), 0.001, 0.02, curve=9)
x = np.zeros(n)
x[:len(impact)] += impact * 0.6
save("sword.wav", shing + ring * 0.9 + x * 0.4, gain=0.8)

# ---------- 20. wind.wav — ветер степи (~7 с) ----------
dur = 7.0
n = int(dur * SR)
t = np.arange(n) / SR
w1 = lowpass(noise(dur), 480)
w2 = sp.lfilter(*sp.butter(2, [200/(SR/2), 900/(SR/2)], "bandpass"), noise(dur))
# медленные порывы: произведение двух низкочастотных синусоид + фейд краёв
gusts = (0.45 + 0.55 * np.sin(2*np.pi*0.17*t + 0.4) * np.sin(2*np.pi*0.073*t + 2.0))
edge = np.minimum(t / 1.2, 1.0) * np.minimum((dur - t) / 1.2, 1.0)
save("wind.wav", (w1 * 0.7 + w2 * 0.5) * gusts * edge, gain=0.4)

# ---------- 21. quill.wav — перо по пергаменту (~2.6 с) ----------
dur = 2.6
n = int(dur * SR)
x = np.zeros(n)
tt = 0.0
# штрихи: группы коротких скрипов, пауза между словами
while tt < dur - 0.06:
    stroke_len = rng.uniform(0.10, 0.22)
    n_st = int(stroke_len * SR)
    # скрип пера: полосовой шум с дрожащей огибающей
    scr = sp.lfilter(*sp.butter(2, [1400/(SR/2), 5200/(SR/2)], "bandpass"), noise(stroke_len))
    trem = 0.5 + 0.5 * np.sin(2*np.pi*rng.uniform(28, 44)*np.arange(n_st)/SR)
    i0 = int(tt * SR)
    room = max(0, n - i0)
    seg = (scr * trem * env_ad(n_st, 0.01, 0.12, curve=4) * 0.8)[:room]
    x[i0:i0 + len(seg)] += seg
    tt += stroke_len + rng.uniform(0.05, 0.14)
x = highpass(x, 900)
save("quill.wav", x, gain=0.5)

# ---------- 22. horn.wav — рог войны (~1.8 с) ----------
dur = 1.8
n = int(dur * SR)
t = np.arange(n) / SR
f0 = 155  # низкий боевой рог (~D#3)
vib = 1 + 0.006 * np.sin(2*np.pi*5.2*t)  # вибрато
phase = 2*np.pi*np.cumsum(f0*vib)/SR
x = np.zeros(n)
for k in range(1, 9):
    x += (0.9/k) * np.sin(k*phase + k*0.3)
env = env_ad(n, 0.09, 0.55, curve=3)
env[n-int(0.35*SR):] *= np.linspace(1, 0.0, int(0.35*SR))  # спад в конце
# лёгкая «расстройка» — два рога в унисон
x = x * env + 0.4 * np.sin(phase*1.004 + 0.7) * env
save("horn.wav", lowpass(x, 2400), gain=0.75)

# ---------- 23. boom.wav — кинематографичный слэм (турнир-хук) ----------
# Глубокий кик с пилообразным падением высоты + саб-хвост + щелчок атаки.
dur = 1.1
n = int(dur * SR)
t = np.arange(n) / SR
# высота: 150 Гц -> 36 Гц за 0.14 с, дальше медленный саб
f = np.where(t < 0.14, 150 * (36 / 150) ** (t / 0.14), 36 * np.exp(-(t - 0.14) / 0.55))
phase = 2 * np.pi * np.cumsum(f) / SR
x = np.sin(phase)  # фундамент
# саб-октава тише, для «раздутия»
x += 0.35 * np.sin(phase / 2)
# атака: короткий шумовой клик
click = highpass(noise(0.02), 2000) * env_ad(int(0.02 * SR), 0.001, 0.008, curve=9)
x[:len(click)] += click * 0.7
# огибающая: мгновенная атака, мясистый спад
env = env_ad(n, 0.003, 0.34, curve=5)
x = x * env
# мягкий клип для плотности (танh)
x = np.tanh(x * 1.8) * 0.82
save("boom.wav", x, gain=0.92)

print("\nГотово: 23 SFX →", SFX)
