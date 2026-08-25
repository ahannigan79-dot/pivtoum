import { and, eq, like } from "drizzle-orm";
import { db } from "@/db";
import { lessonProgress } from "@/db/schema";

// A section can carry one paragraph, several paragraphs (string[]), and/or a
// bullet list — enough to hold the full depth of the source lessons without any
// HTML/markdown (stays plain-text, auto-escaped, no sanitizer needed).
export type Section = { h: string; p?: string | string[]; bullets?: string[] };
export type Lesson = { key: string; title: string; minutes: number; summary: string; sections: Section[] };
export type Module = { slug: string; title: string; blurb: string; lessons: Lesson[] };

/* The Learn curriculum — the ideas behind the Map, written to be read in a sitting.
   Completing a lesson counts as effort (learn:*) and buys down exposure over time. */
export const CURRICULUM: Module[] = [
  {
    slug: "foundations", title: "Foundations", blurb: "The stance everything else stands on.",
    lessons: [
      {
        key: "embrace", title: "Embrace — run toward the change", minutes: 3,
        summary: "Resisting AI is the losing move. Making it your instrument is the winning one.",
        sections: [
          { h: "The instinct to resist is the trap", p: "Every big shift punishes the people who freeze and rewards the people who move first. AI is no different. The urge to wait it out, or to hope your corner stays untouched, feels safe — but it hands the advantage to whoever leans in while you hesitate." },
          { h: "Make it your instrument", p: "Embrace means bringing AI into your actual work: doing the reps, finding where it makes you faster, and learning its limits by using it, not reading about it. The goal isn't to compete with the machine — it's to become the person who wields it better than anyone else in your lane." },
          { h: "Build is how you Embrace", p: "Embrace isn't a mindset you affirm, it's reps you log. That's why the Loop has a Build space — a place to master the machine on the tasks it's taking, and to deepen the human edges it can't reach." },
        ],
      },
      {
        key: "together", title: "Together — nobody wins alone", minutes: 3,
        summary: "A shift this big isn't navigated solo. Being seen and held to your word is what turns intent into motion.",
        sections: [
          { h: "Isolation is where plans die", p: "You can build a perfect plan and never touch it. What moves people isn't willpower — it's being watched, in the good sense: a small group who expect to hear what you shipped this week." },
          { h: "Your pod is the engine", p: "A Together pod is a handful of people in your lane, on the same climb. You share your Map, your moves, your wins and your stuck points. The accountability is the product — it's the difference between knowing what to do and actually doing it." },
          { h: "Be generous, be steady", p: "The room works when people show up honestly: post the messy middle, not just the wins; answer someone's question when you know the answer; keep coming back. That's Together — and it's how the whole community compounds." },
        ],
      },
    ],
  },
  {
    slug: "loop", title: "The Winning Loop", blurb: "How the whole system fits together.",
    lessons: [
      {
        key: "loop", title: "Learn → Map → Build → Evolve", minutes: 3,
        summary: "One loop turns a vague worry into a plan you run every week.",
        sections: [
          { h: "Four moves, one cycle", p: "Learn the rules of the game. Map where you stand. Build the edges that matter for your lane. Evolve — re-score, adjust, and keep moving. It's a loop, not a checklist: you come back around as the field shifts and as you put in the work." },
          { h: "Everything hangs off your Map", p: "Your Map is the spine. It scores your exposure, names your winning strategy, and points to the moves that lower it. Learn feeds it, Build acts on it, Evolve tracks it. When you're not sure what to do next, the Map has an answer." },
        ],
      },
      {
        key: "exposure", title: "What exposure really measures", minutes: 5,
        summary: "Your score is the net of six forces that live in your work, not your job title — a read you can act on, not a verdict on you.",
        sections: [
          { h: "It measures the work, not your worth", p: "Exposure is how much of your lane's work AI can already do, plus how fast that's moving. It's a market read. A high score isn't a judgment of your talent — it's a warning about the ground you're standing on. We'd rather show you a number that stings and is true than one that comforts and isn't." },
          { h: "Two forces expose you, four protect you", p: ["Your exposure is the net of six signals. Two push it up: Automatability (how much of the work is language, patterns and screens, the stuff the machine is good at) and the Ladder (whether the path into and up your field is eroding). Four pull it down: Physical presence, Trust and accountability, Licensing, and Judgment.", "Two of them raise the water; four hold it back. Your score is simply the balance of all six — and, just as importantly, why you're exposed or protected, not only how much."] },
          { h: "Exposure lives in the work, not the title", p: ["If you take one thing from this, take this: exposure is a property of the tasks you do, not the title on your badge. That's why the same job can be a safe harbor for one person and a sinking ship for another. The nurse at the bedside and the nurse doing utilization review on a screen share a title and share almost no exposure. The lawyer in the courtroom and the lawyer drafting routine contracts, the same.", "Economists have measured this directly. When researchers scored more than 18,000 distinct work tasks for how automatable they were, they found most occupations contain at least some highly automatable tasks — yet almost none are automatable end to end. Automation lands on tasks; jobs are just the bundles we happen to package them in.", "This is where hope hides. Because exposure lives in the tasks, almost every exposed field contains protected sub-streams — the bedside inside nursing, the courtroom inside law, the hands-on build inside design. Even if your field's overall score looks frightening, there is very often a place to stand inside it where the water rises slowest."] },
          { h: "Forces you don't control, and levers you do", p: "The market baseline — what your lane scores — is largely out of your hands, and that's why we're honest about it. But your personal protections (judgment, trust, the license you hold, the hands-on work you do) are levers you can pull, and they move your score within bounds. A grade you can't change is a sentence; a set of levers you can change is a map." },
          { h: "A moving target, so we re-score", p: "None of the six is frozen — the machine keeps advancing, and even the protective walls can move. A moving target needs a moving map, which is why your read gets rebuilt on a cadence instead of going stale the month after you see it. Honest, current, and pointed at something you can actually do next." },
        ],
      },
    ],
  },
  {
    slug: "shifts", title: "The Shifts", blurb: "How the world of work is changing — and why.",
    lessons: [
      {
        key: "machine", title: "The Machine — what AI can and can't do", minutes: 9,
        summary: "Past the hype and the doom: AI's ability is specific, uneven, and moving — and it takes tasks, not jobs.",
        sections: [
          { h: "Why we start here", p: "Everything in the Foundations stands on one question: what can this machine genuinely do? Get that wrong and every other read is wrong — you'll either panic at work that's safe, or relax into work that's quietly automating. And because this is the fastest-moving shift of all, it's the one we update most often." },
          { h: "Both loud camps are wrong", p: "There are two easy stories about AI, and neither is true. The fearmongers say it will do everything and everyone's finished. The dismissers say it's just autocomplete, a party trick. Believe the first and you freeze; believe the second and you get blindsided. The reality is less dramatic and far more useful: AI's ability is specific and uneven. It is extraordinary at some things and genuinely poor at others — and knowing exactly which is which is the whole skill. The data shows both faces at once: on hard benchmarks that stumped models in 2023, scores leapt by up to 67 points in a single year — yet the same models still stumble on logic-heavy, accuracy-critical reasoning, which is why you can't yet hand them anything that has to be right." },
          { h: "What it's strong at", p: "Today's frontier AI is superhuman in range across anything that looks like language, patterns, and generation. It reads and writes fluently, summarizes and translates, spots signal in oceans of data, and produces a first draft of almost anything — text, code, an image — in seconds. It holds a little of nearly every subject at once. If a task is mostly symbols on a screen, assume the machine can already do a lot of it." },
          { h: "What it's weak at — for now", p: "The same machine is weak exactly where work leaves the screen and meets the world. It struggles with genuine novelty — the un-patterned, first-of-its-kind call. It cannot take physical action: hands, bodies, presence. It cannot carry accountability — someone still has to own the outcome when it matters. And, most importantly, it doesn't reliably know when it's wrong: it is fluent and confident even when it's confabulating, so a human has to supply the judgment about what to trust. Note the phrase for now — these are today's edges, not permanent laws." },
          { h: "A peek under the hood — how it actually works", p: ["You never have to build one of these things, but a little of how it works explains everything above — both the magic and the mistakes. At its core, today's AI is a prediction engine. It is trained on an enormous amount of text, images and code, from which it learns the statistical patterns in that data — and then it generates by repeatedly predicting the most plausible next piece: the next word, the next pixel, the next line of code. Understanding, in the human sense, isn't quite what's happening. It's pattern-matching at a scale no person could ever reach.", "Four terms are worth carrying with you. It's a neural network — a web of billions of tunable dials called parameters. Training is the slow, hugely expensive process of tuning those dials on data; inference is the fast part — what happens the instant you use it. The engine behind the recent leaps is scale: feed a model more data and more computing power and its ability grows in a fairly predictable way. And after the raw training, humans coach it to be helpful and safe (a step you'll hear called RLHF — reinforcement learning from human feedback).", "Now the payoff — because this one mechanism explains the whole strong/weak split. It's fluent and broad because it has absorbed the patterns of nearly everything ever written. And it's confidently wrong for the very same reason: it produces what's plausible, not what's verified. It has no built-in sense of truth, no memory beyond what's put in front of it, and no stake in the outcome. The strengths and the failure modes are two faces of the same coin. Once you see that, AI stops being either magic or menace and becomes what it is: a tool with a knowable shape you can work with."] },
          { h: "The one idea that unlocks everything: capability is task-shaped", p: ["Here's the single most important sentence in this lesson: AI doesn't take jobs, it takes tasks. Every job is a bundle of tasks — some of them language-and-pattern work the machine eats easily, some of them novel, physical, accountable, human work it can't touch. When people ask 'will AI take my job?' they're asking the wrong question. The right one is: 'which of my tasks, and how many?'", "This is why exposure varies so wildly inside a single job title. Two people with the same role, doing different mixes of tasks, can have completely different futures. The nurse charting on a screen and the nurse at the bedside share a title and share almost no exposure. The research backs this to the hilt: one landmark study that scored more than 18,000 work tasks found most jobs contain some machine-suitable tasks but very few are fully automatable, and a separate analysis estimates around 80% of US workers have at least 10% of their tasks exposed to AI, with roughly one in five seeing half their tasks affected. Exposure lives at the task level, inside the job."] },
          { h: "The tell", p: "Look at your own week and split it in two: the parts that are information (reading, writing, analyzing, deciding-by-rule) and the parts that are presence, novelty, or ownership. The first pile is where the machine is coming; the second is where you're standing on rock. Most jobs are a mix — and the mix is the whole story." },
          { h: "It's not standing still — it's gaining autonomy", p: ["The snapshot above is today. The trajectory matters just as much. AI is moving along one clear axis: from a tool you prompt (you drive every step), to a copilot beside you (it drafts, you steer), toward an agent that runs whole processes (it plans and executes, you set the goal and check the result). Each step hands more of the doing to the machine and moves the human further up into direction and judgment. And the line is moving fast: by one careful measure, the length of task an AI agent can complete on its own has been doubling roughly every seven months.", "That's why, all through this community, we look at two horizons instead of one: how your work changes now, with today's supervised AI — and how it changes as the machine keeps gaining autonomy. The first is your plan for this year. The second is your early-warning system. Judge yourself only against today's snapshot and you'll be caught out; watch the line move and you stay ahead of it."] },
          { h: "Never bet against the line", p: ["Here's the most radical example — and look how fast it came. When ChatGPT landed in late 2022, AI was a chatbot: you asked, it answered, one turn at a time. It couldn't do anything, and plenty of people filed it under 'clever party trick.' Then the ground moved, fast. By early 2023, people were wrapping it in loops (AutoGPT) so it could chase a goal on its own — crude and glitchy, but a glimpse. By October 2024, Anthropic's Claude could operate a computer — read the screen, move the cursor, click and type like a person. By January 2025, OpenAI's Operator was driving a web browser to get things done for you. In barely two years, 'a chatbot that answers questions' had become an agent that does the work.", "That's the whole lesson in a single story. Two years earlier, almost nobody — not the skeptics, not most of the insiders — had 'AI agents running multi-step jobs on their own' anywhere on the horizon; the word agent wasn't even in the everyday vocabulary. The jump from AI that talks to AI that acts is the biggest shift yet, and it arrived years ahead of the confident forecasts. And it isn't a one-off — the same shock has repeated with images, with language, with scientific discovery. The line doesn't just move; it lurches."] },
          { h: "So here's our superpower", p: "We take today's limits seriously — but we treat every one of them as 'for now,' never 'forever.' Our edge isn't guessing the exact date a barrier falls; it's refusing to be the person who bet it never would. Respect what AI can't do today; never underestimate what it might do tomorrow. That one habit — humility about the future — is what keeps you positioned ahead of the change instead of blindsided by it." },
          { h: "What the evidence says", p: "You don't have to take our word for any of this. The picture above is the mainstream read of the best current research and reporting. A few anchors worth reading yourself:", bullets: [
            "GPTs are GPTs: An Early Look at the Labor Market Impact Potential of LLMs (Eloundou, Manning, Mishkin & Rock, 2023 / Science 2024) — the flagship task-exposure study: about 80% of US workers have at least 10% of their tasks exposed to LLMs, and about 19% could see half. Proof that exposure is measured in tasks, not jobs.",
            "What Can Machines Learn, and What Does It Mean for Occupations and the Economy? (Brynjolfsson, Mitchell & Rock, 2018) — scored 18,000+ work tasks: most jobs contain some machine-suitable tasks, but very few are fully automatable — the clearest evidence that exposure varies within a single job title.",
            "Why Are There Still So Many Jobs? (David Autor, 2015) — the foundational task-based frame: machines substitute for routine, codifiable tasks while raising the value of human problem-solving, adaptability and judgment.",
            "The 2025 AI Index Report (Stanford HAI, 2025) — documents both faces at once: record one-year benchmark gains alongside persistent weakness on logic-heavy, accuracy-critical reasoning.",
            "Measuring AI Ability to Complete Long Tasks (METR, 2025) — the autonomy line, quantified: the length of task an AI can finish on its own has been doubling roughly every seven months.",
            "Agentic AI, explained (MIT Sloan, 2024-25) — plain-language on the tool-to-agent shift: agents set sub-goals, adapt to feedback and act without step-by-step instructions.",
          ] },
          { h: "The one thing to remember", p: "AI doesn't take jobs — it takes tasks. Its power is real but specific and uneven, and the line is moving. So never ask 'will it take my job?' — ask 'which of my tasks, how many, and how fast?'" },
        ],
      },
      {
        key: "value-shift", title: "The Value Shift — where the value goes", minutes: 8,
        summary: "When AI takes a task, the value doesn't vanish — it elevates to the deciding. Follow it.",
        sections: [
          { h: "Value doesn't vanish — it relocates", p: ["Start with the fear, honestly. When a task you do gets automated, it feels like the value of your work is being taken. And the doing of it — the drafting, the calculating, the producing — genuinely does leave. But watch what happens to the value of that work. It doesn't evaporate. It flows to whoever now directs the machine, checks its output, decides what's good enough, and owns the result. The task drained; the value moved up a level.", "Think of any piece of work as two layers: the doing and the deciding. AI is brilliant at the doing and weak at the deciding — which means as it takes the doing, the deciding is all that's left, and it becomes worth more, not less, because it now governs far more output. That's the whole shift in one line: automate the doing, and the value elevates to the deciding."] },
          { h: "Where the value goes", p: "It's not vague. When the mechanical layer drains, value pools into four very specific places — and you'll notice they're the human-strong ground from the last shift:", bullets: [
            "Framing — deciding what problem to solve and how to point the machine. AI optimizes whatever you aim it at; choosing the target is now the high-value move.",
            "Judgment and taste — knowing what's good, what's subtly wrong, what to trust and what to fix. AI is fluent by default; the discerning eye is the scarce input.",
            "Ownership — standing behind the result and carrying the accountability. Someone has to be answerable, and it won't be the model.",
            "The parts it can't — the physical, the relational, the genuinely novel. Whatever the machine can't reach becomes the premium.",
          ] },
          { h: "The mechanism underneath the levers", p: "If those four sound familiar, they should: they're the protective levers and the directing-the-machine edge, seen from a different angle. The Value Shift is why those levers protect — it's the mechanism underneath." },
          { h: "A worked example: the automated draft", p: ["Take writing a report. Two years ago the work was: gather the inputs, draft it, polish, send. Today AI drafts it in seconds. So is the writer's value gone? Only the typing is. What remains — and is now worth more — is framing the report so it answers the real question, editing it with judgment so it's sharp rather than generic, and standing behind it when someone acts on it. The first draft went from the job to the raw material. The value didn't fall; it climbed from the keyboard to the head.", "That same pattern repeats everywhere the doing automates: the mechanical layer leaves, and the judgment layer becomes the job. The typing was never the value — the judgment was. AI just made that impossible to ignore."] },
          { h: "Be honest — we're worth more than this", p: ["This shift isn't only economics — it's how we spend our lives. None of us went to college, or spent years learning our craft, in order to write another status report, wrangle another spreadsheet, or sit through another meeting that could have been an email. Even now, a huge slice of a typical week disappears into exactly that low-value churn. We don't do that work because it's where our value is. We do it because, until now, there was no other way: the doing and the deciding came bundled together, so we did both.", "AI is starting to take the churn — and that is something to celebrate, not mourn. Our instinct is to cling to the familiar, even when the familiar is beneath us, because it's what we know and what we've always been measured on. But the value is moving up — to the parts that actually needed a human: the framing, the judgment, the care, the call. Go with it. The promise here isn't just 'keep your job.' It's that you finally get to do the work you were capable of all along. We are worth far more than most of what fills our days today — and for the first time, the tools exist to set that free. This is Embrace, made concrete: the opportunity isn't AI leaving us alone — it's AI lifting us up."] },
          { h: "Why this is the most important reframe in the Foundations", p: ["Here's why we build the whole community on this idea. Exposure is only frightening if you believe the value disappears. It doesn't. It moves — and it moves predictably, in the same direction every time: up, toward direction, judgment, and ownership. And anything that moves predictably is something you can move to meet.", "The early evidence already shows this exact shape. In a controlled study of professional writing, generative AI cut the time taken by around 40% and lifted quality — and, tellingly, restructured the work toward idea-generation and editing, away from rough-drafting. Among management consultants, those using GPT-4 inside its capabilities did far more, far faster and better — but on a task outside them, AI users were more likely to produce worse answers than those with no AI at all. The new scarce skill is the human judgment about where to trust the machine. The doing gets cheaper; the deciding gets dearer — precisely as the theory predicts.", "This is the source of every opening we'll ever point you to. An opening is simply a place the value is heading that you can get to — become the one who directs the machine (the AI-native edge), or plant yourself in the parts it can't reach (the protected edge). Both are just 'follow the value.' Read the Value Shift right and an exposure score stops being a verdict and becomes an arrow: here's where the value is going — go there."] },
          { h: "What the evidence says", p: "That automation shifts value toward complementary human work — rather than simply destroying it — is one of the most robust findings in the economics of technology, and the early generative-AI studies show the same shape:", bullets: [
            "Automation and New Tasks: How Technology Displaces and Reinstates Labor (Acemoglu & Restrepo, 2019) — new tasks 'reinstate labor,' the opposite of displacement. The formal case that value doesn't vanish; it relocates into new human-advantaged work.",
            "Why Are There Still So Many Jobs? (David Autor, 2015) — automation substitutes for some tasks but complements others, raising the value of the work it can't do. The classic statement of 'value flows to the complementary human tasks.'",
            "The Turing Trap: The Promise and Peril of Human-Like Artificial Intelligence (Erik Brynjolfsson, 2022) — automating human-like work reduces workers' leverage; augmenting it creates new value. 'Automate to elevate,' in one paper.",
            "Experimental Evidence on the Productivity Effects of Generative AI (Noy & Zhang, Science 2023) — gen-AI cut writing time about 40% and raised quality, and restructured the work toward idea-generation and editing, away from rough-drafting.",
            "Navigating the Jagged Technological Frontier (Dell'Acqua et al., Harvard/BCG, 2023) — consultants soared with GPT-4 inside its 'jagged frontier' but did worse outside it — proof the scarce new skill is judgment about where to trust AI.",
            "Generative AI at Work (Brynjolfsson, Li & Raymond, NBER 2023) — AI raised support-agent productivity 14% on average (34% for novices) by spreading the best workers' judgment.",
          ] },
          { h: "The one thing to remember", p: "When AI takes a task, the value doesn't vanish — it elevates to the deciding: framing, judgment, ownership, and the parts AI can't. Don't guard the doing. Follow the value." },
        ],
      },
      {
        key: "reshaping", title: "The Reshaping of Jobs", minutes: 9,
        summary: "Jobs rarely vanish whole — they get reshaped: roles collapse toward the operator, and the ladder changes under everyone.",
        sections: [
          { h: "Jobs don't vanish whole — they're reshaped", p: ["'Will AI take my job?' is the wrong question — you already know why: AI takes tasks, not jobs. So jobs don't usually vanish in one clean stroke. Picture a job as a bundle of tasks. AI doesn't delete the bundle; it removes the tasks it can do, and hands back a smaller, denser role — one concentrated in exactly the things it can't: the judgment, the framing, the ownership. This is the Value Shift, now seen at the level of a whole job. The role that's left is fewer hours of doing and more hours of deciding.", "Sometimes that's fine — a better job, honestly. But two things follow that reshape a whole field, not just a role: roles collapse together, and the ladder that connects them changes shape."] },
          { h: "When roles collapse into one operator", p: ["Here's a pattern already visible in real workplaces. A function used to be a stack of roles: a junior analyst who pulled and cleaned the data, a manager who turned it into decisions, a leader who set direction. Automate the doing at each level and those layers press together. What's left can be a single role that spans all three — one person, working with AI, who does the analysis, makes the calls, and sets the direction. Three rungs become one operator.", "Take procurement. The Procurement Analyst, Procurement Manager and Procurement Leader were three jobs on three rungs. As AI absorbs the analysis and the routine management, they can collapse toward one Procurement Operator — the person who runs the whole machine end to end. Fewer seats, each one denser, each one demanding the ability to direct the AI rather than do the task by hand.", "This is why the operator matters so much: when roles collapse, the winning seat is the one that runs the machine across what used to be several jobs. Your protection isn't your rung; it's your ability to operate."] },
          { h: "The ladder erodes from the bottom", p: ["Now the ladder itself. The rungs most exposed to automation are usually the junior ones — the entry-level, learn-the-ropes tasks are the most codifiable, so they automate first. That means the traditional way in gets narrower even while the senior roles still look secure. The bottom of the ladder thins.", "This is already showing up in the data. A 2025 Stanford study found that early-career workers (ages 22-25) in the most AI-exposed jobs saw a roughly 13% relative drop in employment once generative AI took hold — while older workers in the same fields, and everyone in less-exposed fields, held steady. The entry rungs are thinning first, for real, right now. (It's a fast-moving working paper — a later revision puts the figure nearer 16% — so read it as a live signal, not a settled number.)", "And as the way in narrows, something happens at the other end. People already on the ladder climb to get clear of the rising water — and everyone climbing at once means the top crowds. More people competing for fewer senior seats pushes down pay, status and security for roles that used to feel safe. The ladder gets thin at the bottom and jammed at the top."] },
          { h: "Seniority is not a queue ticket", p: "One warning: 'bottom-up' is the pattern today, not a law. Because AI takes tasks, not rungs, it can grab chunks of senior work before it has finished the junior work — so the erosion needn't stay orderly. Don't assume the juniors go first and you're safe for years; watch which of your tasks are in range." },
          { h: "Depth is destabilization", p: ["Not all ladder erosion is equal, and this is the distinction the Ladder signal is built to capture. A shallow erosion only nibbles the entry rungs — painful for newcomers, survivable for the field. A deep one, where automation climbs high up the ladder, shakes the whole structure: it collapses roles, crowds the top, and rewrites the career path for everyone on it.", "So the question isn't just 'is the bottom rung automating?' It's 'how far up does it go?' The higher the water climbs on a field's ladder, the more destabilized that field is — and the more urgently everyone on it needs to reposition. Depth is destabilization. That depth is precisely what we score."] },
          { h: "The flip side: reshaping is also creation", p: ["Read all of the above as pure loss and you've missed half of it. Reshaping doesn't only subtract — it creates. The operator seat didn't exist a few years ago; nor did most of the roles built around directing, training and governing AI. The very same force that thins the old rungs is cutting new ones.", "The numbers bear this out. The World Economic Forum projects that by 2030 the churn will create 170 million new roles even as 92 million are displaced — a net gain of 78 million — with the fastest-growing roles (by rate) led by data, fintech and AI specialists. About four in ten of workers' core skills are expected to change by 2030. New rungs are being cut roughly as fast as old ones erode. The only question is whether you move to them.", "An important nuance — it's the 'work not title' lesson again. We actually score Computer Science and Data Science as heavily exposed, because so much of their day-to-day (boilerplate code, standard analysis, data plumbing) is exactly what AI does best. So how can 'AI and machine-learning specialist' be a top-growing role? Because that growth lives in a specific sub-stream inside those disciplines — the people who build, direct and deploy the AI itself — not the field as a whole. A field's average score and its best sub-stream are two very different things, which is exactly why we never read a career as a single number.", "That's the whole difference between the passive and the mover. The passive stands on a rung waiting to see if it holds. The mover reads the reshaping and steps toward where the new seats are forming — the operator role, the new AI-adjacent work, the protected sub-streams. Same reshaping; opposite outcome."] },
          { h: "What the evidence says", p: "The reshaping isn't a forecast — it's already measurable, and the early data lines up with the picture above:", bullets: [
            "Canaries in the Coal Mine? Six Facts about the Recent Employment Effects of AI (Brynjolfsson, Chandar & Chen, Stanford, 2025) — early-career workers (22-25) in the most AI-exposed jobs saw about a 13% relative employment decline (nearer 16% in later revisions) while older and less-exposed workers held steady.",
            "The Future of Jobs Report 2025 (World Economic Forum, 2025) — by 2030: 170M roles created, 92M displaced (+78M net); 39% of core skills disrupted; 59 in 100 workers need reskilling.",
            "Automation and New Tasks: How Technology Displaces and Reinstates Labor (Acemoglu & Restrepo, 2019) — a displacement effect peels tasks from roles; a reinstatement effect creates new ones. The formal spine of 'reshaped, not removed.'",
            "The Growth of Low-Skill Service Jobs and the Polarization of the US Labor Market (Autor & Dorn, 2013) — automating routine, codifiable tasks hollows the middle and pushes pressure to the ends — the structural shape behind a squeezed ladder.",
            "From Jobs to Superjobs: The Impact of AI (Deloitte Global Human Capital Trends, 2019) — 'superjobs' combine parts of different traditional jobs into integrated roles that work with smart machines — the role-collapse-into-an-operator pattern, named.",
          ] },
          { h: "The one thing to remember", p: "Jobs don't vanish whole — they're reshaped: roles collapse toward the operator, the ladder thins from the bottom and crowds at the top, and how far up it erodes is how much the field shakes. Reshaping destroys rungs and cuts new ones — move toward the new." },
        ],
      },
      {
        key: "openings", title: "The New Openings", minutes: 8,
        summary: "Every big change creates as it destroys. Openings come in two kinds, hide inside exposed fields, and are widest for the first movers.",
        sections: [
          { h: "Look at the road, not the wreckage", p: ["Four shifts in, you could be forgiven for feeling the doom: capable machine, exposed work, reshaping ladders. But that's only half the picture — and honestly, the less important half. Every large technological change destroys some work and creates other work. History is blunt on this: technology has destroyed whole categories of work for two centuries — and employment kept rising, because it kept inventing new work faster than it erased the old.", "When economists actually cataloged this, the result was striking: more than 60% of the jobs Americans held in 2018 were in occupations that barely existed in 1940 — and among professional roles it's roughly three-quarters. Most of the work we do today had to be invented. There's no reason to think that engine has switched off — if anything, AI is turning it faster.", "So the disciplined move — the one this whole community is built around — is to spend at least as much energy on where the doors are opening as on where the walls are closing. That's not optimism for its own sake. It's just where the useful information is."] },
          { h: "New roles — built around AI (the AI-native edge)", p: "AI doesn't just subtract; it creates work that needs a human, and a lot of it didn't exist a few years ago:", bullets: [
            "The Operator — the person who runs the machine across what used to be several roles. The reshaping's headline new seat, and often the highest-leverage one.",
            "Build and direct AI — engineering, deploying, and designing the workflows AI runs inside. Not just for coders: every field is growing people who make AI actually work in their domain.",
            "Govern AI — safety, oversight, ethics, evaluation, trust. As AI does more, someone has to make sure it does it right — and be accountable for it.",
          ] },
          { h: "These aren't hypothetical", p: "'AI Engineer' topped LinkedIn's fastest-growing-jobs list, US postings mentioning generative AI jumped several-fold in a single year, and the WEF's fastest-growing roles by rate are led by data, fintech and AI specialists (each up 80-110%+). Whole new titles, most of which didn't exist a few years ago, are hiring hard. If that seems to clash with our scoring computer science and data science as heavily exposed — good catch. It doesn't, and there's a reason why." },
          { h: "Newly valuable — the human premium (the protected edge)", p: "The second kind isn't new work at all — it's old human work that just became worth more, precisely because AI made it scarce. When the machine floods the world with cheap cognitive output, the things it can't do get rarer, and rarer means dearer:", bullets: [
            "Hands and presence — physical, in-person, real-world work. Harder to automate, and more valued as screen-work commoditizes.",
            "Trust and relationships — being the human someone actually relies on. In a world of infinite generated everything, a person you trust is premium.",
            "Novel judgment — the high-stakes, first-of-its-kind call. The scarcer good judgment gets, the more it's worth.",
          ] },
          { h: "The human premium was already rising", p: "This isn't wishful thinking — the pattern predates AI. Between 1980 and 2012, as computers absorbed routine tasks, jobs demanding strong social skills grew by nearly 12 percentage points of the US workforce, while math-heavy-but-low-social roles shrank — with the biggest winners needing both. The human premium was already climbing before the machine poured fuel on it. Both kinds are real openings. One says master the machine; the other says become the thing it can't be. Most people's best path uses a little of each." },
          { h: "The best openings often hide inside exposed fields", p: ["Here's the trap to avoid: assuming the openings are only in obviously 'safe' careers. They're not. Because exposure lives in the work, not the title, some of the biggest openings sit inside heavily exposed fields — in their AI-native and protected sub-streams.", "We score Computer Science and Data Science as heavily exposed — a lot of their routine work (boilerplate code, standard analysis, data plumbing) is exactly what AI does best. So how can 'AI Engineer' be the fastest-growing job on the market? Because both are true at once. The opening isn't the whole field; it's a specific AI-native corner of it — the people who build, direct and operate the AI, not the ones doing the routine work it now absorbs. Exposed discipline, enormous opening.", "And one more thing this makes clear: being AI-native in your field almost never means retraining as a computer scientist. It means becoming the person who runs AI inside the work you already do. The 'AI Engineer' headline is one corner of one field — your opening is the AI-native corner of yours. Never let a field's average score tell you there's nothing there."] },
          { h: "The openings are widest for the first movers", p: ["One more thing, and it matters more than any single role on the list: timing. A new opening is widest at the start — when few people have moved into it, demand outstrips supply, and being early is the qualification. As a role matures, it crowds and formalizes. The person who becomes their team's AI operator this year writes the job description; the one who waits three years applies for it.", "And the market is already paying for it: job postings that ask for AI skills advertise about 28% higher salaries — roughly $18,000 a year more — than otherwise-similar postings, and more than half of those postings are now outside tech. Moving early isn't just safer; it's being rewarded, in cash, right now.", "This is Embrace made practical: don't be a follower, be a leader. You don't need to be certain, and you don't need to be technical — you need to move toward the opening while it's still an opening. Early and imperfect beats late and polished, almost every time."] },
          { h: "And the list isn't finished", p: "One honest caveat: the openings above are the ones we can see today. Some of the biggest are almost certainly not on the list — because they don't exist yet. Remember the 60%: if most of today's jobs were invented in the last few generations, then a real share of tomorrow's haven't been named, and no one can fully catalog them in advance. That isn't a gap in the plan; it's the reason the plan is a community that keeps watching. Spotting new openings as they form, naming them, and pointing you toward them is core to what we do — and it's exactly what the re-score and the living Map are built for." },
          { h: "What the evidence says", p: "'New work keeps appearing' and 'the human premium is rising' aren't hopeful slogans — they're documented patterns:", bullets: [
            "New Frontiers: The Origins and Content of New Work, 1940-2018 (Autor, Chin, Salomons & Seegmiller, NBER 2022 / QJE 2024) — more than 60% of 2018 US employment was in job specialties introduced since 1940 (about 74% among professionals).",
            "The Growing Importance of Social Skills in the Labor Market (David Deming, QJE 2017) — social-skill-intensive jobs grew nearly 12 percentage points of the workforce (1980-2012) while math-heavy-but-antisocial roles shrank.",
            "The Future of Jobs Report 2025 (World Economic Forum, 2025) — fastest-growing roles by rate: big data (~113%), fintech (~93%), AI/ML specialists (~82%); 170M created vs 92M displaced by 2030.",
            "Beyond the Buzz: Making AI Real (Lightcast, 2025) — postings asking for AI skills advertise about 28% higher salaries (~$18k/year), and 51% of AI-skill postings are now outside IT.",
            "Rapid Growth in GenAI Job Postings (Indeed Hiring Lab, 2024) — US job postings mentioning generative AI rose roughly 3.5x year-over-year, with brand-new titles like 'Generative AI Engineer' climbing.",
            "LinkedIn Jobs on the Rise 2025 (LinkedIn Economic Graph, via Axios, 2025) — 'AI Engineer' ranked the #1 fastest-growing job; LinkedIn attributes about 1.3M new AI-enabled roles to the build-out.",
          ] },
          { h: "The one thing to remember", p: "Every big change creates as it destroys. Openings come in two kinds — new roles built around AI, and old human work made newly valuable — they hide even inside exposed fields, and they're widest for the first movers. Find the door." },
        ],
      },
      {
        key: "forces", title: "The Forces Behind It", minutes: 11,
        summary: "Cost, competition and compounding make the change a permanent tide — but an uneven one, and the unevenness sets your window.",
        sections: [
          { h: "Why it's a tide, not a fad", p: "A fair question after five shifts: is this real, or is it hype that will blow over? The short version: the change is driven by forces that don't reverse — so it's permanent, a tide rather than a fad. Plenty of technologies get hyped and fade. This one won't, and the reason is structural: three forces push it forward, and none of them is about to reverse. When something is driven by cost, competition and compounding capability all at once, it doesn't blow over — it becomes the water everyone swims in. The scale of the bet says it all: US private AI investment alone hit a record $109 billion in 2024. Nobody spends like that on a fad." },
          { h: "1 - Cost: it's cheap and getting cheaper", p: "The price of a given amount of AI capability is falling fast. What cost a fortune to do two years ago costs cents today, and the curve keeps bending down. When something powerful gets that much cheaper that quickly, it doesn't stay a luxury for frontier labs — it spreads into every tool, every workflow, every desk. Falling cost is what turns a breakthrough into infrastructure. The drop is startling: the cost to run an AI at a given level of capability fell more than 280-fold in about two years — from roughly $20 to 7 cents per million words of output — while the hardware keeps getting about 30% cheaper and about 40% more energy-efficient every year." },
          { h: "2 - Competition: adopt or lose", p: "Once a few players in a market use AI to work faster, cheaper or better, everyone else has to follow or fall behind. That's true of companies against companies, and of people against people. It creates a one-way ratchet: no individual firm or worker can simply opt out, because their competitors won't. Competition is the force that makes adoption compulsory, not optional. And it shows: 88% of organizations now report using AI in at least one function (up from 78% just a year earlier), and 86% of employers expect it to transform their business by 2030." },
          { h: "3 - Compounding: it builds on itself", p: "AI capability doesn't rise in a straight line; it compounds. Better models make better tools, which generate better data and fund bigger investments, which make the next models better still. Progress that builds on its own output accelerates — which is exactly why the last few years have felt like lurches, not steps, and why the safe assumption is faster, not slower. One raw measure — the computing power used to train frontier models — has grown about 4-5x every year, doubling roughly every six months. That's the engine under the lurches." },
          { h: "The deepest reason: the prize", p: ["The three forces above are mechanical — cost, competition, compounding. But underneath them is a pull so strong it all but guarantees the push never stops: the prize.", "The promise being dangled in front of humanity is staggering. If AI keeps advancing, it might finally help crack the problems we've never solved — disease, climate, poverty, and the deep political, economic and social divides that have defied us for centuries. Picture a tool that helps cure cancers, model a livable climate, lift billions out of scarcity, and put a patient tutor beside every child on earth. We have no proof it will do any of it. But the possibility is so vast that no one — no company, no country, no civilization — is willing to be the one who didn't try.", "Call it FOMO at the scale of nations. When the potential upside is 'solve humanity's greatest problems,' no government will be the first to stop, because a rival who keeps going might unlock the century. So the money keeps flowing and the frontier keeps moving — not only because it pays, but because the carrot is everything we've ever wanted. And the only way to find out whether AI can do these things is to go on the journey — to keep building and see. It's a one-way bet humanity has effectively already placed."] },
          { h: "But isn't it a bubble?", p: ["Let's be honest about the other side of the ledger. A great deal of money is being thrown at AI right now, and the realized value is still catching up. Adoption is near-universal — yet by McKinsey's own survey only about 7% of companies have fully scaled AI and roughly 39% report a real bottom-line impact so far. When spending runs that far ahead of proven returns, you have the ingredients for a financial correction. So yes — expect a wobble: over-hyped startups will fold, valuations will take a haircut, and the headlines will swing to 'AI was overblown.'", "But hold onto the crucial distinction: a market wobble is not the technology going away. The dot-com bubble burst in 2000 and vaporized fortunes — and the internet went on to remake every part of life anyway. Pets.com died; the web didn't. The people who confused 'these valuations are insane' (true) with 'this technology doesn't matter' (catastrophically false) made the most expensive mistake of their generation.", "So the stance is both-eyed: expect turbulence in the market, and expect the technology to keep advancing and spreading regardless — because the three forces don't reverse when share prices do. This is 'never bet against the line' from the first shift, in financial form. Be smart about the hype, but never mistake a wobble for a reason to stop preparing."] },
          { h: "'Having AI' isn't being AI-native", p: ["One more honest note. A figure like 'nearly 4 in 10 large firms already use AI' can make it sound as if the ship has sailed, the transformation is finished, and the openings are gone. The reality on the ground is nothing like that. In most organizations, the number that have truly reimagined their workflows to be AI-native — in real depth and breadth, not a chatbot license and a handful of pilots — is close to zero. The data hints at it too: only about 7% of firms have fully scaled AI at all.", "Why so little, when the technology is this capable? Because it's genuinely hard — and the bottleneck is human, not technical. Unpicking how work really gets done, redesigning it from a blank page, and getting people to actually adopt the new way is slow, messy, effortful work. Most organizations have barely started. 'Has AI' and 'is AI-native' are worlds apart.", "And here's the good news buried in that gap: the openings are still wide open — and will be for a long time. If deep reimagination has barely begun, then the operator seats and AI-native roles are still there for the taking. This isn't a race that's already over. It's one that's barely begun."] },
          { h: "But it's uneven", p: ["There's a second kind of patchiness, just as important. Where AI has landed it's usually shallow — and it also hasn't landed everywhere at once. The pace varies enormously by industry, company, geography and function: a frontier tech firm may be years ahead while a traditional employer in a slow-moving sector is years behind. Two people with identical roles can face very different timelines simply because of where they work. The spread is measurable: in the US, only about 6% of the smallest firms use AI versus roughly 37% of the largest.", "This unevenness is why the picture looks so contradictory from the ground: one person swears AI has changed everything, another insists nothing's really happened at their job. Both are telling the truth — they're just standing on different shores of the same tide."] },
          { h: "What uneven changes: your timeline, not your fate", p: "Don't misread the unevenness as a reprieve. It sets when the water reaches you and how fast it's rising — your timeline and urgency — but not whether it reaches you. The forces are universal; only the schedule is local. Being in a lagging organization buys you time, which is a real gift if you use it — and a trap if you mistake it for safety. The worst position of all is a slow-moving employer that lulls you to sleep right up until the water arrives all at once." },
          { h: "The useful question", p: "Put the two halves together and your question changes. You stop asking 'will this really happen to me?' — because the forces settle that; it will. You start asking the question you can actually act on: not 'will it happen?' but 'how fast, for me — and what's my window?' The first is answered by the forces (yes, eventually). The second is answered by your field's pace and your employer's — and it tells you how much runway you have to get ahead of it." },
          { h: "The opportunity: uneven pace is itself an opening", p: "If the tide reaches different places at different times, then being early where others are late is a genuine edge. Two versions:", bullets: [
            "Be the AI-native one in a lagging organization. If your employer is behind, you don't have to be. Become the person who brings AI into the work first, and you're the operator writing the playbook while everyone else is still waiting — scarce, visible, and hard to replace.",
            "Move toward where the value is concentrating first. If your shore is slow and you'd rather ride the front of the wave, position toward the fields and roles where the change — and the new value — is landing soonest.",
          ] },
          { h: "What the evidence says", p: "Each of the three forces, and the unevenness, is measurable — not a hunch:", bullets: [
            "The 2025 AI Index Report (Stanford HAI, 2025) — cost: inference to reach GPT-3.5-level fell more than 280x in about two years (~$20 to ~$0.07 per million tokens); hardware -30%/yr, energy +40%/yr. US private AI investment hit a record $109.1B in 2024.",
            "Training Compute of Frontier AI Models Grows by 4-5x Per Year (Epoch AI, 2024) — compounding: frontier training compute has grown about 4-5x per year, doubling roughly every six months.",
            "The State of AI in 2025 (McKinsey / QuantumBlack, 2025) — competition: 88% of organizations report using AI in at least one function (up from 78% a year earlier); 72% use generative AI (from 33%).",
            "The Future of Jobs Report 2025 (World Economic Forum, 2025) — 86% of employers expect AI to transform their business by 2030 — employers themselves treat it as inevitable, not optional.",
            "Business Trends and Outlook Survey: AI Use in Businesses (US Census Bureau, 2026) — uneven: firm AI adoption ranges from about 6% of the smallest firms to about 37% of firms with 250+ staff.",
            "LLM Inference Prices Have Fallen Rapidly but Unequally (Epoch AI, 2025) — the price to hit a given benchmark falls a median of about 50x per year (range 9x-900x by task) — cost is collapsing, but even the collapse is uneven.",
          ] },
          { h: "The one thing to remember", p: "Three forces make this permanent — cost falling, competition, compounding capability. It's a tide, not a fad. But it's uneven: that sets your timeline, not your fate. Ask 'how fast, for me — and what's my window?' — then move early." },
        ],
      },
    ],
  },
  {
    slug: "levers", title: "Your Six Levers", blurb: "The six forces that decide who's exposed and who's protected.",
    lessons: [
      {
        key: "sig-automatability", title: "Automatability", minutes: 5,
        summary: "An exposing signal: how much of your work today's AI can already do. It essentially only climbs.",
        sections: [
          { h: "What it measures", p: ["This is the most direct of the six. It asks, bluntly: how much of your work can today's AI already do? It's one of the two signals that raise your exposure — the more of your day is language, patterns and on-screen tasks, the higher it runs.", "We score how much of the actual work — the tasks, not the title — is the kind of thing today's AI does well: reading, writing, analyzing, summarizing, generating, and deciding by rule. Anything that lives mostly in language and patterns on a screen runs high. High automatability doesn't mean your job vanishes tomorrow — it means a large share of your tasks are already in range. Like every signal it's a span, not a dot: two people with the same title can score very differently depending on what they actually do.", "The scoring question: how much of this work is language, patterns and on-screen tasks that AI can already do reliably?"] },
          { h: "What raises it", bullets: [
            "Work that's mostly text, language or code",
            "Repeatable analysis and rule-based decisions",
            "On-screen, remote, fully digital tasks",
            "Standardized, high-volume outputs",
          ] },
          { h: "What lowers it", p: "You'll notice the 'lowers it' column is the four protective signals. That's not a coincidence — Automatability is high wherever the protective signals are low, and vice versa. Moving your work toward this column is one of your two edges.", bullets: [
            "Physical, in-person, hands-on work",
            "Genuinely novel, first-of-its-kind calls",
            "Deep relationships and trust",
            "Anything a licensed human must do",
          ] },
          { h: "Across careers", p: "The tell is always the shape of the task, not the prestige of the job.", bullets: [
            "High: a paralegal doing document review, an analyst building standard reports, a copywriter producing routine content — words and numbers on a screen.",
            "Lower: a courtroom advocate, a field engineer, a nurse at the bedside — the same broad professions, but anchored in presence, novelty or trust.",
          ] },
          { h: "How this signal can move", p: "Of all six, Automatability is the one that essentially moves only one way — up, as AI gets more capable (that's the moving line from The Machine). Two things to hold onto: 'automatable' doesn't mean 'simple' — generative AI came for sophisticated cognitive work too, and higher-paid, more-educated knowledge roles often score high here, not low. And what's out of reach today can be in reach next year, which is exactly why we re-score twice a year. Read this signal as 'where the line is heading,' not just where it is." },
          { h: "In your Map", p: "In your Map, we score your work's automatability — from your real tasks, your field and your phase — and it becomes one of your six scores, each with a one-line 'why.' You have two ways to act on a high score, straight from Build: lower it by moving tasks toward the protective signals, or flip it by becoming the one who directs the AI instead of the one it replaces." },
          { h: "The evidence", bullets: [
            "GPTs are GPTs: Labor Market Impact Potential of LLMs (Eloundou, Manning, Mishkin & Rock, 2023 / Science 2024) — about 80% of US workers have at least 10% of tasks exposed to LLMs (about 19% see at least 50%), and higher-paid, more-educated work is among the most exposed. Automatable does not mean simple.",
            "What Can Machines Learn, and What Does It Mean for Occupations? (Brynjolfsson, Mitchell & Rock, 2018) — scored 18,000+ tasks: most occupations hold some automatable tasks but very few are automatable end to end. Exposure is task-level — the reason your score is a span.",
          ] },
          { h: "In a line", p: "Automatability asks how much of your work AI can already do. It essentially only climbs, and 'automatable' doesn't mean 'simple.' Lower it by moving toward what AI can't — or win by directing the machine." },
        ],
      },
      {
        key: "sig-ladder", title: "The Ladder", minutes: 5,
        summary: "An exposing signal: is the path into and up your field eroding — and how far up does it go?",
        sections: [
          { h: "What it measures", p: ["Automatability asks what AI does to your tasks. The Ladder asks what it does to your path — the way you get into a field and climb up it. It's the second exposing signal, and the one people most often miss, because a field can look safe at the top while its foundation quietly washes out.", "We score whether the career path in your field is eroding — the entry-level rungs you climb to get in, and the rungs you climb to get ahead — and how far up that erosion reaches. The junior, learn-the-ropes tasks are usually the most codifiable, so they automate first: the way in narrows even while the senior seats still look secure. Two things push the score up: how much the bottom is thinning, and how deep the erosion climbs. Depth is destabilization — a shallow erosion just squeezes entrants; a deep one shakes the whole field.", "The scoring question: is the path into and up this field being automated — and how high up does it climb?"] },
          { h: "What raises it", bullets: [
            "Entry-level tasks that are highly automatable",
            "Training or apprenticeship done at a screen",
            "Erosion climbing high up the ladder (deep)",
            "'Pipeline' roles being thinned or cut",
          ] },
          { h: "What lowers it", bullets: [
            "A way in that stays hands-on or human",
            "Apprenticeship built on real-world practice",
            "Shallow erosion — only the very bottom",
            "Progression tied to judgment and relationships",
          ] },
          { h: "Across careers", p: "The classic case is law: the partner's judgment is safe, but the junior rungs that lead to it — document review, routine drafting — are automating fast. The top looks fine; the ladder underneath it is breaking, so the field scores high. Contrast a licensed trade, where the way in is a hands-on apprenticeship AI can't sit: intact ladder, lower score. Same question every time — can you still climb in, and up?" },
          { h: "How this signal can move", p: "The pattern today is bottom-up — juniors first. But don't bank on that order: because AI takes tasks, not rungs, it can grab chunks of senior work before it finishes the bottom. Seniority is not a queue ticket. Watch which of your tasks are in range, not just the juniors'. And the depth can grow: a shallow erosion this year can climb higher the next — which is exactly the kind of shift a re-score catches." },
          { h: "In your Map", p: "The Ladder pairs with your phase. This signal scores how high the water has risen on your field's ladder; your career phase says which rung you're standing on. Together they answer the real question: are you underwater, right at the waterline, or safely above it — for now? If the ladder's eroding under you, the move is to climb toward judgment-and-relationship rungs, or step onto a more protected sub-stream." },
          { h: "The evidence", bullets: [
            "Canaries in the Coal Mine? Employment Effects of AI (Brynjolfsson, Chandar & Chen, Stanford, 2025) — early-career workers (22-25) in the most AI-exposed jobs saw about a 13% relative employment decline while older peers held steady — the ladder thinning from the bottom, measured.",
            "The Polarization of the US Labor Market (Autor & Dorn, 2013) — automating routine, codifiable tasks hollows the middle and pressures the ends — the structural shape behind a squeezed ladder.",
          ] },
          { h: "In a line", p: "The Ladder scores whether the way into and up your field is eroding — and how deep it climbs. It thins bottom-up today, but seniority is no queue ticket. Read it with your phase: field sets the water, phase sets your rung." },
        ],
      },
      {
        key: "sig-physical", title: "Physical presence", minutes: 5,
        summary: "A protective signal: must the work be done in person, with a body, in the real world?",
        sections: [
          { h: "What it measures", p: ["The first of the four protective signals — and the most literal. Today's AI is a genius on a screen and helpless in a room. Work that has to happen with hands, bodies and presence, in a real place, is the hardest of all to automate. The more of your work lives in the physical world, the lower your exposure runs.", "We score how much of the work must happen in the physical world — with your hands, your body, your presence, in a specific place, often with other people or things that can't be moved to a screen. This is Moravec's paradox in action: the things that feel effortless to a human — perceiving, moving, manipulating the world — are the very things machines find hardest. The more your value is embodied, the more protected you are, because AI can generate a plan for the job but it can't turn up and do it.", "The scoring question: how much of this work has to be done in person, with a body, in the real world?"] },
          { h: "What lowers it", bullets: [
            "Hands-on, manual, dexterous work",
            "Being physically present with people",
            "Work tied to a specific place or object",
            "Perception and movement in the real world",
          ] },
          { h: "What raises it", bullets: [
            "Work that's entirely on a screen",
            "Fully remote, digital-only tasks",
            "Outputs that are just text, data or code",
            "Nothing that needs a body in the room",
          ] },
          { h: "Across careers", p: "An electrician, a nurse at the bedside, a chef, a plumber, a physical therapist — all score low exposure here, because the value is in the hands and the presence, not the paperwork around it. A fully-remote analyst or a content writer scores high: nothing they do needs a body in a place. And within one field it splits — the nurse at the bedside is protected; the same nurse doing utilization review on a screen is not." },
          { h: "How this signal can move", p: "Here's the honest caveat: physical presence is protective because robotics lags the software, not because it's impossible. AI's mind is racing ahead of its body — for now. A genuine leap in dexterous, general-purpose 'physical AI' would pull this floor lower, and it's an area advancing fast. So treat a low score here as durable, not permanent — the slowest-eroding ground, which is exactly why we re-score and why the strongest position pairs it with becoming AI-native too." },
          { h: "In your Map", p: "In your Map, a high physical-presence share pulls your overall exposure down and shows up as one of your six scores. If you sit in an exposed field, one of the clearest moves is toward its physical sub-stream — the hands-on, in-person corner where the water rises slowest. Presence is a moat; just don't assume it's a permanent one." },
          { h: "The evidence", bullets: [
            "Mind Children: The Future of Robot and Human Intelligence (Hans Moravec, 1988) — Moravec's paradox: perception, dexterity and moving through the world are what machines find hardest. As Steven Pinker put it, 'the hard problems are easy and the easy problems are hard.' The basis of the physical moat.",
          ] },
          { h: "In a line", p: "Physical presence protects you because AI has a mind but no body — for now. The more your value is in hands, bodies and places, the lower your exposure. A durable moat, not a permanent one." },
        ],
      },
      {
        key: "sig-trust", title: "Trust and accountability", minutes: 5,
        summary: "A protective signal: does someone need a human they can trust — and hold responsible — when it matters?",
        sections: [
          { h: "What it measures", p: ["Some work can be wrong and it barely matters. Other work carries consequences — money, health, safety, reputation — and when it does, people need a human they can trust, and hold responsible if it goes wrong. A machine can produce the answer, but it can't be accountable for it. The more your role rests on trust and liability, the more protected you are.", "We score how much the work depends on a human being trusted and accountable — someone who signs their name, carries the liability, and can be held responsible when the stakes are real. This is the flip side of a genuine gap in AI: a model cannot bear responsibility. If it's wrong, it can't be sued, struck off, or held to account — so in high-stakes work a human has to stay in the loop as the accountable party.", "The scoring question: when this work matters, does someone need a human they can trust and hold responsible?"] },
          { h: "What lowers it", bullets: [
            "High-stakes decisions with real consequences",
            "Legal or financial liability attached",
            "Deep, personal client relationships",
            "Someone must sign and stand behind it",
          ] },
          { h: "What raises it", bullets: [
            "Low-stakes work where errors are cheap",
            "No liability and no one to answer to",
            "Anonymous, transactional, one-off tasks",
            "Nobody needs to trust you in particular",
          ] },
          { h: "Across careers", p: "A doctor, a lawyer, a financial adviser, an auditor, a safety engineer — all carry accountability that a model can't. AI can draft the advice; a human still has to own it. Score: protected. An anonymous back-office processor or a producer of low-stakes, disposable content scores high — nothing rides on a trusted human. Notice this often travels with a real, named relationship: being the person a client actually relies on is itself the moat." },
          { h: "How this signal can move", p: "This is the 'responsibility gap' — and it rests on today's norms about who we'll allow to be responsible, not on a hard law of nature. As AI proves itself, society may get comfortable letting it carry more (think how quickly we trusted autopilot, or algorithmic trading). If the norms and rules shift to accept AI accountability in a domain, this moat drains there. So it protects — but keep an eye on where trust is quietly being re-assigned." },
          { h: "In your Map", p: "In your Map, a high trust-and-accountability share lowers your overall exposure and appears as one of your six scores. If you're exposed, a strong move is toward the work where you are the accountable, trusted human — deepen the relationships, take on the sign-off, own the high-stakes calls. Value pools around the person who can be held responsible." },
          { h: "The evidence", bullets: [
            "The Responsibility Gap: Ascribing Responsibility for the Actions of Learning Automata (Andreas Matthias, 2004) — a machine's behavior can't be fully predicted or controlled, so it cannot be held morally responsible or liable — the canonical case for why a human must remain the accountable decision-maker.",
          ] },
          { h: "In a line", p: "A model can be right or wrong, but it can't be accountable. Where the stakes are real, people need a human to trust and hold responsible — and that human is protected. Watch the norms: trust can be re-assigned." },
        ],
      },
      {
        key: "sig-licensing", title: "Licensing", minutes: 4,
        summary: "A protective signal: does the law require a licensed human to do this work?",
        sections: [
          { h: "What it measures", p: ["This one is the bluntest moat of all, and it has nothing to do with what the technology can do. Some work is simply reserved by law for a licensed human. However capable AI becomes at the underlying task, if the rules say a credentialed person must do it — or sign off on it — then a human stays in the loop by regulation.", "We score whether the work is legally gated — reserved for someone with a license, certification or statutory sign-off. It's the one signal that's regulatory, not technical: it protects a role even when AI can do the task perfectly well, because the law still requires a qualified human to be the one who does it (or takes responsibility for it). About 1 in 3 US workers holds some kind of government license or certification, so this is a bigger moat than people assume — and where it applies, it's a hard wall.", "The scoring question: does the law require a licensed or credentialed human to do — or sign off on — this work?"] },
          { h: "What lowers it", bullets: [
            "A legal license is required to practice",
            "Statutory sign-off by a named professional",
            "Regulated, safety-critical work",
            "Strong professional-body gatekeeping",
          ] },
          { h: "What raises it", bullets: [
            "No credential or license needed",
            "Anyone (or anything) may legally do it",
            "Unregulated, low-oversight work",
            "No statutory human in the process",
          ] },
          { h: "Across careers", p: "A doctor, a pilot, a lawyer, a certified public accountant, an electrician, a pharmacist — all sit behind a license. AI can help them enormously, but it can't legally be them: the prescription, the audit opinion, the safety certificate all need a credentialed human's name. Score: protected. A general knowledge worker with no required credential scores high — nothing legal stops the task being automated. The moat isn't skill; it's statute." },
          { h: "How this signal can move", p: "The crucial caveat: licensing is a legal barrier, not a technical one — which means it can be loosened. The day regulators permit an AI to diagnose, sign a return, or fly the aircraft, the moat drains, regardless of the profession's history. Pressure to relax licenses tends to rise when the technology is clearly capable and the cost savings are large. So a high score here is protective but politically contingent — watch the regulation in your field, not just the technology." },
          { h: "In your Map", p: "In your Map, a license lowers your overall exposure and shows as one of your six scores. If you're in an exposed field, moving toward its licensed sub-stream — the credentialed, sign-off-bearing corner — is one of the most durable protections available, precisely because it's backed by law. Just keep one eye on whether that law is under review." },
          { h: "The evidence", bullets: [
            "Analyzing the Extent and Influence of Occupational Licensing on the Labor Market (Kleiner & Krueger, 2013) — about 29% of US workers are required to hold a government license (about 35% licensed or certified) — regulation keeps a credentialed human in the role, independent of what AI can technically do.",
          ] },
          { h: "In a line", p: "Licensing protects by law, not skill — where a credentialed human is legally required, AI can't take the role however capable it gets. A hard wall, but a political one: regulators can move it." },
        ],
      },
      {
        key: "sig-judgment", title: "Judgment", minutes: 5,
        summary: "A protective signal: how often does the work hit genuinely new, high-stakes calls no playbook covers?",
        sections: [
          { h: "What it measures", p: ["The last of the six, and the deepest. AI is brilliant at the patterned and the precedented — the situations that look like something it has seen before. It is weakest at the genuinely new, ambiguous, high-stakes call where there's no playbook, the data is thin, and someone has to decide anyway. The more your work turns on that kind of judgment, the more protected you are — and the more valuable you become as everything routine gets automated around you.", "We score how much of the work is novel, tacit, high-stakes judgment — decisions where the situation is genuinely new, the right answer isn't written down, and getting it wrong is costly. This is Polanyi's paradox: 'we know more than we can tell.' So much real expertise is intuition built from experience that can't be fully articulated — and what can't be articulated is hard to automate. Routine, rule-based decisions score high exposure; the ones that need a wise human on an un-scripted call score low.", "The scoring question: how often does this work require novel, high-stakes judgment that no playbook covers?"] },
          { h: "What lowers it", bullets: [
            "Genuinely new, first-of-its-kind situations",
            "Ambiguous calls with thin or conflicting data",
            "High stakes, where being wrong is costly",
            "Tacit expertise built from real experience",
          ] },
          { h: "What raises it", bullets: [
            "Routine, repeatable decisions",
            "Clear rules or a known playbook to follow",
            "Low stakes, easily reversible calls",
            "Anything a checklist could do",
          ] },
          { h: "Across careers", p: "An ER physician facing an unusual presentation, a crisis leader, a strategist reading an ambiguous market, a senior negotiator — all live on novel judgment, and score protected. A role that mostly applies a fixed rulebook — routine claims, standard approvals, by-the-numbers processing — scores high, because a checklist is exactly what AI does best. The tell is the proportion of un-scripted calls, not the seniority of the title." },
          { h: "How this signal can move", p: "Judgment is the last thing to automate — but 'last' isn't 'never.' AI's ability to handle harder, less-scripted problems keeps climbing (that's the moving line from The Machine). So even here, treat a low score as the most durable protection you have, not a permanent one. The winning stance is the one from Build's inner game: don't just have judgment — train it, and become the person who directs the AI rather than the one it out-reasons. Good judgment plus AI-native fluency is the strongest position of all." },
          { h: "In your Map", p: "In your Map, a high judgment share lowers your overall exposure and appears as one of your six scores. It's also the signal that most directly points into Build: deepen the novel, high-stakes judgment in your work, and pair it with becoming AI-native. As the routine drains away, the judgment layer is exactly where your value elevates — this signal is the human ground the whole framework is trying to move you toward." },
          { h: "The evidence", bullets: [
            "Why Are There Still So Many Jobs? (David Autor, 2015) — names Polanyi's paradox — 'we know more than we can tell' — to explain why work demanding flexibility, judgment and common sense resists automation. The economic case for the judgment moat.",
          ] },
          { h: "In a line", p: "Judgment protects you where the situation is new, ambiguous and high-stakes — the last thing to automate. Don't just have it: train it, and pair it with directing the AI. That's the strongest ground there is." },
        ],
      },
    ],
  },
  {
    slug: "strategy", title: "Renovate or Relocate", blurb: "The two edges, and the play you choose.",
    lessons: [
      {
        key: "edges", title: "The two edges", minutes: 3,
        summary: "Master the machine on what it's taking; deepen what it can't take.",
        sections: [
          { h: "Edge 1 — master the machine (Renovate)", p: "On the exposing levers, don't run — get faster than everyone else. Become the person in your lane who does the AI-assisted work best. This is Renovate: rebuild how you work around the tools so you set the pace instead of being outpaced." },
          { h: "Edge 2 — deepen what AI can't take", p: "On the protecting levers, invest. Move your value toward judgment, trust, the credential, the hands-on. This is where durable advantage lives — the parts of the work that get more valuable, not less, as the routine parts get automated." },
        ],
      },
      {
        key: "play", title: "Guard, Shift, or Relocate", minutes: 3,
        summary: "Your Map names one of three plays for Edge 2. Here's what each means.",
        sections: [
          { h: "Guard the moat", p: "You already sit on strong protection — a license, deep trust, real judgment. The play is to guard and deepen it: make the protected part more of your work, and don't let the routine parts define you." },
          { h: "Shift lanes", p: "You're exposed where you are, but a nearby lane rewards the same skills with far more protection. The play is a lateral move toward that ground — same you, safer footing." },
          { h: "Relocate", p: "The exposure is high and the protection is thin. The honest play is a deliberate move to different ground — planned, not panicked. Relocate is the hardest play and sometimes the only right one." },
        ],
      },
    ],
  },
  {
    slug: "shifts-read", title: "Reading the Shifts", blurb: "How to stay ahead once you've started.",
    lessons: [
      {
        key: "signals", title: "Reading the change — signal from noise", minutes: 7,
        summary: "Most AI news is noise. Four filters pull the rare signal that actually moves your position.",
        sections: [
          { h: "The problem: fast, loud, and built to be shared", p: ["Everything you've learned keeps moving, and the news about it is fast, loud, and mostly designed to be shared, not to be useful. Every single week there's a new model, a jaw-dropping demo, a terrifying headline, a confident prediction that everything's about to change — and an equally confident one that it's all overblown. Most of it is engineered for clicks and shares, not for your career decisions.", "The volume alone pushes people into one of two losing places: panic (reacting to every scary headline as if the sky fell today) or tune-out (deciding it's all hype and ignoring the whole thing). Both are ways of not reading the change — one overreacts to noise, the other misses the signal. The goal isn't to consume more. It's to consume better — to build a cheap, repeatable filter so you can glance at the week's flood, extract the one thing that matters to you, and get on with your life. That filter is four questions."] },
          { h: "The four filters", p: "Run the week's flood through these, in order:", bullets: [
            "Capabilities, not demos. A demo shows what AI did once, in ideal conditions, on a stage. A capability is what it can do reliably, in real work, at your fingertips. Don't ask 'did it do that?' Ask 'can it do that dependably, for the kind of work I actually do?' Most demos never survive that question.",
            "Adoption, not announcements. An announcement is a press release; adoption is people actually using the thing to get real work done. The world changes when the second happens, not the first — and there's usually a long lag between them. Weight your attention toward what's being used over what's being launched.",
            "Which of your six does it move? For any piece of news, ask: does it make more of my work automatable, erode my field's ladder further, or change what's protected? If yes, that's signal, and it might be worth a re-map. If you can't connect it to a signal, it's almost certainly noise, however loud. Most news moves none of your six.",
            "Hold your assumptions loosely. The people who read the change best don't cling to a fixed story ('AI will never do X' / 'AI will do everything by Tuesday'). They hold a working view and update it as evidence lands. Strong opinions, loosely held.",
          ] },
          { h: "The trap in one line: short run vs long run", p: ["There's a famous rule of thumb that captures the whole skill: we tend to overestimate what a technology will do in the short run, and underestimate what it will do in the long run. It's usually attributed to Roy Amara of the Institute for the Future, and it has held up for fifty years.", "Hold both halves at once and you're immune to the two failure modes. The short-run overestimate is the hype — the demo that was going to change everything this quarter and didn't; that's the noise you learn to let pass. The long-run underestimate is why you never tune out — because the drumbeat of 'it's overblown' is exactly how people miss the tide. Don't panic at the hype; don't bet against the long run. That's reading the change in a sentence."] },
          { h: "Why this is the meta-skill", p: "Every other shift you've learned keeps moving: the machine gets more capable, the levers shift, the ladder reshapes, new openings appear, the forces grind on. A read of your position is only ever a snapshot — and reading the change is the skill that keeps that snapshot from going stale. It's the meta-skill of Evolve: the habit that lets you re-learn, re-map and re-build forever, instead of learning this once and slowly falling out of date." },
          { h: "The weekly brief habit", p: ["You don't have to run these filters over the whole flood by yourself; that's a job the community shares. A weekly brief is reading the change in practice — running the week's noise through exactly these four filters and passing on only what survives. Every item that makes the cut comes with two things attached:", "Why it made the cut — the principle it passed: a real, reliable capability (not a demo), genuine adoption (not an announcement), something that actually moves the board. And which of your Six Signals it shifts — every item tagged to the signal(s) it moves. If we can't name the signal, it doesn't go in. So the brief is the opposite of a firehose. It's the de-noised signal — already filtered, already tagged — so you can spend a couple of minutes a week staying genuinely current instead of hours getting anxious."] },
          { h: "The evidence", bullets: [
            "Amara's Law (Roy Amara, Institute for the Future, 1970s) — 'we tend to overestimate the effect of a technology in the short run and underestimate the effect in the long run.' The whole signal-vs-noise skill in one sentence.",
            "Gartner Hype Cycle — 2025 AI (Gartner, 2025) — names the shape of hype (Peak of Inflated Expectations, Trough of Disillusionment, Plateau). In 2025 it placed generative AI in the Trough — 'a course correction, not a defeat.'",
            "Superforecasting — why foxes beat hedgehogs (Tetlock & Gardner, 2015) — across decades of forecasts, 'foxes' who hold many views and update often beat 'hedgehogs' who force everything through one theory. The evidence for holding assumptions loosely.",
            "Navigating the Jagged Technological Frontier (Dell'Acqua et al., Harvard/BCG, 2023) — AI lifted work inside its frontier but made people 19 points more likely to be wrong just outside it. A demo can't tell you which side your work is on.",
            "The State of AI in 2025 (McKinsey / QuantumBlack, 2025) — 88% of organizations use AI, but nearly two-thirds haven't scaled it and only about 39% see bottom-line impact. The gap between announcement and adoption, quantified.",
          ] },
          { h: "The one thing to remember", p: "Most AI news is noise. Run the week's flood through four filters — capabilities not demos, adoption not announcements, does it move one of my six, hold loosely — and act only on the rare signal. Don't panic at the hype; don't bet against the long run." },
        ],
      },
      {
        key: "rescore", title: "Why we re-score", minutes: 2,
        summary: "The field moves, so your Map has to move with it — on a cadence.",
        sections: [
          { h: "Two clocks", p: "Your personal factors change as you put in the work — so you re-score those every two months. The market baseline changes as AI improves — so Pivotum re-scores your lane every six. Between them, your Map stays honest instead of drifting out of date." },
          { h: "Effort shows up here", p: "Re-scoring is also where your work pays off visibly: the reps you logged, the moves you shipped, the protection you deepened all show up as your exposure comes down. That's the loop closing — and the reason to keep going." },
        ],
      },
    ],
  },
];

