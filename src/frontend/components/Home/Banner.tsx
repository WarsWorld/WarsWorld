import Image from "next/image";

export default function Banner() {
  return (
    <div>
      <div className="@relative @w-screen @h-100 @bg-cover @bg-[url('/img/layout/homeBanner/gameCollage.jpg')]">
        <div className="@flex @items-start @gap-10 @backdrop-brightness-[0.40] @w-100 @px-10 @py-40">
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
      </div>
      <h1>
        {" "}
        h1 = <strong> Susan Strong!</strong> Normal Nancy.
      </h1>
      <h2>
        {" "}
        h2 = <strong> Susan Strong!</strong> Normal Nancy.
      </h2>
      <h3>
        {" "}
        h3 = <strong> Susan Strong!</strong> Normal Nancy.
      </h3>
      <p>
        {" "}
        p = <strong> Susan Strong!</strong> Normal Nancy.
      </p>
    </div>
  );
}
