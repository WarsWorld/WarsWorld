import type { avaliableSVGs } from "frontend/utils/svgPaths";
import type { ReactNode } from "react";
import { SVG } from "../SVG";
import OrangeGradientLine from "./decorations/OrangeGradientLine";

type Props = {
  children: ReactNode;
  svg?: avaliableSVGs;
};

export default function PageTitle({ children, svg }: Props) {
  return (
    <div className="@relative @w-full @bg-gradient-to-r @from-black/75 @to-bg-primary/40">
      <OrangeGradientLine />

      {svg !== undefined && (
        <SVG
          className="@absolute @z-20 @-top-2 smallscreen:@-top-5 @-left-12 smallscreen:@left-12 @fill-primary @h-24 smallscreen:@h-36 @-rotate-12"
          svg={svg}
          height="200"
          width="200"
        />
      )}

      <div
        className={`@relative ${
          svg ? "@pl-32 smallscreen:@pl-64" : "@pl-10 smallscreen:@pl-20"
        } @py-4 @text-3xl smallscreen:@text-6xl @font-medium`}
      >
        {children}
      </div>

      <OrangeGradientLine />
    </div>
  );
}
