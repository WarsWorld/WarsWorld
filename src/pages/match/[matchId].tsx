import { CSSProperties, useState } from 'react';
import { MapTile, PlayerInMatch, PlayerState } from 'server/map-parser';
import { trpc } from 'utils/trpc';
import styles from '../../styles/match.module.css';
import { useRouter } from 'next/router';

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

export default function Match() {
  const [players, setPlayers] = useState<PlayerState | null | undefined>(null);
  const [map, setMap] = useState<MapTile[] | null | undefined>(null);

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

      if (!map) {
        setMap(data.matchState.mapTiles);
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

  if (players == null || map == null) {
    return 'Loading..';
  }

  return (
    <div className={styles.match}>
      <h1>Match #69420</h1>
      <button onClick={passTurn}>Pass turn</button>
      <div className={styles.gap}>
        <PlayerBox playerInMatch={players.orangeStar} />
        <div>
          {map.map((tile, index) => (
            <div
              key={index}
              // onClick={useFunction}
              className={`mapTile ${
                tile.tileUnit && tile.tileUnit.isUsed ? 'stateUsed' : ''
              }`}
            >
              <div className={`tileTerrain ${tile.terrainImage}`}></div>
              {tile.tileUnit && (
                <div
                  className={
                    tile.tileUnit.country + tile.tileUnit.name + ' tileUnit'
                  }
                ></div>
              )}
              {null /** tileSquare */}
              {null /** showMenu */}
              {tile.tileUnit && (
                <>
                  {tile.tileUnit.hp <= 100 && (
                    <div
                      className={`HP${Math.ceil(tile.tileUnit.hp / 10)}Icon`}
                    ></div>
                  )}
                  {tile.tileUnit.capture && (
                    <div className={`captureIcon`}></div>
                  )}
                </>
              )}
              <div className="tileCursor"></div>
            </div>
          ))}
        </div>
        <PlayerBox playerInMatch={players.blueMoon} />
      </div>
    </div>
  );
}
