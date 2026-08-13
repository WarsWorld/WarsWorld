import type { CO } from "server/core/schemas/co";

/**
 * Short flavour blurbs for the champ-select dossier — a one-line characterisation of each general
 * (personality + nation/role), independent of game version. Original summaries of the well-known
 * commanders, kept brief for the Overview tab; the gameplay specifics live in the phase descriptions.
 */
export const CO_BIOS: Record<CO, string> = {
  andy: "Orange Star's energetic young mechanic — repairs anything, quits at nothing, and fights with all-round balance.",
  max: "A powerhouse who trusts raw muscle: his direct-combat units hit like a truck, though the long game isn't his strength.",
  sami: "Orange Star's special-forces veteran, whose elite infantry capture with ruthless speed.",
  nell: "Orange Star's easygoing commanding officer, famous for battlefield luck that always seems to break her way.",
  rachel:
    "Nell's earnest younger sister — a steady Orange Star hand who answers trouble with a devastating missile barrage.",
  jake: "A cool, hip-hop-loving Orange Star rookie who fights at his best out on the open plains.",
  olaf: "Blue Moon's grizzled veteran, who turns winter into a weapon and marches freely through snow that mires everyone else.",
  grit: "A laid-back Blue Moon marksman whose indirect units outrange and outgun anything on the field.",
  hachi:
    "A retired Orange Star commander turned shopkeeper — nobody sells units cheaper than he does.",
  colin:
    "Blue Moon's timid young aristocrat — fabulously wealthy, he builds on the cheap and turns gold into firepower.",
  sasha:
    "Colin's composed older sister, a shrewd Blue Moon economist who starves her foes of momentum.",
  eagle:
    "Green Earth's proud ace pilot, whose peerless aircraft can strike twice when he unleashes them.",
  drake:
    "A big-hearted Green Earth sailor who commands the seas and calls the weather to his side.",
  jess: "A no-nonsense Green Earth tank commander whose ground vehicles roll harder and never run dry.",
  sensei:
    "Green Earth's legendary retired officer — a master of infantry and helicopters who deploys troops from nowhere.",
  javier: "A chivalrous Green Earth knight, devoted to defense and his beloved Comm Towers.",
  kanbei:
    "Yellow Comet's honour-bound warlord: his forces are the strongest around — at a premium price.",
  sonja:
    "Kanbei's sharp, studious daughter — an intel specialist who sees through the fog and fights smart.",
  grimm: "A brash Yellow Comet warrior who lives to attack, guard be damned.",
  sturm:
    "The masked Black Hole overlord: brutal firepower, unstoppable movement, and meteors from the sky.",
  hawke:
    "A cold, commanding Black Hole officer of few words — steady firepower and a power that drains the enemy's life.",
  lash: "A gleeful young Black Hole scientist who weaponises the terrain itself.",
  adder: "A smug, slippery Black Hole schemer who lives for speed and swift maneuvers.",
  flak: "A brutish Black Hole bruiser who swings wildly — enormous luck, for better or worse.",
  jugger:
    "A Black Hole combat android running Flak's berserk tactics with cold, glitchy precision.",
  koal: "A cool-headed Black Hole officer who presses every advantage along the roads.",
  kindle:
    "A haughty, fashionable Black Hole commander who rules the cities and punishes those who hold them.",
  "von-bolt":
    "Black Hole's ancient, ruthless leader — kept alive by machines and armed with a paralysing lightning strike.",
};
