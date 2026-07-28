"""
Factor ratings for every scored track in the Pivotum Degree Risk Index.

Each track: (A2023, A2025, A2026, E2023, E2025, E2026, P, T, R, J)

  A = task automatability        (exposure, 35%)
  E = entry-path erosion         (exposure, 15%)
  P = physical / embodied        (protection, 15%)
  T = human trust/accountability (protection, 15%)
  R = regulatory / licensing     (protection, 10%)
  J = judgment under novelty     (protection, 10%)

Modelling choice: P, T, R and J are held constant across the three editions.
Those protections are structural — a licence, a physical requirement, an
accountability relationship — and they do not move on a three-year horizon.
Backcast movement therefore comes entirely from A and E, which is where the
observable change has been.
"""

W = dict(A=.35, E=.15, P=.15, T=.15, R=.10, J=.10)


def score(A, E, P, T, R, J):
    return (W['A'] * A + W['E'] * E + W['P'] * (10 - P)
            + W['T'] * (10 - T) + W['R'] * (10 - R) + W['J'] * (10 - J))


# --- factor anchors stated explicitly in the published profiles -------------
# teaching elementary A=7.7, presence 9.0, trust 9.5
# design production A=9.1 ; accounting audit A=7.3 ; psychology clinical A=6.8
# data science entry A=9.0, novelty 4.0, trust 4.0 ; ML novelty 8.0
# physical therapy P=9.5 ; veterinary J=9.0 ; cybersecurity IR J=9.0, SOC J=4.5
# law junior E=9.5 R=7.0 ; litigator R=9.5 ; nursing E=2.0 ; accounting E=4.0
# business E=7.5 ; software E=9.0 ; construction E=2.5 ; architecture R=8.5
# engineering R=9.0 ; marketing R=1.0 P=1.0, brand T=7.0, content T=3.0
# finance advisor T=9.0, analyst T=4.0 ; medicine residency E=1.5

