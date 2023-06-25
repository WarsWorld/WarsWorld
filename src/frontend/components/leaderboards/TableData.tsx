import { faker } from "@faker-js/faker";

export type Player = {
  id: string;
  name: string;
  games: number;
  wins: number;
  rating: number;
  streak: number;
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
  return {
    id,
    name,
    games,
    wins,
    rating,
    streak,
  };
};

export default function getTableData(amount: number) {
  const data: Player[] = [];
  for (let i = 0; i < amount; i++) data.push(newPlayer());

  return data;
}
