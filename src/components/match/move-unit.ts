import { BlueTiles } from './path-finding';

function moveUnit({ previous }: BlueTiles, targetTile: number) {
  const path = [];

  for (let i: number | null = targetTile; i !== null; i = previous[i]) {
    path.push(i);
  }

  //lets reverse it so we don't start at the end
  return path.reverse();
}
export { moveUnit };
