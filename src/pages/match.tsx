import { Player } from '@prisma/client';
import { CSSProperties } from 'react';
import styles from '../styles/match.module.css';

type CO = {
  name: string;
  img: string;
};

type DisplayPlayer = {
  player: Player;
  co: CO;
  color: string;
  armyValue: number;
  timePlayed: number;
  unitCount: number;
  properties: number;
  gold: number;
};

const smallPadding: CSSProperties = {
  padding: '0.2rem',
};

const PlayerBox = ({ displayPlayer }: { displayPlayer: DisplayPlayer }) => {
  const time = new Date(0);
  time.setSeconds(displayPlayer.timePlayed ?? 1);

  return (
    <div
      style={{ width: '300px', border: '4px solid black', fontSize: '1.2rem' }}
    >
      <div className={styles.segment}>(img)</div>
      <div
        style={{
          backgroundColor: displayPlayer.color,
          color: 'white',
          fontWeight: 'bolder',
          display: 'flex',
          justifyContent: 'space-between',
          ...smallPadding,
        }}
      >
        <span>{displayPlayer.player.name}</span>
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
            <span className={styles.segment}>Gold: {displayPlayer.gold}</span>
          </div>
          <div className={styles.segment}>Placeholder for an exp bar</div>
        </div>
        <div
          style={{ width: '40%', flexDirection: 'column' }}
          className={styles.gap}
        >
          <p className={styles.segment}>Units: {displayPlayer.unitCount}</p>
          <p className={styles.segment}>
            Army-Value: {displayPlayer.properties * 1000}
          </p>
          <p className={styles.segment}>Income: {displayPlayer.properties}</p>
        </div>
      </div>
    </div>
  );
};

const cos: Record<string, CO> = {
  sami: {
    name: 'Sami',
    img: 'Sami-Full',
  },
  max: {
    name: 'Max',
    img: 'Max-Full',
  },
};

const createDisplayPlayer = (name: string, color: string): DisplayPlayer => ({
  player: {
    id: '123',
    name,
    secret: false,
    mmr: 1300,
    top_mmr: 1300,
    youtubeChannelId: null,
    twitchUserName: null,
    achievements: [],
    favourite_COs: [],
    favourite_games: [],
    favourite_units: [],
    matchConsentId: null,
    matchId: null,
    preferences: null,
    userId: null,
  },
  armyValue: 0,
  co: cos.sami,
  color,
  timePlayed: 60,
  unitCount: 0,
  properties: 3,
  gold: 3000,
});

export default function Match() {
  const players: Record<string, DisplayPlayer> = {
    orangeStar: createDisplayPlayer('Function', 'orange'),
    blueMoon: createDisplayPlayer('Femboy', 'blue'),
  };

  return (
    <div className={styles.match}>
      <h1>Match #69420</h1>
      <button>Pass turn</button>
      <PlayerBox displayPlayer={players.orangeStar} />
      (match)
      <PlayerBox displayPlayer={players.blueMoon} />
    </div>
  );
}
