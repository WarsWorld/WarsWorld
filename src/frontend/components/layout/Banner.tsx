import Image from "next/image";
interface imageData {
  className: string;
  alt: string;
  src: string;
  width: number;
  height: number;
}
export default function Banner(props: {
  image1?: imageData;
  title: React.ReactElement | React.ReactElement[];
  backgroundURL: string,
  image2?: imageData;
}) {

  return (
    <div  style={{backgroundImage:`url(${props.backgroundURL})`}} className={`@bg-cover `}>
      <div className="@flex @items-start @gap-10 @backdrop-brightness-[0.35] @px-10 @py-40">
        {props.image1 && (
          <Image
            {...props.image1}
          />
        )}
        <div>
          {props.title}
        </div>
        {props.image2 && (
          <Image
            {...props.image2}
          />
        )}
      </div>
    </div>
  );
}
