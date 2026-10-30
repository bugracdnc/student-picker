# Presentation: “Herkese Eşit Söz: Öğrenci Seçici”

Working notes so the presentation can be picked up later.

- **Live deck:** https://claude.ai/artifact/PC6gbjVXMwyVXpwmgXmhog (private until shared from its Share menu; downloads as .pptx / PDF)
- **Sources of the deck:** `deck/project/` — `deck.json` (order, sections, fonts) and one `slides/<id>.html` per slide, speaker notes in each slide's `<aside>`
- **Simulation:** `sim.py` (`python3 sim.py`, no dependencies)
- **Started:** 2026-10-30

## Brief

- ~10 minutes, **Turkish** slides and speaker notes
- Audience: English teachers and teacher candidates first; then teachers of any subject who use a smartboard
- Focus: why the app was made (equal chance to participate), how it was made and how it works, how much difference it makes compared with the teacher's own “random” picking and with volunteering by raised hands (dominant students overshadowing quieter ones)
- Evidence: a simulation plus published research
- Look: navy `#1C2541`, cream `#FAF6EE` / `#F1EADB`, orange `#E07A3A` (text accent `#B4501C`, on dark `#F2A65A`); Rubik headings, Nunito Sans body

## Slide order (15)

| # | id | Content |
|---|---|---|
| 1 | kapak | Cover |
| 2 | sahne | The familiar scene, same hands every time (image placeholder) |
| 3 | arastirma | Research: Karp & Yoels 1976; Horwitz et al. 1986; Dallimore et al. 2013 |
| 4 | ingilizce | Statement: in a language class, a turn to speak is speaking practice |
| 5 | kural | The rule: nobody picked twice until everyone has had a turn |
| 6 | isleyis | How it works: 5 steps of a round |
| 7 | ekran-secim | Screenshots 1–2 (placeholders) |
| 8 | ekran-liste | Screenshots 3–4 (placeholders) |
| 9 | yapim | How it was made: timeline + features |
| 10 | sim-kurulum | Simulation setup |
| 11 | sim-sonuc | Simulation results (two bar charts) |
| 12 | buyuk-sayi | 11/30 vs 0/30 |
| 13 | ipuclari | Calling on students without raising anxiety: 4 tips |
| 14 | kurulum | Three ways to install + smartboard photo placeholder |
| 15 | kapanis | Thanks, GitHub link, QR placeholder, references |

## Simulation results

30 students, 15 lessons × 6 questions = 90 turns, 5,000 runs per method. A fair share is 3 turns each.

Assumptions: hand raising per question: 5 dominant students 85%, 10 moderate 35%, 15 reluctant 7%. Teacher's picking: front 10 weighted ×3, middle 10 ×1.5, back 10 ×1, avoids the last 5 picked.

| Method | ≤1 turn (of 30) | 0 turns | Share of the 5 most active |
|---|---|---|---|
| Raised hands | 14.1 | 7.9 | 52% |
| Teacher's own picking | 6.6 | 1.7 | 32% |
| Name wheel (with replacement) | 5.8 | 1.4 | 32% |
| Student Picker | 0 | 0 | 17% |

- Raised hands: dominant students averaged 9.0 turns, moderate 3.5, reluctant 0.7
- Teacher's picking: front rows 4.6, middle 2.6, back 1.8
- Name wheel, 30 questions: on average 10.8 students never picked (theory: 30 × (29/30)^30 ≈ 10.9)

## TODO

- [ ] Cover: title, school, date (`kapak`)
- [ ] Personal story of how the app came about (notes of `yapim`)
- [ ] Screenshots, Turkish UI, light mode, landscape:
  - [ ] 1: “Pick a student” screen with progress bar (`ekran-secim`)
  - [ ] 2: picked name shown large with +1/−1 (`ekran-secim`)
  - [ ] 3: student cards with Present/Absent/Skip and “picked” badges (`ekran-liste`)
  - [ ] 4: leaderboard and “Start new round” (`ekran-liste`)
  - [ ] Photo of the app on a real smartboard (`kurulum`)
- [ ] AI image for `sahne` (prompts below)
- [ ] QR code for https://github.com/bugracdnc/student-picker (`kapanis`)
- [ ] Verify the Karp & Yoels citation details (*Sociology and Social Research* 60(4)); added from memory
- [ ] Rehearse to time (notes total ~10 min)

## Image prompts

1. Realistic: “Bright Turkish high-school classroom seen from the teacher’s desk, an interactive smartboard on the wall. In the front rows the same three eager students raise their hands high, while the many students in the back rows look down, avoid eye contact, or hide behind books. Warm natural light, realistic photo style, diverse students wearing simple navy and white school uniforms, no visible text, 16:9.”
2. Illustration: “Flat vector illustration, warm palette of navy #1C2541, orange #E07A3A and cream #FAF6EE: a classroom drawn as rows of simple round-headed figures, a few figures in the front with raised hands highlighted in orange, the rest faded in grey; a soft spotlight falls only on the front. Minimal, no text, 16:9.”
3. Optional (`ingilizce`): “Close-up of a shy teenage student at a school desk holding an English textbook, glancing nervously while classmates’ raised hands blur in the foreground, shallow depth of field, soft classroom light, empathetic mood, no text, 16:9.”

## References

- Karp, D. A. & Yoels, W. C. (1976). The college classroom: Some observations on the meanings of student participation. *Sociology and Social Research*, 60(4). (secondary: https://zendy.io/title/10.2307/2649159)
- Horwitz, E. K., Horwitz, M. B. & Cope, J. (1986). Foreign language classroom anxiety. *The Modern Language Journal*, 70(2), 125–132. https://www.ling.ohio-state.edu/research/groups/lacqueys/readings/horowitz.pdf
- Dallimore, E. J., Hertenstein, J. H. & Platt, M. B. (2013). Impact of cold-calling on student voluntary participation. *Journal of Management Education*, 37(3), 305–341. Done in university accounting classes. https://www.learningandthebrain.com/blog/?p=7623
- Left out: Adams & Biddle’s “action zone” (source not confirmed)

## Log

- 2026-10-30: Brief settled (Turkish, simulation + research, web deck). Simulation run. All 15 slides written and published. Waiting on screenshots, photo, AI image, cover details, personal story.
