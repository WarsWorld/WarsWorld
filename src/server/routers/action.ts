import { observable } from "@trpc/server/observable";
import { subscribe } from "server/emitter/event-emitter";
import { performAction } from "server/services/perform-action";
import { mainActionSchema } from "shared/schemas/action";
import type { Emittable } from "shared/types/events";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import { matchBaseProcedure, playerInMatchBaseProcedure, router } from "../trpc/trpc-setup";

// Helper function to check if a player is a computer
const isComputerPlayer = (player: PlayerInMatchWrapper): boolean => {
  // For now, check if the player ID matches our special computer player ID
  // This will be updated when we add the PlayerKind enum to the database
  return player.data.id === "computer-player-001";
};

export const actionRouter = router({
  send: playerInMatchBaseProcedure
    .input(mainActionSchema)
    .mutation(async ({ input, ctx: { match } }) => {
      // Use the extracted performAction service
      await performAction(match, input, false);

      // Check if this was a PassTurn action and the next player is a computer
      if (input.type === "passTurn") {
        const nextPlayer = match.getCurrentTurnPlayer();

        if (nextPlayer !== undefined && isComputerPlayer(nextPlayer)) {
          // Trigger AI turn asynchronously to avoid blocking
          setImmediate(() => {
            void (async () => {
            try {
              const { runAiTurn } = await import("../services/ai-service");
              await runAiTurn(match.id);
            } catch (error) {
              console.error("AI turn failed:", error);
            }
            })();
          });
        }
      }
    }),
  onEvent: matchBaseProcedure.subscription(({ ctx: { match, currentPlayer } }) =>
    observable<Emittable>((emit) => subscribe(match.id, currentPlayer.id, emit.next)),
  ),
  // TODO create procedure for anonymous users to observe games
  // (they get their own special "-1" team or something)
});
