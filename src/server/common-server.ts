import { applyWSSHandler } from "@trpc/server/adapters/ws";
import type { ServerOptions } from "ws";
import { WebSocketServer } from "ws";
import { appRouter } from "./routers/app";
import { createContext } from "./trpc/trpc-context";

export const createTRPCwebSocketServer = (wssConfig: ServerOptions) => {
  const wss = new WebSocketServer(wssConfig);

  const handler = applyWSSHandler({ wss, router: appRouter, createContext });

  // Handle graceful shutdown
  const gracefulShutdown = () => {
    console.log("Shutting down WebSocket server...");
    handler.broadcastReconnectNotification();

    // Close all active connections
    wss.clients.forEach((client) => {
      client.terminate();
    });

    wss.close(() => {
      console.log("WebSocket server closed");
      process.exit(0);
    });

    // Force exit after timeout if server doesn't close
    setTimeout(() => {
      console.error("Could not close connections in time, forcefully shutting down");
      process.exit(1);
    }, 5000);
  };

  // SIGTERM is sent by process managers
  process.on("SIGTERM", gracefulShutdown);

  // SIGINT is sent by Ctrl+C
  process.on("SIGINT", gracefulShutdown);

  // Prevent multiple handlers from being registered
  process.once("SIGUSR2", gracefulShutdown);

  return wss;
};
