import { moveUnit } from 'components/match/move-unit';
import { BlueTiles, pathFinding } from 'components/match/path-finding';
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

const smallPadding: CSSProperties = {
  padding: '0.2rem',
};

const PlayerBox = ({
  playerInMatch,
  hasTurn,
}: {
  playerInMatch: PlayerInMatch;
  hasTurn: boolean;
}) => {
  const time = new Date(0);
  time.setSeconds(playerInMatch.timePlayed ?? 1);

  return (
    <div
      style={{
        width: '300px',
        border: '4px solid black',
        fontSize: '1.2rem',
        opacity: hasTurn ? 1 : 0.5,
      }}
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

export type Segment = {
  tile: MapTile;
  squareHighlight: JSX.Element | null;
  menu: JSX.Element | null;
};

const Unit = ({ unit }: { unit: UnitOnMap }) => (
  <div className={unit.country + unit.cssClassName + ' tileUnit'}></div>
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
  const [turn, setTurn] = useState(1);

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

    setSegments((oldSegments) =>
      oldSegments?.map((segment) => ({
        ...segment,
        menu: null,
        squareHighlight: null,
      })),
    );
  };

  const updateSegment = (
    index: number,
    updater: (oldSegment: Segment) => Partial<Segment>,
  ) => {
    setSegments((oldSegments) =>
      oldSegments?.map((oldSegment, i) => {
        if (i === index) {
          const newSegmentPartial = updater(oldSegment);
          return { ...oldSegment, ...newSegmentPartial };
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
      tile: {
        ...oldSegment.tile,
        unit: {
          cssClassName: buildableUnit.displayName,
          type: buildableUnit.type,
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

  // trpc.match.moves.useSubscription(undefined, {
  //   onData: console.log,
  // });

  const makeMove = trpc.match.makeMove.useMutation();

  const passTurn = () => {
    setTurn(turn + 1);

    makeMove.mutate({
      moveType: 'pass-turn',
    });
  };

  const drawPath = ({
    blueTiles,
    startingTileIndex,
    targetTileIndex,
  }: {
    blueTiles: BlueTiles;
    startingTileIndex: number;
    targetTileIndex: number;
  }) => {
    if (segments == null) {
      return;
    }

    const movePath = moveUnit(blueTiles, targetTileIndex);

    setSegments(
      segments.map((s, index) => {
        if (movePath.some((m) => m === index)) {
          return { ...s, squareHighlight: <div className="tilePath"></div> };
        }

        if (blueTiles.tilesToDraw.some((t) => t.index === index)) {
          return {
            ...s,
            squareHighlight: (
              <div
                className="tileMove"
                onMouseEnter={() => {
                  drawPath({
                    blueTiles,
                    targetTileIndex,
                    startingTileIndex,
                  }); // targetTile unsure
                }}
              ></div>
            ),
          };
        }

        return { ...s, squareHighlight: null };
      }),
    );
  };

  const checkPath = (tile: MapTile, tileIndex: number) => {
    if (tile.unit === false || segments == null) {
      return;
    }

    const blueTiles = pathFinding(
      18,
      18,
      tile.unit.type,
      tileIndex,
      segments,
      false,
    );

    setSegments(
      segments.map((s, index) => {
        const foundBlueTileMatch = blueTiles.tilesToDraw.find(
          (t) => t.index === index,
        );

        if (foundBlueTileMatch === undefined) {
          return s;
        }

        return {
          ...s,
          squareHighlight: foundBlueTileMatch.hasEnemy ? (
            <div
              className="tileEnemy"
              onMouseEnter={() => {
                // battleForecast(tileIndex, index, false);
              }}
              onMouseLeave={() => {
                updateSegment(index, () => ({
                  // useFunction newPosition(blueTiles, tile.index, initialTile);
                }));
              }}
            ></div>
          ) : (
            <div
              className="tileMove"
              onMouseEnter={() => {
                console.log('enter');
                drawPath({
                  blueTiles,
                  startingTileIndex: index,
                  targetTileIndex: tileIndex,
                });
              }}
            ></div>
          ),
        };
      }),
    );
  };

  if (players == null || segments == null) {
    return 'Loading..';
  }

  return (
    <div className={styles.match + ' gameBox'}>
      <h1>Match #{matchId}</h1>
      <button onClick={passTurn}>Pass turn</button>
      <div className={styles.gap}>
        <PlayerBox
          playerInMatch={players.orangeStar}
          hasTurn={isTurn('orangeStar')}
        />
        <div className="gridSize18 mapGrid">
          {segments.map(({ tile, menu, squareHighlight }, tileIndex) => {
            const { unit, terrainImage, terrainType, terrainOwner } = tile;

            return (
              <div
                key={tileIndex}
                onClick={() => {
                  reset();
                  if (unit) {
                    checkPath(tile, tileIndex);
                  } else if (terrainType === 'property') {
                    if (!isTurn(terrainOwner) || menu !== null) {
                      return;
                    }

                    updateSegment(tileIndex, () => ({
                      menu: (
                        <div className="tileMenu">
                          {factoryBuildableUnits.map(
                            (buildable, buildableUnitIndex) => (
                              <div
                                key={buildableUnitIndex}
                                className="menuOptions" // + menuNoBuy
                                onClick={() =>
                                  buildUnit(tileIndex, buildable, terrainOwner)
                                }
                              >
                                <div
                                  className={`menu${terrainOwner}${buildable.displayName}`}
                                ></div>
                                <div className={`menuName`}>
                                  {' '}
                                  {buildable.displayName}
                                </div>
                                <div className={`menuCost`}>
                                  {' '}
                                  {buildable.cost}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ),
                      squareHighlight: null,
                    }));
                  }
                }}
                className={`mapTile ${unit && unit.isUsed ? 'stateUsed' : ''}`}
              >
                <div className={`tileTerrain ${terrainImage}`}></div>
                {unit && <Unit unit={unit} />}
                {squareHighlight}
                {menu}
                {unit && <HPAndCapture unit={unit} />}
                <div className="tileCursor"></div>
              </div>
            );
          })}
        </div>
        <PlayerBox
          playerInMatch={players.blueMoon}
          hasTurn={isTurn('blueMoon')}
        />
      </div>
    </div>
  );
}
