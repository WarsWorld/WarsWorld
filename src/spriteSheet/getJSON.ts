import path from "path";
import { promises as fs } from "fs";

//gotta be able to return different things depending on input

export default async function getJSON(countryNames: string[]) {
  //Find the absolute path of the json directory

  const jsonDirectory = path.join(process.cwd(), "public/img/spriteSheet");
  const spriteSheets = { countries: [] };
  countryNames.forEach(async (country: string) => {
    //Read the json data file data.json
    const fileData = await fs.readFile(
      jsonDirectory + `/${country}.json`,
      "utf8"
    );
    const parse = JSON.parse(fileData);
    spriteSheets[country] = parse;
    spriteSheets.countries.push(country);
  });
  const fileData = await fs.readFile(jsonDirectory + `/neutral.json`, "utf8");
  spriteSheets["neutral"] = JSON.parse(fileData);
  spriteSheets.countries.push("neutral");

  //Return the content of the data file in json format
  return spriteSheets;
}
