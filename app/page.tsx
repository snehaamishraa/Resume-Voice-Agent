"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

type ChatMessage = { role: "user" | "assistant"; text: string };
type Status = "idle" | "connecting" | "listening" | "speaking";

const LIVE_URL =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained";

const STATUS_LABEL: Record<Status, string> = {
  idle: "Offline",
  connecting: "Connecting",
  listening: "Listening",
  speaking: "Speaking",
};

const STATUS_HINT: Record<Status, string> = {
  idle: "Start a conversation and ask me anything",
  connecting: "Setting up a secure voice session…",
  listening: "I'm listening — just speak naturally",
  speaking: "Feel free to interrupt me anytime",
};

const SUGGESTIONS = [
  { title: "Tell me about yourself", hint: "Background & journey" },
  { title: "What did you build at Poco AI?", hint: "Berrika, end to end" },
  { title: "Walk me through Berrika's architecture", hint: "System design" },
  { title: "What's your tech stack?", hint: "Skills & tools" },
];

const LINKS = [
  { label: "LinkedIn", href: "https://linkedin.com/in/snehamishraa" },
  { label: "GitHub", href: "https://github.com/snehaamishraa" },
  { label: "Email", href: "mailto:sneha.mishra1144@gmail.com" },
];

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function fromBase64(base64: string): Int16Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Int16Array(bytes.buffer);
}

/* ---------- Icons ---------- */

function MicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- Talking avatar ---------- */
// The mouth ellipses are moved directly by the audio level (see animateMouth),
// so the lips follow the real voice without re-rendering React on every frame.

function Avatar({
  mouthOuterRef,
  mouthInnerRef,
}: {
  mouthOuterRef: RefObject<SVGEllipseElement | null>;
  mouthInnerRef: RefObject<SVGEllipseElement | null>;
}) {
  return (
    <svg viewBox="0 0 240 240" className="h-full w-full" aria-label="Sneha's AI avatar" role="img">
      <defs>
        <radialGradient id="avatar-bg" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#3b2566" />
          <stop offset="100%" stopColor="#130d24" />
        </radialGradient>
        <linearGradient id="avatar-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
        <linearGradient id="avatar-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a1a2e" />
          <stop offset="100%" stopColor="#140b16" />
        </linearGradient>
        <clipPath id="avatar-clip">
          <circle cx="120" cy="120" r="120" />
        </clipPath>
      </defs>

      <g clipPath="url(#avatar-clip)">
        <circle cx="120" cy="120" r="120" fill="url(#avatar-bg)" />

        {/* Hair (back), neck and body */}
        <path
          d="M62 118 C 56 60, 92 34, 124 36 C 160 38, 190 66, 180 120 C 176 150, 184 176, 174 198 C 162 206, 150 202, 146 192 L 94 192 C 90 202, 78 206, 66 198 C 56 176, 64 150, 62 118 Z"
          fill="url(#avatar-hair)"
        />
        <rect x="106" y="140" width="28" height="48" rx="12" fill="#c38462" />
        <path d="M26 240 C 32 200, 70 182, 120 182 C 170 182, 208 200, 214 240 Z" fill="url(#avatar-top)" />
        <path d="M104 183 L120 205 L136 183 Z" fill="#d49a76" />

        <g className="avatar-head">
          {/* Ears + earrings */}
          <ellipse cx="82" cy="116" rx="6" ry="10" fill="#c38462" />
          <ellipse cx="158" cy="116" rx="6" ry="10" fill="#c38462" />
          <circle cx="82" cy="131" r="3.2" fill="#f5c451" />
          <circle cx="158" cy="131" r="3.2" fill="#f5c451" />
          {/* Face */}
          <ellipse cx="120" cy="110" rx="38" ry="46" fill="#d49a76" />
          {/* Hair (front, side-swept fringe) */}
          <path
            d="M80 112 C 72 66, 104 50, 128 54 C 154 58, 168 82, 160 114 C 156 92, 144 78, 126 74 C 116 88, 98 94, 80 112 Z"
            fill="url(#avatar-hair)"
          />
          {/* Eyebrows */}
          <path d="M96 99 Q104 94 112 98" stroke="#24161a" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M128 98 Q136 94 144 99" stroke="#24161a" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          {/* Eyes (blink together) */}
          <g className="avatar-eyes">
            <ellipse cx="104" cy="111" rx="6.2" ry="4.4" fill="#fff" />
            <circle cx="104" cy="111" r="3.1" fill="#2b1a12" />
            <circle cx="105.2" cy="110" r="1" fill="#fff" />
            <ellipse cx="136" cy="111" rx="6.2" ry="4.4" fill="#fff" />
            <circle cx="136" cy="111" r="3.1" fill="#2b1a12" />
            <circle cx="137.2" cy="110" r="1" fill="#fff" />
            <path d="M97 109 Q104 105 111 109" stroke="#1b1220" strokeWidth="1.7" fill="none" strokeLinecap="round" />
            <path d="M129 109 Q136 105 143 109" stroke="#1b1220" strokeWidth="1.7" fill="none" strokeLinecap="round" />
          </g>
          {/* Nose */}
          <path d="M120 115 Q116.5 127 121 129" stroke="#b37152" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {/* Cheeks */}
          <circle cx="97" cy="128" r="7" fill="#e8868a" opacity="0.22" />
          <circle cx="143" cy="128" r="7" fill="#e8868a" opacity="0.22" />
          {/* Mouth: a gentle smile, plus lips that open with the voice */}
          <path d="M108 138 Q120 146 132 138" stroke="#a8434f" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <ellipse ref={mouthOuterRef} cx="120" cy="141" rx="10" ry="0" fill="#b44d5b" />
          <ellipse ref={mouthInnerRef} cx="120" cy="141.5" rx="7" ry="0" fill="#3d0f1b" />
        </g>
      </g>
    </svg>
  );
}