export const ALL_LESSONS: Lesson[] = CURRICULUM.flatMap((m) => m.lessons);
export const LESSON_BY_KEY: Record<string, Lesson> = Object.fromEntries(ALL_LESSONS.map((l) => [l.key, l]));

export function findLesson(key: string): { lesson: Lesson; module: Module; prev: Lesson | null; next: Lesson | null } | null {
  const lesson = LESSON_BY_KEY[key];
  if (!lesson) return null;
  const module = CURRICULUM.find((m) => m.lessons.some((l) => l.key === key))!;
  const idx = ALL_LESSONS.findIndex((l) => l.key === key);
  return { lesson, module, prev: ALL_LESSONS[idx - 1] ?? null, next: ALL_LESSONS[idx + 1] ?? null };
}

/** Set of completed lesson keys (without the `learn:` prefix). */
export async function getLearnProgress(userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const rows = await db.select({ key: lessonProgress.lessonKey, status: lessonProgress.status })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.memberId, userId), like(lessonProgress.lessonKey, "learn:%")));
  const done = new Set<string>();
  for (const r of rows) if (r.status === "complete") done.add(r.key.replace(/^learn:/, ""));
  return done;
}

export function learnTotals(done: Set<string>) {
  const total = ALL_LESSONS.length;
  const complete = ALL_LESSONS.filter((l) => done.has(l.key)).length;
  return { total, complete, pct: total ? Math.round((complete / total) * 100) : 0 };
}
