const games = [
  {
    gameName: "Advance Wars",
  },
  {
    gameName: "Advance Wars 2",
  },
  {
    gameName: "Advance Wars Days of Ruin",
  },
  {
    gameName: "Famicom Wars",
  },
];

export function PlayerFavoriteGamesSection() {
  return (
    <section className="@pb-8 @px-8 @h-full @w-full @bg-black/60 @my-4 @space-y-2">
      <h1 className="@col-span-3 @text-center @font-russoOne">Favorite Games</h1>
      <div className="@grid smallscreen:@grid-cols-2 laptop:@grid-cols-4 @gap-4">
        {games.map((game) => {
          return (
            <div
              className="@w-full @h-52 @border-primary @border-4 @bg-bg-secondary"
              key={game.gameName}
            >
              <p className="@text-center">{game.gameName}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
