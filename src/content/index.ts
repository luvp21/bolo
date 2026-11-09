// Seed content. All text here is original. Add more only after the core loop works.

export interface TechPassage {
  id: string;
  title: string;
  /** Short noun phrase for prompts, e.g. "caching". */
  subject: string;
  /** Read aloud in stage 1, recalled in stage 2. About 60 to 80 words so it fits in 30 s. */
  text: string;
  /** Passed to Prisma as `keyterms` so jargon is transcribed correctly. */
  keyterms: string[];
  /** Stage 3: the user builds their own explanation from this topic. */
  topic: string;
  /** Words the user should try to use in stage 3. */
  keywords: string[];
}

export const TECH_PASSAGES: TechPassage[] = [
  {
    id: "rest-api",
    subject: "REST APIs",
    title: "What is a REST API?",
    text: "A REST API lets two programs talk over the internet using simple requests. The client sends a request to a URL, and the server replies with data, usually in JSON. Each request is independent, so the server does not remember earlier calls. This makes REST easy to scale, because any server in a group can answer any request.",
    keyterms: ["REST", "API", "JSON", "client", "server", "URL", "stateless"],
    topic: "Explain what a REST API is to a friend who has never coded.",
    keywords: ["request", "response", "JSON", "stateless"],
  },
  {
    id: "caching",
    subject: "caching",
    title: "Why caching makes apps fast",
    text: "Caching means keeping a copy of data close to where it is needed. When a user asks for the same page again, the app returns the saved copy instead of doing the slow work twice. The trade-off is freshness. If the original data changes, the cache may show an old answer until it expires or is cleared.",
    keyterms: ["caching", "cache", "latency", "Redis", "expiry", "TTL"],
    topic: "Explain caching and its trade-off to a junior developer.",
    keywords: ["cache", "latency", "stale data", "expiry"],
  },
  {
    id: "git-branching",
    subject: "Git branches",
    title: "Git branches in plain words",
    text: "A Git branch is a separate line of work inside the same project. You can try a new feature on its own branch without breaking the main code. When the feature is ready, you merge it back. If something goes wrong, you simply delete the branch and the main code stays safe.",
    keyterms: ["Git", "branch", "merge", "commit", "main", "pull request"],
    topic: "Explain Git branches to a new teammate on their first day.",
    keywords: ["branch", "merge", "main", "pull request"],
  },
  {
    id: "docker",
    subject: "Docker",
    title: "Docker, simply",
    text: "Docker packages an application together with everything it needs to run, such as libraries and settings. This package is called a container. Because the container is the same everywhere, the app behaves the same on your laptop, on a teammate's machine, and on the production server. That removes the classic problem of it works on my machine.",
    keyterms: ["Docker", "container", "image", "production", "dependencies"],
    topic: "Explain why teams use Docker, in your own words.",
    keywords: ["container", "image", "dependencies", "production"],
  },
  {
    id: "db-index",
    subject: "database indexes",
    title: "What a database index does",
    text: "A database index works like the index at the back of a book. Instead of reading every row to find a match, the database jumps straight to the right place. Queries become much faster, especially on large tables. The cost is extra storage and slightly slower writes, because the index must be updated whenever data changes.",
    keyterms: ["database", "index", "query", "table", "rows", "SQL"],
    topic: "Explain database indexes and their cost to an interviewer.",
    keywords: ["index", "query", "table scan", "writes"],
  },
  {
    id: "ci-cd",
    subject: "CI and CD",
    title: "CI and CD",
    text: "Continuous integration means every code change is automatically built and tested. Continuous delivery goes one step further and prepares each good change for release. Together they catch bugs early and make releases boring, which is exactly what a team wants. Small, frequent releases are safer than one big release every few months.",
    keyterms: ["CI", "CD", "pipeline", "build", "deploy", "GitHub Actions"],
    topic: "Explain CI and CD in an interview answer.",
    keywords: ["pipeline", "tests", "deploy", "release"],
  },
];

export interface Angle {
  id: string;
  label: string;
  /** Turns a subject ("caching") into the stage 4 task. */
  prompt: (subject: string) => string;
}

/** Stage 4 "pick your angle" chips. The chosen one becomes the task prompt. */
export const TECH_ANGLES: Angle[] = [
  { id: "friend", label: "Explain to a friend", prompt: (s) => `Explain ${s} to a friend who does not code.` },
  { id: "interview", label: "Interview answer", prompt: (s) => `An interviewer asks you about ${s}. Answer in 30 seconds.` },
  { id: "reel", label: "30 second reel script", prompt: (s) => `Record a 30 second reel about ${s}. Open with a hook.` },
  { id: "standup", label: "Explain it to your team", prompt: (s) => `Tell your team why ${s} matters for your project.` },
];

