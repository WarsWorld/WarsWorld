/**
 * These are just some notes for now.
 *
 * The system needs to be able to create and
 * broadcast the end-turn event when the time
 * of a player runs out without any player interaction.
 *
 * AWBW will also make a player lose if
 * their timer runs out and they haven't made a move in this turn yet.
 *
 * Basically:
 * onTimeRunsOut() {
 *  if (noEventThisTurn) {
 *    player.lose()
 *  } else {
 *    passTurn()
 *  }
 * }
 */

// TODO this empty export is to allow the code to compile because
// this file isn't a module otherwise.
export {};
