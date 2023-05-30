import Image from "next/image";

//Np clue as of why ESLint is littering frontend files with a line for every

export default function Banner() {
  return (
    <>
      <div
        className={`@relative @w-screen  @h-100   @bg-cover @bg-[url('/img/layout/homeBanner/gameCollage.jpg')]`}
      >
        <div
          className={
            "@flex @items-start @gap-10  @backdrop-brightness-[0.40] @w-100 @px-10 @py-40 "
          }
        >
          <Image
            className="pixelated  "
            src={"/img/layout/homeBanner/classicInfantry.png"}
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
            <button className={"button"}> Play Now</button>
          </div>

          <Image
            className=" pixelated @scale-x-[-1]"
            src={"/img/layout/homeBanner/newInfantry.png"}
            width={42 * 5}
            height={42 * 5}
            alt="New Infantry"
          />
        </div>
      </div>
    </>
  );
}
