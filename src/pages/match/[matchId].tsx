import Head from 'next/head';
import {
  BuildableUnit,
  factoryBuildableUnits,
} from 'components/match/unit-builder';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  MapTile,
  PlayerInMatch,
  PlayerState,
  UnitOnMap,
} from 'server/map-parser';
import { trpc } from 'utils/trpc';
import { Army } from 'utils/wars-world-types';
import styles from '../../styles/match.module.css';
import { Layout } from 'components/layout';
import { useMediaQuery } from 'utils/useMediaQuery';
import { IngameInfo } from 'components/IngameInfo';

interface Props {
  playerTurn: boolean;
  playerInMatch: PlayerInMatch;
}

const PlayerBox = ({ playerTurn, playerInMatch: playerInMatch }: Props) => {
  const time = new Date(0);
  time.setSeconds(playerInMatch.timePlayed ?? 1);

  const nationColorGradients: Record<string, string> = {
    blue: '@bg-gradient-to-l @from-blue-400',
    orange: '@bg-gradient-to-l @from-orange-400',
    green: '@bg-gradient-to-l @from-green-400',
    yellow: '@bg-gradient-to-l @from-yellow-400',
  };

  return (
    <div className="playerBox @relative @z-25">
      <div className="playerCOAndNationBox">
        <div
          className={`@relative ${
            nationColorGradients[playerInMatch.color]
          } playerCOBox`}
        >
          <img
            className={`@absolute @bottom-0 playerCOIcon ${
              playerTurn ? '' : 'isNotPlayerTurn'
            }`}
            src={`/img/CO/${playerInMatch.co}-Full.png`}
          />
          <img
            className="@absolute @h-8 @top-1 @right-1 @bg-slate-200"
            src={`/img/nations/${playerInMatch.nation}.webp`}
          />
        </div>
        <div className="playerNationBox">
          <div className="playerUsernameIconAndIngameStats">
            <div className="@flex @items-center @bg-stone-900 playerUsername">
              {playerInMatch.username}
            </div>
            <div className="@flex @items-center @justify-center @bg-stone-900 playerIngameExp">
              Placeholder for an exp bar
            </div>
            <div className="@flex @flex-col playerIngameInfo">
              <IngameInfo
                ingameStatIconPath=""
                ingameStat={time.toISOString().substring(11, 19)}
              />
              <IngameInfo
                ingameStatIconPath={`/img/units/${playerInMatch.nation}/Infantry-0.png`}
                ingameStat={999}
              />
              <IngameInfo
                ingameStatIconPath="/img/mapTiles/countries/city/ne1.webp"
                ingameStat={999999}
              />
              <IngameInfo ingameStatIconPath="" ingameStat={999999} />
              <IngameInfo ingameStatIconPath="" ingameStat={999999} />
              {/* <IngameInfo
                statsIconPath="Time"
                ingameStat={time.toISOString().substring(11, 19)}
              />
              <IngameInfo statsIconPath="Units" ingameStat={playerInMatch.unitCount} />
              <IngameInfo statsIconPath="Income" ingameStat={playerInMatch.properties} />
              <IngameInfo statsIconPath="Gold" ingameStat={playerInMatch.gold} />
              <IngameInfo
                statsIconPath="Army-Value"
                ingameStat={playerInMatch.properties * 1000}
              /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type Segment = {
  tile: MapTile;
  squareHighlight: JSX.Element | null;
  menu: JSX.Element | null;
};

const Unit = ({ unit }: { unit: UnitOnMap }) => (
  <div className={unit.country + unit.name + ' tileUnit'}></div>
);

const HPAndCapture = ({ unit }: { unit: UnitOnMap }) => (
  <>
    {unit.hp <= 100 && (
      <div className={`HP${Math.ceil(unit.hp / 10)}Icon`}></div>
    )}
    {unit.capture && <div className={`captureIcon`}></div>}
  </>
);

export default function Match() {
  const [players, setPlayers] = useState<PlayerState | null | undefined>(null);
  const [segments, setSegments] = useState<Segment[] | null | undefined>(null);
  const query1000 = useMediaQuery('(max-width: 1000px)');

  segments
    ?.filter((s) => s.tile.unit)
    .forEach((seg) => console.log('has-unit', seg));

  // Original functionality for turn
  // const turn = 2;

  // const isTurn = (army: Army) => {
  //   switch (army) {
  //     case 'orangeStar':
  //       return turn % 2 === 0;
  //     case 'blueMoon':
  //       return turn % 2 === 1;
  //     case null:
  //       return false;
  //   }
  // };

  const reset = () => {
    if (segments == null) {
      return;
    }

    setSegments(
      segments.map((segment) => ({
        ...segment,
        menu: null,
        squareHighlight: null,
      })),
    );
  };

  const updateSegment = (
    index: number,
    updater: (oldSegment: Segment) => Segment,
  ) => {
    console.trace('updateSegment trace');

    setSegments(
      segments?.map((oldSegment, i) => {
        if (i === index) {
          const newSegment = updater(oldSegment);
          console.log('newSeg', newSegment);
          return newSegment;
        }

        return oldSegment;
      }),
    );
  };

  const updatePlayerUnits = (army: Army, unitCost: number) => {
    if (players == null || army == null) {
      return;
    }

    const oldPlayerInMatch = players[army];

    const newPlayerInMatch: PlayerInMatch = {
      ...oldPlayerInMatch,
      unitCount: oldPlayerInMatch.unitCount + 1,
      gold: oldPlayerInMatch.gold - unitCost,
    };

    setPlayers({
      ...players,
      [army]: newPlayerInMatch,
    });
  };

  const buildUnit = (
    index: number,
    buildableUnit: BuildableUnit,
    army: Army,
  ) => {
    updateSegment(index, (oldSegment) => ({
      ...oldSegment,
      tile: {
        ...oldSegment.tile,
        unit: {
          name: buildableUnit.name,
          country: army,
          hp: 100,
          isUsed: true,
          capture: false,
        },
      },
    }));

    updatePlayerUnits(army, buildableUnit.cost);
  };

  const { query } = useRouter();
  const matchId = query.matchId as string;

  trpc.match.full.useQuery(matchId, {
    onSuccess(data) {
      if (data === null) {
        throw new Error(`Match ${matchId} not found!`);
      }

      if (!players) {
        setPlayers(data.matchState.playerState);
      }

      if (!segments) {
        setSegments(
          data.matchState.mapTiles.map((tile) => ({
            tile,
            menu: null,
            squareHighlight: null,
          })),
        );
      }
    },
  });

  trpc.match.moves.useSubscription(undefined, {
    onData: console.log,
  });

  // Original functionality for turns
  // const makeMove = trpc.match.makeMove.useMutation();

  // mock functionality for testing css transitions
  const [turn, setTurn] = useState({ player1: true, player2: false });

  const passTurn = () => {
    // Original function
    // makeMove.mutate({
    //   moveType: 'pass-turn',
    // });

    // mock function for testing css transition
    setTurn({ player1: !turn.player1, player2: !turn.player2 });
  };

  if (players == null || segments == null) {
    return 'Loading..';
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Layout>
        <div className={styles.match + ' gameBox'}>
          {/* <h1>Match #{matchId}</h1> */}
          {query1000 ? (
            <div>
              <PlayerBox
                playerTurn={turn.player1}
                playerInMatch={players.orangeStar}
              />
              <PlayerBox
                playerTurn={turn.player2}
                playerInMatch={players.blueMoon}
              />
            </div>
          ) : (
            <PlayerBox
              playerTurn={turn.player1}
              playerInMatch={players.orangeStar}
            />
          )}
          <div className="@flex @items-center @justify-center gameInnerBox">
            <div className="gridSize18 mapGrid">
              {segments.map(({ tile, menu }, index) => {
                const { unit, terrainImage, terrainType, terrainOwner } = tile;

                return (
                  <div
                    key={index}
                    onClick={() => {
                      reset();
                      if (unit) {
                        // check path
                      } else if (terrainType === 'property') {
                        /* Original functionality for turns; UNCOMMENT ONCE ITS WORKING AGAIN*/
                        /* if (!isTurn(terrainOwner)) {
                          return;
                        } */

                        updateSegment(index, (oldSegment) => ({
                          ...oldSegment,
                          tile,
                          menu: (
                            <div className="tileMenu">
                              {factoryBuildableUnits.map((buildable, index) => (
                                <div
                                  key={index}
                                  className="menuOptions" // + menuNoBuy
                                  onClick={() =>
                                    buildUnit(index, buildable, terrainOwner)
                                  }
                                >
                                  <div
                                    className={`menu${terrainOwner}${buildable.menuName}`}
                                  ></div>
                                  <div className={`menuName`}>
                                    {' '}
                                    {buildable.menuName}
                                  </div>
                                  <div className={`menuCost`}>
                                    {' '}
                                    {buildable.cost}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ),
                          squareHighlight: null,
                        }));
                      }
                    }}
                    className={`mapTile ${
                      unit && unit.isUsed ? 'stateUsed' : ''
                    }`}
                  >
                    <div className={`tileTerrain ${terrainImage}`}></div>

                    {unit && <Unit unit={unit} />}
                    {null /** tileSquare */}
                    {menu}
                    {unit && <HPAndCapture unit={unit} />}
                    <div className="tileCursor"></div>
                  </div>
                );
              })}
            </div>
            <div className="@flex @items-center @justify-center gameTime">
              <p>00:00:00</p>
              <button onClick={passTurn}>Pass turn</button>
            </div>
          </div>
          {query1000 ? null : (
            <PlayerBox
              playerTurn={turn.player2}
              playerInMatch={players.blueMoon}
            />
          )}
        </div>
      </Layout>
    </>
  );
}
