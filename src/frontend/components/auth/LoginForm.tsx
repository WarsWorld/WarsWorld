import SquareButton from "../layout/SquareButton";
import FormInput from "../layout/FormInput";
import { FormEvent, useState } from "react";

interface Props {
  onSubmitEndBehaviour: () => void;
}

export default function LoginForm({ onSubmitEndBehaviour }: Props) {
  const [loginData, setLoginData] = useState({
    user: "",
    password: "",
  });

  const onChangeGenericHandler = (identifier: string, value: string) => {
    setLoginData((prevData) => ({
      ...prevData,
      [identifier]: value,
    }));
  };

  const onSubmitLoginForm = (event: FormEvent) => {
    event.preventDefault();
    console.log("SUBMMITED");
    console.log(loginData);
    onSubmitEndBehaviour();
  };

  return (
    <>
      <form onSubmit={onSubmitLoginForm} className="@flex @flex-col @gap-6">
        <FormInput
          key="li_user"
          text="Username:"
          id="username"
          type="text"
          value={loginData.user}
          onChange={(event) =>
            onChangeGenericHandler(
              "user",
              (event.target as HTMLInputElement).value
            )
          }
        />
        <FormInput
          key="li_password"
          text="Password:"
          id="password"
          type="password"
          value={loginData.password}
          onChange={(event) =>
            onChangeGenericHandler(
              "password",
              (event.target as HTMLInputElement).value
            )
          }
        />
        <div className="@flex @flex-col @items-center @justify-center @pt-2 @px-10">
          <div className="@w-96 @h-16 @text-3xl @my-2">
            <SquareButton>Login</SquareButton>
          </div>
        </div>
      </form>
    </>
  );
}
