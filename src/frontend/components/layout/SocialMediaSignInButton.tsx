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
    text_color: "@text-white",
    font: "@font-semibold",
    signinHandler: async () => signIn("github"),
  },
  {
    name: "Discord",
    imgSrc: "/img/socialMedia/discord_icon.png",
    imgAlt: "Discord icon",
    color: "@bg-discord",
    text_color: "@text-white",
    font: "@font-semibold",
    signinHandler: async () => signIn("discord"),
  },
  {
    name: "Google",
    imgSrc: "/img/socialMedia/google_icon.png",
    imgAlt: "Google icon",
    color: "@bg-white",
    text_color: "@text-black/90",
    font: "@font-medium",
    signinHandler: async () => signIn("google"),
  },
];

export default function SocialMediaSignInButton({ disabled, name }: Props) {
  const socialMedia = SocialMedia.find(
    (x) => x.name.toLowerCase() === name.toLowerCase()
  );
  const displayName = socialMedia?.name ?? "";
  const imgSrc = socialMedia?.imgSrc ?? "";
  const imgAlt = socialMedia?.imgAlt ?? "";
  const color = socialMedia?.color ?? "";
  const text_color = socialMedia?.text_color ?? "";
  const font = socialMedia?.font ?? "";
  const signInHandler = socialMedia?.signinHandler ?? (() => undefined);

  const onClickSocialMediaHandler = async () => {
    await signInHandler();
  };

  return (
    <button
      className={`@flex @justify-center @align-middle @text-center @rounded @w-full @h-full @py-2 @px-3 cellphone:@px-4 @gap-4 @text-inherit ${font} @shadow-black/50 @shadow-md ${
        disabled ? "@bg-gray-500" : color
      } ${!disabled && "hover:@scale-[1.025] active:@scale-105"}`}
      onClick={onClickSocialMediaHandler}
      disabled={disabled}
    >
      <div className="@h-full @flex @align-middle @justify-center">
        <img
          className={`@h-full ${disabled ? "@grayscale" : ""}`}
          src={imgSrc}
          alt={imgAlt}
        />
      </div>
      <div
        className={`@flex @flex-col @justify-center @align-middle @text-center @h-full ${
          disabled ? "@text-gray-300" : text_color
        }`}
      >
        {displayName}
      </div>
    </button>
  );
}
