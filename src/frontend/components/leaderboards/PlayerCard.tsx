import Link from "next/link";
import type { Army } from "shared/schemas/army";

type Props = {
  rank: number;
  name: string;
  mmr: number;
  co: string;
  country: Army;
  profileLink: string;
};

export default function PlayerCard({
  rank,
  name,
  mmr,
  co,
  country,
  profileLink
}: Props) {
  return (
    <Link href={profileLink} className="@text-white hover:@text-white">
      <div className="@relative @w-full @h-full @bg-black/50 @shadow-black/80 @shadow-lg @rounded-lg @overflow-hidden hover:@scale-105 @duration-75">
        <img
          className="@absolute @scale-[1.2] @top-8 @left-2 smallscreen:@left-4 smallscreen:@top-16"
          src={`img/CO/smoothFull/Awds-${co}.webp`}
          alt={co}
        />
        <div className="@absolute @bottom-0 @right-0 @w-full @h-12 smallscreen:@h-16 laptop:@h-20 large_monitor:@h-32 @bg-bg-tertiary">
          <div className="@flex @absolute @bottom-6 smallscreen:@bottom-8 laptop:@bottom-10 large_monitor:@bottom-16 @right-0 @w-full @h-6 smallscreen:@h-8 laptop:@h-10 large_monitor:@h-16">
            <div className="@flex @w-full @h-full @items-center @justify-center">
              <h4 className="@text-[0.9em] large_monitor:@text-[1.2em]">
                # {rank}
              </h4>
            </div>
            <img
              className="@m-[2px] large_monitor:@m-[4px] [image-rendering:pixelated]"
              src={`img/nations/${country}.gif`}
              alt=""
            />
            <div className="@flex @w-full @h-full @items-center @justify-center">
              <h4 className="@text-[0.9em] large_monitor:@text-[1.25em]">
                {mmr}
              </h4>
            </div>
          </div>
          <div className="@flex @absolute @bottom-0 @w-full @h-6 smallscreen:@h-8 laptop:@h-10 large_monitor:@h-16 @bg-white">
            <div
              className={`@flex @w-full @h-full @items-center @justify-center ${
                "@bg-" + country
              }`}
            >
              <h4 className="@font-medium @text-[0.7em] smallscreen:@text-[0.85em] large_monitor:@text-[1.1em]">
                {name}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
