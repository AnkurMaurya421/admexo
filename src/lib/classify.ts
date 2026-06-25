// Bonus AI feature: classifies an inbound lead's requirement text into a
// category + priority using OpenAI. Falls back to a rule-based keyword
// classifier if OPENAI_API_KEY is missing, the request errors, or it's
// slow — so a live demo never hangs or breaks on a flaky network/API call.

export type Classification = { category: string; priority: "High" | "Medium" | "Low" };

const VALID_PRIORITIES = ["High", "Medium", "Low"];
const OPENAI_TIMEOUT_MS = 6000;

export async function classifyLead(requirement: string): Promise<Classification> {
  if (process.env.OPENAI_API_KEY) {
    try {
      return await classifyWithOpenAI(requirement);
    } catch (err) {
      console.error("OpenAI classification failed, falling back to rules:", err);
    }
  }
  return classifyLeadRuleBased(requirement);
}

async function classifyWithOpenAI(requirement: string): Promise<Classification> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              'You classify inbound sales leads for a web dev / automation agency. ' +
              'Given a requirement/message, respond ONLY with JSON in this exact shape: ' +
              '{"category": string, "priority": "High" | "Medium" | "Low"}. ' +
              'Category should be a short 2-4 word label, e.g. "AI Automation", "Web Development", ' +
              '"App Development", "Booking & Payments", "Marketing", "Design", or "General Inquiry". ' +
              'Priority should reflect urgency and how serious/specific the lead sounds.',
          },
          { role: "user", content: requirement },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI request failed: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content in OpenAI response");

    const parsed = JSON.parse(content);
    const category = typeof parsed.category === "string" && parsed.category.trim()
      ? parsed.category.trim()
      : "General Inquiry";
    const priority: Classification["priority"] = VALID_PRIORITIES.includes(parsed.priority)
      ? parsed.priority
      : "Medium";

    return { category, priority };
  } finally {
    clearTimeout(timeout);
  }
}

// --- Fallback: instant, zero-dependency keyword classifier ---

const CATEGORY_RULES: { keywords: string[]; category: string }[] = [
  { keywords: ["chatbot", "ai assistant", "automation", "automate", "n8n", "workflow"], category: "AI Automation" },
  { keywords: ["website", "site", "landing page", "web app", "portal"], category: "Web Development" },
  { keywords: ["app", "mobile", "android", "ios"], category: "App Development" },
  { keywords: ["booking", "reservation", "payment", "razorpay", "checkout"], category: "Booking & Payments" },
  { keywords: ["seo", "marketing", "ads", "campaign", "social media"], category: "Marketing" },
  { keywords: ["design", "ui", "ux", "branding", "logo"], category: "Design" },
];

const URGENT_WORDS = ["urgent", "asap", "immediately", "today", "right away", "emergency"];
const LOW_PRIORITY_WORDS = ["just exploring", "curious", "someday", "no rush", "future"];

export function classifyLeadRuleBased(requirement: string): Classification {
  const text = requirement.toLowerCase();

  let category = "General Inquiry";
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      category = rule.category;
      break;
    }
  }

  let priority: Classification["priority"] = "Medium";
  if (URGENT_WORDS.some((w) => text.includes(w))) {
    priority = "High";
  } else if (LOW_PRIORITY_WORDS.some((w) => text.includes(w))) {
    priority = "Low";
  } else if (text.length > 120) {
    priority = "High";
  }

  return { category, priority };
}
