import { useState, useEffect, useCallback, useRef } from "react";
import type { Part, ToolInvocation } from "../lib/types";
import { getSessionMessages, getMessageParts } from "../lib/commands";

export interface ParsedMessage {
  id: string;
  role: string;
  content: string;
  toolInvocations: ToolInvocation[];
  parts: Part[];
  timestamp: number;
}

interface PartData {
  type: string;
  text?: string;
  tool?: string;
  callID?: string;
  state?: {
    status: string;
    input?: Record<string, unknown>;
    output?: string;
  };
  reasoning?: string;
}

function parsePartData(raw: string): PartData | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function useMessages(sessionId: string | null) {
  const [messages, setMessages] = useState<ParsedMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const loadMessages = useCallback(async () => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    try {
      abortRef.current = false;
      setLoading(true);
      setError(null);

      const rawMessages = await getSessionMessages(sessionId);
      const parts = await getMessageParts(sessionId);

      if (abortRef.current) return;

      // Group parts by message_id, preserving order
      const partsByMessage = new Map<string, Part[]>();
      for (const part of parts) {
        const existing = partsByMessage.get(part.message_id) || [];
        existing.push(part);
        partsByMessage.set(part.message_id, existing);
      }

      const parsed: ParsedMessage[] = rawMessages.map((msg) => {
        // Parse message metadata (role, model, tokens, etc.)
        let role = "user";
        try {
          const meta = JSON.parse(msg.data);
          role = meta.role || "user";
        } catch {
          // keep default
        }

        // Extract content and tool invocations from parts
        const msgParts = partsByMessage.get(msg.id) || [];
        const textChunks: string[] = [];
        const toolInvocations: ToolInvocation[] = [];

        for (const part of msgParts) {
          const data = parsePartData(part.data);
          if (!data) continue;

          if (data.type === "text" && data.text) {
            textChunks.push(data.text);
          } else if (data.type === "tool" && data.callID) {
            toolInvocations.push({
              state: data.state?.status === "completed" ? "result" : "call",
              toolCallId: data.callID,
              toolName: data.tool || "unknown",
              args: data.state?.input,
              result: data.state?.output,
            });
          }
          // reasoning, step-start, etc. are skipped for now
        }

        return {
          id: msg.id,
          role,
          content: textChunks.join("\n"),
          toolInvocations,
          parts: msgParts,
          timestamp: msg.time_created,
        };
      });

      setMessages(parsed);
    } catch (err) {
      if (!abortRef.current) {
        setError(
          err instanceof Error ? err.message : "Failed to load messages"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadMessages();
    return () => {
      abortRef.current = true;
    };
  }, [loadMessages]);

  const refresh = useCallback(() => {
    loadMessages();
  }, [loadMessages]);

  return { messages, loading, error, refresh };
}
