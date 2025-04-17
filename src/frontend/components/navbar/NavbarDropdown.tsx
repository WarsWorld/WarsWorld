import type { RefObject } from "react";

type Props = {
  show: boolean;
  refClickOutsideUserDropdown: RefObject<HTMLDivElement>;
  children: React.ReactNode;
};

export default function NavbarDropdown({ show, refClickOutsideUserDropdown, children }: Props) {
  return (
    <div
      className={`@absolute @list-none @overflow-y-hidden @m-0 @p-0 @z-50 @w-full smallscreen:@w-96 @top-[calc(100%_+_0.1em)] @right-0 smallscreen:@right-2 @shadow-black @shadow-lg @rounded @bg-bg-secondary ${
        show ? "@max-h-[100vh]" : "@max-h-0"
      }`}
      ref={refClickOutsideUserDropdown}
    >
      {children}
    </div>
  );
}
