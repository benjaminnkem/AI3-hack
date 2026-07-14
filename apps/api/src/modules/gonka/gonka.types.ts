/**
 * Shape of a single chat-style inference request sent to the Gonka Router.
 * Gonka is OpenAI-compatible at the router layer, so this mirrors the
 * /v1/chat/completions contract. Confirm exact field names against
 * https://gonkarouter.io docs before the live demo.
 */
export interface GonkaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GonkaChatRequest {
  model: string;
  messages: GonkaChatMessage[];
  temperature?: number;
  response_format?: { type: 'json_object' | 'text' };
}

export interface GonkaChatResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: GonkaChatMessage;
    finish_reason: string;
  }>;
}

/** Normalised result our services consume, decoupled from the wire format. */
export interface GonkaCompletion {
  /** Gonka Router request id — surfaced in the passport for auditability. */
  requestId: string;
  model: string;
  content: string;
}
