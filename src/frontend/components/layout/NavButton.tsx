import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function NavButton({ children }: Props) {
  return (
    <div className="@text-base-a @text-white hover:@text-primary-light @text-xl monitor:@text-2xl @font-medium large_monitor:@text-4xl">
      {children}
    </div>
  );
}
