import Link from "next/link";
import type { CO } from "shared/schemas/co";

type SmallMatchCardPlayer = {
  co: CO;
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

export function SmallMatchCard({ matchResult, player1, player2, matchLink }: Props) {
  return (
    <Link
      className="@flex @bg-black/50 @text-center @text-white @cursor-pointer hover:@text-white hover:@translate-x-2"
      href={matchLink}
    >
      <div
        className={`@flex ${resultColors[matchResult]} @h-full @min-w-12 monitor:@min-w-16 @font-russoOne @text-2xl monitor:@text-4xl @align-middle @justify-center @items-center`}
      >
        <strong>{matchResult}</strong>
      </div>
      <div className="@relative @flex @w-full @justify-between @items-center">
        <img
          className="[image-rendering:pixelated] @h-10 monitor:@h-12 @opacity-10 @px-4"
          src={`/img/CO/pixelated/${player1.co}-small.png`}
          alt={player1.co}
        />
        <p className="@absolute @bottom-0 @px-2 @left-0 @text-sm @bg-transparent">{player1.name}</p>
        <div className="@absolute @opacity-10 @font-russoOne @text-4xl @bottom-0 @left-1/2 @translate-x-[-50%]">
          VS
        </div>
        <img
          className="[image-rendering:pixelated] @scale-x-[-1] @h-10 monitor:@h-12 @opacity-10 @px-4"
          src={`/img/CO/pixelated/${player2.co}-small.png`}
          alt={player2.co}
        />
        <p className="@absolute @top-0 @px-2 @right-0 @text-sm @bg-transparent">{player2.name}</p>
      </div>
    </Link>
  );
}
