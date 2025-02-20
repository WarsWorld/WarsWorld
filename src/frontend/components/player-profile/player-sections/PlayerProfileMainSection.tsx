import type { Army } from "shared/schemas/army";
import type { CO } from "shared/schemas/co";

type Props = {
  playerName: string;
  realName: string;
  preferedNation: Army;
  preferedCO: CO;
  description: string;
  lastActivity: string;
  isOnline: boolean;
};

export function PlayerProfileMainSection({
  playerName,
  realName,
  preferedNation,
  preferedCO,
  description,
  lastActivity,
  isOnline,
}: Props) {
  return (
    <>
      <section className="@h-full @bg-black/60 @mt-4 @rounded-t-xl @overflow-hidden">
        <div className={`@h-4 @w-full @bg-${preferedNation}`} />
        <div className="@flex @flex-col @items-center smallscreen:@items-[normal] smallscreen:@flex-row @space-y-8 smallscreen:@space-y-0 smallscreen:@space-x-6 laptop:@space-x-12 @px-6 laptop:@px-12 @py-10">
          <div
            className={`@min-w-48 @max-w-48 @min-h-48 @max-h-48 @border-${preferedNation} @bg-black/50 @border-4 @text-center @overflow-hidden`}
          >
            <img src={`\\img\\CO\\smoothFull\\Awds-${preferedCO}.webp`} alt="grit" />
          </div>
          <div className="@min-h-48 @flex @flex-col">
            <div>
              <div className="@flex @flex-col @space-y-4 laptop:@space-y-0 laptop:@flex-row @justify-between">
                <div>
                  <div className="@flex @space-x-2">
                    <img
                      className="[image-rendering:pixelated] @self-center @w-8 @h-8"
                      src={`\\img\\nations\\${preferedNation}.gif`}
                      alt="blue-moon"
                    />
                    <div className="@text-2xl smallscreen:@text-4xl @font-semibold">
                      {playerName}
                    </div>
                  </div>
                  <div className="@text-gray-500">{realName}</div>
                </div>
                <div className="@space-y-2">
                  <div className="@flex @h-6 @space-x-2 @items-center">
                    <div
                      className={`@h-6 @w-6 @rounded-full ${
                        isOnline ? "@bg-green-earth" : "@bg-orange-star"
                      }`}
                    ></div>
                    <div className="@text-xl">{isOnline ? "Online" : "Offline"}</div>
                  </div>
                  <div className="@text-base @text-gray-500">Last Activity: {lastActivity}</div>
                </div>
              </div>
              <div className="@pt-6 @text-base">{description}</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
