"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import AdminNavigation from "../AdminNavigation";

type CallState = "idle" | "connecting" | "active" | "ending" | "error";
type TranscriptEntry = {
  id: string;
  role: "patient" | "assistant" | "system";
  text: string;
};

type RealtimeEvent = {
  type?: string;
  event_id?: string;
  item_id?: string;
  delta?: string;
  transcript?: string;
  call_id?: string;
  name?: string;
  arguments?: string;
  error?: { message?: string };
};

type ToolResult = Record<string, unknown>;

const initialLog: TranscriptEntry[] = [
  {
    id: "welcome",
    role: "system",
    text: "TEST MODE. Підключені тестові ціни, слоти та тестовий запис. Реальна база пацієнтів не використовується.",
  },
];

export default function AiOperatorPage() {
  const [state, setState] = useState<CallState>("idle");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [log, setLog] = useState<TranscriptEntry[]>(initialLog);
  const [activeTool, setActiveTool] = useState("");
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RTCDataChannel | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const assistantDraftRef = useRef("");

  useEffect(() => {
    if (state !== "active") return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [state]);

  const append = (entry: TranscriptEntry) => {
    setLog((current) => [...current, entry].slice(-60));
  };

  const stopMedia = () => {
    channelRef.current?.close();
    channelRef.current = null;
    peerRef.current?.close();
    peerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    assistantDraftRef.current = "";
    setActiveTool("");
    if (audioRef.current) audioRef.current.srcObject = null;
  };

  useEffect(() => () => stopMedia(), []);

  const executeToolCall = async (event: RealtimeEvent) => {
    if (!event.name || !event.call_id) return;

    let args: unknown = {};
    try {
      args = JSON.parse(event.arguments || "{}");
    } catch {
      args = {};
    }

    setActiveTool(event.name);
    append({
      id: event.event_id || crypto.randomUUID(),
      role: "system",
      text: `AI викликає тестовий інструмент: ${event.name}`,
    });

    let result: ToolResult;
    try {
      const response = await fetch("/api/admin/ai-operator/tools", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: event.name, arguments: args }),
      });
      const payload = (await response.json()) as ToolResult & { error?: string };
      result = response.ok
        ? payload
        : {
            ok: false,
            error: payload.error || `Tool HTTP ${response.status}`,
          };
    } catch (reason) {
      result = {
        ok: false,
        error: reason instanceof Error ? reason.message : "Не вдалося виконати tool call.",
      };
    }

    const channel = channelRef.current;
    if (channel?.readyState === "open") {
      channel.send(
        JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: event.call_id,
            output: JSON.stringify(result),
          },
        }),
      );
      channel.send(JSON.stringify({ type: "response.create" }));
    }

    append({
      id: crypto.randomUUID(),
      role: "system",
      text: result.ok === false
        ? `Тестовий інструмент ${event.name} повернув помилку.`
        : `Тестовий інструмент ${event.name} виконався успішно.`,
    });
    setActiveTool("");
  };

  const handleRealtimeEvent = async (event: RealtimeEvent) => {
    if (event.type === "conversation.item.input_audio_transcription.completed") {
      const text = event.transcript?.trim();
      if (text) {
        append({ id: event.event_id || crypto.randomUUID(), role: "patient", text });
      }
      return;
    }

    if (event.type === "response.output_audio_transcript.delta" && event.delta) {
      assistantDraftRef.current += event.delta;
      return;
    }

    if (event.type === "response.output_audio_transcript.done") {
      const text = (event.transcript || assistantDraftRef.current).trim();
      assistantDraftRef.current = "";
      if (text) {
        append({ id: event.event_id || crypto.randomUUID(), role: "assistant", text });
      }
      return;
    }

    if (event.type === "response.function_call_arguments.done") {
      await executeToolCall(event);
      return;
    }

    if (event.type === "error") {
      const message = event.error?.message || "Realtime API повернув невідому помилку.";
      setError(message);
      append({ id: event.event_id || crypto.randomUUID(), role: "system", text: message });
    }
  };

  const startCall = async () => {
    setState("connecting");
    setError("");
    setSeconds(0);
    setLog(initialLog);
    setActiveTool("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const peer = new RTCPeerConnection();
      peerRef.current = peer;
      stream.getAudioTracks().forEach((track) => peer.addTrack(track, stream));

      peer.ontrack = (event) => {
        if (audioRef.current) {
          audioRef.current.srcObject = event.streams[0];
          void audioRef.current.play().catch(() => undefined);
        }
      };

      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "failed" || peer.connectionState === "disconnected") {
          setError("Голосове з'єднання перервано.");
          setState("error");
        }
      };

      const channel = peer.createDataChannel("oai-events");
      channelRef.current = channel;
      channel.onmessage = (message) => {
        try {
          void handleRealtimeEvent(JSON.parse(message.data) as RealtimeEvent);
        } catch {
          // Ignore non-JSON diagnostic frames.
        }
      };
      channel.onopen = () => {
        setState("active");
        channel.send(
          JSON.stringify({
            type: "response.create",
            response: {
              instructions:
                "Почни дзвінок зараз: коротко привітайся за сценарієм медичного центру і запитай, чим можеш допомогти.",
            },
          }),
        );
      };

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      const response = await fetch("/api/admin/ai-operator/realtime", {
        method: "POST",
        headers: { "content-type": "application/sdp" },
        body: offer.sdp || "",
      });

      const answer = await response.text();
      if (!response.ok) {
        let message = "Не вдалося запустити AI-оператора.";
        try {
          const payload = JSON.parse(answer) as { error?: string; detail?: string };
          message = payload.error || payload.detail || message;
        } catch {
          if (answer.trim()) message = answer.slice(0, 400);
        }
        throw new Error(message);
      }

      await peer.setRemoteDescription({ type: "answer", sdp: answer });
    } catch (reason) {
      stopMedia();
      setState("error");
      setError(reason instanceof Error ? reason.message : "Не вдалося запустити тест.");
    }
  };

  const endCall = () => {
    setState("ending");
    stopMedia();
    window.setTimeout(() => setState("idle"), 150);
  };

  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const isBusy = state === "connecting" || state === "ending";

  return (
    <main style={styles.page}>
      <audio ref={audioRef} autoPlay />

      <header style={styles.header}>
        <div>
          <span style={styles.kicker}>Адмін-панель · експеримент</span>
          <h1 style={styles.title}>AI Call Center</h1>
          <p style={styles.subtitle}>
            Голосовий тест адміністратора «Здорової родини» без Binotel і без реальних пацієнтських записів.
          </p>
        </div>
        <AdminNavigation current="ai-operator" showSiteLink />
      </header>

      <section style={styles.grid}>
        <article style={styles.callCard}>
          <div style={styles.statusRow}>
            <span style={{ ...styles.dot, background: state === "active" ? "#16a34a" : state === "connecting" ? "#f59e0b" : "#94a3b8" }} />
            <strong style={styles.statusText}>
              {activeTool
                ? `Інструмент: ${activeTool}`
                : state === "active"
                  ? "Розмова триває"
                  : state === "connecting"
                    ? "Підключення…"
                    : state === "error"
                      ? "Помилка"
                      : "Готовий до тесту"}
            </strong>
            <span style={styles.timer}>{time}</span>
          </div>

          <div style={styles.orbWrap} aria-hidden="true">
            <div style={{ ...styles.orb, ...(state === "active" ? styles.orbActive : {}) }}>
              <span style={styles.mic}>●</span>
            </div>
          </div>

          <h2 style={styles.callTitle}>Віртуальний адміністратор</h2>
          <p style={styles.callCopy}>
            Запитай про МРТ головного мозку, КТ грудної клітки або уролога. Потім попроси вільний час і спробуй зробити тестовий запис.
          </p>

          {error ? <p style={styles.error}>{error}</p> : null}

          {state === "active" ? (
            <button type="button" onClick={endCall} style={{ ...styles.button, ...styles.stopButton }}>
              Завершити розмову
            </button>
          ) : (
            <button type="button" onClick={startCall} disabled={isBusy} style={{ ...styles.button, opacity: isBusy ? 0.65 : 1 }}>
              {state === "connecting" ? "Підключаємо…" : "Почати тестовий дзвінок"}
            </button>
          )}

          <p style={styles.privacyNote}>
            TEST MODE: не називай реальні персональні дані пацієнтів. Для перевірки використовуй вигадані ім’я та номер телефону.
          </p>
        </article>

        <article style={styles.transcriptCard}>
          <div style={styles.transcriptHeader}>
            <div>
              <span style={styles.kicker}>Live transcript</span>
              <h2 style={styles.transcriptTitle}>Діалог</h2>
            </div>
            <button type="button" onClick={() => setLog(initialLog)} style={styles.clearButton}>
              Очистити
            </button>
          </div>

          <div style={styles.log} aria-live="polite">
            {log.map((entry) => (
              <div key={entry.id} style={{ ...styles.message, ...(entry.role === "assistant" ? styles.aiMessage : entry.role === "patient" ? styles.patientMessage : styles.systemMessage) }}>
                <span style={styles.messageRole}>
                  {entry.role === "assistant" ? "AI" : entry.role === "patient" ? "Пацієнт" : "Система"}
                </span>
                <p style={styles.messageText}>{entry.text}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section style={styles.bottomGrid}>
        <article style={styles.infoCard}>
          <span style={styles.kicker}>v0.2</span>
          <h3 style={styles.infoTitle}>Tool calls уже працюють</h3>
          <p style={styles.infoText}>AI може сам звернутися до тестової бази за послугою, ціною, відділенням і вільними слотами під час живої голосової розмови.</p>
        </article>
        <article style={styles.infoCard}>
          <span style={styles.kicker}>Безпечний тест</span>
          <h3 style={styles.infoTitle}>Запис без реального пацієнта</h3>
          <p style={styles.infoText}>Після погодження часу AI створює лише TEST-підтвердження з номером виду TEST-XXXXXXXX. У реальну базу нічого не записується.</p>
        </article>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", padding: "38px clamp(18px, 4vw, 64px) 70px", background: "#f3f7f6", color: "#073f45", fontFamily: "Manrope, Arial, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 30, marginBottom: 34, flexWrap: "wrap" },
  kicker: { display: "block", marginBottom: 8, color: "#008a91", fontSize: 12, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase" },
  title: { margin: 0, fontSize: "clamp(38px, 5vw, 72px)", lineHeight: 1, fontWeight: 500, letterSpacing: "-.045em" },
  subtitle: { maxWidth: 780, margin: "16px 0 0", color: "#657b7e", fontSize: 17, lineHeight: 1.55 },
  grid: { display: "grid", gridTemplateColumns: "minmax(300px, .8fr) minmax(360px, 1.2fr)", gap: 22 },
  callCard: { minHeight: 620, padding: "28px clamp(22px, 3vw, 38px)", border: "1px solid rgba(0,123,130,.16)", borderRadius: 30, background: "#fff", boxShadow: "0 20px 60px rgba(7,63,69,.06)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  statusRow: { width: "100%", display: "flex", alignItems: "center", gap: 10, paddingBottom: 22, borderBottom: "1px solid #e3eceb" },
  dot: { width: 9, height: 9, borderRadius: 99 },
  statusText: { fontSize: 14 },
  timer: { marginLeft: "auto", color: "#718589", fontVariantNumeric: "tabular-nums" },
  orbWrap: { display: "grid", placeItems: "center", flex: "1 1 auto", minHeight: 250 },
  orb: { width: 170, height: 170, display: "grid", placeItems: "center", borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #47c9c6 0, #079aa1 40%, #05636a 100%)", boxShadow: "0 24px 70px rgba(0,155,164,.28), inset 0 0 0 1px rgba(255,255,255,.25)", transition: "transform .25s ease, box-shadow .25s ease" },
  orbActive: { transform: "scale(1.045)", boxShadow: "0 28px 90px rgba(0,155,164,.42), 0 0 0 18px rgba(0,155,164,.08)" },
  mic: { width: 26, height: 26, display: "grid", placeItems: "center", color: "#fff", fontSize: 28 },
  callTitle: { margin: "0 0 10px", fontSize: 28, fontWeight: 550, letterSpacing: "-.03em" },
  callCopy: { maxWidth: 540, margin: "0 0 22px", color: "#657b7e", lineHeight: 1.55 },
  button: { width: "100%", minHeight: 54, padding: "0 24px", border: 0, borderRadius: 16, background: "#008f97", color: "#fff", font: "inherit", fontWeight: 800, cursor: "pointer" },
  stopButton: { background: "#b42318" },
  error: { width: "100%", margin: "0 0 14px", padding: 12, borderRadius: 12, background: "#fff0ee", color: "#9f241b", fontSize: 14, textAlign: "left" },
  privacyNote: { margin: "14px 0 0", color: "#849598", fontSize: 12, lineHeight: 1.45 },
  transcriptCard: { minHeight: 620, padding: "28px clamp(20px, 3vw, 34px)", borderRadius: 30, background: "#073f45", color: "#fff", overflow: "hidden" },
  transcriptHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, marginBottom: 20 },
  transcriptTitle: { margin: 0, fontSize: 32, fontWeight: 500, letterSpacing: "-.035em" },
  clearButton: { border: "1px solid rgba(255,255,255,.2)", borderRadius: 12, padding: "9px 13px", color: "#d7e7e6", background: "transparent", cursor: "pointer" },
  log: { height: 520, overflowY: "auto", paddingRight: 5, display: "flex", flexDirection: "column", gap: 12 },
  message: { maxWidth: "88%", padding: "14px 16px", borderRadius: 18 },
  aiMessage: { alignSelf: "flex-start", background: "#0b565d" },
  patientMessage: { alignSelf: "flex-end", background: "#fff", color: "#073f45" },
  systemMessage: { maxWidth: "100%", alignSelf: "stretch", background: "rgba(255,255,255,.08)", color: "#c9d9d9" },
  messageRole: { display: "block", marginBottom: 5, fontSize: 10, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", opacity: .7 },
  messageText: { margin: 0, fontSize: 15, lineHeight: 1.5 },
  bottomGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 22, marginTop: 22 },
  infoCard: { padding: 26, border: "1px solid rgba(0,123,130,.16)", borderRadius: 24, background: "#fff" },
  infoTitle: { margin: "0 0 9px", fontSize: 22, fontWeight: 600 },
  infoText: { margin: 0, color: "#657b7e", lineHeight: 1.55 },
};
