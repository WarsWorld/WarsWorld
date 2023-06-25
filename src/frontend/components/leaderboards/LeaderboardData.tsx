import { faker } from "@faker-js/faker";

const cos = [
  "Adder",
  "Andy",
  "Colin",
  "Drake",
  "Eagle",
  "Flak",
  "Grimm",
  "Grit",
  "Hachi",
  "Hawke",
  "Jake",
  "Javier",
  "Jess",
  "Jugger",
  "Kanbei",
  "Kindle",
  "Koal",
  "Lash",
  "Max",
  "Nell",
  "Olaf",
  "Rachel",
  "Sami",
  "Sasha",
  "Sensei",
  "Sonja",
  "Sturm",
  "Von Bolt",
];

const countries = ["blueMoon", "greenEarth", "orangeStar", "yellowComet"];

export type Player = {
  id: string;
  name: string;
  games: number;
  wins: number;
  rating: number;
  streak: number;
  co: string;
  country: string;
  profileLink: string;
};

export type PlayerLeaderboard = {
  id: string;
  rank: number;
  name: string;
  games: number;
  winRate: number;
  rating: number;
  streak: number;
  co: string;
  country: string;
  profileLink: string;
};

const newPlayer = (): Player => {
  const id = faker.string.uuid();
  const name = faker.internet.userName();
  const games = faker.number.int({ max: 150 });
  const wins = faker.number.int({ max: games });
  const ratingCalc =
    1000 +
    (wins * faker.number.int({ min: 1, max: 9 }) -
      (games - wins) * faker.number.int({ min: 1, max: 9 }));
  const rating = ratingCalc <= 0 ? 0 : ratingCalc;
  const streak = rating === 0 ? 0 : faker.number.int({ max: wins });
  const co = faker.helpers.arrayElement(cos);
  const country = faker.helpers.arrayElement(countries);
  const profileLink = "/";
  return {
    id,
    name,
    games,
    wins,
    rating,
    streak,
    co,
    country,
    profileLink,
  };
};

function transformData(data: Player[]): PlayerLeaderboard[] {
  let rank = 1;

  const transformedData = data
    .sort((a, b) => {
      return b.rating - a.rating;
    })
    .map((player) => {
      const result: PlayerLeaderboard = {
        id: player.id,
        rank: rank++,
        name: player.name,
        games: player.games,
        winRate: (player.wins / player.games) * 100,
        rating: player.rating,
        streak: player.streak,
        co: player.co,
        country: player.country,
        profileLink: player.profileLink,
      };
      return result;
    });

  return transformedData;
}

export default function getLeaderboardData(
  amount: number
): PlayerLeaderboard[] {
  const data: Player[] = [];
  for (let i = 0; i < amount; i++) data.push(newPlayer());

  const transformedData = transformData(data);

  return transformedData;
}
