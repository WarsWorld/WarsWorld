import Image from "next/image";
export default function SmallContainer(props: {
  image: string;
  alt: string;
  title: string;
  text: string;
}) {
  return (
    <div className={"  @bg-blue-950 @rounded-2xl   "}>
      <Image
        className={"@w-full @rounded-t-2xl "}
        src={`/img/layout/${props.image}.jpg`}
        alt={props.alt}
        width={380}
        height={400}
      ></Image>
      <div className={" @p-2 "}>
        <h1>
          <strong> {props.title} </strong>
        </h1>
        <p>{props.text}</p>
      </div>
    </div>
  );
}
