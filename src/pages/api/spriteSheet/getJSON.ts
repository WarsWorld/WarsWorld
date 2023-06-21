import path from 'path';
import { promises as fs } from 'fs';

export default async function getJSON( fileName: string) {
  //Find the absolute path of the json directory
  const jsonDirectory = path.join(process.cwd(), 'public/img/spriteSheet/orangeStar');
  //Read the json data file data.json
  const fileContents = await fs.readFile(jsonDirectory + `/${fileName}.json`, 'utf8');
  //Return the content of the data file in json format
  return(fileContents)
}