import { buildSystemPrompt } from "@/lib/system-prompt";

const MODEL = process.env.GEMINI_LIVE_MODEL || "gemini-3.8-live";
const VOICE = process.env.GEMINI_VOICE || "en-in-storyteller-1";

/* ---------- Rate limit (protects the free Gemini quota) ----------
 * Simple in-memory limits, counted per server instance:
 *  - one visitor (IP) can start at most 5 conversations per 10 minutes
 *  - the whole site can start at most 60 conversations per hour
 * Your own computer (localhost) is not limited, so testing stays easy.
 */
const PER_IP_LIMIT = 5;
const PER_IP_WINDOW_MS = 10 * 60 * 1000;
const GLOBAL_LIMIT = 60;
const GLOBAL_WINDOW_MS = 60 * 60 * 1000;
const LOCAL_IPS = new Set(["local", "::1", "127.0.0.1", "::ffff:127.0.0.1"]);

const ipHits = new Map<string, number[]>();
let globalHits: number[] = [];

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local"
  );
}

// Returns how many seconds the visitor must wait, or 0 if allowed
function checkRateLimit(ip: string): number {
  if (LOCAL_IPS.has(ip)) return 0;
  const now = Date.now();

  globalHits = globalHits.filter((t) => now - t < GLOBAL_WINDOW_MS);
  const recent = (ipHits.get(ip) ?? []).filter((t) => now - t < PER_IP_WINDOW_MS);

  if (recent.length >= PER_IP_LIMIT) return Math.ceil((recent[0] + PER_IP_WINDOW_MS - now) / 1000);
  if (globalHits.length >= GLOBAL_LIMIT) return Math.ceil((globalHits[0] + GLOBAL_WINDOW_MS - now) / 1000);

  recent.push(now);
  ipHits.set(ip, recent);
  globalHits.push(now);

  // Forget old visitors so memory stays small
  if (ipHits.size > 1000) {
    for (const [key, times] of ipHits) {
      if (times.every((t) => now - t >= PER_IP_WINDOW_MS)) ipHits.delete(key);
    }
  }
  return 0;
}

// Creates a short-lived token for ONE live voice session.
// The knowledge base, rules and voice are locked inside the token,
// so the browser never sees the API key and can't change the agent's instructions.
export async function POST(request: Request) {
  const retryAfter = checkRateLimit(getClientIp(request));
  if (retryAfter > 0) {
    return Response.json(
      { error: "Too many conversations. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY is missing" }, { status: 500 });
  }

  const now = Date.now();
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/auth_tokens", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      uses: 1,
      expireTime: new Date(now + 30 * 60 * 1000).toISOString(), // session can last 30 min
      newSessionExpireTime: new Date(now + 60 * 1000).toISOString(), // must connect within 1 min
      bidiGenerateContentSetup: {
        model: `models/${MODEL}`,
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
        },
        systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
        inputAudioTranscription: {}, // text of what the user said
        outputAudioTranscription: {}, // text of what the agent said
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Token error:", JSON.stringify(data));
    return Response.json({ error: "Could not start a session" }, { status: 502 });
  }

  return Response.json({ token: data.name, model: MODEL });
}
