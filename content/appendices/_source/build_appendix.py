"""
Generates the technical scoring appendix for each career profile.

Output: <slug>-03-scoring-appendix.md — the audit trail. Formula, anchors,
full factor table per track, backcast arithmetic, sensitivity analysis,
falsifiable indicators and stated limitations.
"""
import json

FACTORS = json.load(open('_factors_solved.json'))
W = dict(A=.35, E=.15, P=.15, T=.15, R=.10, J=.10)

CAREER_NAME = {
 'nursing':'Nursing', 'medicine':'Medicine', 'dentistry':'Dentistry',
 'veterinary':'Veterinary Medicine', 'allied-health':'Physical Therapy & Allied Health',
 'pharmacy':'Pharmacy', 'psychology':'Psychology',
 'computer-science':'Computer Science', 'data-science':'Data Science',
 'cybersecurity':'Cybersecurity', 'engineering':'Engineering',
 'architecture':'Architecture', 'trades':'Skilled Trades',
 'construction':'Construction Management', 'business':'Business & Management',
 'accounting':'Accounting', 'finance':'Finance', 'law':'Law',
 'design':'Graphic & Visual Design', 'journalism':'Journalism & Media',
 'marketing':'Marketing & Communications', 'teaching':'Teaching',
}

BANDS = [(3.0,'Very low'),(4.5,'Low'),(5.5,'Moderate'),(7.0,'Moderate–High'),(11,'High')]

def band(v):
    return next(b for t,b in BANDS if v < t)


ANCHORS = """
### How the 0–10 raw ratings are anchored

Every factor is rated on its own 0–10 scale before weighting. The anchors are
identical across all twenty-seven careers, which is what makes the scores
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
| 0–2 | No licence exists and none is proposed. |
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
""".rstrip()


def sensitivity(d):
    """How much does the 2026 score move if each factor is ±1?"""
    rows = []
    for k, w in (('A', W['A']), ('E', W['E']), ('P', W['P']),
                 ('T', W['T']), ('R', W['R']), ('J', W['J'])):
        rows.append((k, round(w, 2)))
    return rows


