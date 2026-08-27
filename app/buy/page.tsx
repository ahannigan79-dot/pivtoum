import { redirect } from "next/navigation";

// The à-la-carte Career Value Guide is retired — everything now runs through the
// community. Any inbound /buy traffic (old links, bookmarks, SEO) lands on the
// community page. The checkout/claim infra stays in place but is unreachable.
export default function BuyPage() {
  redirect("/community");
}
