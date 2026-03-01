import type { ReactNode } from "react";
import Link from "next/link";
import { MODEL_PRICING } from "./knowledge-base";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  content: () => ReactNode;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "ai-agent-cost-2026",
    title: "How Much Does an AI Agent Cost in 2026?",
    description:
      "A data-driven breakdown of AI agent costs — from billing mechanics to multi-turn cost growth to the 200K token pricing tier. Based on real experiments tracking every token and API call.",
    date: "2026-03-01",
    readTime: "10 min read",
    category: "Cost Analysis",
    content: () => (
      <>
        <p>
          I spent the last month building agents from scratch, tracking every token, every API call, every retry. Before I started I had no real idea what these things cost at scale. Here&apos;s what I found.
        </p>

        <h2>How the billing actually works</h2>
        <p>
          Every LLM provider charges the same way: input tokens plus output tokens, priced separately per million.
        </p>
        <p>
          The thing that catches most people off guard is that output tokens cost 2-5x more than input tokens. On Claude Haiku, input is $1 per million tokens, output is $5. On GPT-4o, input is $2.50, output is $10. So every time your agent writes a response, you&apos;re paying at the expensive rate for all of it.
        </p>
        <p>The formula is just:</p>
        <pre><code>cost = (input_tokens / 1,000,000 x input_price) + (output_tokens / 1,000,000 x output_price)</code></pre>
        <p>Simple enough. The hard part is knowing how many tokens you&apos;re actually using.</p>

        <h2>Current model pricing</h2>
        <p>Here&apos;s what agencies are actually working with in 2026:</p>
        <table>
          <thead>
            <tr><th>Model</th><th>Input/MTok</th><th>Output/MTok</th></tr>
          </thead>
          <tbody>
            {Object.values(MODEL_PRICING).map((m) => (
              <tr key={m.label}><td>{m.label}</td><td>${m.input.toFixed(2)}</td><td>${m.output.toFixed(2)}</td></tr>
            ))}
          </tbody>
        </table>
        <p>
          DeepSeek V3 is over 21x cheaper than Claude Sonnet for simple tasks. Most agencies I&apos;ve talked to pick one model and never compare alternatives. That decision alone can mean 10x difference in running costs.
        </p>

        <h2>Why single-turn estimates don&apos;t tell you much</h2>
        <p>
          A one-turn exchange costs almost nothing. A few fractions of a cent. That&apos;s why demos look cheap, and why estimates based on demos are usually wrong.
        </p>
        <p>
          The real cost is in multi-turn conversations. Every time your agent responds, it resends the entire conversation history as input tokens. Turn 1 reads 1 turn of context. Turn 2 reads 2 turns. Turn 3 reads 3. The growth is triangular, not linear.
        </p>
        <p>
          A 10-turn conversation doesn&apos;t cost 10 times a single turn. It costs roughly 55 times a single turn.
        </p>
        <p>
          For a chatbot handling 500 conversations a day, 8-10 turns each, this is where the money goes. Not the individual calls, the accumulation across the conversation.
        </p>

        <h2>The 200K token pricing tier</h2>
        <p>
          Anthropic and most providers have a long context pricing tier. On Claude Sonnet, if your input exceeds 200,000 tokens in a request, the price for every token in that request, input and output, switches to a higher rate. Sonnet goes from $3/$15 to $6/$22.50 per million.
        </p>
        <p>
          One large document injected into context, one conversation thread that grew too long, one agent that accumulated tool results without truncating, that&apos;s enough to double the cost of that response. Most agencies don&apos;t know this threshold exists until they see an unexpected bill.
        </p>

        <h2>Thinking models and reasoning token costs</h2>
        <p>
          Extended thinking models (Claude&apos;s extended thinking, o1, o3) generate invisible reasoning tokens before writing the visible response. Those reasoning tokens are billed as output tokens, which is the expensive tier.
        </p>
        <p>
          If a model thinks for 10,000 tokens then writes a 500-token response, you&apos;re billed for 10,500 output tokens. An agency running a thinking model on 200 conversations a day without a thinking budget cap will spend much more than they planned.
        </p>
        <p>Every SDK that supports thinking models exposes a thinking budget parameter. Most people never set it.</p>

        <h2>When prompt caching actually helps</h2>
        <p>
          Prompt caching stores part of your prompt so the model doesn&apos;t re-read it from scratch every request. Cache reads cost about 10% of the base price, so the savings are real.
        </p>
        <p>
          But there&apos;s a minimum threshold. Anthropic requires at least 1,024 tokens in the cached section before a cache is created. Smaller prompts won&apos;t cache at all.
        </p>
        <p>In my testing, caching made a meaningful difference when:</p>
        <ul>
          <li>The system prompt was large (5,000+ tokens)</li>
          <li>There were many tool definitions (10+ tools adds up fast at 500 tokens per definition)</li>
          <li>The model was expensive (Sonnet or Opus, where input is $3-5/MTok)</li>
          <li>There were many calls per session (10+)</li>
        </ul>
        <p>
          For a simple chatbot with a short system prompt on Haiku, caching saves maybe $0.002 total per session. Not the thing to optimize first.
        </p>

        <h2>Rough cost ranges at different scales</h2>
        <p>These are based on my experiments using Claude Haiku with a 5-turn average conversation, no tools:</p>
        <p><strong>100 conversations/day:</strong> Low: ~$1.50/month, High: ~$6/month</p>
        <p><strong>1,000 conversations/day:</strong> Low: ~$15/month, High: ~$60/month</p>
        <p><strong>10,000 conversations/day:</strong> Low: ~$150/month, High: ~$600/month</p>
        <p>
          Add tool use, switch to Sonnet, or have longer conversations and these numbers jump significantly. A ReAct agent with web search running 10,000 conversations a day on Sonnet is a completely different calculation.
        </p>

        <h2>Where agencies go wrong with estimates</h2>
        <p>
          The pattern I keep seeing: estimate costs from a demo. Run 10 test conversations, divide by 10, multiply by expected volume. This misses tool calls, failure retries, context growth, and the difference between clean demo traffic and real production usage.
        </p>
        <p>
          Production agents behave differently. Users write longer messages. Conversations go more turns. Tool calls fail and get retried. Context windows fill up in ways they didn&apos;t during testing.
        </p>
        <p>By the time the real bill arrives, the client has already been quoted a fixed price.</p>
        <p>
          That&apos;s what AgentQuote is for. Put realistic cost ranges in front of you before you commit to a number, not after.
        </p>
        <p>
          <em>AgentQuote estimates AI agent running costs before you quote a client. <Link href="/estimate">Try it here</Link>.</em>
        </p>
      </>
    ),
  },
  {
    slug: "reduce-agent-costs",
    title: "5 Ways to Reduce Your AI Agent API Costs",
    description:
      "I ran the same query through 6 configurations to find which optimizations actually work. Fuzzy loop detection saved 49%. Budget caps broke the agent. Here's the full data.",
    date: "2026-03-01",
    readTime: "8 min read",
    category: "Optimization",
    content: () => (
      <>
        <p>
          I ran the same query through 6 different configurations to figure out which cost optimizations actually work. Here&apos;s the full data:
        </p>
        <table>
          <thead>
            <tr><th>Configuration</th><th>Cost</th><th>Calls</th><th>Answer Quality</th><th>Savings</th></tr>
          </thead>
          <tbody>
            <tr><td>Naive (no guards)</td><td>$0.0171</td><td>6</td><td>Real answer</td><td>—</td></tr>
            <tr><td>Budget cap</td><td>$0.0099</td><td>4</td><td>Garbage answer</td><td>42%</td></tr>
            <tr><td>Smart truncation</td><td>$0.0105</td><td>4</td><td>Real answer</td><td>39%</td></tr>
            <tr><td>Prompt caching</td><td>$0.0107</td><td>4</td><td>Real answer</td><td>37%</td></tr>
            <tr><td>All combined</td><td>$0.0099</td><td>4</td><td>Partial answer</td><td>42%</td></tr>
            <tr><td>Fuzzy loop detect</td><td>$0.0086</td><td>3</td><td>Real answer</td><td>49%</td></tr>
          </tbody>
        </table>
        <p>
          The budget cap saved the most on paper but returned a useless answer. The agent hit its limit during a string of failed tool calls and gave up. Cost savings don&apos;t mean anything if the agent stops working correctly.
        </p>
        <p>Here&apos;s what actually works.</p>

        <h2>1. Fuzzy loop detection</h2>
        <p>This was the clearest winner at 49% savings.</p>
        <p>
          When a tool fails, the agent retries. That&apos;s reasonable. But when the same tool keeps failing the same way, same query, same error, the agent is stuck. Without detection it keeps retrying until it hits a token limit or your budget runs out.
        </p>
        <p>
          Fuzzy loop detection tracks what tools the agent has called and what came back. After a set number of consecutive failures on the same tool, it blocks that tool for the rest of the session and forces the agent to answer from what it knows.
        </p>
        <p>
          In my test, web search was returning nothing useful. The naive agent made 6 API calls, 4 of them failed searches, each one adding 15-20% to the context window. The loop detection version made 3 calls, caught the pattern after the second failed search, and got a real answer on the third call.
        </p>
        <p>
          Every other optimization I tested tried to make wasted iterations cheaper. Loop detection just eliminated them. That&apos;s why it won.
        </p>

        <h2>2. Don&apos;t send tool definitions to agents that don&apos;t need them</h2>
        <p>
          Each tool definition costs roughly 500 tokens, and those tokens are billed on every single request to that agent.
        </p>
        <p>
          In a multi-agent system, most agents only need 1 or 2 tools. A writer agent doesn&apos;t need web search. A critic agent doesn&apos;t need a calculator. But if you send all tool definitions to all agents, you pay 500 tokens per unused tool per call.
        </p>
        <p>On a 4-agent system with 3 tools, the difference looks like this:</p>
        <ul>
          <li>Selective routing: 4 agents x 500 tokens = 2,000 tokens overhead per round</li>
          <li>All tools to all agents: 4 agents x (3 x 500) tokens = 6,000 tokens overhead per round</li>
        </ul>
        <p>
          3x more tokens for the same result. In my multi-agent experiment, switching non-tool-using agents from the full tool call to a simple call function saved 2,500 input tokens across 5 calls.
        </p>

        <h2>3. Choose a memory strategy deliberately</h2>
        <p>
          Most frameworks default to buffer memory, which means the full conversation history is resent every turn. This works fine for short conversations. For anything longer it becomes the biggest cost driver.
        </p>
        <p>From my Day 5 experiments across 10-turn conversations on the same task:</p>
        <table>
          <thead>
            <tr><th>Memory Strategy</th><th>Token Usage</th><th>Extra API Calls Per Turn</th></tr>
          </thead>
          <tbody>
            <tr><td>Buffer (full history)</td><td>1.0x baseline</td><td>0</td></tr>
            <tr><td>Summary memory</td><td>0.71x</td><td>~0.3</td></tr>
            <tr><td>Entity extraction</td><td>0.45x</td><td>1</td></tr>
            <tr><td>No memory (stateless)</td><td>~0x</td><td>0</td></tr>
          </tbody>
        </table>
        <p>
          Entity extraction saved 55% of tokens vs buffer, but it adds an extra API call every turn for the extraction step. Whether that tradeoff makes sense depends on your model cost. On Opus at $5/MTok input, the token savings easily justify the extra calls. On Haiku at $1/MTok, it&apos;s a closer call.
        </p>
        <p>The point is to pick intentionally. The default is rarely optimal.</p>

        <h2>4. Cap revision loops and give the critic specific criteria</h2>
        <p>
          For evaluator-optimizer patterns (one agent generates, another evaluates), an uncapped revision loop is expensive. If the critic keeps rejecting and the writer keeps revising, you can end up with 5-6 revision cycles. At 2 API calls per round, that&apos;s 10-12 calls for one output.
        </p>
        <p>Two things fix this:</p>
        <p>
          Set a hard revision cap. I use 1 in production setups. After one revision, accept whatever came out.
        </p>
        <p>
          Give the critic specific acceptance criteria, not vague ones. &quot;Review for quality&quot; produces inconsistent verdicts. &quot;Verify: are all claims supported by the research? Is the word count between 300-500? Does it directly answer the original question?&quot; produces consistent PASS/FAIL decisions.
        </p>
        <p>
          In my experiment, the critic flagged the draft as incomplete and triggered a revision. After the revision, the supervisor still marked the output incomplete. Revision loops that don&apos;t converge are expensive and produce bad output anyway.
        </p>

        <h2>5. Prompt caching on large static content</h2>
        <p>
          Cache reads cost about 10% of the base price, so savings are real when caching activates. The catch is Anthropic&apos;s minimum threshold of 1,024 tokens. Smaller content won&apos;t create a cache at all.
        </p>
        <p>Caching makes a real difference when:</p>
        <ul>
          <li>System prompts are large (5,000+ tokens of instructions, examples, reference content)</li>
          <li>There are many tool definitions (10+ tools = 5,000+ tokens just in definitions)</li>
          <li>You&apos;re on an expensive model (Sonnet/Opus where input is $3-5/MTok)</li>
          <li>There are many calls per session (10+)</li>
        </ul>
        <p>Caching doesn&apos;t help much when:</p>
        <ul>
          <li>System prompts are short</li>
          <li>Queries are one-off with no repeated context</li>
          <li>You&apos;re on a cheap model like Haiku</li>
        </ul>
        <p>
          On a well-cached Opus agent with a 5,000-token system prompt making 20 calls per session, caching saves a meaningful amount. On a Haiku chatbot with a 200-token system prompt, it saves close to nothing.
        </p>

        <h2>What not to do: hard budget caps without fallback logic</h2>
        <p>
          Budget caps feel safe. Set a limit, stay under it. The problem is what happens when the agent hits the cap mid-task with nothing useful to show for it.
        </p>
        <p>
          In my test, the $0.008 budget cap returned garbage because the agent burned its budget on failed searches and got cut off before it could fall back to its training knowledge. The naive version, with no cap, eventually gave up on search and wrote a real answer from training data.
        </p>
        <p>
          If you use budget caps, pair them with explicit fallback instructions in the system prompt: something like &quot;if you cannot find information via tools, answer from your training knowledge and note that the answer is unverified.&quot; Without that, a hard cap just means your agent stops working at the worst possible moment.
        </p>
        <p>
          <em>AgentQuote estimates AI agent running costs and surfaces which optimizations will actually move the needle for your architecture. <Link href="/estimate">Try it here</Link>.</em>
        </p>
      </>
    ),
  },
  {
    slug: "multi-agent-cost-multiplier",
    title: "Multi-Agent Systems: The Hidden 4.8x Cost Multiplier",
    description:
      "I ran the same task through a single agent and a 4-agent supervisor system. Same model, same tools, same query. The multi-agent system cost 4.8x more and produced half the output.",
    date: "2026-03-01",
    readTime: "9 min read",
    category: "Architecture",
    content: () => (
      <>
        <p>
          I ran the same task through a single agent and a 4-agent supervisor system. Same model, same tools, same query. The multi-agent system cost 4.8x more and produced half the output.
        </p>
        <p>Here&apos;s what happened and why.</p>

        <h2>The setup</h2>
        <p>
          Task: write a market analysis of AI agencies in 2026, covering market size, key trends, major players, and cost challenges.
        </p>
        <p>Single agent: one Claude Haiku with web search and calculator, running a ReAct loop.</p>
        <p>Multi-agent system:</p>
        <ul>
          <li>Supervisor: breaks down the task, coordinates, synthesizes at the end</li>
          <li>Researcher: runs web searches in a ReAct loop</li>
          <li>Writer: takes research output, writes the analysis</li>
          <li>Critic: reviews the draft, verdict PASS or REVISE</li>
        </ul>
        <p>Same model (Claude Haiku 4.5), same tools, same query.</p>

        <h2>The results</h2>
        <table>
          <thead>
            <tr><th>Metric</th><th>Multi-Agent</th><th>Single Agent</th><th>Ratio</th></tr>
          </thead>
          <tbody>
            <tr><td>Total cost</td><td>$0.085</td><td>$0.018</td><td>4.8x</td></tr>
            <tr><td>API calls</td><td>11</td><td>4</td><td>2.8x</td></tr>
            <tr><td>Input tokens</td><td>45,191</td><td>9,046</td><td>5.0x</td></tr>
            <tr><td>Output tokens</td><td>8,010</td><td>1,737</td><td>4.6x</td></tr>
            <tr><td>Output length</td><td>2,754 chars</td><td>6,028 chars</td><td>0.5x</td></tr>
          </tbody>
        </table>
        <p>Multi-agent cost nearly 5x more and produced half the output.</p>

        <h2>Why: context duplication</h2>
        <p>
          The single agent kept everything in one growing conversation. Turn 1 added some tokens. Turn 2 added a bit more. Information accumulated in one place.
        </p>
        <p>
          The multi-agent system passed context between agents. Every handoff meant the next agent received the full output of the previous one as new input. Those tokens got counted and billed again. And again.
        </p>
        <p>Here&apos;s how the input token count grew across the pipeline:</p>
        <pre><code>{`Supervisor (plan):    239 input tokens   just the original task
Researcher:        36,734 input tokens   task + plan + 6 iterations of search results
Writer:               897 input tokens   plan + truncated research
Critic:             2,290 input tokens   task + research excerpt + full draft
Writer (revision):  2,681 input tokens   draft + feedback + research excerpt
Supervisor (synth): 2,350 input tokens   draft + review`}</code></pre>
        <p>
          The same information, the original task and the research plan, flowed through every agent. Every time it reached a new agent, it was re-tokenized and re-billed as input.
        </p>

        <h2>The researcher ate 57% of the budget</h2>
        <p>Here&apos;s the per-agent cost breakdown:</p>
        <pre><code>{`Agent              Cost     Share
Supervisor plan   $0.004    4.8%
Researcher        $0.049   57.2%
Writer draft      $0.011   13.1%
Critic            $0.005    5.6%
Writer revision   $0.011   12.7%
Supervisor synth  $0.006    6.6%`}</code></pre>
        <p>
          The researcher ran in a loop. 6 iterations, each carrying the accumulated results of all previous iterations. By iteration 6, it was processing the output of 5 previous searches on every new call. That&apos;s where the money went.
        </p>
        <p>
          Any multi-agent system with a tool-using research agent is going to look like this. The research agent will always eat a disproportionate share.
        </p>

        <h2>Quality didn&apos;t compensate</h2>
        <p>
          You&apos;d expect 4.8x more expensive to mean better output. It didn&apos;t.
        </p>
        <p>
          The researcher hit its max iteration limit without synthesizing a clean brief. It kept searching but never stopped to organize what it found. The writer received a pile of raw search results and produced a rough draft.
        </p>
        <p>
          The critic flagged it incomplete and requested a revision. After the revision, the supervisor still marked it &quot;INCOMPLETE.&quot;
        </p>
        <p>
          The single agent reached iteration 4, decided it had enough information, and wrote a complete 6,028-character analysis. It adapted. The pipeline couldn&apos;t.
        </p>

        <h2>When multi-agent actually makes sense</h2>
        <p>
          This isn&apos;t an argument against multi-agent systems. It&apos;s an argument for using them in the right situations.
        </p>
        <p>
          Multi-agent makes sense when tasks are genuinely parallel. Three agents researching different market segments simultaneously, each with their own tools, running concurrently. The context duplication cost is real but you&apos;re getting actual parallelization. Time saved matters in some workflows more than token cost.
        </p>
        <p>
          Multi-agent doesn&apos;t make sense for sequential tasks. If Agent B can&apos;t start until Agent A finishes, and Agent B needs Agent A&apos;s full output, you&apos;re paying the context duplication tax with no parallelization benefit. A well-prompted single agent will do the same job for a fraction of the cost.
        </p>
        <p>
          Before building a multi-agent system, the question to ask is: can these tasks actually run at the same time? If yes, multi-agent might be worth it. If they&apos;re sequential by nature, a single agent with a structured prompt will almost certainly be cheaper and produce better output.
        </p>

        <h2>What this means for pricing agency projects</h2>
        <p>
          When you&apos;re quoting a client on an AI system that researches, writes, reviews, and delivers reports, the cost estimate matters.
        </p>
        <p>The naive calculation: agents x cost per agent.</p>
        <p>
          The real cost: that number, multiplied by a compounding factor for every context handoff in the pipeline.
        </p>
        <p>
          In this experiment, input tokens were 5x higher in the multi-agent system despite both versions having the same tools and the same task. That multiplier scales with the number of agents and how much context each one passes downstream.
        </p>
        <p>
          AgentQuote models this. When you describe a multi-agent system, the calculator applies a context duplication multiplier per agent, based on the measured 1.2x compounding factor from this experiment. That&apos;s why the high-end scenario for a 5-agent pipeline looks much more expensive than just &quot;5 times single agent cost.&quot;
        </p>

        <h2>The practical takeaway</h2>
        <p>Sequential task where one piece of reasoning feeds the next: use a single agent.</p>
        <p>
          Genuinely parallel workload where agents can run concurrently and specialization matters: multi-agent might be worth the cost.
        </p>
        <p>Either way, budget the research or tool-using agent separately. It will always consume more than its proportional share.</p>
        <p>
          <em>AgentQuote estimates multi-agent system costs with context duplication built into the model. <Link href="/estimate">Try it here</Link>.</em>
        </p>
      </>
    ),
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
