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
  const borderStyle =
    iconSide === SideEnum.Left ? "@border-r-2" : "@border-l-2";
  const paddingStyle = iconSide === SideEnum.Left ? "@pr-2" : "@pl-2";
  const armyString = NationEnum[armyIndex] as Army;
  const iconDiv = (
    <div className="@flex @flex-col @flex-shrink-0 @h-full">
      <img
        className={`@h-full @bg-white @mx-auto ${borderStyle} @border-b-2 @border-gray-400`}
        src={`/img/nations/${NationIconEnum[armyString]}.webp`}
      />
    </div>
  );
  const nameDiv = (
    <div className="@flex @flex-col @flex-grow @flex-shrink @h-full @max-w-[66%]">
      <p className="@truncate">{name}</p>
    </div>
  );
  const rankDiv = (
    <div className="@flex @flex-col @flex-shrink-0 @h-full @font-light">
      <p>{rank}</p>
    </div>
  );
  const contentDivs =
    iconSide === SideEnum.Left
      ? [iconDiv, nameDiv, rankDiv]
      : [rankDiv, nameDiv, iconDiv];

  return (
    <div className="@flex @flex-col @min-w-[40%]">
      <div
        className={`@flex @flex-row @items-center @justify-between @h-full @gap-2 ${paddingStyle}`}
        style={{ background: `${NationColorEnum[armyString]}` }}
      >
        {...contentDivs}
      </div>
    </div>
  );
}
