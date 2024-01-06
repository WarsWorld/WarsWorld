import type { ReactNode } from "react";
import OrangeGradientLine from "./decorations/OrangeGradientLine";

type Props = {
  children: ReactNode;
};

export default function PageTitle({ children }: Props) {
  return (
    <div className="@w-full @bg-gradient-to-r @from-black/75 @to-bg-primary/40">
      <OrangeGradientLine />

      <div className="@px-10 smallscreen:@px-20 @py-4 @text-3xl smallscreen:@text-6xl @font-medium">{children}</div>

      <OrangeGradientLine />
    </div>
  );
}
