# Technical scoring appendix — Finance

*Pivotum Degree Risk Index — Fall 2026 Edition*

This appendix is the audit trail. It sets out the formula, the rating anchors, every factor rating behind every track score in this profile, the backcast arithmetic, a sensitivity analysis, and the specific things that would change our mind.

We publish it because ==+a score nobody can check is an opinion with a decimal point.==

---

## 1. The formula

```
Risk = 0.35 × Automatability
     + 0.15 × EntryErosion
     + 0.15 × (10 − Physical)
     + 0.15 × (10 − Trust)
     + 0.10 × (10 − Regulatory)
     + 0.10 × (10 − Judgment)
```

Two exposure factors carry 50% of the weight; three protection factors carry 40%; judgment under novelty carries the remaining 10% and sits on the protection side. ==?The deliberate consequence is that protection can outweigh exposure — which is why a highly automatable job like teaching still scores low.==

**Bands.** Very low below 3.0 · Low 3.0–4.4 · Moderate 4.5–5.4 · Moderate–High 5.5–6.9 · High 7.0 and above.

---

## 2. Rating anchors

### How the 0–10 raw ratings are anchored

Every factor is rated on its own 0–10 scale before weighting. The anchors are
identical across all twenty-eight careers, which is what makes the scores
comparable.

**Task automatability (A)** — *what share of the working week could a capable
current system already do to an acceptable standard?*

| Rating | Anchor |
|---|---|
| 0–2 | Almost nothing. The work is physical, relational or wholly novel. |
| 3–4 | Administrative surround only — notes, scheduling, correspondence. |
| 5–6 | A meaningful minority of the week, mostly documentation and lookup. |
| 7–8 | A large share, including tasks central to the junior version of the role. |
| 9–10 | Most of the described duties, at or near professional standard. |

**Entry-path erosion (E)** — *how much has the traditional route into this work
narrowed?*

| Rating | Anchor |
|---|---|
| 0–2 | Protected by statute or physical necessity. Training hours cannot be automated. |
| 3–4 | Stable. Some junior tasks absorbed; the apprenticeship survives. |
| 5–6 | Visible narrowing. Employers prefer experience; junior intake reduced. |
| 7–8 | Substantial. The work juniors learned on has largely gone. |
| 9–10 | The training layer and the automatable layer were the same layer. |

**Physical / embodied (P)** — *must this be done in person, with a body, in an
unpredictable setting?*

| Rating | Anchor |
|---|---|
| 0–2 | Fully screen-based. Location-independent. |
| 3–4 | Occasional presence; the core work is not physical. |
| 5–6 | Regular physical presence, in largely controlled conditions. |
| 7–8 | Substantially physical, with some variability of setting. |
| 9–10 | Irreducibly physical, in conditions that differ every time. |

**Human trust / accountability (T)** — *does someone need a specific human they
can rely on, and must a human answer when it goes wrong?*

| Rating | Anchor |
|---|---|
| 0–2 | Output is anonymous and reviewed by others. |
| 3–4 | Work is signed off by someone else. No personal reliance. |
| 5–6 | Some client relationship; accountability is institutional. |
| 7–8 | Named responsibility, with commercial or professional consequence. |
| 9–10 | The relationship is the service, and liability attaches personally. |

**Regulatory / licensing (R)** — *does the law reserve this act to a qualified
human?*

| Rating | Anchor |
|---|---|
| 0–2 | No license exists and none is proposed. |
| 3–4 | Certification is customary but not reserved. |
| 5–6 | Partial reservation, varying by jurisdiction or task. |
| 7–8 | Licensed practice, with some unreserved adjacent work. |
| 9–10 | Comprehensive statutory reservation, including of the training route. |

**Judgment under novelty (J)** — *how often does the work present something with
no matching precedent, where being wrong is costly?*

| Rating | Anchor |
|---|---|
| 0–2 | Routine by design. Deviation is an error, not a case. |
| 3–4 | Occasional exceptions, handled by escalation. |
| 5–6 | Regular non-standard cases within a known range. |
| 7–8 | Frequent genuine novelty with material consequences. |
| 9–10 | Novelty is constant, and in some fields adversarially generated. |