/* ---------- Page ---------- */

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [input, setInput] = useState("");
  const [micOn, setMicOn] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextPlayTimeRef = useRef(0);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const newTurnRef = useRef(true);
  const readyRef = useRef(false);
  const pendingQuestionRef = useRef<string | null>(null);

  // Avatar animation
  const mouthOuterRef = useRef<SVGEllipseElement | null>(null);
  const mouthInnerRef = useRef<SVGEllipseElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const levelRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Keep the chat scrolled to the newest message (only the chat box scrolls, never the page)
  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Stop the animation loop if the page is closed
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Read the loudness of the agent's voice ~60 times a second and move the lips
  function animateMouth() {
    const analyser = analyserRef.current;
    let target = 0;
    if (analyser) {
      const data = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      target = Math.min(1, Math.sqrt(sum / data.length) * 4);
    }
    const level = levelRef.current * 0.55 + target * 0.45; // smooth it out
    levelRef.current = level;

    mouthOuterRef.current?.setAttribute("ry", String(level * 8));
    mouthOuterRef.current?.setAttribute("rx", String(10 + level * 2));
    mouthInnerRef.current?.setAttribute("ry", String(level * 6));
    if (glowRef.current) {
      glowRef.current.style.transform = `scale(${1 + level * 0.12})`;
      glowRef.current.style.opacity = String(0.45 + level * 0.55);
    }

    rafRef.current = requestAnimationFrame(animateMouth);
  }

  // Live captions: add text to the current bubble, or start a new bubble
  function addTranscript(role: ChatMessage["role"], text: string) {
    const startNew = newTurnRef.current;
    newTurnRef.current = false;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (!startNew && last?.role === role) {
        return [...prev.slice(0, -1), { role, text: last.text + text }];
      }
      return [...prev, { role, text }];
    });
  }

  // Play one chunk of the agent's voice right after the previous chunk
  function playChunk(base64: string) {
    const ctx = audioContextRef.current;
    const analyser = analyserRef.current;
    if (!ctx || !analyser) return;

    const pcm = fromBase64(base64);
    const audioBuffer = ctx.createBuffer(1, pcm.length, 24000);
    const channel = audioBuffer.getChannelData(0);
    for (let i = 0; i < pcm.length; i++) channel[i] = pcm[i] / 32768;

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser); // analyser → speakers, and it measures loudness for the lips

    const startAt = Math.max(ctx.currentTime, nextPlayTimeRef.current);
    source.start(startAt);
    nextPlayTimeRef.current = startAt + audioBuffer.duration;

    sourcesRef.current.push(source);
    source.onended = () => {
      sourcesRef.current = sourcesRef.current.filter((s) => s !== source);
      if (sourcesRef.current.length === 0) {
        setStatus((s) => (s === "speaking" ? "listening" : s));
      }
    };
    setStatus("speaking");
  }

  // Stop the agent's voice immediately (used when the user interrupts)
  function stopPlayback() {
    sourcesRef.current.forEach((s) => {
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
    });
    sourcesRef.current = [];
    nextPlayTimeRef.current = 0;
  }

  // Send a typed or tapped question over the open session
  function sendText(text: string) {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    stopPlayback();
    newTurnRef.current = true;
    addTranscript("user", text);
    ws.send(JSON.stringify({ realtimeInput: { text } }));
  }

  function ask(text: string) {
    const question = text.trim();
    if (!question) return;
    setInput("");
    if (readyRef.current) {
      sendText(question);
    } else {
      pendingQuestionRef.current = question; // sent as soon as the session is ready
      if (status === "idle") start();
    }
  }

  function stop() {
    const ws = wsRef.current;
    wsRef.current = null;
    readyRef.current = false;
    pendingQuestionRef.current = null;
    ws?.close();

    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
    setMicOn(false);

    stopPlayback();
    analyserRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;

    // Close the mouth and stop the animation loop
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    levelRef.current = 0;
    mouthOuterRef.current?.setAttribute("ry", "0");
    mouthOuterRef.current?.setAttribute("rx", "10");
    mouthInnerRef.current?.setAttribute("ry", "0");
    if (glowRef.current) {
      glowRef.current.style.transform = "scale(1)";
      glowRef.current.style.opacity = "0.45";
    }

    setStatus("idle");
  }

  async function start() {
    setStatus("connecting");
    setNotice(null);
    newTurnRef.current = true;

    // Create the audio engine right inside the tap, so phones (especially iPhones) allow sound.
    // One context at the device's own sample rate works in every browser, including Firefox.
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    void audioContext.resume();
    const analyser = audioContext.createAnalyser(); // measures loudness for lip-sync
    analyser.fftSize = 512;
    analyser.connect(audioContext.destination);
    analyserRef.current = analyser;
    if (rafRef.current === null) rafRef.current = requestAnimationFrame(animateMouth);

    // True if "End conversation" was pressed while we were still connecting
    const cancelled = () => audioContextRef.current !== audioContext;

    try {
      // 1. Short-lived token from our server (the API key never reaches the browser)
      const res = await fetch("/api/token", { method: "POST" });
      if (cancelled()) return;
      if (res.status === 429) {
        stop();
        setNotice("Lots of conversations are happening right now. Please try again in a few minutes.");
        return;
      }
      if (!res.ok) throw new Error("Could not get a session token");
      const { token, model } = await res.json();

      // 2. Microphone (optional): if it's blocked or missing, continue in typing mode
      let micNode: AudioWorkletNode | null = null;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
        });
        if (cancelled()) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        micStreamRef.current = stream;
        await audioContext.audioWorklet.addModule("/mic-processor.js");
        micNode = new AudioWorkletNode(audioContext, "mic-processor");
        audioContext.createMediaStreamSource(stream).connect(micNode);
        micNode.connect(audioContext.destination); // outputs silence; keeps the processor running everywhere
        setMicOn(true);
      } catch (micError) {
        if (cancelled()) return;
        console.warn("Microphone unavailable, switching to typing mode:", micError);
        micStreamRef.current?.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
        micNode = null;
        setMicOn(false);
        setNotice("Microphone isn't available, so type your questions below. I'll still answer out loud.");
        inputRef.current?.focus();
      }
      if (cancelled()) return;
      const mic = micNode;

      // 3. Open the live voice connection
      const ws = new WebSocket(`${LIVE_URL}?access_token=${encodeURIComponent(token)}`);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ setup: { model: `models/${model}` } }));
      };

      ws.onmessage = async (event) => {
        const raw = typeof event.data === "string" ? event.data : await (event.data as Blob).text();
        const msg = JSON.parse(raw);

        if (msg.setupComplete) {
          readyRef.current = true;
          setStatus("listening");

          // Stream the mic to Gemini (skipped in typing mode)
          if (mic) {
            mic.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(
                  JSON.stringify({
                    realtimeInput: {
                      audio: { data: toBase64(e.data), mimeType: "audio/pcm;rate=16000" },
                    },
                  })
                );
              }
            };
          }

          // Answer a tapped question right away, otherwise greet first
          const pending = pendingQuestionRef.current;
          pendingQuestionRef.current = null;
          if (pending) {
            sendText(pending);
          } else {
            ws.send(
              JSON.stringify({
                realtimeInput: {
                  text: "A recruiter just joined. Greet them in one short sentence, say you are Sneha's AI voice agent, and invite their questions.",
                },
              })
            );
          }
          return;
        }

        const content = msg.serverContent;
        if (!content) return;

        if (content.interrupted) stopPlayback(); // the user started talking

        for (const part of content.modelTurn?.parts ?? []) {
          if (part.inlineData?.data) playChunk(part.inlineData.data);
        }

        if (content.inputTranscription?.text) addTranscript("user", content.inputTranscription.text);
        if (content.outputTranscription?.text) addTranscript("assistant", content.outputTranscription.text);
        if (content.turnComplete) newTurnRef.current = true;
      };

      ws.onclose = (event) => {
        console.log("Live session closed:", event.code, event.reason);
        if (wsRef.current !== ws) return; // we ended it ourselves
        stop();
        setNotice(
          event.code === 1000
            ? "The conversation ended. Tap Start conversation to talk again."
            : "The connection dropped. Tap Start conversation to try again."
        );
      };
    } catch (err) {
      console.error(err);
      if (cancelled()) return;
      stop();
      setNotice("Couldn't connect right now. Please try again in a moment.");
    }
  }

  const active = status !== "idle";
  const typingOnly = status === "listening" && !micOn;
  const statusLabel = typingOnly ? "Ready" : STATUS_LABEL[status];
  const statusHint = typingOnly ? "Type your question below — I'll answer out loud" : STATUS_HINT[status];

  const dotColor =
    status === "speaking"
      ? "bg-fuchsia-400"
      : status === "listening"
        ? "bg-emerald-400"
        : status === "connecting"
          ? "bg-amber-300"
          : "bg-white/30";

  return (
    <main className="relative min-h-dvh w-full overflow-clip bg-[#07060c] text-white lg:h-dvh lg:min-h-[640px]">
      {/* Background */}
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -top-48 left-[10%] h-[520px] w-[min(620px,100vw)] rounded-full bg-violet-600/25 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-48 right-[5%] h-[460px] w-[min(560px,100vw)] rounded-full bg-fuchsia-600/20 blur-[140px]" />

      <div className="relative mx-auto grid h-full w-full max-w-6xl grid-cols-1 gap-4 px-3 py-4 sm:gap-5 sm:px-6 sm:py-6 lg:grid-cols-[1fr_1.1fr] lg:py-8">
        {/* ---------- Avatar stage ---------- */}
        <section className="gradient-border relative flex min-w-0 flex-col items-center justify-between overflow-hidden rounded-[28px] bg-white/[0.03] px-5 py-5 backdrop-blur-xl sm:rounded-[32px] sm:px-6 lg:py-8">
          <div className="flex w-full items-center justify-between">
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/70">
              <span className={`h-2 w-2 rounded-full ${dotColor} ${active ? "animate-pulse" : ""}`} />
              {statusLabel}
            </span>
            <span className="text-[11px] tracking-wide text-white/35 uppercase">AI Voice Agent</span>
          </div>

          {/* Avatar */}
          <div className="relative my-4 flex items-center justify-center sm:my-6">
            <div
              ref={glowRef}
              className="absolute h-[115%] w-[115%] rounded-full bg-linear-to-br from-violet-500/60 via-fuchsia-500/50 to-orange-400/40 opacity-45 blur-2xl transition-[transform,opacity] duration-75"
            />
            {status === "listening" && micOn && (
              <>
                <span className="orb-ripple absolute inset-0 rounded-full border-2 border-emerald-300/40" />
                <span
                  className="orb-ripple absolute inset-0 rounded-full border-2 border-emerald-300/30"
                  style={{ animationDelay: "0.9s" }}
                />
              </>
            )}
            <div
              className={`relative h-40 w-40 overflow-hidden rounded-full p-[3px] sm:h-56 sm:w-56 lg:h-[min(18rem,34dvh)] lg:w-[min(18rem,34dvh)] ${
                status === "speaking"
                  ? "bg-linear-to-br from-fuchsia-400 to-violet-500"
                  : status === "listening" && micOn
                    ? "bg-linear-to-br from-emerald-300 to-violet-500"
                    : "bg-white/15"
              }`}
            >
              <div className="h-full w-full overflow-hidden rounded-full">
                <Avatar mouthOuterRef={mouthOuterRef} mouthInnerRef={mouthInnerRef} />
              </div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Sneha Mishra</h1>
            <p className="mt-1 text-sm text-white/55">
              Full Stack Software Engineer
              <span className="hidden sm:inline"> · Next.js · TypeScript · Go</span>
            </p>
            <p className="mt-2 text-sm text-white/40 sm:mt-3">{statusHint}</p>
            {notice && (
              <p
                role="status"
                className="mx-auto mt-3 max-w-xs rounded-2xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs text-amber-100/90"
              >
                {notice}
              </p>
            )}
          </div>

          <div className="mt-5 flex w-full flex-col items-center gap-4 sm:mt-6">
            {active ? (
              <button
                onClick={stop}
                className="flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/15 px-6 py-3 text-sm font-medium text-red-200 transition hover:bg-red-500/25"
              >
                <span className="h-2.5 w-2.5 rounded-sm bg-red-300" />
                End conversation
              </button>
            ) : (
              <button
                onClick={start}
                className="group flex items-center gap-2.5 rounded-full bg-linear-to-r from-violet-500 via-fuchsia-500 to-orange-400 px-7 py-3.5 text-sm font-semibold shadow-xl shadow-fuchsia-600/30 transition hover:scale-[1.03] hover:shadow-fuchsia-500/50"
              >
                <MicIcon className="h-5 w-5" />
                Start conversation
              </button>
            )}

            <nav className="flex gap-2">
              {LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white/60 transition hover:border-white/25 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </section>

        {/* ---------- Conversation ---------- */}
        <section className="gradient-border flex h-[80dvh] min-h-[420px] min-w-0 flex-col overflow-hidden rounded-[28px] bg-white/[0.03] backdrop-blur-xl sm:rounded-[32px] lg:h-auto lg:min-h-0">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">Conversation</h2>
              <p className="text-xs text-white/40">Live captions of our chat</p>
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="text-xs text-white/40 transition hover:text-white/80"
              >
                Clear
              </button>
            )}
          </div>

          <div ref={chatScrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
            {messages.length === 0 ? (
              <div className="flex min-h-full flex-col justify-center">
                <p className="mb-4 text-center text-sm text-white/45">Not sure where to start? Try one of these:</p>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.title}
                      onClick={() => ask(s.title)}
                      disabled={status === "connecting"}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 text-left transition hover:border-violet-400/40 hover:bg-violet-500/10 disabled:opacity-40 sm:p-4"
                    >
                      <p className="text-sm font-medium text-white/90">{s.title}</p>
                      <p className="mt-1 text-xs text-white/40">{s.hint}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex items-end gap-2"}>
                  {m.role === "assistant" && (
                    <div className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 text-[10px] font-semibold">
                      SM
                    </div>
                  )}
                  <p
                    className={`max-w-[85%] break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[80%] ${
                      m.role === "user"
                        ? "rounded-br-md bg-linear-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-900/30"
                        : "rounded-bl-md border border-white/10 bg-white/[0.06] text-white/90"
                    }`}
                  >
                    {m.text}
                  </p>
                </div>
              ))
            )}
          </div>

          {messages.length > 0 && (
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1 sm:px-5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.title}
                  onClick={() => ask(s.title)}
                  disabled={status === "connecting"}
                  className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 transition hover:border-violet-400/40 hover:text-white disabled:opacity-40"
                >
                  {s.title}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-center gap-2 p-3 sm:p-4"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Prefer typing? Ask here…"
              className="min-w-0 flex-1 rounded-full bg-white/5 px-4 py-3 text-base text-white outline-none ring-1 ring-white/10 transition placeholder:text-white/35 focus:ring-violet-400/60 sm:px-5 sm:text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || status === "connecting"}
              aria-label="Send"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-600/30 transition hover:opacity-90 disabled:opacity-30"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </form>

          <p className="px-4 pb-4 text-center text-[11px] text-white/30">
            AI agent · answers about me come only from my verified profile
          </p>
        </section>
      </div>
    </main>
  );
}
