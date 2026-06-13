import { useEffect, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setIsConnected(true);
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        // Try to reconnect after 3 seconds
        setTimeout(connect, 3000);
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.current?.close();
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "refresh") {
            queryClient.invalidateQueries();
          }
        } catch (err) {
          console.error("Failed to parse WS message", err);
        }
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [queryClient]);

  return { isConnected };
}
