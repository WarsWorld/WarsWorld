import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function PageTitle({ children }: Props) {
  return (
    <div className="@w-full @bg-gradient-to-r @from-black/75 @to-bg-primary/40">
      <div className="@h-1 @w-full @bg-gradient-to-r @from-primary-dark @from-10% @via-primary @to-primary-dark @to-90%" />

      <div className="@px-10 smallscreen:@px-20 @py-4 @text-3xl smallscreen:@text-6xl @font-medium">
        {children}
      </div>

      <div className="@h-1 @w-full @bg-gradient-to-r @from-primary-dark @from-10% @via-primary @to-primary-dark @to-90%" />
    </div>
  );
}
