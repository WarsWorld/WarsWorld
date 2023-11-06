import { signIn } from "next-auth/react";

interface Props {
  disabled?: boolean;
  name: string;
}

const SocialMedia = [
  {
    name: "GitHub",
    imgSrc: "/img/socialMedia/github_icon.png",
    imgAlt: "GitHub icon",
    color: "@bg-github",
    signinHandler: async () => signIn("github"),
  },
  {
    name: "Discord",
    imgSrc: "/img/socialMedia/discord_icon.png",
    imgAlt: "Discord icon",
    color: "@bg-discord",
    signinHandler: async () => signIn("discord"),
  },
];

export default function SocialMediaSignInButton({ disabled, name }: Props) {
  const socialMedia = SocialMedia.find((x) => x.name === name);
  const imgSrc = socialMedia?.imgSrc ?? "";
  const imgAlt = socialMedia?.imgAlt ?? "";
  const color = socialMedia?.color ?? "";
  const signInHandler = socialMedia?.signinHandler ?? (() => undefined);

  const onClickSocialMediaHandler = async () => {
    await signInHandler();
  };

  return (
    <button
      className={`@flex @justify-center @align-middle @text-center @rounded @w-full @h-full @py-2 @px-3 cellphone:@px-4 @gap-4 @text-inherit @font-semibold @shadow-black/50 @shadow-md ${color} ${
        !disabled && "hover:@scale-[1.025] active:@scale-105"
      }`}
      onClick={onClickSocialMediaHandler}
      disabled={disabled}
    >
      <div className="@h-full @flex @align-middle @justify-center">
        <img className="@h-full" src={imgSrc} alt={imgAlt} />
      </div>
      <div className="@flex @flex-col @justify-center @align-middle @text-center @h-full @text-inherit">
        {name}
      </div>
    </button>
  );
}
