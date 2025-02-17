import COCalculator from "./COCalculator";
// import { CO } from "../../../shared/schemas/co"; // TODO: unused import
import type { PlayerInMatch } from "shared/types/server-match-state";

type Props = {
  player: PlayerInMatch;
};

export default function Calculator({ player }: Props) {
  return (
    <>
      <h1>Calculator</h1>
      <div className="@grid @grid-cols-12 @gap-2 @bg-bg-primary">
        <div className="@col-span-12 @flex @bg-bg-tertiary @align-middle @justify-between @p-2">
          <p>Attacker</p>
          <button className="btn ">Swap</button>
          <p>Defender</p>
        </div>

        <COCalculator
          gold={player.funds}
          co={player.coId.name}
          capture={10}
          commtower={1}
          coPower={false}
        />
        <COCalculator
          gold={player.funds}
          co={player.coId.name}
          capture={10}
          commtower={1}
          coPower={false}
        />
        <div className="@col-span-6 @flex-row @bg-bg-secondary">
          <div className="@flex">UNIT ATTACKER #1</div>

          <div className="@flex">UNIT ATTACKER #2</div>
        </div>

        <div className="@col-span-6 @flex @bg-bg-secondary">
          <div className="@flex">CounterAttack</div>
          <div className="@flex">UNIT Defender</div>
        </div>

        <div className="@col-span-6 @flex @bg-bg-tertiary">TOTAL UNIT</div>

        <div className="@col-span-6 @flex @bg-bg-tertiary">KO Chance</div>

        <div className="@col-span-6 @flex @bg-bg-secondary">TOTAL Gold/Bar made #1</div>

        <div className="@col-span-6 @flex @bg-bg-secondary">TOTAL Gold/Bar made #2</div>
      </div>
    </>
  );
}
