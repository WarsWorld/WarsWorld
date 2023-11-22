import type { MatchStatus, Player } from "@prisma/client";
import { usePlayers } from "frontend/context/players";
import {
  COEnum,
  MatchType,
  MatchTypeShort,
  SideEnum
} from "frontend/utils/enums";
import type { CO } from "shared/schemas/co";
import type { MapBasic } from "shared/types/component-data";
import type { PlayerInMatch } from "shared/types/server-match-state";
import PlayerNameBar from "./PlayerNameBar";
import Image from "next/image";

type Props = {
  map: MapBasic;
  playersInMatch: PlayerInMatch[];
  state: MatchStatus;
  turn: number;
  spectators: number;
  favorites: number;
};

type DuelInnerProps = {
  co1: string;
  co2: string;
};

const DuelInner = ({ co1, co2 }: DuelInnerProps) => (
  <div id="coImages" className="@flex @justify-between @h-[200px]">
    <div className="@flex @flex-col @overflow-hidden tablet:@pl-4 @items-end">
      <Image
        className="@transform @scale-x-[-1] @max-w-[140px] tablet:@max-w-[200px] @object-cover"
        src={`/img/CO/smoothFull/Awds-${co1}.webp`}
        alt={co1}
      />
    </div>
    <div className="@flex @flex-col @overflow-hidden tablet:@pr-4 @items-end">
      <Image
        className="@max-w-[140px] tablet:@max-w-[200px] @object-cover"
        src={`/img/CO/smoothFull/Awds-${co2}.webp`}
        alt={co2}
      />
    </div>
  </div>
);

type MultiplayerInnerProps = {
  playersInMatch: PlayerInMatch[];
};

const MultiplayerInner = ({ playersInMatch }: MultiplayerInnerProps) => {
  const players: PlayerInMatch[] = new Array(Math.floor(Math.random() * 13) + 3)
    .fill(playersInMatch[0])
    .map((obj: PlayerInMatch) => ({
      ...obj
    }));

  const playersTeam1 = players.slice(0, Math.floor(players.length / 2));
  const playersTeam2 = players.slice(Math.floor(players.length / 2) + 1);
  return (
    <div className="@flex @items-center @justify-between @h-full">
      <div className="@flex @flex-col @w-[50%]">
        {playersTeam1.map((player, i) => {
          const iconSide = SideEnum.Left;
          return (
            <PlayerNameBar
              name="Player"
              rank={Math.floor(Math.random() * 1500).toString()}
              co={COEnum[Math.floor(Math.random() * 28)] as CO}
              armyIndex={Math.floor(Math.random() * 4)}
              iconSide={iconSide}
              multi={true}
              key={i}
            />
          );
        })}
      </div>
      <div className="@flex @flex-col @items-end @w-[50%]">
        {playersTeam2.map((player, i) => {
          const iconSide = SideEnum.Right;
          return (
            <PlayerNameBar
              name="Player"
              rank={Math.floor(Math.random() * 1500).toString()}
              co={COEnum[Math.floor(Math.random() * 28)] as CO}
              armyIndex={Math.floor(Math.random() * 4)}
              iconSide={iconSide}
              multi={true}
              key={i}
            />
          );
        })}
      </div>
    </div>
  );
};

type lowerPlayerBarProps = {
  randomRank: string;
  randomRank2: string;
  armyIndex: number;
  armyIndex2: number;
};

const LowerPlayerBar = ({
  randomRank,
  randomRank2,
  armyIndex,
  armyIndex2
}: lowerPlayerBarProps) => (
  <div className="@h-8 @z-10">
    <div className="@flex @h-full @justify-between">
      <PlayerNameBar
        name="Player"
        rank={randomRank}
        armyIndex={armyIndex}
        iconSide={SideEnum.Left}
      />
      <PlayerNameBar
        name="Player"
        rank={randomRank2}
        armyIndex={armyIndex2}
        iconSide={SideEnum.Right}
      />
    </div>
  </div>
);

export default function MatchCard({
  map,
  playersInMatch,
  turn,
  spectators,
  favorites
}: Props) {
  const { ownedPlayers } = usePlayers();
  const playerMatches: (Player | undefined)[] = playersInMatch?.map((p) =>
    ownedPlayers?.find((op) => op.id === p.id)
  );
  //const isDuel = playersInMatch?.length === 2;
  const isDuel = Math.floor(Math.random() * 2) === 1;

  //Determine value based off match rules. Can be multiple
  const matchType: MatchType[] = [MatchType.Standard];
  const matchTypeString = matchType.map((mt) => MatchTypeShort[mt]).join(" + ");
  //TODO: Replace with real data

  return (
    <div className="@flex @flex-col @bg-black/50 @my-4 @shadow-black/60 @cursor-pointer hover:@scale-105 @transition @h-[350px] @w-[85vw] @max-w-[400px] tablet:@max-w-[600px]">
      <div
        id="mapBar"
        className="@flex @flex-grow-0 @h-8 @items-center @bg-bg-tertiary @shadow-md"
      >
        <div className="@w-3/4 @text-left @px-2 @truncate">{map.name}</div>
        <div className="@w-1/4 @flex @flex-col @h-full @items-center @justify-center @bg-match-orange">{`DAY ${turn}`}</div>
      </div>
      <div
        className="@relative @flex @flex-col @justify-between @flex-grow"
        style={{
          backgroundImage: `url("/img/matchCard/mapBgDemo.png")`,
          backgroundSize: "cover"
        }}
      >
        <div className="@absolute @inset-0 @bg-black @opacity-70"></div>
        <div className="@relative @flex @flex-col @justify-between @flex-grow @z-10">
          <div className="@flex @flex-col tablet:@flex-row @h-[20%] tablet:@h-8 @max-w-full">
            <div className="@flex @h-8">
              <div className=""> LIVE</div>
              <div className="@flex @items-center @justify-center @flex-1 @min-w-20 @bg-bg-primary">
                <p>{matchTypeString}</p>
              </div>
            </div>
            <div className="@flex @h-8">
              <div className="@flex @items-center @gap-2 @px-2 @bg-bg-secondary">
                <Image
                  className="@h-4"
                  src="/img/matchCard/eye.png"
                  alt="eye"
                />
                <p> {spectators}</p>
              </div>
              <div className="@flex @items-center @gap-2 @px-2 @bg-bg-primary">
                <Image
                  className="@h-4"
                  src="/img/matchCard/star.png"
                  alt="star"
                />
                <p> {favorites}</p>
              </div>
              <div className="@flex @items-center @flex-1 @gap-2 @px-2 @bg-bg-secondary">
                <Image
                  className="@h-4"
                  src="/img/matchCard/clock.png"
                  alt="clock"
                />
                <p>
                  {" "}
                  {6}d : {23}h : {59}m
                </p>
              </div>
            </div>
          </div>
          {isDuel ? (
            <DuelInner co1={"Sami"} co2={"Lash"} />
          ) : (
            <MultiplayerInner playersInMatch={playersInMatch} />
          )}
        </div>
        {isDuel && (
          <LowerPlayerBar
            randomRank={"900"}
            randomRank2={"900"}
            armyIndex={0}
            armyIndex2={1}
          />
        )}
      </div>
    </div>
  );
}
