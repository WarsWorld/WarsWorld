import SquareButton from "./SquareButton";
import { useRouter } from "next/router";

interface buttonData {
  text: string;
  link: string;
}

export default function ThreeLinesText(props: {
  subtitle: string;
  title: string;
  text: string;
  button?: buttonData[];
}) {
  const router = useRouter();
  const buttonArray: React.ReactElement[] = [];
  if (props.button) {
    props.button.forEach((buttonItem: buttonData) =>
      buttonArray.push(
        <div className="">
          <SquareButton
            key={buttonItem.text}
            onClick={() => router.push(buttonItem.link)}
          >
            {buttonItem.text}
          </SquareButton>
        </div>
      )
    );
  }

  return (
    <div className="@text-center @pt-10 @pb-6">
      <h2 className="@font-light">{props.subtitle}</h2>
      <h1>
        <strong>{props.title}</strong>
      </h1>
      <p>{props.text}</p>
      <div className="@flex @justify-center @mt-4 @gap-2">{buttonArray}</div>
    </div>
  );
}
