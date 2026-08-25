/* The Operator — the human end-state every Workflow Rebuild points to. Static
   conceptual content, rendered natively. */

export const OPERATOR = {
  thesis: "In AI-native work, the machine does the doing. Your role changes shape entirely: you stop executing and start operating — directing the machine, and owning the judgment it can't make. This is the person every Workflow Rebuild is pointing you toward.",

  judgmentDef: "Deciding well when the situation is ambiguous, the stakes are real, the problem is novel, and the consequences are yours. No rule to follow, no answer to look up — precisely the ground AI can't safely stand on.",

  stack: [
    { n: "01", verb: "Ask", do: "Frame the problem and set the brief — decide what “good” looks like before the machine starts.", judgment: "Knowing the target when no one has handed you one." },
    { n: "02", verb: "Curate", do: "Accept or reject what the AI returns — catch what's wrong, off-brand, or merely plausible.", judgment: "The taste to reject the confident-but-wrong." },
    { n: "03", verb: "Decide", do: "Make the call the AI can't — the strategy, the trade-off, the ethical line, the priority.", judgment: "Choosing under ambiguity, with real stakes." },
    { n: "04", verb: "Own", do: "Stand behind the result. Sign it. Answer for it.", judgment: "Carrying the consequence — with no one else to blame." },
  ],

  traps: [
    { tag: "Trap 01 · No one to ask", title: "The call is made cold, alone", body: "In the old world, before you signed off you could turn to the person who did the work. With AI there's no accountable human upstream — the questioning stops with you." },
    { tag: "Trap 02 · The speed", title: "It's frighteningly fast", body: "The work arrives faster than you can think. Old judgment had the pace of human production built in. AI runs at machine speed — you have to be good at speed, not just good eventually." },
    { tag: "Trap 03 · The lull", title: "Near-perfect makes you lazy", body: "It gets 1,000 calls right and 1 wrong. The stream of good answers trains you to stop looking, to rubber-stamp “yep, fine” — and the wrong one slips through precisely because you'd relaxed." },
    { tag: "Trap 04 · The polish", title: "Fluency disarms your scrutiny", body: "So confident and well-formatted that you extend it trust it hasn't earned. A beautiful wrong answer gets inspected less hard than an ugly one — and AI is often subtly wrong under a perfect surface." },
    { tag: "Trap 05 · No hiding place", title: "You can't just slow it down", body: "Throttling the AI and checking everything by hand isn't a strategy — slow plus low-autonomy equals low value. You can't offset weak judgment by hobbling the machine; you'll be out-valued by someone who judges fast and right." },
  ],

  contrast: [
    { before: "You did the work.", after: "You direct the work." },
    { before: "Valued for your output.", after: "Valued for your decisions." },
    { before: "Mistakes were visible, caught in review.", after: "Calls are invisible until outcomes test them." },
    { before: "A junior absorbed the blame.", after: "The accountability is yours alone." },
    { before: "AI amplified nothing.", after: "AI amplifies your judgment — good and bad — at scale." },
  ],

  track: [
    { n: "01", title: "Make real calls under stakes", do: "Judgment grows from decisions with skin in the game, not from watching others decide. Take real calls, own real outcomes — that loop is the whole engine.", sit: "What decision am I currently avoiding making?", week: "Decisions under stakes" },
    { n: "02", title: "Calibrate — decide, then reveal", do: "Predict, commit in writing, then compare to what actually happened. A decision journal turns gut feel into a track record — and shows you your own biases.", sit: "How often am I actually right — and about what?", week: "The decision journal" },
    { n: "03", title: "Separate the call from the outcome", do: "A good decision can have a bad result, and a lucky one can look brilliant. Judge the process, not just the score — or you'll learn exactly the wrong lessons.", sit: "Was my last bad outcome a bad call, or bad luck?", week: "Process vs. outcome" },
    { n: "04", title: "Master the brief", do: "Your ask reveals your judgment. The craft of specifying and directing AI — and rigorously critiquing what it hands back — is where taste meets the machine.", sit: "Could someone else run my brief and get my result?", week: "The craft of the brief" },
    { n: "05", title: "Build your taste", do: "Immerse in excellent work in your field until you can feel what's right faster than you can justify it. Taste is judgment sped up — and it's earned by exposure.", sit: "Whose work in my field do I trust — and can I say why?", week: "Developing taste" },
    { n: "06", title: "Raise the stakes deliberately", do: "Don't wait to be handed the big calls. Reach for progressively higher-consequence decisions — the operator seat is taken, not given.", sit: "What's the biggest call I could credibly own next quarter?", week: "Onto the calls that matter" },
    { n: "07", title: "Distrust the polish — check at speed", do: "The AI-specific muscle. Deliberately red-team what the machine hands you, and hold your scrutiny steady even when the output is fast and flawless-looking — without slowing to a crawl.", sit: "When did I last say “fine” without really checking?", week: "Adversarial checking", ai: true },
  ],
};
