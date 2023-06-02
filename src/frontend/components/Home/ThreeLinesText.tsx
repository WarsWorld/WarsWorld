interface buttonData {
  text: string;
  link: string;
}
export default function ThreeLinesText(props: {
  subtitle: string;
  title: string;
  text: string;
  button: buttonData[] | false;
}) {
  const buttonArray: React.ReactElement[] = [];
  if (props.button) {
    props.button.forEach((buttonItem: buttonData) =>
      buttonArray.push(
        <a href={buttonItem.link} className={"btn"}>
          {buttonItem.text}
        </a>
      )
    );
  }
  return (
    <div className="@text-center @py-10">
      <h2>{props.subtitle}</h2>
      <h1>
        <strong> {props.title}</strong>
      </h1>
      <p>{props.text}</p>
      <div className={"@mt-4 @gap-1"}>{buttonArray}</div>
    </div>
  );
}