---

## 3. Factor ratings by track

Ratings are the Fall 2026 edition unless a range is shown. **P, T, R and J are held constant across editions** — those protections are structural and do not move on a three-year horizon. All measured movement is in A and E.

### Wealth / financial advisory — **4.6** (Moderate)

| Factor | Weight | 2023 | 2025 | **2026** | Contribution to 2026 score |
|---|---|---|---|---|---|
| Task automatability | 35% | 4.4 | 5.0 | **6.0** | 2.1 |
| Entry-path erosion | 15% | 3.0 | 3.4 | **3.8** | 0.57 |
| Physical / embodied | 15% | 1.5 | 1.5 | **1.5** | 1.27 |
| Human trust / accountability | 15% | 9.0 | 9.0 | **9.0** | 0.15 |
| Regulatory / licensing | 10% | 7.5 | 7.5 | **7.5** | 0.25 |
| Judgment under novelty | 10% | 7.5 | 7.5 | **7.5** | 0.25 |
| | | | | **Total** | **4.59 → 4.6** |

### Risk & compliance — **5.3** (Moderate)

| Factor | Weight | 2023 | 2025 | **2026** | Contribution to 2026 score |
|---|---|---|---|---|---|
| Task automatability | 35% | 4.7 | 5.4 | **6.6** | 2.31 |
| Entry-path erosion | 15% | 3.5 | 3.9 | **4.4** | 0.66 |
| Physical / embodied | 15% | 1.0 | 1.0 | **1.0** | 1.35 |
| Human trust / accountability | 15% | 7.5 | 7.5 | **7.5** | 0.38 |
| Regulatory / licensing | 10% | 6.5 | 6.5 | **6.5** | 0.35 |
| Judgment under novelty | 10% | 7.5 | 7.5 | **7.5** | 0.25 |
| | | | | **Total** | **5.29 → 5.3** |

### Investment banking (senior) — **5.7** (Moderate–High)

| Factor | Weight | 2023 | 2025 | **2026** | Contribution to 2026 score |
|---|---|---|---|---|---|
| Task automatability | 35% | 5.0 | 6.0 | **7.0** | 2.45 |
| Entry-path erosion | 15% | 3.8 | 4.2 | **4.6** | 0.69 |
| Physical / embodied | 15% | 1.0 | 1.0 | **1.0** | 1.35 |
| Human trust / accountability | 15% | 7.5 | 7.5 | **7.5** | 0.38 |
| Regulatory / licensing | 10% | 4.0 | 4.0 | **4.0** | 0.6 |
| Judgment under novelty | 10% | 7.5 | 7.5 | **7.5** | 0.25 |
| | | | | **Total** | **5.71 → 5.7** |

### Corporate finance / FP&A — **6.8** (Moderate–High)

| Factor | Weight | 2023 | 2025 | **2026** | Contribution to 2026 score |
|---|---|---|---|---|---|
| Task automatability | 35% | 6.4 | 7.3 | **8.2** | 2.87 |
| Entry-path erosion | 15% | 4.8 | 5.3 | **5.8** | 0.87 |
| Physical / embodied | 15% | 1.0 | 1.0 | **1.0** | 1.35 |
| Human trust / accountability | 15% | 6.0 | 6.0 | **6.0** | 0.6 |
| Regulatory / licensing | 10% | 3.0 | 3.0 | **3.0** | 0.7 |
| Judgment under novelty | 10% | 6.0 | 6.0 | **6.0** | 0.4 |
| | | | | **Total** | **6.79 → 6.8** |

### Entry analyst / research — **8.0** (High)

