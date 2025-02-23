import { SVG } from "../SVG";

type Props = {
  onClick?: React.MouseEventHandler;
  children: React.ReactNode;
};

export default function PlayButton({ onClick, children }: Props) {
  return (
    <div className="filter-shadow-wrap @overflow-visible" onClick={onClick}>
      <button
        className="octagon-box @relative @bg-blue-moon @font-black @w-auto @h-auto hover:@scale-[1.01] @duration-100 @shadow-black @shadow-lg"
        onClick={onClick}
      >
        <div className="@bg-blue-moon @flex @items-center @py-3 smallscreen:@py-6 monitor:@py-6 @px-4 smallscreen:@px-8 monitor:@px-12 @space-x-4">
          <SVG
            svg="Target"
            viewBox="0 0 24 24"
            className="@scale-150 @fill-white @rotate-[20deg] @w-10 cellphone:@w-12 smallscreen:@w-20 monitor:@w-[6.5rem] @h-10 cellphone:@h-12 smallscreen:@h-16 monitor:@h-[5.5rem]"
            width="200px"
            height="200px"
          />
          <div className="@text-white @font-russoOne @text-3xl cellphone:@text-4xl laptop:@text-6xl monitor:@text-8xl @pl-6 smallscreen:@pl-8">
            {children}
          </div>
        </div>
      </button>
    </div>
  );
}
