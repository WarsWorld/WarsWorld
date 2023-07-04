export enum COEnum {
  "adder",
  "andy",
  "colin",
  "drake",
  "eagle",
  "flak",
  "grimm",
  "grit",
  "hachi",
  "hawke",
  "jake",
  "javier",
  "jess",
  "jugger",
  "kanbei",
  "kindle",
  "koal",
  "lash",
  "max",
  "nell",
  "olaf",
  "rachel",
  "sami",
  "sasha",
  "sensei",
  "sonja",
  "sturm",
  "von-bolt",
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
  "orange-star" = "orange-star",
  "blue-moon" = "blue-moon",
  "yellow-comet" = "yellow-comet",
  "green-earth" = "green-earth",
  "black-hole" = "black-hole",
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

export enum TurnStyleEnum {
  Async,
  Live,
}

export const TurnStyleString: Record<TurnStyleEnum, string> = {
  [TurnStyleEnum.Async]: "ASYNC",
  [TurnStyleEnum.Live]: "LIVE",
};

export enum SideEnum {
  Left,
  Right,
}
