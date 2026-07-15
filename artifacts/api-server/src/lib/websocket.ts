import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { logger } from "./logger";

let wss: WebSocketServer | null = null;

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    logger.info("WebSocket client connected");
    ws.send(JSON.stringify({ type: "connected", message: "EnkaTextile Live" }));

    ws.on("close", () => {
      logger.info("WebSocket client disconnected");
    });

    ws.on("error", (err) => {
      logger.error({ err }, "WebSocket error");
    });
  });

  logger.info("WebSocket server initialized at /ws");
}

export function broadcastRefresh() {
  if (!wss) return;
  const message = JSON.stringify({ type: "refresh", ts: Date.now() });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
