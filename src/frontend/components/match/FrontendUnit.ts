import { type Sprite } from "pixi.js";
import { UnitWrapper } from "shared/wrappers/unit";

/**
 * we might have to expose the generics of UnitWrapper through FrontendUnit
 * because otherwise type-gating the unit type might not work properly.
 *
 * i.e. class FrontendUnit<Type extends UnitType = UnitType... = ExtractUnit<Type>
 * and then forward those generics to UnitWrapper.
 */
export class FrontendUnit extends UnitWrapper {
  public sprite: Sprite | null = null;
}
