import { BackendMatchState } from "../types/server-match-state";

type Version = "aw2";

type MatchStateMutation = (matchState: BackendMatchState) => void;

type VersionPowerMapping = Record<Version, MatchStateMutation>;

type Power = "meteorStrike";

export const instantPowerEffects: Partial<Record<Power, VersionPowerMapping>> =
  {
    meteorStrike: {
      aw2(matchState) {
        for (const unit of matchState.units) {
          // TODO obviously this is not how meteor strike works lol
          unit.stats.hp = Math.max(1, unit.stats.hp - 3);
        }
      },
    },
  };
