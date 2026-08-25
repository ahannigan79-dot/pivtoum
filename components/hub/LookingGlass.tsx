import { getGlassData } from "@/lib/gate";
import { getMembershipOffer } from "@/lib/billing";
import { getHighlights } from "@/lib/highlights";
import { formatWhen } from "@/lib/events";
import { startMembership } from "@/app/hub/membership/actions";

const PERKS = [
  { icon: "🧭", t: "Your living Map", d: "Your exact exposure, your winning strategy, and the moves that lower it — re-scored as the field shifts." },
  { icon: "👥", t: "Your Together pod", d: "A small group in your lane, holding you accountable week to week." },
  { icon: "📈", t: "The whole loop", d: "Learn the levers, log the reps, ship the moves — and watch your exposure come down." },
  { icon: "📅", t: "Live events & the founder", d: "Clinics, deep-dives, and direct access — not another passive course." },
];

export async function LookingGlass() {
  const [data, offer, highlights] = await Promise.all([getGlassData(), getMembershipOffer(), getHighlights()]);
  const trial = offer.trialDays > 0;

  return (
    <div className="hub-body glass">
      <div className="glass-hero">
        <span className="glass-eyebrow">Members only</span>
        <h1>You can see the room. Step inside to win in it.</h1>
        <p>Winning in the Age of AI is a working community — you get your own plan, your own pod, and people in your exact lane figuring this out alongside you. Here&apos;s what&apos;s happening inside right now.</p>
      </div>

      {highlights.length > 0 && (
        <div className="glass-reel">
          <div className="glass-reel-lbl">What&apos;s happening inside</div>
          <div className="glass-reel-cards">
            {highlights.map((h) => (
              <div key={h.id} className="glass-card">
                <b>{h.title}</b>
                <p>{h.body}</p>
                {h.attribution && <span className="glass-card-attr">— {h.attribution}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-live">
        <div className="glass-stat">
          <div className="glass-num">{data.memberCount || "—"}</div>
          <div className="glass-lbl">members in the community</div>
        </div>

        {data.pods.length > 0 && (
          <div className="glass-block">
            <div className="glass-block-lbl">Active pods</div>
            <div className="glass-pods">
              {data.pods.map((p) => (
                <span key={p.name} className="glass-pod">{p.name}<i>{p.members}</i></span>
              ))}
            </div>
          </div>
        )}

        {data.events.length > 0 && (
          <div className="glass-block">
            <div className="glass-block-lbl">Coming up</div>
            <ul className="glass-events">
              {data.events.map((e, i) => (
                <li key={i}><b>{e.title}</b><span>{formatWhen(e.startsAt)}</span></li>
              ))}
            </ul>
          </div>
        )}

        {data.prompt && (
          <div className="glass-block">
            <div className="glass-block-lbl">This week&apos;s prompt</div>
            <p className="glass-prompt">{data.prompt.title}</p>
          </div>
        )}
      </div>

      <div className="glass-perks">
        {PERKS.map((p) => (
          <div key={p.t} className="glass-perk">
            <span className="glass-perk-ic">{p.icon}</span>
            <div><b>{p.t}</b><p>{p.d}</p></div>
          </div>
        ))}
      </div>

      <div className="glass-cta">
        {offer.configured ? (
          <>
            {offer.priceLabel && <p className="glass-price">{offer.priceLabel}{trial && <span> · {offer.trialDays}-day free trial</span>}</p>}
            <form action={startMembership}>
              <button type="submit" className="glass-join">{trial ? `Start your ${offer.trialDays}-day free trial →` : "Join the community →"}</button>
            </form>
            <p className="glass-fine">Secure checkout by Stripe. Cancel anytime.</p>
          </>
        ) : (
          <p className="glass-fine">Membership is opening soon — check back shortly.</p>
        )}
      </div>
    </div>
  );
}
