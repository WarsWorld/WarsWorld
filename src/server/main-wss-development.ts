import { createTRPCwebSocketServer } from "./common-server";
import { rebuildServerState } from "./match-logic/server-match-states";

(async () => {
  await rebuildServerState();

  const wss = createTRPCwebSocketServer({
    port: 3001,
  });

  wss.on("connection", (ws) => {
    console.log(`➕➕ Connection (${wss.clients.size})`);
    ws.once("close", () => {
      console.log(`➖➖ Connection (${wss.clients.size})`);
    });
  });

  console.log("Development mode: tRPC listening on ws://localhost:3001");
})();
