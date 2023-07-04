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

// use this enum for nation colors, icons, etc.
// @bg-orange-star
// @text-orange-star
// orange-star-icon.webp
export enum NationEnum {
  "orange-star",
  "blue-moon",
  "yellow-comet",
  "green-earth",
  "black-hole",
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
