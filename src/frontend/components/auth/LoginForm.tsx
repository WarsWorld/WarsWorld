import SquareButton from "../layout/SquareButton";
import FormInput from "../layout/FormInput";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import ErrorSuccessBlock from "../layout/ErrorSuccessBlock";

export default function LoginForm() {
  const nextJsRouter = useRouter();
  const [loginData, setLoginData] = useState({
    user: "",
    password: "",
  });
  const [error, setError] = useState({
    isError: false,
    message: "",
  });

  const onChangeGenericHandler = (identifier: string, value: string) => {
    setLoginData((prevData) => ({
      ...prevData,
      [identifier]: value,
    }));
  };

  const onSubmitLoginForm = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const loginResponse = await signIn("credentials", {
        name: loginData.user,
        password: loginData.password,
        redirect: false,
      });

      if (!loginResponse)
        throw {
          title: "Couldn't connect to the server.",
          statusCode: null,
        };

      if (loginResponse.status === 401)
        throw {
          title: "User or password are incorrect",
          statusCode: loginResponse.status,
        };

      if (loginResponse.ok) {
        setError({
          isError: false,
          message: "",
        });
        nextJsRouter.reload();
      }
    } catch (e: any) {
      setError({
        isError: true,
        message: e.title,
      });
    }
  };

  return (
    <>
      {error.isError && <ErrorSuccessBlock isError title={error.message} />}

      <form
        onSubmit={onSubmitLoginForm}
        className="@flex @flex-col @gap-2 smallscreen:@gap-6"
      >
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
        <div className="@flex @flex-col @items-center @justify-center @pt-4 @px-10">
          <div className="@w-[80vw] smallscreen:@w-96 @h-16 @text-3xl @my-2">
            <SquareButton>Login</SquareButton>
          </div>
        </div>
      </form>
    </>
  );
}
