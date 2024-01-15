import type { ReactNode } from "react";
import OrangeGradientLine from "./decorations/OrangeGradientLine";

type Props = {
  children: ReactNode;
  svgPathD?: string;
};

export default function PageTitle({ children, svgPathD }: Props) {
  return (
    <div className="@relative @w-full @bg-gradient-to-r @from-black/75 @to-bg-primary/40">
      <OrangeGradientLine />

      {svgPathD && 
        <svg className="@absolute @z-20 @-top-2 smallscreen:@-top-5 @-left-12 smallscreen:@left-12 @fill-primary @h-24 smallscreen:@h-36 @-rotate-12" xmlns="http://www.w3.org/2000/svg" height="200" viewBox="0 -960 960 960" width="200">
          <path d={svgPathD}/>
        </svg>
      }
      
      <div className={`@relative ${svgPathD ? "@pl-32 smallscreen:@pl-64" : "@pl-10 smallscreen:@pl-20"} @py-4 @text-3xl smallscreen:@text-6xl @font-medium`}>
        {children}
      </div>

      <OrangeGradientLine />
    </div>
  );
}
