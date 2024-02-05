# Emittables vs. Events

The purpose of this readme is to define what the differences are between emittables and events. <br/>
There might be some details missing. Feel free to append/update this file.

## Terminology:
- **Events**: <br/>
Stored match actions in Events table used for match replays. <br/>
For more info, check the prisma schema.
  - e.g. Creating a unit
- **Emittables**: <br/>
Actions that are broadcasted to subscribers using websockets.
  - e.g. In-match chat box messages

## Important Notes:
-  **Most events are emittables.** <br/>
For the few that are not, they need to be modified and explicitly <br/>
named emittable as some information needs to be hidden from the client. <br/>
For example, MoveEvent to EmittableMoveEvent for FoW.
-  **Not all emittables are events.** <br/>
For example, ChatMessageEmittable is not an event and not stored as an event in the database. <br/>
They are label emittables for sending and receiving messsages real time.
