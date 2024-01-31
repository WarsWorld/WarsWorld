import { trpc } from "frontend/utils/trpc-client";
import { useEffect, useState } from "react";
import type { FrontendChatMessage } from "shared/types/component-data";
import SquareButton from "./layout/SquareButton";
import FormInput from "./layout/forms/FormInput";

type Props = {
  chat?: FrontendChatMessage[] | null;
  matchId: string;
  currentPlayerId?: string;
};

function formatDate(date: Date) {
  return date.toLocaleTimeString().substring(0, date.toLocaleTimeString().length - 6);
}

export function ChatBox({ chat, matchId, currentPlayerId }: Props) {
  const [message, setMessage] = useState("");
  const [isVisisble, setIsVisible] = useState(false);

  const chatMutation = trpc.action.sendChatMessage.useMutation();

  // Force the chat history to go to bottom
  useEffect(() => {
    const objDiv = document.getElementById("chatHistory");
    objDiv!.scrollTop = objDiv!.scrollHeight;
  }, [chat]);

  return (
    <section
      className={`@fixed ${
        isVisisble ? "@right-0" : "@right-[-360px]"
      } @w-[360px] @h-[500px] @bg-bg-tertiary @border-4 @border-black @p-2 @flex @flex-col`}
    >
      <div
        className="@absolute @h-[100px] @w-[30px] @left-[-30px] @bg-bg-tertiary @border-4 @border-black @cursor-pointer"
        onClick={() => {
          setIsVisible((prev) => !prev);
        }}
      >
        {`>>\n`}
        {`>>\n`}
        {`>>\n`}
        {`>>\n`}
      </div>
      <div className="@flex @justify-center @mb-2">
        <p className="@w-2/3 @text-center">Live Chat</p>
      </div>
      <div className="@basis-auto @grow @shrink">
        {/* Chat History */}
        <div id="chatHistory" className="@h-[300px] @bg-black/50 @overflow-auto @p-2">
          {chat?.map(({ createdAt, name, content }, index) => (
            <div className="@flex" key={index}>
              <div className="@text-white/30 @min-w-9 @text-right @mr-1">
                {formatDate(createdAt)}
              </div>
              <div>
                <span className="@text-secondary">{name}</span>:<span> {content}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void chatMutation.mutateAsync({
            matchId: matchId,
            playerId: currentPlayerId!,
            message: message,
          });
          setMessage("");
        }}
      >
        <FormInput
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          type="text"
        />
        <div className="@self-end @my-2 @ml-auto @w-fit">
          <SquareButton type="submit">Chat</SquareButton>
        </div>
      </form>
    </section>
  );
}
