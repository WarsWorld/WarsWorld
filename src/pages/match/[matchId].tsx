import Head from 'next/head';
import {
  BuildableUnit,
  factoryBuildableUnits,
} from 'components/match/unit-builder';
import { useRouter } from 'next/router';
import { CSSProperties, useState } from 'react';
import {
  MapTile,
  PlayerInMatch,
  PlayerState,
  UnitOnMap,
} from 'server/map-parser';
import { trpc } from 'utils/trpc';
import { Army } from 'utils/wars-world-types';
import styles from '../../styles/match.module.css';
import Layout from 'components/Layout';

const smallPadding: CSSProperties = {
  padding: '0.2rem',
};

const PlayerBox = ({
  playerInMatch: playerInMatch,
}: {
  playerInMatch: PlayerInMatch;
}) => {
  const time = new Date(0);
  time.setSeconds(playerInMatch.timePlayed ?? 1);

  return (
    <div
      style={{ width: '300px', border: '4px solid black', fontSize: '1.2rem' }}
    >
      <div className={styles.segment}>
        <img
          style={{
            height: 100,
            width: '100%',
            objectFit: 'none',
            objectPosition: '0 0',
          }}
          src={`/img/CO/${playerInMatch.co}-Full.png`}
        />
      </div>
      <div
        style={{
          backgroundColor: playerInMatch.color,
          color: 'white',
          fontWeight: 'bolder',
          display: 'flex',
          justifyContent: 'space-between',
          ...smallPadding,
        }}
      >
        <span>{playerInMatch.username}</span>
        <span>(armyIcon)</span>
      </div>
      <div
        style={{ display: 'flex', gap: '0.5rem', border: '2px solid green' }}
      >
        <div className={styles.gap} style={{ flexDirection: 'column' }}>
          <div className={styles.gap}>
            <span className={styles.segment}>
              {time.toISOString().substring(11, 19)}
            </span>
            <span className={styles.segment}>Gold: {playerInMatch.gold}</span>
          </div>
          <div className={styles.segment}>Placeholder for an exp bar</div>
        </div>
        <div
          style={{ width: '40%', flexDirection: 'column' }}
          className={styles.gap}
        >
          <p className={styles.segment}>Units: {playerInMatch.unitCount}</p>
          <p className={styles.segment}>
            Army-Value: {playerInMatch.properties * 1000}
          </p>
          <p className={styles.segment}>Income: {playerInMatch.properties}</p>
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

  segments
    ?.filter((s) => s.tile.unit)
    .forEach((seg) => console.log('has-unit', seg));

  const turn = 2;

  const isTurn = (army: Army) => {
    switch (army) {
      case 'orangeStar':
        return turn % 2 === 0;
      case 'blueMoon':
        return turn % 2 === 1;
      case null:
        return false;
    }
  };

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

  const makeMove = trpc.match.makeMove.useMutation();

  const passTurn = () => {
    makeMove.mutate({
      moveType: 'pass-turn',
    });
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
        <div className={styles.match + ' gameBox' + ' layoutMatch'}>
          <h1>Match #{matchId}</h1>
          <button onClick={passTurn}>Pass turn</button>
          <div className={styles.gap}>
            <PlayerBox playerInMatch={players.orangeStar} />
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
                        if (!isTurn(terrainOwner)) {
                          return;
                        }

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
            <PlayerBox playerInMatch={players.blueMoon} />
          </div>
        </div>
      </Layout>
    </>
  );
}
