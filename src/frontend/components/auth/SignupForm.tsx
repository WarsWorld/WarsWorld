import { TRPCClientError } from "@trpc/client";
import { trpc } from "frontend/utils/trpc-client";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useState } from "react";
import { passwordSchema, signUpSchema } from "shared/schemas/auth";
import { ZodError } from "zod";
import SquareButton from "../layout/SquareButton";
import ErrorSuccessBlock from "../layout/forms/ErrorSuccessBlock";
import FormInput from "../layout/forms/FormInput";

type Props = {
  setIsSignupForm: (value: boolean, callbackUrl: string | null) => Promise<void>;
  setDidSignUp: Dispatch<SetStateAction<boolean>>;
  callbackUrl: string | null;
};

export default function SignupForm({ setIsSignupForm, setDidSignUp, callbackUrl }: Props) {
  const [signupData, setSignupData] = useState({
    user: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState<ZodError>();
  const [error, setError] = useState("");

  const { mutateAsync: registerAsync } = trpc.user.registerUser.useMutation();

  const onChangeGenericHandler = (identifier: string, value: string) => {
    setSignupData((prevData) => ({
      ...prevData,
      [identifier]: value,
    }));
  };

  const onSubmitSignupForm = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const parsedCredentials = signUpSchema
        .extend({
          confirmPassword: passwordSchema,
        })
        .parse({
          email: signupData.email,
          name: signupData.user,
          password: signupData.password,
          confirmPassword: signupData.confirmPassword,
        });

      setFormErrors(undefined);

      if (signupData.password !== signupData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      await registerAsync(parsedCredentials);
    } catch (err) {
      if (err instanceof ZodError) {
        if (signupData.password !== signupData.confirmPassword) {
          setError("Passwords do not match");
        } else {
          setError("");
        }

        setFormErrors(err);
      } else if (err instanceof TRPCClientError || err instanceof Error) {
        setError(err.message);
      } else {
        setError("There was an error posting your comment. Please try again.");
      }

      return;
    }

    setError("");
    void setIsSignupForm(false, callbackUrl);
    setDidSignUp(true);
  };

  const nameError = formErrors?.issues?.find((error) => error.path[0] === "name");
  const emailError = formErrors?.issues?.find((error) => error.path[0] === "email");
  const passwordError = formErrors?.issues?.find((error) => error.path[0] === "password");
  const confirmPasswordError = formErrors?.issues?.find(
    (error) => error.path[0] === "confirmPassword",
  );

  return (
    <>
      {error && <ErrorSuccessBlock isError title="Warning" message={error} />}
      <form className="@flex @flex-col @gap-6">
        <FormInput
          key="su_email"
          text="Email:"
          id="email"
          type="email"
          value={signupData.email}
          isError={emailError !== undefined}
          errorMessage={emailError?.message}
          onChange={(event) =>
            onChangeGenericHandler("email", (event.target as HTMLInputElement).value)
          }
        />
        <FormInput
          key="su_user"
          text="Username:"
          id="username"
          type="text"
          value={signupData.user}
          isError={nameError !== undefined}
          errorMessage={nameError?.message}
          onChange={(event) =>
            onChangeGenericHandler("user", (event.target as HTMLInputElement).value)
          }
        />
        <FormInput
          key="su_password"
          text="Password:"
          id="password"
          type="password"
          value={signupData.password}
          isError={passwordError !== undefined}
          errorMessage={passwordError?.message}
          onChange={(event) =>
            onChangeGenericHandler("password", (event.target as HTMLInputElement).value)
          }
        />
        <FormInput
          key="su_confirm_password"
          text="Confirm password:"
          id="confirm_password"
          type="password"
          value={signupData.confirmPassword}
          isError={confirmPasswordError !== undefined}
          errorMessage={confirmPasswordError?.message}
          onChange={(event) =>
            onChangeGenericHandler("confirmPassword", (event.target as HTMLInputElement).value)
          }
        />
        <div className="@flex @flex-col @items-center @justify-center @py-4 @px-10">
          <div className="@w-[80vw] smallscreen:@w-96 @h-16 @text-3xl @my-2">
            <SquareButton
              onClick={(event: FormEvent) => {
                void onSubmitSignupForm(event);
              }}
            >
              Signup
            </SquareButton>
          </div>
        </div>
      </form>
    </>
  );
}
