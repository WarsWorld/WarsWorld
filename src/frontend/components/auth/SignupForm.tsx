import SquareButton from "../layout/SquareButton";
import FormInput from "../layout/FormInput";
import { Dispatch, FormEvent, SetStateAction } from "react";

interface Props {
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function SignupForm({ setIsModalOpen }: Props) {
  const onSubmitSignupForm = (event: FormEvent) => {
    event.preventDefault();
    console.log("SUBMMIT");
    setIsModalOpen(false);
  };

  return (
    <>
      <form className="@flex @flex-col @gap-6">
        <FormInput key="su-email" text="Email:" id="email" type="email" />
        <FormInput key="su-user" text="Username:" id="username" type="text" />
        <FormInput
          key="su-password"
          text="Password:"
          id="password"
          type="password"
        />
        <FormInput
          key="su-con-password"
          text="Confirm password:"
          id="password"
          type="password"
        />
        <div className="@flex @flex-col @items-center @justify-center @pb-2 @px-10 @gap-2">
          <div className="@w-96 @h-16 @text-3xl @my-2">
            <SquareButton onClick={onSubmitSignupForm}>Signup</SquareButton>
          </div>
        </div>
      </form>
    </>
  );
}
