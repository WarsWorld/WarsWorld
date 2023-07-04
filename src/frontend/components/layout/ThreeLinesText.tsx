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
  const buttonArray: React.ReactElement[] = [];
  if (props.button) {
    props.button.forEach((buttonItem: buttonData) =>
      buttonArray.push(
        <a key={buttonItem.link} href={buttonItem.link} className="btn">
          {buttonItem.text}
        </a>
      )
    );
  }

  return (
    <div className="@text-center @pt-10 @pb-6">
      <h2>{props.subtitle}</h2>
      <h1>
        <strong>{props.title}</strong>
      </h1>
      <p>{props.text}</p>
      <div className="@mt-4 @gap-1">{buttonArray}</div>
    </div>
  );
}
