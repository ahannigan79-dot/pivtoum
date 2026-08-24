import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getConversation } from "@/lib/dms";
import { sendMessage } from "../actions";
import { timeAgo } from "@/lib/community";
import { Avatar } from "@/components/hub/community/Avatar";
import { MessageComposer } from "@/components/hub/messages/MessageComposer";

export const metadata = { title: "Conversation — Winning in the Age of AI" };

export default async function ConversationPage({ params }: { params: Promise<{ thread: string }> }) {
  const { thread } = await params;
  const { userId } = await auth();
  const convo = userId ? await getConversation(thread, userId) : null;
  if (!convo) notFound();

  const send = sendMessage.bind(null, thread);

  return (
    <>
      <div className="hub-toolbar">
        <Link href="/hub/messages" className="back">‹ Messages</Link>
        <span className="tt dm-tt"><Avatar name={convo.other.name} url={convo.other.avatarUrl} size={28} />{convo.other.name}</span>
      </div>
      <div className="hub-body dm-convo">
        <div className="dm-stream">
          {convo.messages.length === 0 ? (
            <p className="feed-empty">Say hello to {convo.other.name}.</p>
          ) : (
            convo.messages.map((msg) => (
              <div key={msg.id} className={"dm-msg" + (msg.senderId === userId ? " mine" : "")}>
                <div className="dm-bubble">{msg.body}</div>
                <span className="dm-msg-when">{timeAgo(msg.createdAt)}</span>
              </div>
            ))
          )}
        </div>
        <MessageComposer action={send} name={convo.other.name} />
      </div>
    </>
  );
}
