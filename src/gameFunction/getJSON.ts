import path from "path";
import { promises as fs } from "fs";

//gotta be able to return different things depending on input

export default async function getJSON(countryNames: string[]) {
  //Find the absolute path of the json directory

  const jsonDirectory = path.join(process.cwd(), "public/img/spriteSheet");
  const spriteSheets: Record<string, string[]> = { countries: [] };

  for (const country of countryNames) {
    //Read the json data file data.json
    const fileData = await fs.readFile(
      jsonDirectory + `/${country}.json`,
      "utf8"
    );
    //lets parse our data and send it in
    spriteSheets[country] = JSON.parse(fileData) as string[];
    spriteSheets.countries.push(country);
  }

  const fileData = await fs.readFile(jsonDirectory + `/neutral.json`, "utf8");
  spriteSheets.neutral = JSON.parse(fileData) as string[];
  spriteSheets.countries.push("neutral");

  const arrowData = await fs.readFile(jsonDirectory + `/arrow.json`, "utf8");
  spriteSheets.arrow = JSON.parse(arrowData) as string[]; //considering arrows as a "country" as well
  spriteSheets.countries.push("arrow");
  //Return the content of the data file in json format
  return spriteSheets;
}

export type TheJson = Awaited<ReturnType<typeof getJSON>>;