| Factor | Weight | 2023 | 2025 | **2026** | Contribution to 2026 score |
|---|---|---|---|---|---|
| Task automatability | 35% | 5.7 | 7.8 | **9.4** | 3.29 |
| Entry-path erosion | 15% | 6.0 | 7.2 | **8.0** | 1.2 |
| Physical / embodied | 15% | 1.0 | 1.0 | **1.0** | 1.35 |
| Human trust / accountability | 15% | 4.0 | 4.0 | **4.0** | 0.9 |
| Regulatory / licensing | 10% | 3.0 | 3.0 | **3.0** | 0.7 |
| Judgment under novelty | 10% | 4.5 | 4.5 | **4.5** | 0.55 |
| | | | | **Total** | **7.99 → 8.0** |

---

## 4. Backcast arithmetic

Worked example for the headline track, showing exactly how the three-year movement is composed.

**Wealth / financial advisory**

| Edition | A | E | Protection deficit (fixed) | Score |
|---|---|---|---|---|
| 2023 | 4.4 | 3.0 | 1.92 | **3.9** |
| 2025 | 5.0 | 3.4 | 1.92 | **4.2** |
| Fall 2026 | 6.0 | 3.8 | 1.92 | **4.6** |

**Movement decomposition:** automatability contributed **+0.56** and entry-path erosion **+0.12**, for a total of **+0.7** points over three years.

==?The 2023 and 2025 figures are retrospective reconstructions using the current methodology, not archived scores from published editions. They are our best assessment of what each factor would have rated at the time, given what was then demonstrable. They are not measurements.==

---

## 5. Sensitivity

How far the score moves if a single factor is rated one point differently:

| Factor | ±1 point moves the score by |
|---|---|
| Task automatability | ±0.35 |
| Entry-path erosion | ±0.15 |
| Physical / embodied | ±0.15 |
| Human trust / accountability | ±0.15 |
| Regulatory / licensing | ±0.10 |
| Judgment under novelty | ±0.10 |

**What this means in practice.** A one-point disagreement about automatability moves a score by 0.35 — enough to shift a track between bands at the margins. A one-point disagreement about licensing moves it by 0.10, which almost never changes a band.

==?So if you disagree with one of our numbers, the automatability rating is where the disagreement matters most, and it is the rating we would most want challenged.==

---

## 6. Stated limitations

**We measure capability, not deployment.** Scores reflect exposure to what AI can already do at the leading edge — not how much any particular employer has adopted. Adoption lags capability by years and lags unevenly: large, well-funded organisations first; small, rural, public-sector and thin-margin employers much later. ==+The lag is a buffer, not a shelter. It buys time without changing direction.==

**We do not measure demand.** A task can be highly automatable and highly in demand simultaneously. Where the labor market and our framework disagree, we say so in the profile rather than adjusting the score to fit.

**We do not measure oversupply.** The number of people entering a field is outside our six factors, and for some careers it matters more than automation.

**We do not measure industry economics.** A profession can contract for reasons entirely unrelated to technology.

**We do not measure whether the work is worth doing.** Pay, satisfaction, debt, hours and meaning sit outside the score and are covered separately in each profile — often at greater length, because for several careers they matter more.

**Sub-track definitions are ours.** Job titles vary between employers and countries. We have chosen tracks that reflect genuinely different work, not official classifications.

---

## 7. What would change our mind

Each edition names specific, checkable indicators. If these move, the scores move — including downward.

**Across the index:**

- **Graduate hiring share.** If employers in the professions where we rate entry-path erosion highly return to hiring juniors at pre-2023 rates, those ratings fall.
- **Content of mandated training hours.** Several professions protect their on-ramp through required supervised experience. If the content of those hours shifts from producing work to supervising it, the protection weakens without any rule changing.
- **Offsite and prefabricated construction share.** The clearest test of our physical-protection ratings: automation performs well in controlled settings, so moving work indoors raises exposure without any robotics breakthrough.
- **Verified deployment rather than capability.** If adoption stalls materially below capability for several editions, our leading-indicator approach is overstating near-term risk and we will say so.

==+We will report movement in either direction. A framework that only ever revises upward is not measuring anything.==

---

*Scores measure exposure to what AI can already do — not how much any particular employer has deployed. The 2023 and 2025 figures are retrospective reconstructions using the current methodology.*
