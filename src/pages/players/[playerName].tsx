import { PlayerFavoriteGamesSection } from "frontend/components/player-profile/player-sections/PlayerFavoriteGamesSection";
import { PlayerFriendSection } from "frontend/components/player-profile/player-sections/PlayerFriendsSection";
import { PLayerLeagueGeneralSection } from "frontend/components/player-profile/player-sections/PlayerLeagueGeneralSection";
import { PlayerProfileMainSection } from "frontend/components/player-profile/player-sections/PlayerProfileMainSection";
import { PlayerSelectLeagueSection } from "frontend/components/player-profile/player-sections/PlayerSelectLeagueSection";
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
        <div className="@w-[95%] tablet:@w-[80%] @m-4 smallscreen:@px-4">
          {/* Each Section calls the info? */}
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
          <div className="@flex  @flex-col laptop:@flex-row laptop:@space-x-4">
            <div className="@col-span-6 @h-full laptop:@w-[75%]">
              {/* 
                Show all profile sections, can add a best maps section, fav maps section, and we 
                can even make it so the user can personalize their profile sections,
                the user could change the order and which sessions will appear in their profile.
              */}
              <PLayerLeagueGeneralSection playerLeaguesMMR={playerMMRArray} />
              <PlayerSelectLeagueSection playerMMRArray={playerMMRArray} />
              <PlayerFavoriteGamesSection />
            </div>
            <div className="@min-h-full laptop:@w-[25%] @mb-8">
              <PlayerFriendSection />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
