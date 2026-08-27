import Link from "next/link";
import type { Metadata } from "next";
import { careerCount } from "@/data/careers";
import { SITE } from "@/lib/site";
import { SiteFooter } from "@/components/SiteFooter";
import "./community.css";

export const metadata: Metadata = {
  title: "The Winning Community — Winning in the Age of AI",
  description:
    "See everything inside Winning in the Age of AI: your living Career Map, the Judgment Gym, Workflow Rebuilds, your Together pod, and the year you run week by week. The biggest shift in a century is your biggest opening.",
  alternates: { canonical: "/community" },
};

export default function CommunityPage() {
  return (
    <div className="cg">
      <div className="wrap">
        {/* HERO */}
        <section className="hero">
          <p className="ck">Winning in the Age of AI · The community</p>
          <h1>The biggest shift in a century is <span className="hl">your biggest opening.</span></h1>
          <p className="lede">
            Your free Career Map showed you where you stand. This is where you turn it into an advantage —
            get ahead of the people frozen by fear, become the one who wields AI best, and come out further
            ahead than you went in.
          </p>
          <div className="cta">
            <Link className="btn" href={SITE.join}>Start your free trial →</Link>
            <a className="btn ghost" href="#inside">See what&rsquo;s inside ↓</a>
          </div>
        </section>

        {/* OPPORTUNITY */}
        <section className="opp">
          <h2>Fear has most people frozen. That&rsquo;s the opening.</h2>
          <p>
            AI is remaking every field, and the natural response is to freeze up or doom-scroll. Which is
            exactly why the ground is wide open for the people who do the opposite: face it head-on, learn to
            wield it, and move while everyone else waits. That&rsquo;s who wins the next decade — and this is
            the room built for them.
          </p>
          <div className="opp-pts">
            <div><b>Get ahead of your field</b><span>While your peers wait, you&rsquo;re doing the reps that put you out in front.</span></div>
            <div><b>Wield it, don&rsquo;t fear it</b><span>Become the one who uses AI best — the person who gets pulled up, not pushed out.</span></div>
            <div><b>Move up, not out</b><span>Turn the shift into a step up: the new openings, the higher-value work, the bigger seat.</span></div>
          </div>
        </section>

        <div id="inside" />

        {/* MAP */}
        <section className="feat">
          <div className="feat-copy">
            <p className="ck">Your living Map</p>
            <h2>Watch yourself pull ahead — month by month.</h2>
            <p>
              Your Map isn&rsquo;t a one-time score. It&rsquo;s the spine of everything: it moves as you do the
              work and re-scores as the field shifts — so your exposure falling is the proof, in one number,
              that you&rsquo;re getting ahead of it.
            </p>
            <ul className="pts">
              <li><b>Current exposure and the improvement</b> you&rsquo;ve earned, always in view.</li>
              <li><b>Your journey line</b> — every re-score and every effort dividend, plotted.</li>
              <li><b>Re-scored twice a year</b> as Pivotum re-reads the market, so it&rsquo;s never stale.</li>
            </ul>
          </div>
          <div className="scrn">
            <div className="scrn-bar"><i /><i /><i /><span>Evolve · your dashboard</span></div>
            <div className="card">
              <div className="stat-row">
                <div className="stat exp"><b>34</b><span>Current exposure</span></div>
                <div className="stat imp"><b>−18</b><span>Improvement earned</span></div>
              </div>
              <div className="jrny">
                <div className="lbl">Your journey</div>
                <svg viewBox="0 0 320 96" aria-hidden="true">
                  <polyline fill="none" stroke="var(--cg-prot)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    points="10,14 78,40 146,58 214,68 300,80" />
                  <circle cx="10" cy="14" r="4" fill="var(--cg-exp)" />
                  <circle cx="78" cy="40" r="4" fill="var(--cg-accent)" />
                  <circle cx="146" cy="58" r="4" fill="var(--cg-accent)" />
                  <circle cx="214" cy="68" r="4" fill="var(--cg-accent)" />
                  <circle cx="300" cy="80" r="4.5" fill="var(--cg-prot)" />
                </svg>
                <div className="jrny-key"><span>Start 52</span><span>Rescore 43</span><span>38</span><span>36</span><span>Today 34</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* GYM */}
        <section className="feat flip">
          <div className="feat-copy">
            <p className="ck">The Judgment Gym</p>
            <h2>Build the edge that puts you ahead of your field.</h2>
            <p>
              The machine hands you polished work; some of it is subtly wrong. Learning to catch what it
              misses — fast — is the edge that makes you the one they can&rsquo;t replace. Clear the month&rsquo;s
              reps and your exposure drops: the work pays off, right there in your number.
            </p>
            <ul className="pts">
              <li>Real reps built for <b>your exact field</b>, refreshed every month.</li>
              <li>Pass 8 reps and show up 3 weeks → <b>an Effort Dividend</b> off your exposure.</li>
              <li>The one edge that compounds: <b>the call only a human can make</b>.</li>
            </ul>
          </div>
          <div className="scrn">
            <div className="scrn-bar"><i /><i /><i /><span>Build · Judgment Gym</span></div>
            <div className="card">
              <div className="lbl">This rep · staff accountant</div>
              <div className="rep" style={{ marginTop: "0.5rem" }}><span className="v flag">Flag</span><p>&ldquo;The full 3-year support contract is recognized this year.&rdquo;</p></div>
              <div className="gate">
                <div className="gbar"><div className="gt"><span>Reps passed</span><b>6 / 8</b></div><div className="gtrack"><span style={{ width: "75%" }} /></div></div>
                <div className="gbar"><div className="gt"><span>Weeks active</span><b>3 / 3</b></div><div className="gtrack"><span style={{ width: "100%" }} /></div></div>
              </div>
              <p className="earned">2 reps to go — then this month&rsquo;s dividend lands.</p>
            </div>
          </div>
        </section>

        {/* REBUILD */}
        <section className="feat">
          <div className="feat-copy">
            <p className="ck">Workflow Rebuilds</p>
            <h2>Rebuild a workflow you actually run — AI-native.</h2>
            <p>
              Describe a workflow from your real week, and get back a sharp, boss-shareable transformation doc:
              what changes, where the risks are, where your people move up, and the gains. The artifact that
              makes you the person who saw it first.
            </p>
            <ul className="pts">
              <li>Your process today vs. <b>rebuilt AI-native</b>, step by step.</li>
              <li>Clear ownership — what&rsquo;s <b>AI</b>, what&rsquo;s <b>human</b>, what&rsquo;s both.</li>
              <li>A one-pager you can take <b>to your lead</b>.</li>
            </ul>
          </div>
          <div className="scrn">
            <div className="scrn-bar"><i /><i /><i /><span>Build · Workflow Rebuild</span></div>
            <div className="card">
              <div className="lbl">Monthly board reporting pack · rebuilt</div>
              <div className="flow" style={{ marginTop: "0.5rem" }}>
                <div className="step"><b>Pull &amp; reconcile the numbers</b><span className="own ai">AI</span></div>
                <div className="step"><b>Draft the commentary</b><span className="own both">AI + Human</span></div>
                <div className="step"><b>Judge the story &amp; sign off</b><span className="own hu">Human</span></div>
                <div className="step"><b>Present to the board</b><span className="own hu">Human</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* POD */}
        <section className="feat flip">
          <div className="feat-copy">
            <p className="ck">Your pod</p>
            <h2>You won&rsquo;t do this alone.</h2>
            <p>
              The people who come through ahead won&rsquo;t be the ones who did it solo. Your pod is a small
              group in your exact lane — the ones who keep you at it, post the messy middle, and celebrate
              the wins.
            </p>
            <ul className="pts">
              <li>A <b>small cohort in your field</b>, not a noisy feed of strangers.</li>
              <li>Weekly check-ins, shared goals, and <b>real accountability</b>.</li>
              <li>Led by a pod leader who brings <b>guests from your world</b>.</li>
            </ul>
          </div>
          <div className="scrn">
            <div className="scrn-bar"><i /><i /><i /><span>Together · your pod</span></div>
            <div className="card">
              <div className="post"><div className="av">MR</div><div><div className="who">Maya R. <span>· bedside nurse</span></div><p className="txt">Re-scored today — down to 31. The reps on triage judgment actually changed how I work.</p><div className="rx">♥ 12 · 4 replies</div></div></div>
              <div className="post"><div className="av b">DK</div><div><div className="who">Daniel K. <span>· marketing lead</span></div><p className="txt">Shared my workflow rebuild with my boss. She&rsquo;s putting me on the AI rollout. 🙌</p><div className="rx">♥ 21 · 7 replies</div></div></div>
              <div className="post"><div className="av c">PS</div><div><div className="who">Priya S. <span>· staff accountant</span></div><p className="txt">Cleared all 8 reps this month. First effort dividend earned!</p><div className="rx">♥ 9 · 3 replies</div></div></div>
            </div>
          </div>
        </section>

        {/* WINNING YEAR */}
        <section className="feat">
          <div className="feat-copy">
            <p className="ck">The Winning Year</p>
            <h2>A plan you run every week — not a pile of videos.</h2>
            <p>
              Every month has one subject the whole community moves through together: a lesson, live events,
              guest experts who know your field, and a pod session. You always know what to do this week.
            </p>
            <ul className="pts">
              <li>One <b>shared subject a month</b>, built on the six levers that set your exposure.</li>
              <li><b>Live clinics and Q&amp;As</b>, plus career SMEs brought in by your pod.</li>
              <li>Two <b>market re-scores a year</b> — the whole room reads the field together.</li>
            </ul>
          </div>
          <div className="scrn">
            <div className="scrn-bar"><i /><i /><i /><span>Learn · the year</span></div>
            <div className="card">
              <div className="calm">
                <div className="c"><span className="mo">Oct</span><span className="su">State of Play</span></div>
                <div className="c"><span className="mo">Nov</span><span className="su">Automatability</span></div>
                <div className="c"><span className="mo">Dec</span><span className="su">Trust</span></div>
                <div className="c"><span className="mo">Jan</span><span className="su">Judgment</span></div>
                <div className="c"><span className="mo">Feb</span><span className="su">Physical</span></div>
                <div className="c rs"><span className="mo">Mar</span><span className="su">The Shifts</span></div>
                <div className="c"><span className="mo">Apr</span><span className="su">Licensing</span></div>
                <div className="c"><span className="mo">May</span><span className="su">AI-fluency</span></div>
              </div>
              <div className="evt"><div className="t">Live · State of the Shifts</div><div className="d">This week — the market re-score, with a guest economist.</div></div>
            </div>
          </div>
        </section>

        {/* OFFER */}
        <section className="offer" id="join">
          <p className="ck">Membership · try it free for 7 days</p>
          <h2>Everything you need to win, in one place.</h2>
          <p className="offer-lead">Don&rsquo;t just keep up with the shift — get out in front of it.</p>
          <ul className="incl">
            <li>Your <b>living AI Career Map</b> — re-scored as the field moves</li>
            <li>Your <b>Together pod</b> — a small group in your exact lane, keeping you at it</li>
            <li>The <b>Judgment Gym &amp; Workflow Rebuilds</b> — reps that build your edge</li>
            <li><b>Live clinics, events, and guest experts</b> — plus direct access to the founder</li>
            <li>The full <b>Learn curriculum</b> and asset library, from day one</li>
          </ul>
          <div className="cta">
            <Link className="btn" href={SITE.join}>Start your free trial →</Link>
            <Link className="btn ghost" href="/map">Not ready? Get your free Career Map</Link>
          </div>
          <p className="fine">Seven days free · cancel anytime · your Map and progress come with you.</p>
        </section>

        <footer className="foot">
          <p className="sig">Face it honestly, do the work, and come out ahead — together.</p>
          <p style={{ marginTop: "0.6rem" }}>Winning in the Age of AI · a Pivotum community</p>
        </footer>
      </div>
      <SiteFooter />
    </div>
  );
}
