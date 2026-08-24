import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateProfile } from "@/lib/member";
import { getPlan } from "@/lib/plan";
import { MarkBooked } from "@/components/hub/welcome/MarkBooked";

export const metadata = { title: "Welcome — Pivotum" };

type Step = {
  n: number; title: string; body: string;
  href?: string; cta?: string; doneKey?: "map" | "welcome" | "pod";
  tag?: string; booked?: boolean; finish?: boolean;
};

const STEPS: Step[] = [
  { n: 1, title: "Read the Welcome pack", body: "Start in the Library — how the community works, what the Winning Loop is, and how to win here.", href: "/hub/library", cta: "Open the Library" },
  { n: 2, title: "Build your AI Career Map", body: "The fun, eye-opening part. Some of it might not fully click yet — that's expected. Your Welcome session with Adam clears it up.", href: "/hub/map", cta: "Build your Map", doneKey: "map" },
  { n: 3, title: "Do the Learn courses", body: "Work through the six levers, then explore our extensive library. This is where your Map stops being a verdict and starts being dials you can turn.", href: "/hub/learn", cta: "Open Learn" },
  { n: 4, title: "Book your Welcome Session with Adam", body: "Sixty minutes to walk your Map together, make sense of it, and set your first moves.", href: "/hub/events/welcome", cta: "Book it", doneKey: "welcome", booked: true },
  { n: 5, title: "Tweak your Map and lock it down", body: "After your session, refine your AI Career Map with what you've learned — then commit to it.", href: "/hub/map", cta: "Refine your Map" },
  { n: 6, title: "Join your Together Pod", body: "Join your pod, post your details, and share your Career Map with the team. Get involved — this is who holds you to your moves.", href: "/hub/pods", cta: "Find your pod", doneKey: "pod" },
  { n: 7, title: "Get into the swing of things", body: "Work through the Build sections, attend the planned events, and read the weekly newsletter. Momentum is a habit.", href: "/hub/build", cta: "Go to Build" },
  { n: 8, title: "Watch your Evolve dashboard", body: "Keep an eye on your progress, ship your moves, and stay active with your Together Pod and the wider community.", href: "/hub", cta: "Open Evolve" },
  { n: 9, title: "Book a follow-up with Adam", body: "Whenever you like — a deeper 1:1 to push further. (Fees apply.)", href: "/hub/events/welcome", cta: "Book a follow-up" },
  { n: 10, title: "Win in the Age of AI", body: "That's the whole point. Keep pulling the levers, and keep evolving.", finish: true },
];

export default async function WelcomePage() {
  const profile = await getOrCreateProfile();
  const first = (profile?.displayName ?? "there").split(" ")[0];
  const { userId } = await auth();
  const plan = await getPlan(userId);

  const isDone = (key?: string) => (key ? !!plan?.steps.find((s) => s.key === key)?.done : false);

  return (
    <>
      <div className="hub-top"><h1>Welcome</h1><span className="sp" /></div>
      <div className="hub-body">
        <p className="hub-lead">
          Welcome in, <b>{first}</b>. Your career is worth defending — and winning in the age of AI is a game
          you can play well. Here&apos;s your path in, step by step. Work through it in order.
        </p>

        <ol className="guide">
          {STEPS.map((s) => {
            const done = isDone(s.doneKey);
            return (
              <li key={s.n} className={"gstep" + (done ? " done" : "") + (s.finish ? " finish" : "")}>
                <span className="gnum">{done ? "✓" : s.finish ? "★" : s.n}</span>
                <div className="gbody">
                  <h3 className="gtitle">{s.title}</h3>
                  <p className="gblurb">{s.body}</p>
                  {done ? (
                    <span className="gdone-label">Done ✓</span>
                  ) : (
                    <span className="gactions">
                      {s.href && s.cta && <Link href={s.href} className="gcta">{s.cta} →</Link>}
                      {s.booked && <MarkBooked />}
                      {s.tag && <span className="gtag">{s.tag}</span>}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
