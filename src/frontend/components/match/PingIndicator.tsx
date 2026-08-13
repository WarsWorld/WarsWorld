"use client";
import { trpc } from "frontend/utils/trpc-client";
import { useEffect, useState } from "react";

/**
 * Live connection-latency indicator. Times a round-trip to the `system.ping` endpoint every few
 * seconds over the same WS as gameplay, and shows a traffic-light dot: green (snappy), yellow
 * (laggy), red (slow or disconnected). Purely presentational — a query, no game state.
 */

type PingState = { ms: number | null; connected: boolean };

const GREEN = "#3fb950";
const YELLOW = "#d9a441";
const RED = "#be1919";

const dotColor = ({ ms, connected }: PingState): string => {
  if (!connected || ms === null) {
    return RED;
  }

  if (ms < 100) {
    return GREEN;
  }

  return ms < 300 ? YELLOW : RED;
};

const PING_INTERVAL_MS = 3000;

export function PingIndicator() {
  const utils = trpc.useUtils();
  const [state, setState] = useState<PingState>({ ms: null, connected: false });

  useEffect(() => {
    let active = true;

    const measure = async () => {
      const start = performance.now();

      try {
        // staleTime 0 forces a fresh round-trip every tick instead of returning the cached value.
        await utils.system.ping.fetch(undefined, { staleTime: 0 });

        if (active) {
          setState({ ms: Math.round(performance.now() - start), connected: true });
        }
      } catch {
        if (active) {
          setState({ ms: null, connected: false });
        }
      }
    };

    void measure();
    const id = setInterval(() => void measure(), PING_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, [utils]);

  const label = state.connected && state.ms !== null ? `${state.ms} ms` : "offline";

  return (
    <div className="@flex @items-center @gap-1 @text-xs @opacity-80" title={`Connection: ${label}`}>
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 9999,
          backgroundColor: dotColor(state),
          display: "inline-block",
        }}
      />
      <span>{label}</span>
    </div>
  );
}
