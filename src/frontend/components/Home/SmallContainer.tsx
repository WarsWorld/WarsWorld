import Image from "next/image";
import matchContainer from "../../../../public/img/layout/matchContainer.jpg"
export default function SmallContainer(props: { image: string, text: string }) {

  return (
    <div>
      <Image
      src={`/img/layout/${props.image}.jpg`}
      width={380}
      height={400}>

      </Image>
      <p>{props.text}</p>

    </div>
  )
}