interface Props {
  rank: number;
  name: string;
  mmr: number;
  co: string;
  country: string;
  profileLink: string;
}

const countryColors: { [key: string]: string } = {
  blueMoon: "@bg-blue-moon",
  orangeStar: "@bg-orange-star",
  greenEarth: "@bg-green-earth",
  yellowComet: "@bg-yellow-comet",
};

export default function PlayerCard({
  rank,
  name,
  mmr,
  co,
  country,
  profileLink,
}: Props) {
  return (
    <a href={profileLink} className="@text-white hover:@text-white">
      <div className="@relative @w-full @h-full @bg-black/50 @shadow-black/80 @shadow-lg @rounded-lg @overflow-hidden hover:@scale-105 @duration-75">
        <img
          className="@absolute @scale-[1.2] @left-4 @top-16"
          src={`img/CO/smoothFull/Awds-${co}.webp`}
          alt={co}
        />
        <div className="@absolute @bottom-0 @right-0 @w-full @h-20 @bg-bg-tertiary">
          <div className="@flex @absolute @bottom-10 @right-0 @w-full @h-10">
            <div className="@flex @w-full @h-full @items-center @justify-center">
              <h4 className="@text-lg"># {rank}</h4>
            </div>
            <img
              className="@m-[2px] @bg-white"
              src={`img/nations/${country}.webp`}
              alt=""
            />
            <div className="@flex @w-full @h-full @items-center @justify-center">
              <h4 className="@text-lg">{mmr}</h4>
            </div>
          </div>
          <div className="@flex @absolute @bottom-0 @w-full @h-10 @bg-white">
            <div
              className={`@flex @w-full @h-full @items-center @justify-center ${countryColors[country]}`}
            >
              <h4 className="@font-medium">{name}</h4>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
