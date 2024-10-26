import Link from "next/link";
import type { Army } from "shared/schemas/army";
import type { CO } from "shared/schemas/co";

type Props = {
  friendName: string;
  friendFavCO: CO;
  friendFavArmy: Army;
};

export function PlayerFriendLink({ friendName, friendFavArmy, friendFavCO }: Props) {
  return (
    <Link
      className="@grid @grid-cols-6 smallscreen:@grid-cols-10 laptop:@grid-cols-6 @w-full @space-x-4 @justify-start @items-center @align-middle @text-white hover:@text-primary-light"
      href="/"
    >
      <div
        className={`@bg-black/20 @border-${friendFavArmy} @border-[3px] @min-h-4 @min-w-4 monitor:@min-h-12 monitor:@min-w-12`}
      >
        <img
          className="@min-w-full [image-rendering:pixelated]"
          src={`/img/CO/pixelated/${friendFavCO}-small.png`}
          alt={friendFavCO}
        />
      </div>
      <h3 className="@col-span-5 @font-medium @text-lg smallscreen:@text-xl">{friendName}</h3>
    </Link>
  );
}
