import Image from "next/image";

export function FeaturedNewsCard() {
  return (
    <div className="@flex @justify-center @items-center @max-w-[90vw]">
      <div className="@flex @flex-col smallscreen:@flex-row @cursor-pointer @duration-300 tablet:hover:@z-10">
        <div className="@relatve @h-[300px] @w-full smallscreen:@w-[400px] laptop:@w-[60vw] @bg-cover @bg-[url(/img/layout/newsPage/featuredImg.png)]">
          <div className="@h-full @w-full @overflow-hidden @backdrop-brightness-50">
            <Image
              className="@scale-x-[-1]"
              src="/img/CO/smoothFull/Awds-Flak.webp"
              alt="placeholder image for feature image"
              width={250}
              height={250}
            />
          </div>
        </div>
        <div className="@flex @flex-col tablet:@min-w-[300px] @p-4 @gap-3 @justify-center @bg-black/50 smallscreen:@max-w-[300px] laptop:@max-w-[20vw]">
          <div>
            <h3 className="@font-normal">Welcome back Flak</h3>
            <h2 className="@font-semibold">Patch 1.10 is out!</h2>
          </div>
          <p className="@text-xs @leading-loose">
            The Balance Overhaul patch brings a renewed focus on strategic depth
            and fair gameplay to Advance Wars. With careful adjustments made to
            unit abilities and map layouts, commanders will find themselves
            faced with more challenging decisions and a more balanced playing
            field.
          </p>
        </div>
      </div>
    </div>
  );
}