export function findPassage(id: string): TechPassage | undefined {
  return TECH_PASSAGES.find((p) => p.id === id);
}

export interface GrammarItem {
  id: string;
  /** Stage 1: read aloud. */
  sentence: string;
  /** Stage 3: make your own sentence using this pattern or word. */
  buildPrompt: string;
  /** What this item teaches, shown after the attempt. */
  rule: string;
}

export const GRAMMAR_ITEMS: GrammarItem[] = [
  { id: "g1", sentence: "I have been working on this project since last month.", buildPrompt: "Say what you have been doing since this morning. Use 'have been' and 'since'.", rule: "Present perfect continuous with 'since' for a start point." },
  { id: "g2", sentence: "If I had more time, I would learn another language.", buildPrompt: "Say one thing you would do if you had a free week. Use 'If I had... I would...'.", rule: "Second conditional for unreal present situations." },
  { id: "g3", sentence: "She suggested that we should start the meeting early.", buildPrompt: "Suggest something to a teammate. Use 'suggested that'.", rule: "Reporting a suggestion with 'suggest that'." },
  { id: "g4", sentence: "The server was down for two hours yesterday.", buildPrompt: "Describe a problem you faced last week. Use past simple and a duration.", rule: "Past simple with 'for' plus a duration." },
  { id: "g5", sentence: "Could you please explain how this function works?", buildPrompt: "Politely ask a senior for help with something. Start with 'Could you'.", rule: "Polite requests with 'Could you'." },
  { id: "g6", sentence: "He doesn't know the answer, but he is trying to find it.", buildPrompt: "Contrast two things about yourself using 'but'.", rule: "Present simple and present continuous side by side." },
];

export interface ConvoScenario {
  id: string;
  title: string;
  scenario: string;
  persona: string;
  opener: string;
}

export const CONVO_SCENARIOS: ConvoScenario[] = [
  { id: "standup", title: "Daily stand-up", scenario: "A team stand-up meeting. The user gives a quick update on yesterday, today and any blockers.", persona: "A friendly engineering manager who asks short follow-up questions.", opener: "Morning! Quick stand-up. What did you work on yesterday?" },
  { id: "hr", title: "Tell me about yourself", scenario: "The opening of a campus placement interview for a software role.", persona: "A calm HR interviewer who probes for specifics and gently pushes for detail.", opener: "Thanks for coming in. To start, tell me a little about yourself." },
  { id: "bug", title: "Explain a bug", scenario: "The user explains a production bug and how they fixed it to a non-technical product manager.", persona: "A curious product manager who asks 'why does that matter?' and avoids jargon.", opener: "Hey, I heard something broke last night. Can you explain what happened in simple words?" },
  { id: "project", title: "Walk me through your project", scenario: "A technical interview round where the user presents their best project.", persona: "A senior engineer who asks about design choices and trade-offs.", opener: "Pick one project you are proud of and walk me through it." },
];

export interface CreatorPrompt {
  id: string;
  title: string;
  /** Stage 1: read to camera. */
  script: string;
  /** Stage 3: build your own. */
  buildPrompt: string;
  keyterms: string[];
}

export const CREATOR_PROMPTS: CreatorPrompt[] = [
  { id: "c1", title: "Hook and teach", script: "Most developers waste hours on one mistake. They write code before they understand the problem. Here is a simple three step habit that fixes it. Step one, write the problem in one sentence. Step two, write an example input and output. Step three, only then open your editor.", buildPrompt: "Teach one tip you wish you knew a year ago. Start with a hook in the first sentence.", keyterms: ["developers", "input", "output", "editor"] },
  { id: "c2", title: "Tool in 30 seconds", script: "Here is a tool that saves me an hour every week. It watches my files and reruns my tests every time I save. No more switching windows, no more forgetting to test. If you write code daily, try it for one week and tell me what changed.", buildPrompt: "Introduce a tool or shortcut you use and why. Hook, benefit, call to action.", keyterms: ["tests", "files", "tool"] },
  { id: "c3", title: "Story of a failure", script: "Last year my project crashed during a demo, in front of the whole class. I froze for ten seconds. Then I opened the logs, found the bug, and fixed it live. The lesson was simple. Panic is slow, logs are fast.", buildPrompt: "Tell a short story about something that went wrong and what you learned.", keyterms: ["demo", "logs", "bug"] },
  { id: "c4", title: "Myth busting", script: "You do not need to learn ten languages to get a good job. You need one language, a few real projects, and the ability to explain them clearly. Depth beats breadth, and communication beats both.", buildPrompt: "Bust a myth about learning to code or getting a tech job.", keyterms: ["language", "projects", "depth", "breadth"] },
];
