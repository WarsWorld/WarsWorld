export enum COEnum {
  "adder",
  "andy",
  "sami",
  "max",
  "hawke",
  "sturm",
  "lash",
  "flak",
  "kanbei",
  "sonja",
  "sensei",
  "colin",
  "drake",
  "eagle",
  "nell",
  "hachi",
  "olaf",
  "grit",
}

export enum NationEnum {
  "orange-star",
  "blue-moon",
  "yellow-comet",
  "green-earth",
  "black-hole",
}

export enum NationIconEnum {
  "orange-star" = "orangeStar",
  "blue-moon" = "blueMoon",
  "yellow-comet" = "yellowComet",
  "green-earth" = "greenEarth",
  "black-hole" = "blackHole",
}

export enum NationColorEnum {
  "orange-star" = "#D04038",
  "blue-moon" = "#466EFE",
  "yellow-comet" = "#998D00",
  "green-earth" = "#37A42A",
  "black-hole" = "#000000",
}

export enum MatchType {
  Standard = "Standard",
  Fog = "Fog",
  HighFunds = "High Funds",
}

export const MatchTypeShort: Record<MatchType, string> = {
  [MatchType.Standard]: "STD",
  [MatchType.Fog]: "FOG",
  [MatchType.HighFunds]: "HF",
};

export enum SideEnum {
  Left = 0,
  Right = 1,
}
