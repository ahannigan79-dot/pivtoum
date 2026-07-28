import { visit } from "unist-util-visit";
import type { Root, Text, PhrasingContent } from "mdast";
import type { Plugin } from "unified";

/**
 * Pivotum highlighter syntax. Four markers, deliberate — also used by the PDF pipeline.
 *
 *   ==text==   → <span class="hl">    the finding      (yellow)
 *   ==+text==  → <span class="hl g">  protection       (green)
 *   ==-text==  → <span class="hl r">  exposure         (coral)
 *   ==?text==  → <span class="hl b">  method / honesty (blue)
 */
const CLASS: Record<string, string> = {
  "+": "hl g",
  "-": "hl r",
  "?": "hl b",
  "": "hl",
};

const PATTERN = /==([+\-?]?)([\s\S]+?)==/g;

export const remarkHighlight: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent || typeof index !== "number") return;

      const value = node.value;
      if (!value.includes("==")) return;

      const replacement: PhrasingContent[] = [];
      let last = 0;
      let match: RegExpExecArray | null;
      PATTERN.lastIndex = 0;

      while ((match = PATTERN.exec(value)) !== null) {
        const [full, marker, text] = match;
        const start = match.index;

        if (start > last) {
          replacement.push({ type: "text", value: value.slice(last, start) });
        }

        replacement.push({
          type: "highlight",
          children: [{ type: "text", value: text }],
          data: {
            hName: "span",
            hProperties: { className: CLASS[marker].split(" ") },
          },
        } as unknown as PhrasingContent);

        last = start + full.length;
      }

      if (last === 0) return; // no complete markers matched
      if (last < value.length) {
        replacement.push({ type: "text", value: value.slice(last) });
      }

      parent.children.splice(index, 1, ...replacement);
      return index + replacement.length;
    });
  };
};

export default remarkHighlight;
