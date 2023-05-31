import Image from "next/image";

export default function Banner() {
  return (
    <div className="@flex @flex-start @gap-5 @w-full @bg-cover @bg-[url('/img/layout/homeBanner/gameCollage.jpg')] @p-10 homeBanner">
      <Image
        className="pixelated"
        src="/img/layout/homeBanner/classicInfantry.png"
        width={42 * 5}
        height={42 * 5}
        alt="Classic Infantry"
      />
      <div>
        <h1>
          Relive the <strong> Nostalgia</strong>
          <br />
          Rewrite the Tactics
        </h1>
        <button className="btn"> Play Now</button>
      </div>
      <Image
        className="pixelated @scale-x-[-1]"
        src="/img/layout/homeBanner/newInfantry.png"
        width={42 * 5}
        height={42 * 5}
        alt="New Infantry"
      />
    </div>
  );
}
