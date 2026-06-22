// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

export interface SSEEvent {
  event: string;
  data: string;
  id?: string;
}

export async function parseSSEStream(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: SSEEvent) => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let eventType = "";
  let dataLines: string[] = [];
  let lastId: string | undefined;

  const dispatch = () => {
    // A blank line with no buffered data (e.g. after a keep-alive comment)
    // is not an event — only the event type resets.
    if (dataLines.length > 0) {
      onEvent({
        event: eventType || "message",
        data: dataLines.join("\n"),
        id: lastId,
      });
      dataLines = [];
    }
    eventType = "";
  };

  const processLine = (line: string) => {
    if (line === "") {
      dispatch();
      return;
    }
    if (line.startsWith(":")) return; // comment / keep-alive

    const colon = line.indexOf(":");
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? "" : line.slice(colon + 1);
    if (value.startsWith(" ")) value = value.slice(1);

    switch (field) {
      case "event":
        eventType = value;
        break;
      case "data":
        dataLines.push(value);
        break;
      case "id":
        lastId = value;
        break;
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newline: number;
      while ((newline = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        processLine(line);
      }
    }
  } finally {
    reader.releaseLock();
  }
}