FACTORS = {
 # ---------------------------------------------------------------- health --
 'nursing': {
  'Specialist clinical (ICU, ED, peri-op)':      (4.6,5.2,5.8, 1.5,1.8,2.0, 9.2,9.5,9.5,8.8),
  'Community / home health nursing':             (5.2,5.8,6.4, 1.8,2.0,2.2, 8.8,9.5,9.5,8.2),
  'Bedside RN (hospital, acute care)':           (5.0,5.8,6.6, 1.8,2.0,2.0, 9.0,9.5,9.5,8.5),
  'Nurse practitioner / advanced practice':      (6.0,6.8,7.4, 2.0,2.2,2.5, 8.0,9.5,9.5,8.5),
  'Telehealth triage':                           (7.8,8.6,9.2, 3.5,4.0,4.5, 2.0,7.0,9.0,5.5),
  'Utilization review / case management (desk)': (8.2,9.0,9.4, 4.0,4.5,5.0, 1.5,6.0,8.5,5.0),
 },
 'medicine': {
  'Surgery':                    (3.0,3.4,3.9, 1.0,1.2,1.5, 9.5,9.5,9.5,9.0),
  'Emergency medicine':         (3.8,4.3,4.9, 1.0,1.2,1.5, 9.0,9.5,9.5,9.2),
  'Primary care / family medicine': (5.0,5.5,6.0, 1.0,1.2,1.5, 8.0,9.5,9.5,8.5),
  'Anesthesiology':             (5.2,5.7,6.1, 1.0,1.2,1.5, 8.0,9.5,9.5,8.5),
  'Psychiatry':                 (5.8,6.5,7.1, 1.2,1.5,1.8, 6.0,9.5,9.5,9.0),
  'Pathology':                  (7.2,8.2,9.0, 1.5,1.8,2.0, 5.0,8.0,9.5,7.0),
  'Radiology':                  (7.5,8.5,9.3, 1.5,1.8,2.0, 4.5,8.0,9.5,7.0),
 },
 'dentistry': {
  'Oral & maxillofacial surgery': (3.0,3.4,3.7, 1.2,1.5,1.8, 9.5,9.5,9.5,8.5),
  'General dentistry':            (3.8,4.2,4.6, 1.5,1.8,2.0, 9.3,9.5,9.5,8.0),
  'Dental hygiene':               (4.2,4.6,5.0, 1.8,2.0,2.2, 9.2,9.0,9.0,7.0),
  'Orthodontics':                 (5.4,6.2,6.9, 2.0,2.2,2.5, 8.5,9.0,9.5,7.0),
  'Dental laboratory technology': (7.6,8.2,8.6, 4.5,5.0,5.5, 5.0,4.0,3.0,4.5),
 },
 'veterinary': {
  'Emergency & critical care':      (3.2,3.6,3.9, 1.2,1.5,1.8, 9.5,9.5,9.5,9.2),
  'Large animal / mixed practice':  (3.2,3.6,4.0, 1.2,1.5,1.8, 9.5,9.3,9.5,9.0),
  'Veterinary specialist / surgery':(3.2,3.6,4.0, 1.2,1.5,1.8, 9.5,9.3,9.5,9.0),
  'Small animal general practice':  (3.8,4.4,4.8, 1.5,1.8,2.0, 9.2,9.3,9.5,9.0),
  'Veterinary nurse / technician':  (4.4,4.9,5.4, 1.8,2.0,2.2, 9.2,8.5,8.5,8.0),
  'Lab / diagnostic veterinary roles': (7.6,8.4,9.0, 3.5,4.0,4.5, 4.0,5.0,6.0,5.5),
 },
 'allied-health': {
  'Physical therapy (hands-on)':      (3.0,3.4,3.8, 1.2,1.5,1.8, 9.5,9.3,9.3,8.5),
  'Occupational therapy':             (3.2,3.6,4.0, 1.2,1.5,1.8, 9.4,9.3,9.3,8.5),
  'Speech-language pathology':        (4.4,4.8,5.2, 1.5,1.8,2.0, 8.5,9.3,9.3,8.5),
  'Respiratory therapy':              (4.4,4.8,5.2, 1.5,1.8,2.0, 8.8,9.0,9.3,8.2),
  'Diagnostic imaging technologist':  (6.4,7.2,7.9, 2.5,3.0,3.4, 7.5,7.0,8.5,5.5),
  'Records / screen-based allied roles': (8.4,9.0,9.5, 4.5,5.0,5.5, 1.5,5.5,7.0,4.5),
 },
 'pharmacy': {
  'Clinical / hospital pharmacy':   (6.0,6.5,7.0, 2.5,2.8,3.2, 5.0,8.5,9.5,7.5),
  'Ambulatory & specialty pharmacy':(6.6,7.1,7.6, 2.8,3.2,3.5, 4.5,8.2,9.5,7.0),
  'Community / retail pharmacy':    (7.2,7.8,8.3, 3.2,3.6,4.0, 3.5,7.5,9.5,5.5),
  'Pharmacy technician':            (8.0,8.8,9.4, 4.0,4.5,5.0, 3.5,5.5,6.5,4.0),
  'Central fill / mail order':      (9.0,9.6,9.9, 5.5,6.2,6.8, 2.0,4.0,8.5,3.0),
 },
 'psychology': {
  'Clinical psychologist (licensed)':      (5.4,6.2,6.8, 2.0,2.4,2.8, 6.5,9.5,9.5,9.0),
  'Counselor / psychotherapist (licensed)':(6.0,6.7,7.4, 2.2,2.6,3.0, 6.0,9.5,9.2,8.8),
  'School psychologist':                   (6.2,7.0,7.6, 2.2,2.6,3.0, 6.0,9.3,9.0,8.5),
  'Research / academic psychology':        (8.4,9.0,9.5, 5.0,5.6,6.2, 2.0,5.5,2.5,6.5),
  'Organizational / HR-adjacent roles':    (8.6,9.3,9.7, 5.5,6.2,6.8, 1.5,5.0,1.5,5.5),
  'Degree only, no further qualification': (8.8,9.4,9.8, 5.8,6.4,7.0, 1.5,4.5,1.0,5.0),
 },
 # ---------------------------------------------------------------- techn. --
 'computer-science': {
  'Embedded / safety-critical systems':   (4.6,5.4,6.2, 3.0,3.5,4.0, 4.0,7.5,6.0,7.5),
  'Security engineering':                 (4.2,5.0,5.8, 3.5,4.0,4.5, 1.0,7.0,3.5,8.5),
  'Senior engineer / architect':          (3.6,4.5,5.4, 3.0,3.5,4.0, 1.0,7.0,1.0,8.0),
  'ML / AI engineering':                  (4.5,5.5,6.5, 3.0,4.0,5.0, 1.0,6.5,1.0,8.0),
  'Backend / infrastructure':             (5.4,6.6,7.6, 4.5,5.5,6.0, 1.0,5.5,1.0,6.5),
  'Frontend / application development':   (6.0,7.4,8.6, 5.5,6.5,7.0, 1.0,4.5,1.0,5.0),
  'Entry-level developer':                (5.1,7.4,8.8, 5.0,7.0,8.5, 1.0,4.0,1.0,4.0),
 },
 'data-science': {
  'ML / AI engineer':                 (5.5,6.5,7.4, 3.5,4.2,5.0, 1.0,6.5,1.0,8.0),
  'Senior data scientist':            (6.4,7.4,8.2, 4.0,4.8,5.5, 1.0,6.0,1.0,7.0),
  'Data engineer':                    (7.0,8.0,8.8, 4.5,5.2,6.0, 1.0,5.5,1.0,6.0),
  'Analytics engineer / BI developer':(7.8,8.9,9.6, 5.5,6.5,7.2, 1.0,4.5,1.0,5.0),
  'Entry data analyst':               (8.2,9.2,9.9, 6.0,7.0,7.8, 1.0,4.0,1.0,4.0),
 },
 'cybersecurity': {
  'Incident response / threat hunting':(4.6,5.4,6.2, 4.0,4.5,5.0, 1.0,7.5,3.5,9.0),
  'Security architecture':             (5.4,6.2,7.0, 4.0,4.5,5.0, 1.0,7.0,3.5,8.5),
  'Penetration testing / offensive':   (5.8,6.6,7.3, 4.2,4.8,5.2, 1.5,6.5,3.0,8.5),
  'GRC / compliance':                  (7.0,7.8,8.5, 4.5,5.2,5.8, 1.0,6.0,5.0,5.5),
  'SOC analyst (tier 1)':              (7.8,8.8,9.6, 5.5,6.5,7.2, 1.0,4.5,3.0,4.5),
 },
 # ------------------------------------------------------- built environment --
 'engineering': {
  'Electrical power & grid':             (4.6,5.2,5.8, 2.5,2.8,3.2, 7.0,8.5,9.0,8.5),
  'Civil / structural (PE, site-based)': (4.8,5.4,6.0, 2.5,2.8,3.2, 7.0,8.5,9.0,8.5),
  'Mechanical (industrial)':             (5.6,6.0,6.6, 3.0,3.2,3.6, 6.0,8.0,8.5,8.0),
  'Manufacturing / process':             (6.4,6.9,7.3, 3.5,3.8,4.2, 5.5,7.5,8.0,7.5),
  'Design & analysis (desk, CAD-centred)':(7.8,8.8,9.6, 4.5,5.2,5.8, 2.0,6.5,7.0,6.0),
 },
 'architecture': {
  'Construction administration / site':  (5.4,6.0,6.6, 3.0,3.4,3.8, 7.5,8.5,8.5,8.0),
  'Licensed architect / design lead':    (5.8,6.4,7.0, 3.2,3.6,4.0, 6.5,8.5,8.5,8.0),
  'Specialist (sustainability, computational)': (6.6,7.2,7.6, 3.5,3.8,4.2, 5.0,8.0,8.0,8.0),
  'Technical / BIM coordination':        (8.0,8.8,9.4, 4.5,5.0,5.5, 2.5,5.5,5.5,5.0),
  'Production drafting':                 (8.6,9.5,9.9, 5.5,6.5,7.2, 2.0,4.5,5.0,4.0),
 },
 'trades': {
  'Electrician — service & maintenance':(2.6,3.0,3.4, 1.5,1.8,2.0, 9.5,8.5,9.0,9.0),
  'Plumbing / HVAC — service':          (2.8,3.2,3.6, 1.5,1.8,2.0, 9.5,8.5,8.8,8.8),
  'Welding & fabrication — site work':  (4.0,4.4,4.8, 2.0,2.2,2.5, 9.2,7.5,7.5,8.2),
  'Construction site trades':           (4.2,4.8,5.4, 2.0,2.4,2.8, 9.2,7.5,7.0,8.0),
  'Production line / prefab / modular':  (6.6,7.4,8.2, 3.5,4.0,4.5, 8.0,5.0,4.5,5.0),
 },
 'construction': {
  'Site superintendent':                    (3.6,4.2,4.6, 2.0,2.2,2.5, 8.5,8.5,6.0,8.5),
  'Construction project manager':           (5.0,5.6,6.0, 2.5,2.8,3.0, 7.0,8.0,5.5,8.0),
  'Estimator / quantity surveyor':          (7.6,8.3,8.9, 4.0,4.5,5.0, 2.5,6.0,4.0,6.0),
  'Scheduler / planner':                    (8.4,9.0,9.6, 4.5,5.0,5.5, 2.0,5.0,3.5,5.0),
  'Preconstruction / document coordination':(8.8,9.5,9.9, 5.0,5.6,6.2, 1.5,4.5,3.0,4.5),
 },
 # ------------------------------------------------------------- business ----
 'business': {
  'General management / P&L ownership':(5.2,5.8,6.4, 3.0,3.4,3.8, 2.5,8.5,2.0,8.0),
  'Supply chain & operations':         (5.4,6.0,6.6, 3.2,3.6,4.0, 3.5,7.5,2.0,7.5),
  'HR / people':                       (6.4,7.0,7.5, 4.0,4.4,4.8, 1.5,7.5,2.5,7.0),
  'Project management':                (7.6,8.4,9.0, 5.0,5.6,6.2, 1.5,6.0,1.5,6.0),
  'Business analyst / coordinator':    (8.5,9.4,9.9, 6.5,7.0,7.5, 1.5,4.5,1.5,4.5),
 },
 'accounting': {
  'Audit / CPA advisory':               (5.8,6.5,7.3, 3.2,3.6,4.0, 1.5,8.5,9.5,7.0),
  'Tax advisory (complex)':             (6.6,7.3,8.0, 3.5,4.0,4.4, 1.5,8.0,9.0,7.0),
  'Management accounting / controller': (7.6,8.4,8.9, 4.5,5.0,5.5, 1.5,7.0,4.0,6.5),
  'Routine tax preparation':            (8.4,9.1,9.6, 5.5,6.0,6.5, 1.5,5.5,6.5,4.5),
  'Bookkeeping / transactional':        (9.0,9.6,9.9, 6.5,7.2,7.8, 1.5,4.0,3.0,3.5),
 },
 'finance': {
  'Wealth / financial advisory':  (5.0,5.6,6.2, 3.0,3.4,3.8, 1.5,9.0,7.5,7.5),
  'Risk & compliance':            (6.2,6.8,7.5, 3.5,3.9,4.4, 1.0,7.5,6.5,7.5),
  'Investment banking (senior)':  (6.6,7.3,7.9, 3.8,4.2,4.6, 1.0,7.5,4.0,7.5),
  'Corporate finance / FP&A':     (8.0,8.6,9.2, 4.8,5.3,5.8, 1.0,6.0,3.0,6.0),
  'Entry analyst / research':     (8.0,9.2,9.9, 6.0,7.2,8.0, 1.0,4.0,3.0,4.5),
 },
 'law': {
  'Trial litigator / advocacy':        (5.2,5.8,6.5, 3.5,4.2,5.0, 4.0,8.5,9.5,8.5),
  'Regulatory & compliance counsel':   (6.2,6.9,7.6, 4.0,4.8,5.6, 1.5,8.0,9.0,8.0),
  'In-house counsel':                  (6.6,7.4,8.0, 4.2,5.0,5.8, 1.0,8.0,8.5,7.5),
  'Transactional / corporate associate':(7.6,8.5,9.2, 5.5,6.5,7.5, 1.0,6.5,8.0,6.0),
  'Junior associate / document review':(8.0,9.0,9.5, 7.0,8.5,9.5, 1.0,3.5,7.0,3.5),
 },
 # ------------------------------------------------------- creative & media --
 'design': {
  'Creative direction / brand identity':(5.6,6.2,6.8, 3.5,4.0,4.5, 1.0,7.5,1.0,7.5),
  'UX / product design':                (6.2,6.8,7.4, 4.0,4.5,5.0, 1.0,7.0,1.0,7.0),
  'Motion, 3D & technical craft':       (7.4,8.2,8.9, 5.0,5.8,6.5, 1.5,5.5,1.0,5.5),
  'Illustration / commercial art':      (8.2,9.1,9.7, 5.5,6.5,7.2, 1.5,4.5,1.0,4.5),
  'Production / execution design':      (8.4,9.6,9.9, 6.5,8.0,9.0, 1.0,3.0,1.0,3.0),
 },
 'journalism': {
  'Investigative reporting':      (5.0,5.5,6.0, 6.5,7.0,7.5, 6.0,8.5,1.0,9.0),
  'Specialist / trade reporting': (6.2,6.7,7.2, 7.0,7.4,7.8, 4.5,7.5,1.0,8.5),
  'Data journalism':              (7.4,8.0,8.6, 7.2,7.6,8.0, 2.5,6.5,1.0,7.5),
  'General news reporting':       (7.6,8.2,8.6, 7.5,7.9,8.3, 3.5,6.0,1.0,7.0),
  'Desk / aggregation & rewrite': (8.8,9.6,9.9, 8.0,8.5,9.0, 1.0,3.5,1.0,3.5),
 },
 'marketing': {
  'Brand strategy / marketing leadership':(5.4,6.0,6.8, 3.5,4.0,4.5, 1.0,7.0,1.0,7.5),
  'Marketing science / analytics':        (6.8,7.4,8.0, 4.2,4.8,5.4, 1.0,6.0,1.0,7.0),
  'Product marketing':                    (7.2,7.9,8.6, 4.5,5.0,5.6, 1.0,5.5,1.0,6.5),
  'Campaign management':                  (8.2,9.0,9.5, 5.5,6.2,6.8, 1.0,4.5,1.0,5.0),
  'Content & social execution':           (8.6,9.6,9.9, 6.5,8.0,9.0, 1.0,3.0,1.0,3.5),
 },
 # -------------------------------------------------------------- education --
 'teaching': {
  'Special education':          (6.6,7.0,7.4, 1.5,1.8,2.0, 9.0,9.5,9.0,8.5),
  'Elementary / early years':   (6.9,7.3,7.7, 1.8,2.0,2.2, 9.0,9.5,9.0,8.0),
  'Secondary — STEM subjects':  (7.2,7.6,8.0, 1.8,2.0,2.2, 8.8,9.3,9.0,7.8),
  'Secondary — general subjects':(7.6,8.0,8.4, 2.0,2.2,2.5, 8.8,9.3,9.0,7.5),
  'Online instruction / tutoring':(8.4,9.2,9.8, 4.5,5.2,5.8, 1.5,5.0,3.0,4.5),
 },
}


def verify(published):
    """Check every track reconciles to its published score."""
    problems = []
    for slug, tracks in FACTORS.items():
        pub = {t[0]: t for t in published.get(slug, [])}
        for name, f in tracks.items():
            A23, A25, A26, E23, E25, E26, P, T, R, J = f
            got = [round(score(A23, E23, P, T, R, J), 1),
                   round(score(A25, E25, P, T, R, J), 1),
                   round(score(A26, E26, P, T, R, J), 1)]
            match = next((v for k, v in pub.items() if k.split(' (')[0][:22] in name
                          or name.split(' (')[0][:22] in k), None)
            if match:
                want = [match[1], match[2], match[3]]
                if any(abs(g - w) > 0.05 for g, w in zip(got, want)):
                    problems.append((slug, name, got, want))
            else:
                problems.append((slug, name, got, 'NO MATCH'))
    return problems
