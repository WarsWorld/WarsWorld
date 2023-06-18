import {
  NationColorEnum,
  NationEnum,
  NationIconEnum,
  SideEnum,
} from "frontend/utils/enums";
import React from "react";
import { Army } from "server/schemas/army";
import { CO } from "server/schemas/co";

interface Props {
  name: string | undefined;
  rank: string | undefined;
  armyIndex: number;
  iconSide: SideEnum;
  co?: CO | null;
}

export default function PlayerNameBar({
  name = "Player",
  rank = "Unknown",
  armyIndex,
  iconSide,
  co = null,
}: Props) {
  const isLeftIcon = iconSide === SideEnum.Left;
  const borderStyle = isLeftIcon ? "@border-r-2" : "@border-l-2";
  const paddingStyle = iconSide === SideEnum.Left ? "@pr-1" : "@pl-1";
  const armyString = NationEnum[armyIndex] as Army;
  const iconDiv = (
    <div className={`@flex @flex-col @flex-shrink-0 @h-full`}>
      <img
        className={`@h-full @bg-white @mx-auto ${borderStyle} @border-b-2 @border-gray-400`}
        src={`/img/nations/${NationIconEnum[armyString]}.webp`}
      />
    </div>
  );
  const nameDiv = (
    <div className="@flex @flex-col @flex-grow @flex-shrink @h-full @px-1">
      <p className="@truncate">{name}</p>
    </div>
  );
  const rankDiv = (
    <div
      className={`@flex @flex-col @flex-shrink-0 @h-full @w-[40px] ${
        isLeftIcon && "@self-end"
      } @font-light`}
    >
      <p>{rank}</p>
    </div>
  );
  const coDiv = co ? (
    <div className={`@relative @flex @flex-col @flex-shrink-0 @h-full`}>
      <div className={`@absolute @inset-0 @bg-black @opacity-50`}></div>
      <img
        className={`@h-full @relative @z-10 ${
          !isLeftIcon && "@transform @scale-x-[-1]"
        }`}
        src={`/img/CO/smallPixel/${co}-small.png`}
      />
    </div>
  ) : null;

  const contentDivs = isLeftIcon
    ? [coDiv, iconDiv, nameDiv, rankDiv]
    : [rankDiv, nameDiv, iconDiv, coDiv];

  return (
    <div className="@flex @flex-col @w-full smallscreen:@w-[40%]">
      <div
        className={`@flex @items-center @h-full @w-full ${paddingStyle}`}
        style={{ background: `${NationColorEnum[armyString]}` }}
      >
        {...contentDivs}
      </div>
    </div>
  );
}
