import type { Army } from "shared/schemas/army";
import type { CO } from "shared/schemas/co";
import { PlayerFriendLink } from "../PlayerFriendLink";

type Player = {
  name: string;
  favArmy: Army;
  favCO: CO;
};

const friends: Player[] = [
  {
    name: "Master Chief",
    favArmy: "orange-star",
    favCO: "adder",
  },
  {
    name: "Alm",
    favArmy: "green-earth",
    favCO: "andy",
  },
  {
    name: "Professor Layton",
    favArmy: "blue-moon",
    favCO: "grit",
  },
  {
    name: "Griffith",
    favArmy: "yellow-comet",
    favCO: "kanbei",
  },
  {
    name: "Yukimura204254 Echoes and Knuckles",
    favArmy: "black-hole",
    favCO: "lash",
  },
  {
    name: "The Arbiter",
    favArmy: "blue-moon",
    favCO: "javier",
  },
  {
    name: "Grimm Guy",
    favArmy: "yellow-comet",
    favCO: "grimm",
  },
];

export function PlayerFriendSection() {
  return (
    <section className="@w-full @min-h-full @bg-black/60 @pb-8 @p-6 @my-4">
      <h3 className="@font-russoOne @uppercase @text-2xl smallscreen:@text-3xl">Friends</h3>
      <div className="@flex @flex-col @w-full @py-6 @space-y-1">
        {friends.map((friend) => {
          return (
            <PlayerFriendLink
              key={friend.name}
              friendName={friend.name}
              friendFavArmy={friend.favArmy}
              friendFavCO={friend.favCO}
            />
          );
        })}
      </div>
    </section>
  );
}
