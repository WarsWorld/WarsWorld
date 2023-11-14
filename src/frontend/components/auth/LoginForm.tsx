import SquareButton from "../layout/SquareButton";
import FormInput from "../layout/FormInput";
import { FormEvent, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import ErrorSuccessBlock from "../layout/ErrorSuccessBlock";
import { useSearchParams } from "next/navigation";

interface Props {
  onClose: () => Promise<void>;
}

export default function LoginForm({ onClose }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginData, setLoginData] = useState({
    user: "",
    password: "",
  });
  const [error, setError] = useState({
    isError: false,
    message: "",
  });
  const errorParam = searchParams.get("error");
  const isProviderCallback = errorParam == "Callback";
  const isProtectionError = errorParam == "ProtectedPage";
  const isOAuthAccountNotLinked = errorParam == "OAuthAccountNotLinked";

  useEffect(() => {
    if (isProviderCallback)
      setError({
        isError: true,
        message: "Error trying to login with that provider.",
      });

    if (isOAuthAccountNotLinked)
      setError({
        isError: true,
        message: "There is already an user with that email",
      });

    if (isProtectionError)
      setError({
        isError: true,
        message: "You must be logged in to access this page.",
      });
  }, [isOAuthAccountNotLinked, isProviderCallback, isProtectionError]);

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
        onClose().then(() => {
          router.reload();
        });
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
