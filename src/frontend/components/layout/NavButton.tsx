import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function NavButton({ children }: Props) {
  return (
    <div className="@text-base-a @text-white hover:@text-primary-light @text-2xl tablet:@text-3xl laptop:@text-xl monitor:@text-2xl @font-medium large_monitor:@text-4xl @text-center">
      {children}
    </div>
  );
}
