import { createTRPCwebSocketServer } from "./common-server";
import { matchStore } from "./match-store";

void (async () => {
  await matchStore.rebuild();

  const wss = createTRPCwebSocketServer({
    port: 3001,
  });

  wss.on("connection", (ws) => {
    console.log(`➕➕ Connection (${wss.clients.size})`);
    ws.once("close", () => {
      console.log(`➖➖ Connection (${wss.clients.size})`);
    });
  });

  console.log(`Development mode: tRPC listening on ${process.env.NEXT_PUBLIC_WS_URL}`);
})();
