import { SVG } from "frontend/components/SVG";
import AuthenticateModal from "../../modals/AuthenticateModal";

type Props = {
  setIsOpen: (value: boolean, callbackUrl?: string) => Promise<void>;
  isOpen: boolean;
  width: string;
};

export default function LoginNavItem({ isOpen, setIsOpen, width }: Props) {
  return (
    <>
      <div className="filter-shadow-wrap-small @w-48">
        <button
          className={`octagon-box @flex @justify-center @items-center @bg-gradient-to-r @from-green-900 @to-green-700 @rounded @w-full @h-full @py-1 @pr-1 @text-inherit @font-semibold @gap-2 @shadow-black @shadow-md hover:@bg-gradient-to-r hover:@from-green-800 hover:@to-green-600`}
          onClick={() => {
            void setIsOpen(true);
          }}
        >
          <SVG
            svg="Target"
            className="@fill-white @rotate-[20deg] @w-10 @h-10"
            viewBox="0 0 24 24"
            width="200px"
            height="200px"
          />
          <div className="@text-white @font-normal @font-russoOne">LOGIN</div>
        </button>
      </div>
      <AuthenticateModal isOpen={isOpen} setIsOpen={setIsOpen} width={width} />
    </>
  );
}
