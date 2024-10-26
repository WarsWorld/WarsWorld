import { PLayerLeagueGeneralSection } from "frontend/components/player-profile/player-sections/PlayerLeagueGeneralSection";
import { PlayerProfileMainSection } from "frontend/components/player-profile/player-sections/PlayerProfileMainSection";
import { PlayerSelectLeagueSection } from "frontend/components/player-profile/player-sections/PlayerSelectLeagueSection";
import { PlayerFriendLink } from "frontend/components/player-profile/PlayerFriendLink";
import Head from "next/head";
import { useRouter } from "next/router";
import { z } from "zod";

export type PlayerMMR = {
  rank: number;
  leagueType: string;
  topMmr: number;
  mmr: number;
  wins: number;
  losses: number;
  draws: number;
};

const playerMMRArray: PlayerMMR[] = [
  {
    rank: 1,
    leagueType: "Standard",
    topMmr: 3000,
    mmr: 2800,
    wins: 50,
    losses: 30,
    draws: 5,
  },
  {
    rank: 32,
    leagueType: "Fog of War",
    topMmr: 3200,
    mmr: 3100,
    wins: 60,
    losses: 20,
    draws: 10,
  },
  {
    rank: 21,
    leagueType: "High Funds",
    topMmr: 3400,
    mmr: 3300,
    wins: 70,
    losses: 10,
    draws: 15,
  },
  {
    rank: 65,
    leagueType: "Standard Live",
    topMmr: 543,
    mmr: 3244,
    wins: 34,
    losses: 423,
    draws: 52,
  },
  {
    rank: 34322,
    leagueType: "Fog of War Live",
    topMmr: 990,
    mmr: 1200,
    wins: 23,
    losses: 2,
    draws: 1,
  },
  {
    rank: 54,
    leagueType: "High Funds Live",
    topMmr: 900,
    mmr: 324,
    wins: 12,
    losses: 21,
    draws: 21,
  },
];

export default function UserProfile() {
  const { query } = useRouter();

  const playerNameParse = z.string().safeParse(query?.playerName);

  if (!playerNameParse.success) {
    return <p>Error!</p>;
  }

  const playerName = playerNameParse.data;

  return (
    <>
      <Head>
        <title>{playerName} | Wars World</title>
      </Head>

      <div className="@flex @flex-col @justify-center @items-center @align-middle">
        <div className="@w-[95vw] @m-4 @px-4">
          <PlayerProfileMainSection
            playerName={playerName ?? ""}
            description="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quaerat, sed recusandae,
                perspiciatis libero minima porro ut quisquam alias vero ratione reiciendis optio
                voluptates totam dolor soluta enim repellendus asperiores voluptatum. Lorem ipsum
                dolor sit amet, consectetur adipisicing elit. Provident ipsam consequatur excepturi
                accusantium quos, eum et?"
            preferedCO="sasha"
            preferedNation="orange-star"
            realName="Real Name"
            lastActivity="05/21/2024 05:04pm"
            isOnline={true}
          />
          <div className="@flex @space-x-4">
            <div className="@col-span-6 @h-full @w-[75%]">
              {/* Show general league stats */}
              <PLayerLeagueGeneralSection playerLeaguesMMR={playerMMRArray} />
              {/* Fully shows stats for one league */}
              <PlayerSelectLeagueSection playerMMRArray={playerMMRArray} />
              <section className="@pb-8 @px-8 @h-full @w-full @bg-black/60 @my-4 @space-y-2">
                <h1 className="@col-span-3 @text-center @font-russoOne">Favorite Games</h1>
                <div className="@grid @grid-cols-4 @h-48 @gap-4">
                  <div className="@w-full @h-full @border-primary @border-4 @bg-bg-secondary">
                    <p className="@text-center">GAME</p>
                  </div>
                  <div className="@w-full @h-full @border-primary @border-4 @bg-bg-secondary">
                    <p className="@text-center">GAME</p>
                  </div>
                  <div className="@w-full @h-full @border-primary @border-4 @bg-bg-secondary">
                    <p className="@text-center">GAME</p>
                  </div>
                  <div className="@w-full @h-full @border-primary @border-4 @bg-bg-secondary">
                    <p className="@text-center">GAME</p>
                  </div>
                </div>
              </section>
            </div>
            <div className="@h-full @w-[25%]">
              <section className="@w-full @min-h-[56rem] @bg-black/60 @pb-8 @p-6 @my-4">
                <h3 className="@font-russoOne @uppercase">Friends</h3>
                <div className="@flex @flex-col @w-full @px-1 @py-6 @space-y-4">
                  <PlayerFriendLink
                    friendName="Master Chief"
                    friendFavArmy="orange-star"
                    friendFavCO="adder"
                  />
                  <PlayerFriendLink
                    friendName="Alm"
                    friendFavArmy="green-earth"
                    friendFavCO="andy"
                  />
                  <PlayerFriendLink
                    friendName="Professor Layton"
                    friendFavArmy="blue-moon"
                    friendFavCO="grit"
                  />
                  <PlayerFriendLink
                    friendName="Griffith"
                    friendFavArmy="yellow-comet"
                    friendFavCO="kanbei"
                  />
                  <PlayerFriendLink
                    friendName="Yukimura204254 Echoes and Knuckles"
                    friendFavArmy="black-hole"
                    friendFavCO="lash"
                  />
                  <PlayerFriendLink
                    friendName="The Arbiter"
                    friendFavArmy="blue-moon"
                    friendFavCO="javier"
                  />
                  <PlayerFriendLink
                    friendName="Grimm Guy"
                    friendFavArmy="yellow-comet"
                    friendFavCO="grimm"
                  />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
