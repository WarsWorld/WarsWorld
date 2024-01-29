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
        <div className="@bg-blue-moon @flex @items-center @py-3 smallscreen:@py-4 monitor:@py-6 @px-3 smallscreen:@px-4 monitor:@px-6">
          <svg
            className="@scale-150 @fill-white @rotate-[20deg] @w-10 cellphone:@w-12 smallscreen:@w-20 monitor:@w-[6.5rem] @h-10 cellphone:@h-12 smallscreen:@h-16 monitor:@h-24"
            width="200px"
            height="200px"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            data-name="Layer 1"
          >
            <path d="M21,11H19.93A8,8,0,0,0,13,4.07V3a1,1,0,0,0-2,0V4.07A8,8,0,0,0,4.07,11H3a1,1,0,0,0,0,2H4.07A8,8,0,0,0,11,19.93V21a1,1,0,0,0,2,0V19.93A8,8,0,0,0,19.93,13H21a1,1,0,0,0,0-2Zm-9,7a6,6,0,1,1,6-6A6,6,0,0,1,12,18Zm0-9a3,3,0,1,0,3,3A3,3,0,0,0,12,9Zm0,4a1,1,0,1,1,1-1A1,1,0,0,1,12,13Z" />
          </svg>
          <div className="@text-white @font-russoOne @text-3xl cellphone:@text-4xl laptop:@text-6xl monitor:@text-8xl @pl-6 smallscreen:@pl-8">
            {children}
          </div>
        </div>
      </button>
    </div>
  );
}
