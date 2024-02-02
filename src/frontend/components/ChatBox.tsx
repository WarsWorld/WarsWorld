import { trpc } from "frontend/utils/trpc-client";
import type { MutableRefObject } from "react";
import { useEffect, useRef, useState } from "react";
import type { ChatMessageFrontend } from "shared/types/chat-message";
import SquareButton from "./layout/SquareButton";
import FormInput from "./layout/forms/FormInput";

type Props = {
  chatHistory: ChatMessageFrontend[];
  matchId: string;
  currentPlayerId?: string;
};

export function ChatBox({ chatHistory, matchId, currentPlayerId }: Props) {
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const sendChatMutation = trpc.match.sendChatMessage.useMutation();

  const chatBottomRef = useRef() as MutableRefObject<HTMLInputElement>;
  const executeScroll = () =>
    chatBottomRef.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "end",
    });
  useEffect(() => {
    executeScroll();
  }, [chatHistory]);

  return (
    <div className="@fixed @right-0">
      <div
        className="@absolute @text-center @h-[60px] @w-[100px] @left-[-100px] @bg-bg-tertiary 
        @border-4 @border-black @cursor-pointer"
        onClick={() => {
          setIsVisible(!isVisible);
        }}
      >
        Toggle Chat
      </div>
      <section
        className={`${
          isVisible ? "@block" : "@hidden"
        } @w-[360px] @h-[500px] @bg-bg-tertiary @border-4 @border-black @p-2 @flex @flex-col`}
      >
        <div className="@flex @justify-center @mb-2">
          <p className="@w-2/3 @text-center">Live Chat</p>
        </div>
        <div className="@basis-auto @grow @shrink">
          <div className="@h-[300px] @bg-black/50 @overflow-auto @p-2">
            {chatHistory?.map(({ createdAt, author, content }, index) => (
              <div className="@flex" key={index}>
                <div className="@text-white/30 @min-w-9 @text-right @mr-1">
                  {formatDate(createdAt)}
                </div>
                <div>
                  <span className="@text-secondary">{author.name}</span>:<span> {content}</span>
                </div>
              </div>
            ))}
            <div ref={chatBottomRef} className="@clear-both @float-left" />
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendChatMutation.mutateAsync({
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
    </div>
  );
}

function formatDate(date: Date) {
  return date.toLocaleTimeString().substring(0, date.toLocaleTimeString().length - 6);
}
