import Link from "next/link";
import type { COID } from "shared/schemas/co";

type SmallMatchCardPlayer = {
  coId: COID;
  name: string;
};
type Props = {
  matchResult: "W" | "L" | "D";
  player1: SmallMatchCardPlayer;
  player2: SmallMatchCardPlayer;
  matchLink: string;
};

const resultColors = {
  W: "@bg-green-earth",
  L: "@bg-orange-star",
  D: "@bg-bg-tertiary",
};

export default function SmallMatchCard({ matchResult, player1, player2, matchLink }: Props) {
  return (
    <Link
      className="@flex @bg-black/50 @text-center @text-white @cursor-pointer hover:@text-white hover:@translate-x-2"
      href={matchLink}
    >
      <div
        className={`@flex ${resultColors[matchResult]} @h-full @min-w-20 @font-russoOne @text-4xl @align-middle @justify-center @items-center`}
      >
        <strong>{matchResult}</strong>
      </div>
      <div className="@grid @grid-cols-2 @w-full @mx-2">
        <div className="@flex @items-center">
          <img
            className="[image-rendering:pixelated] @grayscale @h-16"
            src={`/img/CO/pixelated/${player1.coId.name}-small.png`}
            alt={player1.coId.name}
          />
          <p className="@self-start @px-2">{player1.name}</p>
        </div>
        <div className="@flex @items-center @justify-end">
          <p className="@self-end @px-2">{player2.name}</p>
          <img
            className="[image-rendering:pixelated] @scale-x-[-1] @h-16"
            src={`/img/CO/pixelated/${player2.coId.name}-small.png`}
            alt={player2.coId.name}
          />
        </div>
      </div>
    </Link>
  );
}
