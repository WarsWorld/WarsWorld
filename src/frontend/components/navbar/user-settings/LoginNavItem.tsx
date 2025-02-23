import SquareButton from "../../layout/SquareButton";
import AuthenticateModal from "../../modals/AuthenticateModal";

type Props = {
  setIsOpen: (value: boolean, callbackUrl?: string) => Promise<void>;
  isOpen: boolean;
  width: string;
};

export default function LoginNavItem({ isOpen, setIsOpen, width }: Props) {
  return (
    <>
      <div className="@w-32">
        <SquareButton
          onClick={() => {
            void setIsOpen(true);
          }}
        >
          LOGIN
        </SquareButton>
      </div>
      <AuthenticateModal isOpen={isOpen} setIsOpen={setIsOpen} width={width} />
    </>
  );
}
