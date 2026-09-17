import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D2-q301",
    domain: 2,
    objective: "2.3",
    stem: "A model routes support tickets into twelve queues. It is accurate everywhere except between \"billing dispute\" and \"billing question\", which it confuses on roughly a third of the tickets that fall near that line. The prompt already defines each category in a full paragraph. What is the most appropriate change?",
    choices: [
      {
        id: "A",
        text: "Add a chain-of-thought instruction so the model reasons about the ticket before assigning a label.",
        rationale:
          "The failure is an ambiguous boundary rather than a skipped reasoning step, so added deliberation mostly produces a longer justification for the same arbitrary call.",
      },
      {
        id: "B",
        text: "Add few-shot examples drawn from the boundary between the two categories, including near-misses on both sides.",
      },
      {
        id: "C",
        text: "Rewrite the two definitions at greater length so the distinction becomes unambiguous in prose.",
        rationale:
          "Longer definitions are what already failed. Some boundaries are genuinely hard to state in prose and much easier to demonstrate with cases.",
      },
      {
        id: "D",
        text: "Merge the two categories, since the distinction is evidently not learnable.",
        rationale:
          "It resolves the metric by deleting a business distinction that downstream routing depends on, which changes the product rather than fixing the classifier.",
      },
    ],
    explanation:
      "Few-shot examples are most valuable exactly where a written definition runs out: the decision boundary between adjacent classes. Examples selected from the confusable region, balanced across both labels, define that boundary by demonstration, which is the technique matched to this specific failure.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["few-shot", "classification"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D2-q302",
    domain: 2,
    objective: "2.3",
    stem: "An assistant answers questions about a company's internal expense policy. Its responses follow the required output format exactly, and it regularly states spending limits that appear nowhere in the policy. The team proposes adding twenty few-shot examples of correctly answered questions. What will that achieve?",
    choices: [
      {
        id: "A",
        text: "It will eliminate the fabricated limits, because the examples demonstrate the correct values.",
        rationale:
          "Twenty examples cover twenty cases; every question outside them still has no grounding, so the model continues to supply plausible numbers of its own.",
      },
      {
        id: "B",
        text: "It will eliminate the fabricated limits provided the examples cover every policy category.",
        rationale:
          "Covering every category with examples means putting the entire policy into the prompt as examples, which is retrieval done badly and at maximum cost.",
      },
      {
        id: "C",
        text: "It will reduce fabrication in rough proportion to how many categories the examples cover.",
        rationale:
          "It assumes examples generalize to unseen categories as facts rather than as form, which is precisely the mistaken assumption this objective targets.",
      },
      {
        id: "D",
        text: "It will reduce fabrication because worked examples make the model more cautious about unsupported claims.",
        rationale:
          "Examples set a target form and tone, and a confident-sounding set of examples is as likely to reinforce confident fabrication as to discourage it.",
      },
      {
        id: "E",
        text: "Very little: the format is already correct, and examples convey form rather than facts, so the fix is to supply the policy in context and require citations.",
      },
    ],
    explanation:
      "The output format is already right, so nothing about the demonstrated shape is failing. Fabricated values are a knowledge problem, and no arrangement of prompt text supplies knowledge the model does not have. The fix is retrieval — put the authoritative policy in context and require answers to cite it or decline.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["few-shot", "hallucination", "retrieval"],
    type: "single",
    correct: "E",
  },
  {
    schemaVersion: 1,
    id: "D2-q303",
    domain: 2,
    objective: "2.3",
    stem: "A pricing assistant computes multi-tier volume discounts. It quotes the tier thresholds and rates correctly every time, but arrives at the wrong final figure on roughly one order in six — always on orders whose quantity crosses two tier boundaries. Which change targets the defect?",
    choices: [
      {
        id: "A",
        text: "Instruct the model to work the calculation through step by step in a delimited section, then state the final figure in the contracted format.",
      },
      {
        id: "B",
        text: "Add few-shot examples of correctly priced orders.",
        rationale:
          "Examples would teach a format the model already produces correctly; the arithmetic across tier boundaries is not something a handful of worked answers generalizes.",
      },
      {
        id: "C",
        text: "Move the workload to a more capable model.",
        rationale:
          "It may help but it is the expensive, untargeted response to a defect that a reasoning instruction addresses directly and at far lower cost.",
      },
      {
        id: "D",
        text: "Retrieve the pricing table into context on every request.",
        rationale:
          "The model already states the thresholds and rates correctly, so the pricing data is evidently present and is not the missing ingredient.",
      },
    ],
    explanation:
      "The facts are right and the result is wrong, which localizes the failure to a skipped intermediate step rather than to missing knowledge or a format problem. That is the canonical case for chain-of-thought, and delimiting the working keeps the reasoning out of the payload the caller parses.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["chain-of-thought", "reasoning"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D2-q304",
    domain: 2,
    objective: "2.3",
    stem: "A team plans to add a chain-of-thought instruction to a high-volume extraction endpoint that currently returns a compact JSON object to an internal service. Which TWO consequences should they plan for? (Select TWO.)",
    choices: [
      {
        id: "A",
        text: "Output tokens and response latency will rise on every request, because the reasoning is generated serially before the answer is produced.",
      },
      {
        id: "B",
        text: "The reasoning text will break the existing output contract unless it is delimited and excluded from what the caller parses.",
      },
      {
        id: "C",
        text: "Input token cost will rise in proportion to the length of the reasoning the model produces.",
        rationale:
          "Reasoning is generated output, not supplied input. Only the short instruction that requests it adds to the input side.",
      },
      {
        id: "D",
        text: "The prompt prefix will stop being cacheable, because chain-of-thought instructions vary with each request.",
        rationale:
          "The instruction is a fixed sentence in the system prompt, so it is as stable and as cacheable as everything else in the prefix.",
      },
      {
        id: "E",
        text: "Extraction accuracy will improve across all fields, since reasoning benefits every extraction task.",
        rationale:
          "Fields that are read straight off the document gain nothing, and the extra generated text can talk the model into an elaborate wrong answer.",
      },
    ],
    explanation:
      "Chain-of-thought buys accuracy on multi-step problems by spending output tokens, which are generated one at a time and therefore dominate wall-clock latency. The second cost is structural: a consumer expecting a compact JSON object will fail on deliberation wrapped around it unless the reasoning is delimited and stripped before parsing.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["chain-of-thought", "latency", "output-contract"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "B"],
  },
  {
    schemaVersion: 1,
    id: "D2-q305",
    domain: 2,
    objective: "2.3",
    stem: "A team's first working prompt for a sentiment-labeling task includes eight worked examples plus an instruction to reason step by step before answering. Accuracy is good. Per-request cost and latency are about three times the budget the product can support. What should they try first?",
    choices: [
      {
        id: "A",
        text: "Move to a smaller model and keep the prompt exactly as it is.",
        rationale:
          "It changes the axis most likely to cost accuracy while leaving in place the two techniques that are actually driving the overspend.",
      },
      {
        id: "B",
        text: "Cut the eight examples to four and keep the reasoning step.",
        rationale:
          "It trims input tokens modestly but retains the reasoning step, which is generating the output tokens that dominate latency on a single-step task.",
      },
      {
        id: "C",
        text: "Remove the chain-of-thought instruction first, since sentiment labeling is a single-step task where reasoning spends output tokens without adding accuracy, and then measure.",
      },
      {
        id: "D",
        text: "Enable prompt caching on the prefix, which will remove the cost and latency difference.",
        rationale:
          "Caching helps with the repeated examples but cannot touch the generated reasoning, which is where most of the added latency and output cost sits.",
      },
    ],
    explanation:
      "Every technique is a cost paid on each request forever, so the question is which one is earning its keep. Chain-of-thought helps where errors come from skipped steps; sentiment labeling has no intermediate steps to skip, making it the first candidate for removal and the one measured before anything else changes.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["chain-of-thought", "cost", "technique-selection"],
    type: "single",
    correct: "C",
  },
] satisfies Question[];
