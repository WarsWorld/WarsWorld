import { TRPCClientError } from "@trpc/client";
import ErrorSuccessBlock from "frontend/components/layout/forms/ErrorSuccessBlock";
import FormInput from "frontend/components/layout/forms/FormInput";
import SquareButton from "frontend/components/layout/SquareButton";
import { usePlayers } from "frontend/context/players";
import { trpc } from "frontend/utils/trpc-client";
import type { FormEvent } from "react";
import { useState } from "react";
import { playerSchema } from "shared/schemas/user";
import { ZodError } from "zod";

export default function CreatePlayer() {
  const { mutateAsync: createPlayer, isSuccess } = trpc.user.createPlayer.useMutation();
  const { refetchOwnedPlayers } = usePlayers();

  const [error, setError] = useState("");
  const [playerData, setPlayerData] = useState({
    name: "",
    displayName: "",
  });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const data = playerSchema.parse({
        name: playerData.name,
        displayName: playerData.displayName,
      });

      await createPlayer({
        name: data.name,
        displayName: data.displayName,
      }).then(() => {
        if (refetchOwnedPlayers) {
          refetchOwnedPlayers();
        }
      });
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.message);
      } else if (err instanceof TRPCClientError) {
        setError(err.message);
      } else {
        setError("There was an error while trying to post the article. Please try again.");
      }
    }
  };

  const onChangeGenericHandler = (identifier: string, value: string) => {
    setPlayerData((prevData) => ({
      ...prevData,
      [identifier]: value,
    }));
  };

  return (
    <div className="@p-20">
      {isSuccess && <ErrorSuccessBlock className="@h-16 @mb-8" title="User Created!" />}
      {error.trim() !== "" && (
        <ErrorSuccessBlock
          className="@min-h-16 @mb-8"
          title="Error when creating user..."
          message={error}
          isError
        />
      )}
      <h1>WORK IN PROGRESS</h1>
      <p>
        It's for this page functionality to be moved to user's dropdown pop up on the top right.
      </p>
      <p>
        If you get an error that ends with &quot;Unique constraint failed on the fields:
        `name`&quot;, it means that there is already a player with that name, you can have repeated
        display names though.{" "}
      </p>
      <h1>Create Player</h1>
      <form className="@flex @flex-col @gap-8" onSubmit={(e) => void onSubmit(e)}>
        <FormInput
          type="text"
          name="name"
          text="Name:"
          onChange={(e) => onChangeGenericHandler("name", e.target.value)}
        />
        <FormInput
          type="text"
          name="displayName"
          text="Display Name:"
          onChange={(e) => onChangeGenericHandler("displayName", e.target.value)}
        />
        <div className="@h-12 @w-32">
          <SquareButton type="submit">Create</SquareButton>
        </div>
      </form>
    </div>
  );
}
