import Image from "next/image";

export function FeaturedNews() {
  return (
    <div className="@flex @justify-center @items-center @w-full">
      <div className="@flex @flex-col smallscreen:@flex-row @cursor-pointer @duration-300 tablet:hover:@shadow-[0_0_10px_10px_rgba(183,234,184,0.5)] tablet:hover:@z-10">
        <div className="@relatve @h-[300px] @w-full smallscreen:@w-[400px] laptop:@w-[650px] @bg-cover @bg-[url(/img/layout/newsPage/featuredImg.png)]">
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
        <div className="@flex @flex-col @min-w-[300px] @p-4 @gap-3 @justify-center @bg-bg-secondary smallscreen:@max-w-[300px]">
          <div>
            <h3>Welcome back Flak</h3>
            <h1 className="@text-[1.5rem]">Patch 1.10 is out!</h1>
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
