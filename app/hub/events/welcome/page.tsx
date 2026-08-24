import Link from "next/link";

export const metadata = { title: "Book your 1:1 welcome — Pivotum" };

// Set NEXT_PUBLIC_WELCOME_BOOKING_URL to your Cal.com / Calendly booking link.
export default function WelcomePage() {
  const url = process.env.NEXT_PUBLIC_WELCOME_BOOKING_URL;

  if (!url) {
    return (
      <>
        <div className="hub-toolbar"><Link href="/hub/events" className="back">‹ Events</Link><span className="tt">Book your 1:1 welcome</span></div>
        <div className="hub-body">
          <div className="card" style={{ maxWidth: 560 }}>
            <p className="ck">Setup needed</p>
            <h3>Connect your booking link</h3>
            <p>
              Set <code>NEXT_PUBLIC_WELCOME_BOOKING_URL</code> in your environment to your Cal.com or Calendly
              link (e.g. <code>https://cal.com/adam/welcome</code>) and this page will embed the scheduler so
              members can book their 60-minute welcome directly.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="hub-toolbar"><Link href="/hub/events" className="back">‹ Events</Link><span className="tt">Book your 1:1 welcome with Adam</span></div>
      <iframe src={url} title="Book your 1:1 welcome" className="hub-toolframe" />
    </>
  );
}
