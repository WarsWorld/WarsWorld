export function HowToPlay() {
  const data = [
    {
      key: "t1",
      heading: "Focus on capturing properties",
      instruction:
        "Capturing properties is essential to building up your economy and producing more units.",
      image: "/img/HowToPlay/pic1.jpg",
    },
    {
      key: "t2",
      heading: "Keep an eye on your opponent's units",
      instruction:
        "It's important to be aware of what your opponent is doing and where their units are located.",
      image: "/img/HowToPlay/pic2.jpg",
    },
    {
      key: "t3",
      heading: "Use terrain to your advantage",
      instruction: "Terrain can be a powerful tool in Advance Wars.",
      image: "/img/HowToPlay/pic3.jpg",
    },
    {
      key: "t4",
      heading: "Build a balanced army",
      instruction:
        "You'll want to have a mix of different units to be able to deal with different types of enemy units.",
      image: "/img/HowToPlay/pic4.jpg",
    },
    {
      key: "t5",
      heading: "Plan ahead",
      instruction:
        "Advance Wars is a game that requires planning and foresight.",
      image: "/img/HowToPlay/pic5.jpg",
    },
    {
      key: "t6",
      heading: "Communicate with your teammate",
      instruction:
        "If you're playing a multiplayer game with teammates, communication is the key.",
      image: "/img/HowToPlay/pic6.jpg",
    },
  ];

  return (
    <div className="@flex @flex-col @w-full @items-center @justify-center">
      <div className="@flex @flex-col @space-y-2 @max-w-[90vw] @px-4 laptop:@py-2 laptop:@pb-12">
        <div className="@flex @flex-col @justify-center @items-center @my-2 laptop:@my-8 @space-y-4">
          <h2>You will finaly know what an airport is</h2>
          <h1>How to play</h1>
          <h3>Learn all the fundamentals here and climb the ladder!</h3>
        </div>
        <div className="laptop:@px-8 @space-y-10">
          <div>
            <div className="@flex @flex-col laptop:@flex-row @items-center laptop:@space-x-8">
              <div className="@px-4 @bg-green-500 @rounded-md @w-full laptop:@max-w-[20vw] @text-center @my-2 @shadow-black/50 @shadow-md">
                <h1>BASICS</h1>
              </div>
              <p>
                If you are a new player, these guides will help you establish
                the basic fundamentals of the game
              </p>
            </div>
            <div className="@grid @grid-flow-row @grid-cols-1 smallscreen:@grid-cols-2 laptop:@grid-cols-3 smallscreen:@gap-x-8 laptop:@gap-x-10">
              {data.map((tutorial) => (
                <div
                  key={tutorial.key}
                  className="@bg-black/50 @my-4 @shadow-black/60 @shadow-lg @cursor-pointer hover:@scale-105 @transition"
                >
                  <div className="@flex @flex-col @space-y-2">
                    <img
                      className="@w-full @h-[15vh] laptop:@h-[25vh] @object-cover"
                      src={tutorial.image}
                    ></img>
                    <div className="@px-2 laptop:@px-4 @py-2 laptop:@pb-4 @space-y-4">
                      <h2>{tutorial.heading}</h2>
                      <p>{tutorial.instruction}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="@flex @flex-col laptop:@flex-row @items-center laptop:@space-x-8">
              <div className="@px-2 @bg-orange-500 @rounded-md @w-full laptop:@max-w-[20vw] @text-center @my-2 @shadow-black/50 @shadow-md">
                <h1>ADVANCE</h1>
              </div>
              <p>
                These guides will cover more advanced techniques with specific
                uses that can give you the edge on the battlefield.
              </p>
            </div>
            <div className="@grid @grid-flow-row @grid-cols-1 smallscreen:@grid-cols-2 laptop:@grid-cols-3 smallscreen:@gap-x-8 laptop:@gap-x-10">
              {data.map((tutorial) => (
                <div
                  key={tutorial.key}
                  className="@bg-black/50 @my-4 @shadow-black/60 @shadow-lg @cursor-pointer hover:@scale-105 @transition"
                >
                  <div className="@flex @flex-col @space-y-2">
                    <img
                      className="@w-full @h-[15vh] laptop:@h-[25vh] @object-cover"
                      src={tutorial.image}
                    ></img>
                    <div className="@px-2 laptop:@px-4 @py-2 laptop:@pb-4 @space-y-4">
                      <h2>{tutorial.heading}</h2>
                      <p>{tutorial.instruction}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
