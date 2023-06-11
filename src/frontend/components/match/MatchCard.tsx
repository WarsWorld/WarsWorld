import { MatchStatus, Player } from "@prisma/client";
import { usePlayers } from "frontend/context/players";
import {
  COEnum,
  MatchType,
  MatchTypeShort,
  SideEnum,
  TurnStyleEnum,
  TurnStyleString,
} from "frontend/utils/enums";
import React from "react";
import { MapBasic } from "shared/types/component-data";
import { PlayerInMatch } from "shared/types/server-match-state";
import PlayerNameBar from "./PlayerNameBar";

interface Props {
  map: MapBasic;
  playersInMatch: PlayerInMatch[];
  state: MatchStatus;
  turn: number;
  spectators: number;
  favorites: number;
}

export default function MatchCard({
  map,
  playersInMatch,
  state,
  turn,
  spectators,
  favorites,
}: Props) {
  const { ownedPlayers } = usePlayers();
  const playerMatches: (Player | undefined)[] = playersInMatch?.map((p) =>
    ownedPlayers?.find((op) => op.id === p.playerId)
  );
  const isDuel = playersInMatch?.length === 2;
  const liveDiv = (
    <>
      <img className="@h-4" src="/img/matchCard/liveDot.png" />
      <p>{TurnStyleString[TurnStyleEnum.Live]}</p>
    </>
  );
  //Maybe pull from match state later
  const turnStyle = TurnStyleEnum[Math.floor(Math.random() * 2)];
  const isLive = turnStyle === TurnStyleEnum[TurnStyleEnum.Live];
  //Determine value based off match rules. Can be multiple
  const matchType: MatchType[] = [MatchType.Standard];
  const matchTypeString = matchType.map((mt) => MatchTypeShort[mt]).join(" + ");
  //TODO: Replace with real data
  const randomRank = Math.floor(Math.random() * 1500).toString();
  const randomRank2 = Math.floor(Math.random() * 1500).toString();

  const armyIndex = Math.floor(Math.random() * 4);
  let armyIndex2 = Math.floor(Math.random() * 4);
  if (armyIndex2 === armyIndex) {
    armyIndex === 3 ? armyIndex2-- : armyIndex2++;
  }

  const co1 = COEnum[Math.floor(Math.random() * 26)];
  const co2 = COEnum[Math.floor(Math.random() * 26)];

  //in seconds
  const timeElapsedD: number = Math.floor(Math.random() * 1000);
  const timeElapsedH: number = Math.floor(Math.random() * 24);
  const timeElapsedM: number = Math.floor(Math.random() * 60);

  return (
    <div className="@flex @flex-col @bg-black/50 @my-4 @shadow-black/60 @cursor-pointer hover:@scale-105 @transition @h-[300px] @w-[600px]">
      <div
        id="mapBar"
        className="@flex @flex-grow-0 @flex-shrink-0 @h-8 @items-center @bg-bg-tertiary @shadow-md"
      >
        <div className="@w-4/5 @text-left @px-2 @truncate">{map.name}</div>
        <div className="@w-1/5 @flex @flex-col @h-full @justify-center @bg-match-orange">{`DAY ${turn}`}</div>
      </div>
      <div
        className="@relative @flex @flex-col @justify-between @flex-grow @flex-shrink"
        style={{
          backgroundImage: `url("/img/matchCard/mapBgDemo.png")`,
          backgroundSize: "cover",
        }}
      >
        <div
          className="@absolute @inset-0"
          style={{
            backgroundImage: `url("/img/matchCard/mapBgDemo.png")`,
            backgroundSize: "cover",
          }}
        ></div>
        <div className="@absolute @inset-0 @bg-black @opacity-70"></div>
        <div className="@relative @flex @flex-col @justify-between @flex-grow @flex-shrink @z-10">
          <div className="@flex @h-8 @max-w-full">
            <div
              className={`@flex @items-center @justify-center @gap-2 @px-2 @min-w-20 ${
                isLive ? "@bg-bg-match-live" : "@bg-bg-secondary"
              }`}
            >
              {isLive ? liveDiv : TurnStyleString[TurnStyleEnum.Async]}
            </div>
            <div className="@flex @items-center @justify-center @min-w-20 @bg-bg-primary">
              {matchTypeString}
            </div>
            <div className="@flex @items-center @gap-2 @px-2 @bg-bg-secondary">
              <img className="@h-4" src="/img/matchCard/eye.png" />
              {` ${spectators}`}
            </div>
            <div className="@flex @items-center @gap-2 @px-2 @bg-bg-primary">
              <img className="@h-4" src="/img/matchCard/star.png" />
              {` ${favorites}`}
            </div>
            <div className="@flex @items-center @gap-2 @px-2 @truncate @bg-bg-secondary">
              <img className="@h-4" src="/img/matchCard/clock.png" />
              {` ${timeElapsedD}d : ${timeElapsedH}h : ${timeElapsedM}m`}
            </div>
          </div>
          <div id="coImages" className="@flex @justify-between @h-[200px]">
            <div className="@flex @flex-col @overflow-hidden @pl-4 @items-end">
              <img
                className="@transform @scale-x-[-1] @max-w-[200px] @object-contain"
                src={`/img/CO/smoothFull/Awds-${co1}.webp`}
              />
            </div>
            <div className="@flex @flex-col @overflow-hidden @pr-4 @items-end">
              <img
                className="@max-w-[200px] @object-contain"
                src={`/img/CO/smoothFull/Awds-${co2}.webp`}
              />
            </div>
          </div>
        </div>
        <div id="playerRow" className="@h-8 @z-10">
          <div className="@flex @h-full @justify-between @self-end @gap-2">
            <PlayerNameBar
              name={playerMatches[0]?.name}
              rank={randomRank}
              armyIndex={armyIndex}
              iconSide={SideEnum.Left}
            />
            <PlayerNameBar
              name={playerMatches[1]?.name}
              rank={randomRank2}
              armyIndex={armyIndex2}
              iconSide={SideEnum.Right}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
