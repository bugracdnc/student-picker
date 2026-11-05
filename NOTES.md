# Presentation: “Herkese Eşit Söz: Öğrenci Seçici”

Working notes so the presentation can be picked up later.

- **Live deck:** https://claude.ai/artifact/PC6gbjVXMwyVXpwmgXmhog (private until shared from its Share menu; downloads as .pptx / PDF)
- **Sources of the deck:** `deck/project/` — `deck.json` (order, sections, fonts) and one `slides/<id>.html` per slide, speaker notes in each slide's `<aside>`
- **Style rule:** slides show a title and one sentence; detail goes in the speaker notes. Minimum ~32px (kickers), sentences ≥44px, for reading at ~10 m.
- **FINAL presentation:** `alternatif-ecc/final-sunum.html` (Notebook/fanfold paper, Archivo Black + Space Grotesk, page-edge tick sound). Open in a browser; needs `screenshots/` one folder up. Variant: Bold Signal `alternatif-ecc/sunum.html`. The claude.ai Artifact deck stays as is (https://claude.ai/artifact/PC6gbjVXMwyVXpwmgXmhog). Rebuild both: `bash alternatif-ecc/build/build.sh` (slide text lives in `alternatif-ecc/build/build_ecc.py`; speaker notes come from `deck/project/slides/*.html`).
- **Simulation:** `sim.py` (`python3 sim.py`, no dependencies)
- **Started:** 2026-10-30

## Setup and conventions

- This folder is the **private** repo `bugracdnc/student-picker-presentation` (branch `main`). Keep the presentation off the public `student-picker` repo: no commits there, no submodule (a `.gitmodules` would reveal this repo's name and URL).
- On a new device, inside the app folder:

  ```sh
  git clone https://github.com/bugracdnc/student-picker  # if not there yet
  cd student-picker
  git clone https://github.com/bugracdnc/student-picker-presentation presentation
  echo "presentation/" >> .git/info/exclude              # local-only ignore
  ```

- Start Claude in the app folder (`student-picker/`) and say “continue the presentation, read `presentation/NOTES.md` first”. Run git for presentation work inside `presentation/`.
- **Chat logs and Claude's memory notes** sync through this repo: `chats/` holds each Claude Code session as Markdown, `claude-memory/` a copy of Claude's memory notes for this project.
  - Before closing a session: `python3 presentation/tools/sync-chats.py` (exports, commits, pushes).
  - On another device, after cloning: `python3 presentation/tools/sync-chats.py --restore-memory` (pulls and puts the memory notes where Claude Code looks for them). Run the normal sync there too, so chats from every device end up here.
- The live deck is the current version: if slides were edited in the browser, read the deck before changing anything, and copy changes back into `deck/project/` when committing.

## Brief

- ~10 minutes, **Turkish** slides and speaker notes
- Audience: English teachers and teacher candidates first; then teachers of any subject who use a smartboard
- Focus: why the app was made (equal chance to participate), how it was made and how it works, how much difference it makes compared with the teacher's own “random” picking and with volunteering by raised hands (dominant students overshadowing quieter ones)
- Evidence: a simulation plus published research
- Look: navy `#1C2541`, cream `#FAF6EE` / `#F1EADB`, orange `#E07A3A` (text accent `#B4501C`, on dark `#F2A65A`); Rubik headings, Nunito Sans body

## Slide order (19)

| # | id | Content |
|---|---|---|
| 1 | kapak | Cover |
| 2 | sahne | The familiar scene, same hands every time (image placeholder) |
| 3 | arastirma | Research: Aguillon et al. 2020; Botes, Dewaele & Greiff 2020; Dallimore et al. 2013 |
| 4 | ingilizce | Statement: in a language class, a turn to speak is speaking practice |
| 5 | kural | The rule: nobody picked twice until everyone has had a turn |
| 6 | isleyis | How it works: 5 steps of a round |
| 7 | ekran-secim | Zoomed main screen: button, counters, progress bar |
| 8 | ekran-koyu | Main screen in dark theme |
| 9 | ekran-ingilizce | “It also comes in English!” + English UI shot: L2 exposure in English classes |
| 10 | ekran-isim | Zoomed picked name with +1/−1 |
| 11 | ekran-liste | Zoomed student cards: Var/Yok/Pas, “Seçildi” |
| 12 | ekran-tablo | Zoomed round complete + leaderboard |
| 13 | yapim | How it was made: timeline + features |
| 14 | sim-kurulum | Simulation setup |
| 15 | sim-sonuc | Simulation results (two bar charts) |
| 16 | buyuk-sayi | 11/30 vs 0/30 |
| 17 | ipuclari | Calling on students without raising anxiety: 4 tips |
| 18 | kurulum | Three ways to install + smartboard illustration (CSS, representative) |
| 19 | kapanis | Thanks, GitHub link, QR placeholder, references |

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
  - [x] 1: “Pick a student” screen with progress bar (`ekran-secim`)
  - [x] 2: picked name shown large with +1/−1 (`ekran-secim`)
  - [x] 3: student cards with Present/Absent/Skip and “picked” badges (`ekran-liste`)
  - [x] 4: leaderboard and “Start new round” (`ekran-liste`)
  - Taken 2026-11-04 → `screenshots/` (mock class “10-B İngilizce”). Regenerate: build the app (`npx vite build` in the app folder), then `SP=/tmp python3 tools/screenshots/take.py 1600 985 2` (headless Firefox, no extra installs)
  - [x] Put the four screenshots into slides 7–8; now one zoomed shot per slide (7–10) plus a dark main-screen slide (11). A light/dark toggle isn't possible: the slide format has no scripts and embeds aren't clickable
  - [ ] Photo of the app on a real smartboard (`kurulum`)
- [ ] AI image for `sahne` (prompts below)
- [ ] QR code for https://github.com/bugracdnc/student-picker (`kapanis`)
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

## Syncing Artifact edits into the final deck
A script cannot fetch the Artifact (only Claude's Artifact tool can read it), so syncing needs one prompt:
> Sync the Artifact deck into the final presentation: read it, save each slide to deck/project/slides, show me the git diff, port the text changes into alternatif-ecc/build/build_ecc.py, then run alternatif-ecc/build/build.sh.

Speaker-note changes come over automatically with the rebuild; on-slide text needs porting, since the two decks use different layouts.
Editing `build_ecc.py` by hand? Then only the script is needed: `bash alternatif-ecc/build/build.sh`.

## Log

- 2026-10-30: Brief settled (Turkish, simulation + research, web deck). Simulation run. All 15 slides written and published. Waiting on screenshots, photo, AI image, cover details, personal story.
- 2026-10-30: Moved the presentation into this private repo (kept out of the public app repo; no submodule). Added setup steps for other devices.
- 2026-11-04: Took the 4 app screenshots with a mock class (headless Firefox via Marionette, `tools/screenshots/`). Not in the deck yet.
- 2026-11-04: Retook screenshots in light + dark (“Ceren Taş” renamed “Deniz Şen”), put them into the deck with dark copies after slides 7 and 8 (deck version 12).
- 2026-11-05: Screenshots now one per slide, zoomed crops (`screenshots/z*.png`, made at the end of `take.py`) for readability in a big room; only the main screen gets a dark slide (deck version 13).
- 2026-11-05: Added `ekran-ingilizce` (English UI shot, `z6-ana-en.png`) after the dark slide. Synced all slides from the live deck (browser edits: dark slide moved up, others changed in the editor).
- 2026-11-05: Branding options discussed (Söz Sende recommended; Sıra Sende, Söz Turu, Sırayla). Not decided; deck and app unchanged.
- 2026-11-05: Literature basis doc (Turkish, ~2 pages, 11 sources: participation, cold-call/random call, FL anxiety, differentiation, multiple intelligences + critique): https://claude.ai/artifact/GkcNpEBaBZ5VZ6gF3PHbB9. Proposed swap: Karp & Yoels → Aguillon 2020 + Alvares 2023; add Botes 2020 next to Horwitz. Deck not changed yet.
- 2026-11-05: Slide 3 + references now use the top 3 from the basis doc: Aguillon 2020 (unequal participation), Botes 2020 (FL anxiety meta-analysis, builds on Horwitz), Dallimore 2013 (cold-calling). Karp & Yoels and Horwitz dropped from the deck (Horwitz stays in the doc). Deck version 18.
- 2026-11-05: Slide 15 (sim-sonuc) clarified: subtitle "kısa çubuk daha adil", whole numbers, "(8’i hiç)" zero-turn counts on the left chart, right chart now counts turns out of 90 going to the top 5 (46 / 29 / 28 / 15, fair 15) instead of %. Deck version 45.
- 2026-11-05: Slide 15 left chart is now a two-tone stacked bar (dark = never spoke, light = spoke once; 8+6, 2+5, 1+5, 0) with a legend; title "Bir ayda 1 kez ya da hiç konuşamayan öğrenci". Built on the browser-edited version (absolute layout). Deck version 48.
- 2026-11-05: Slide 15 fixed after browser edits: right-chart Öğrenci Seçici bar got its height and "15" label back; legend uses colour swatches aligned under the bars (was &nbsp; padding). Deck version 70.
- 2026-11-05: Slide 3 author names: margin-top:auto did not align them in the renderer, so dropped it and shortened card 3 to "Dallimore ve ark., 2013" (one line, like Aguillon); all three now sit right under equal-length text; Dallimore body text moved back inside card 3 (a browser edit had detached it). Deck version 84.
- 2026-11-05: Slide 18 (kurulum) photo placeholder replaced by a CSS illustration: smartboard on a stand showing a desktop icon + Öğrenci Seçici window (Tur 2 · 18/30, "Elif Y.", Seç button, progress bar), caption "Temsilî görsel". Deck version 85.
- 2026-11-05: Slide 18 illustration redrawn after the user's classroom photo: wall-mounted frame with whiteboard (left, "Speaking time!") + white-bezel smartboard (right) showing a "Paket Kurucu" dialog installing student-picker_0.1.0.alpha.2_all.deb at 68%; wooden support posts, tray, floor. Caption "Temsilî görsel: akıllı tahtada kurulum". Deck version 86.
- 2026-11-05: Whole deck cut to kicker + title + one sentence, sized for ~10 m viewing (titles 72–120, sentences 44–56, chart labels ≥36, kickers 32). Removed detail moved into speaker notes. Slide 15 right chart now "En çok seçilen öğrenci kaç kez konuştu? (adil: 3)": 13 / 7 / 7 / 3 from sim.py max (the user had retitled it but the numbers were still top-5 totals). Only the illustration and the references on slide 19 stay small. Deck version 91.
- 2026-11-05: Alternative deck built with the ECC `frontend-slides` skill, Bold Signal preset (charcoal + hot orange, Archivo Black / Space Grotesk): `alternatif-ecc/sunum.html`, one self-contained HTML file, same 19 slides and speaker notes (copied from `deck/project/slides/*.html` asides), screenshots from `../screenshots/z*.png`. Keys: arrows/space, N notes, F fullscreen. Checked for overflow in headless Chromium at 9 sizes: clean except a few px on 667×375 landscape phone.
- 2026-11-05: Theme comparison: `alternatif-ecc/onizleme/` has 3-slide previews (kapak, arastirma, sim-sonuc) in Bold Signal and Notebook Tabs (Swiss dropped by the user), plus `karsilastirma.png`. Notebook Tabs is one continuous fanfold sheet (dot-matrix sprocket holes both sides, dashed tear lines between slides, proximity snap); `kagit-kaydirma.png` shows it mid-scroll. Notebook Tabs uses Bodoni at opsz 11 so hairlines survive at distance.
- 2026-11-05: Notebook Tabs preview now plays synthesized (Web Audio, no files) dot-matrix sounds: scrolling down past the printed high-water mark makes the print head catch up at 900 px/s, revealing content top-down with pin-hit noise + carriage-return thunks; any scrolling plays gear/sprocket clicks every 16 px. M mutes; sound starts after the first click/key (browser rule). Reveal verified in headless Chromium with timers; audio not heard by Claude.
- 2026-11-05: Printer sounds replaced with real recordings: Epson LX-300+II video by Roy Edmund Antaw (YouTube _DPDrfI11oY, CC BY). Clips in `alternatif-ecc/sesler/` (print.mp3 loop while the head prints, feed.mp3 loop while scrolling, rate follows scroll speed), embedded base64 in the HTML. **CC BY: add the credit to the closing slide if this theme is used.**
- 2026-11-05: Full 19-slide Notebook Tabs deck: `alternatif-ecc/notebook-tabs.html` (fanfold paper, printer + feed sounds, CC BY credit added to the closing slide's references). Bold Signal full deck stays as `alternatif-ecc/sunum.html`; the claude.ai Artifact deck is unchanged and remains the main one. Digits and the GitHub link use DM Sans in this theme (Bodoni hairlines vanished). Overflow-checked at 9 sizes: clean except a few px on 667×375 landscape phone.
- 2026-11-05: Notebook deck: side tabs removed, paper centred (`alternatif-ecc/notebook-tabs.html`, filename kept). New copy `alternatif-ecc/dot-matrix.html`: green-bar fanfold paper, all text in Doto (dot-matrix Google font, has Turkish glyphs), dotted outlines instead of filled cards, dot-field bars, greyscale screenshots; `%` set in Courier because Doto's % looks like X; results chart tightened. Both decks: each newly printed page plays the same fixed 3-pass clip `sesler/woop3.mp3` (source 2.02–3.50 s, 1.51 s) once, and the page reveal takes exactly that long.
- 2026-11-05: Dot-matrix copy deleted (user prefers Notebook). Fixed 3-woop removed. Print sound now plays once per newly reached page (page index of the viewport bottom), queued with at most one waiting, so smooth key scrolling no longer double-plays. Five candidate print clips in `alternatif-ecc/sesler/` (A–E, see KAYNAK.md) with a listening page `sesler/secenekler.html`; deck currently uses C (satır satır, 1.34 s). User picked A.
- 2026-11-05: Print sound = clip A (single 0.38 s pass), played back to back, one pass per third of a page of new paper; each pass prints that band. Keys/taps: the full distance plays out. Wheel/touch drag: passes stop 150 ms after scrolling stops and the rest prints silently. Tap/click navigation for touch boards: right ¾ of the screen = next, left ¼ = previous (links/buttons excluded). Verified tap nav in headless Chromium; audio chaining only in a real browser.
- 2026-11-05: Notebook deck settles on a page: 180 ms after scrolling stops it glides (smooth) to the slide that fills most of the screen; waits while a finger is down. CSS snap turned off for this theme. Tested stops at 0.3/0.6/1.3/1.6/2.45 pages → 0/1/1/2/2.
- 2026-11-05: Notebook deck: mouse click-and-drag scrolls the paper (6 px threshold separates drag from tap); flick ≥0.5 px/ms goes one page in that direction, otherwise it settles on the most-visible page. Tested: fast 300 px → page 1, slow 300 px → page 0, slow 700 px → page 1. Volumes: master 0.8, print 0.5, feed 0.9 (user: screech too loud, gears too quiet).
- 2026-11-05: Notebook deck now uses the Bold Signal fonts (Archivo Black headings, Space Grotesk body); Bodoni/DM Sans and their workarounds removed. Overflow-checked at 6 sizes, clean.
- 2026-11-05: Notebook deck: print-head screech and print/fade-in reveal removed. Pages are pre-printed and content is static (.reveal/.grow animations off). Only the paper-feed gear sound remains, on scroll in both directions.
- 2026-11-05: Notebook deck: page skips fixed. Keys/taps and mouse flicks now step to the next page edge from the real scroll position (or the target of a glide in progress), instead of the last slide the IntersectionObserver saw. Change is in gen/ecc_template.html too; only notebook-tabs.html was rebuilt.
- 2026-11-05: Notebook deck sound is now minimal and synthesized (no audio files): a soft tick when a page edge crosses mid-screen, plus a soft "thup" when the paper comes to rest on a page. The gear loop and the YouTube clip are gone, and so is the CC BY credit on kapanis (alternatif-ecc/sesler/ is now unused by the deck). File size dropped to ~45 KB.
- 2026-11-05: FINAL: Notebook deck renamed to `alternatif-ecc/final-sunum.html`; the "thup" settle sound was removed, so only the page-edge tick remains. The build pipeline moved from the scratchpad into `alternatif-ecc/build/` (build_ecc.py, ecc_template.html, notebook.css, paper.js, build.sh). The Bold variant was rebuilt with the same template (gains the page-skip fix). Sync procedure is in the section above.
- **Next:** work through the TODO list. Send screenshots/photos/images and they go into slides 2, 7, 8, 14; fill the cover and slide 9 story; add the QR code.
