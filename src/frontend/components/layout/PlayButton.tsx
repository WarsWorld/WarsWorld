type Props = {
  disabled?: boolean;
  onClick?: React.MouseEventHandler;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset" | undefined;
}

export default function PlayButton({ disabled, onClick, children, type }: Props) {
  return (
    <>
      <button
        className="@relative @bg-blue-50 @text-orange-star @font-black @w-auto @h-auto @border-4 @border-blue-50 hover:@scale-[1.01] @duration-100 @shadow-black @shadow-lg"
        onClick={onClick}
        disabled={disabled}
        type={type}
      >
        <div className="@absolute @-top-4 @-left-4 smallscreen:@-top-6 smallscreen:@-left-6 @w-[90%] @h-[70%] @border-l-4 @border-t-4 smallscreen:@border-l-[6px] smallscreen:@border-t-[6px] @border-primary" />
        <div className="@flex @items-center @space-x-2 @border-x-4 @border-y-[10px] smallscreen:@border-y-[16px] @border-blue-moon @py-2 @px-4">
          <div className="@border-4 smallscreen:@border-8 @border-blue-moon @rounded-md">
            <svg className="@fill-orange-star @rotate-[20deg] @w-10 cellphone:@w-12 smallscreen:@w-20 monitor:@w-24 @h-10 cellphone:@h-12 smallscreen:@h-20 monitor:@h-24" width="200px" height="200px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1">
              <path d="M21,11H19.93A8,8,0,0,0,13,4.07V3a1,1,0,0,0-2,0V4.07A8,8,0,0,0,4.07,11H3a1,1,0,0,0,0,2H4.07A8,8,0,0,0,11,19.93V21a1,1,0,0,0,2,0V19.93A8,8,0,0,0,19.93,13H21a1,1,0,0,0,0-2Zm-9,7a6,6,0,1,1,6-6A6,6,0,0,1,12,18Zm0-9a3,3,0,1,0,3,3A3,3,0,0,0,12,9Zm0,4a1,1,0,1,1,1-1A1,1,0,0,1,12,13Z"/>
            </svg>
          </div>
          <div className="@border-b-[0.75rem] @border-blue-moon/90 @font-russoOne @text-3xl cellphone:@text-4xl smallscreen:@text-7xl monitor:@text-8xl">
            {children}
          </div>
        </div>
        <div className="@absolute @-bottom-4 @-right-4 smallscreen:@-bottom-6 smallscreen:@-right-6 @w-[90%] @h-[70%] @border-r-4 @border-b-4 smallscreen:@border-r-[6px] smallscreen:@border-b-[6px] @border-primary" />
      </button>
    </>
  )
}