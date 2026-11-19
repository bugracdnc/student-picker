"""Participation simulation: 30 students, 15 lessons x 6 questions = 90 turns."""
import random, statistics, json

N, LESSONS, Q = 30, 15, 6
CALLS = LESSONS * Q
RUNS = 5000
# hand-raising willingness: 5 dominant, 10 moderate, 15 reluctant (assumption)
WILL = [0.85] * 5 + [0.35] * 10 + [0.07] * 15
# teacher's mental "random": 10 in sight-line (front/centre) x3, 10 x1.5, 10 x1; avoids last 5
ZONE = [3.0] * 10 + [1.5] * 10 + [1.0] * 10


def hands(rng):
    c = [0] * N
    for _ in range(CALLS):
        up = [i for i in range(N) if rng.random() < WILL[i]]
        c[rng.choice(up) if up else rng.randrange(N)] += 1
    return c


def teacher(rng):
    c, recent = [0] * N, []
    for _ in range(CALLS):
        cand = [i for i in range(N) if i not in recent]
        i = rng.choices(cand, weights=[ZONE[j] for j in cand])[0]
        c[i] += 1
        recent = (recent + [i])[-5:]
    return c


def wheel(rng):
    c = [0] * N
    for _ in range(CALLS):
        c[rng.randrange(N)] += 1
    return c


def app(rng):
    c, pool = [0] * N, []
    for _ in range(CALLS):
        if not pool:
            pool = list(range(N))
        i = pool.pop(rng.randrange(len(pool)))
        c[i] += 1
    return c


def stats(fn, groups=None):
    rng = random.Random(42)
    zero, le1, top5, mn, mx, first30zero = [], [], [], [], [], []
    for _ in range(RUNS):
        c = fn(rng)
        zero.append(sum(x == 0 for x in c))
        le1.append(sum(x <= 1 for x in c))
        top5.append(sum(sorted(c, reverse=True)[:5]) / CALLS)
        mn.append(min(c)); mx.append(max(c))
    m = statistics.mean
    out = dict(zero=m(zero), le1=m(le1), top5=m(top5), min=m(mn), max=m(mx))
    if groups:
        rng = random.Random(7)
        acc = [0.0] * N
        for _ in range(RUNS):
            for i, x in enumerate(fn(rng)):
                acc[i] += x / RUNS
        out["groups"] = {k: round(m(acc[a:b]), 2) for k, (a, b) in groups.items()}
    return out


# first-30-questions check: how many never picked after one "round" of 30
def zero_after(fn_calls):
    rng = random.Random(1)
    t = 0
    for _ in range(RUNS):
        c = [0] * N
        for _ in range(30):
            c[rng.randrange(N)] += 1
        t += sum(x == 0 for x in c)
    return t / RUNS


res = {
    "hands": stats(hands, {"dominant": (0, 5), "moderate": (5, 15), "reluctant": (15, 30)}),
    "teacher": stats(teacher, {"front": (0, 10), "middle": (10, 20), "back": (20, 30)}),
    "wheel": stats(wheel),
    "app": stats(app),
    "wheel_zero_after_30": zero_after(30),
}
print(json.dumps(res, indent=1))
