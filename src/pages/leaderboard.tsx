import Head from "next/head";
import ThreeLinesText from "frontend/components/layout/ThreeLinesText";

export default function IndexPage() {
  const data = {
    objects: [
      {
        name: "Humita",
        games: 123,
        wins: 75,
        rating: 1500,
        streak: 50,
      },
      {
        name: "Example1",
        games: 456,
        wins: 300,
        rating: 1800,
        streak: 200,
      },
      {
        name: "Example2",
        games: 789,
        wins: 500,
        rating: 1200,
        streak: 350,
      },
      {
        name: "Incuggarch",
        games: 200,
        wins: 150,
        rating: 1400,
        streak: 100,
      },
      {
        name: "Go7",
        games: 1000,
        wins: 600,
        rating: 1900,
        streak: 400,
      },
      {
        name: "Username1",
        games: 250,
        wins: 125,
        rating: 1600,
        streak: 80,
      },
      {
        name: "Gamer123",
        games: 800,
        wins: 400,
        rating: 1700,
        streak: 200,
      },
      {
        name: "ProGamer99",
        games: 600,
        wins: 300,
        rating: 1999,
        streak: 150,
      },
      {
        name: "Clive",
        games: 150,
        wins: 75,
        rating: 1300,
        streak: 40,
      },
      {
        name: "HiroshiHayashi",
        games: 300,
        wins: 200,
        rating: 2000,
        streak: 100,
      },
      {
        name: "MasterChief",
        games: 700,
        wins: 400,
        rating: 1800,
        streak: 300,
      },
      {
        name: "Mangs",
        games: 400,
        wins: 250,
        rating: 1500,
        streak: 150,
      },
      {
        name: "Black",
        games: 180,
        wins: 80,
        rating: 1200,
        streak: 30,
      },
      {
        name: "User1",
        games: 150,
        wins: 75,
        rating: 1300,
        streak: 40,
      },
      {
        name: "Player42",
        games: 300,
        wins: 200,
        rating: 1600,
        streak: 100,
      },
      {
        name: "GamingMaster",
        games: 700,
        wins: 400,
        rating: 1800,
        streak: 300,
      },
      {
        name: "OnlineGamer",
        games: 400,
        wins: 250,
        rating: 1500,
        streak: 150,
      },
      {
        name: "CasualPlayer",
        games: 180,
        wins: 80,
        rating: 1200,
        streak: 30,
      },
      {
        name: "ProGamer2000",
        games: 1000,
        wins: 800,
        rating: 1950,
        streak: 500,
      },
      {
        name: "GamingChamp",
        games: 600,
        wins: 450,
        rating: 1700,
        streak: 250,
      },
      {
        name: "SuperGamer",
        games: 250,
        wins: 200,
        rating: 1900,
        streak: 150,
      },
      {
        name: "CasualGamer",
        games: 400,
        wins: 150,
        rating: 1400,
        streak: 50,
      },
      {
        name: "ProPlayer123",
        games: 900,
        wins: 700,
        rating: 1800,
        streak: 400,
      },
      {
        name: "Elysium",
        games: 250,
        wins: 180,
        rating: 1600,
        streak: 75,
      },
      {
        name: "NebulaX",
        games: 500,
        wins: 350,
        rating: 1800,
        streak: 200,
      },
      {
        name: "Spectron",
        games: 800,
        wins: 500,
        rating: 1950,
        streak: 350,
      },
      {
        name: "Zephyrus",
        games: 400,
        wins: 275,
        rating: 1750,
        streak: 120,
      },
      {
        name: "NovaStar",
        games: 600,
        wins: 400,
        rating: 1900,
        streak: 250,
      },
      {
        name: "Luminex",
        games: 350,
        wins: 200,
        rating: 1650,
        streak: 80,
      },
      {
        name: "Chronos",
        games: 700,
        wins: 450,
        rating: 1850,
        streak: 300,
      },
      {
        name: "AuroraX",
        games: 450,
        wins: 350,
        rating: 1700,
        streak: 180,
      },
      {
        name: "Vortex",
        games: 550,
        wins: 400,
        rating: 1800,
        streak: 200,
      },
      {
        name: "Nyx",
        games: 300,
        wins: 200,
        rating: 1550,
        streak: 100,
      },
    ],
  };

  return (
    <div className="@flex @flex-col @w-full @items-center @justify-center">
      <Head>
        <title>Leaderboards</title>
      </Head>

      <div className="@flex @flex-col @my-2 @max-w-[90vw] @px-4 @pb-8 laptop:@py-2 laptop:@pb-12">
        <ThreeLinesText
          subtitle="Where the best meet"
          title="Leaderboards"
          text=""
        />
      </div>
    </div>
  );
}
