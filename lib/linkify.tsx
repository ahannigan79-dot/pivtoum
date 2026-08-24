import React from "react";

const URL_RE = /(https?:\/\/[^\s<]+[^\s<.,;:!?)"'])/g;

/** Render plain text with bare URLs turned into safe links. Preserves whitespace
 *  via the parent's white-space: pre-wrap; returns an array of strings + anchors. */
export function linkify(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  URL_RE.lastIndex = 0;
  let i = 0;
  while ((m = URL_RE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const url = m[0];
    out.push(
      <a key={i++} href={url} target="_blank" rel="noopener noreferrer nofollow" className="post-link">
        {url.replace(/^https?:\/\//, "")}
      </a>,
    );
    last = m.index + url.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
