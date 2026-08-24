import { getDirectory } from "@/lib/members";
import { MembersDirectory } from "@/components/hub/members/MembersDirectory";

export const metadata = { title: "Members — Pivotum" };

export default async function MembersPage() {
  const members = await getDirectory();
  return (
    <>
      <div className="hub-top"><h1>Members</h1><span className="sp" /></div>
      <div className="hub-body">
        <p className="hub-lead">Who&apos;s here, what they do, and where they are on their map. Find people on your path.</p>
        <MembersDirectory members={members} />
      </div>
    </>
  );
}