def build(slug):
    name = CAREER_NAME[slug]
    tracks = FACTORS[slug]

    L = []
    L.append(f"# Technical scoring appendix — {name}")
    L.append("")
    L.append("*Pivotum Degree Risk Index — Fall 2026 Edition*")
    L.append("")
    L.append("This appendix is the audit trail. It sets out the formula, the rating anchors, "
             "every factor rating behind every track score in this profile, the backcast "
             "arithmetic, a sensitivity analysis, and the specific things that would change "
             "our mind.")
    L.append("")
    L.append("We publish it because ==+a score nobody can check is an opinion with a decimal "
             "point.==")
    L.append("")
    L.append("---")
    L.append("")

    # ---- formula ----
    L.append("## 1. The formula")
    L.append("")
    L.append("```")
    L.append("Risk = 0.35 × Automatability")
    L.append("     + 0.15 × EntryErosion")
    L.append("     + 0.15 × (10 − Physical)")
    L.append("     + 0.15 × (10 − Trust)")
    L.append("     + 0.10 × (10 − Regulatory)")
    L.append("     + 0.10 × (10 − Judgment)")
    L.append("```")
    L.append("")
    L.append("Two exposure factors carry 50% of the weight; three protection factors carry "
             "40%; judgment under novelty carries the remaining 10% and sits on the "
             "protection side. ==?The deliberate consequence is that protection can outweigh "
             "exposure — which is why a highly automatable job like teaching still scores "
             "low.==")
    L.append("")
    L.append("**Bands.** Very low below 3.0 · Low 3.0–4.4 · Moderate 4.5–5.4 · "
             "Moderate–High 5.5–6.9 · High 7.0 and above.")
    L.append("")
    L.append("---")
    L.append("")

    # ---- anchors ----
    L.append("## 2. Rating anchors")
    L.append(ANCHORS)
    L.append("")
    L.append("---")
    L.append("")

    # ---- per-track tables ----
    L.append("## 3. Factor ratings by track")
    L.append("")
    L.append("Ratings are the Fall 2026 edition unless a range is shown. **P, T, R and J are "
             "held constant across editions** — those protections are structural and do not "
             "move on a three-year horizon. All measured movement is in A and E.")
    L.append("")

    for tname, d in tracks.items():
        A, E = d['A'], d['E']
        L.append(f"### {tname} — **{d['pub'][2]}** ({band(d['pub'][2])})")
        L.append("")
        L.append("| Factor | Weight | 2023 | 2025 | **2026** | Contribution to 2026 score |")
        L.append("|---|---|---|---|---|---|")
        L.append(f"| Task automatability | 35% | {A[0]} | {A[1]} | **{A[2]}** | "
                 f"{round(W['A']*A[2],2)} |")
        L.append(f"| Entry-path erosion | 15% | {E[0]} | {E[1]} | **{E[2]}** | "
                 f"{round(W['E']*E[2],2)} |")
        L.append(f"| Physical / embodied | 15% | {d['P']} | {d['P']} | **{d['P']}** | "
                 f"{round(W['P']*(10-d['P']),2)} |")
        L.append(f"| Human trust / accountability | 15% | {d['T']} | {d['T']} | "
                 f"**{d['T']}** | {round(W['T']*(10-d['T']),2)} |")
        L.append(f"| Regulatory / licensing | 10% | {d['R']} | {d['R']} | **{d['R']}** | "
                 f"{round(W['R']*(10-d['R']),2)} |")
        L.append(f"| Judgment under novelty | 10% | {d['J']} | {d['J']} | **{d['J']}** | "
                 f"{round(W['J']*(10-d['J']),2)} |")
        tot = (W['A']*A[2] + W['E']*E[2] + W['P']*(10-d['P']) + W['T']*(10-d['T'])
               + W['R']*(10-d['R']) + W['J']*(10-d['J']))
        L.append(f"| | | | | **Total** | **{round(tot,2)} → {d['pub'][2]}** |")
        L.append("")

    L.append("---")
    L.append("")

    # ---- backcast ----
    L.append("## 4. Backcast arithmetic")
    L.append("")
    L.append("Worked example for the headline track, showing exactly how the three-year "
             "movement is composed.")
    L.append("")
    first = list(tracks.items())[0]
    tn, d = first
    A, E = d['A'], d['E']
    L.append(f"**{tn}**")
    L.append("")
    L.append("| Edition | A | E | Protection deficit (fixed) | Score |")
    L.append("|---|---|---|---|---|")
    prot = W['P']*(10-d['P']) + W['T']*(10-d['T']) + W['R']*(10-d['R']) + W['J']*(10-d['J'])
    for i, yr in enumerate(('2023', '2025', 'Fall 2026')):
        L.append(f"| {yr} | {A[i]} | {E[i]} | {round(prot,2)} | **{d['pub'][i]}** |")
    L.append("")
    dA = round(W['A']*(A[2]-A[0]), 2)
    dE = round(W['E']*(E[2]-E[0]), 2)
    L.append(f"**Movement decomposition:** automatability contributed **{dA:+.2f}** and "
             f"entry-path erosion **{dE:+.2f}**, for a total of "
             f"**{d['pub'][2]-d['pub'][0]:+.1f}** points over three years.")
    L.append("")
    L.append("==?The 2023 and 2025 figures are retrospective reconstructions using the current "
             "methodology, not archived scores from published editions. They are our best "
             "assessment of what each factor would have rated at the time, given what was "
             "then demonstrable. They are not measurements.==")
    L.append("")
    L.append("---")
    L.append("")

    # ---- sensitivity ----
    L.append("## 5. Sensitivity")
    L.append("")
    L.append("How far the score moves if a single factor is rated one point differently:")
    L.append("")
    L.append("| Factor | ±1 point moves the score by |")
    L.append("|---|---|")
    for k, w in sensitivity(d):
        nm = dict(A='Task automatability', E='Entry-path erosion', P='Physical / embodied',
                  T='Human trust / accountability', R='Regulatory / licensing',
                  J='Judgment under novelty')[k]
        L.append(f"| {nm} | ±{w:.2f} |")
    L.append("")
    L.append("**What this means in practice.** A one-point disagreement about automatability "
             "moves a score by 0.35 — enough to shift a track between bands at the margins. "
             "A one-point disagreement about licensing moves it by 0.10, which almost never "
             "changes a band.")
    L.append("")
    L.append("==?So if you disagree with one of our numbers, the automatability rating is "
             "where the disagreement matters most, and it is the rating we would most want "
             "challenged.==")
    L.append("")
    L.append("---")
    L.append("")

    # ---- limitations ----
    L.append("## 6. Stated limitations")
    L.append("")
    L.append("**We measure capability, not deployment.** Scores reflect exposure to what AI "
             "can already do at the leading edge — not how much any particular employer has "
             "adopted. Adoption lags capability by years and lags unevenly: large, "
             "well-funded organisations first; small, rural, public-sector and thin-margin "
             "employers much later. ==+The lag is a buffer, not a shelter. It buys time "
             "without changing direction.==")
    L.append("")
    L.append("**We do not measure demand.** A task can be highly automatable and highly "
             "in demand simultaneously. Where the labour market and our framework disagree, "
             "we say so in the profile rather than adjusting the score to fit.")
    L.append("")
    L.append("**We do not measure oversupply.** The number of people entering a field is "
             "outside our six factors, and for some careers it matters more than automation.")
    L.append("")
    L.append("**We do not measure industry economics.** A profession can contract for "
             "reasons entirely unrelated to technology.")
    L.append("")
    L.append("**We do not measure whether the work is worth doing.** Pay, satisfaction, debt, "
             "hours and meaning sit outside the score and are covered separately in each "
             "profile — often at greater length, because for several careers they matter more.")
    L.append("")
    L.append("**Sub-track definitions are ours.** Job titles vary between employers and "
             "countries. We have chosen tracks that reflect genuinely different work, not "
             "official classifications.")
    L.append("")
    L.append("---")
    L.append("")

    # ---- falsifiable indicators ----
    L.append("## 7. What would change our mind")
    L.append("")
    L.append("Each edition names specific, checkable indicators. If these move, the scores "
             "move — including downward.")
    L.append("")
    L.append("**Across the index:**")
    L.append("")
    L.append("- **Graduate hiring share.** If employers in the professions where we rate "
             "entry-path erosion highly return to hiring juniors at pre-2023 rates, those "
             "ratings fall.")
    L.append("- **Content of mandated training hours.** Several professions protect their "
             "on-ramp through required supervised experience. If the content of those hours "
             "shifts from producing work to supervising it, the protection weakens without "
             "any rule changing.")
    L.append("- **Offsite and prefabricated construction share.** The clearest test of our "
             "physical-protection ratings: automation performs well in controlled settings, "
             "so moving work indoors raises exposure without any robotics breakthrough.")
    L.append("- **Verified deployment rather than capability.** If adoption stalls materially "
             "below capability for several editions, our leading-indicator approach is "
             "overstating near-term risk and we will say so.")
    L.append("")
    L.append("==+We will report movement in either direction. A framework that only ever "
             "revises upward is not measuring anything.==")
    L.append("")
    L.append("---")
    L.append("")
    L.append("*Scores measure exposure to what AI can already do — not how much any "
             "particular employer has deployed. The 2023 and 2025 figures are retrospective "
             "reconstructions using the current methodology.*")
    L.append("")

    return "\n".join(L)


if __name__ == '__main__':
    n = 0
    for slug in FACTORS:
        open(f'{slug}-03-scoring-appendix.md', 'w').write(build(slug))
        n += 1
    print(f"wrote {n} scoring appendices")
