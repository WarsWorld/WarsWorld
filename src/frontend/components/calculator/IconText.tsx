
type Props = {
    icon: string,
    text?: number
}


export default function IconText({icon, text}:Props) {
    return (
        <div className="@flex @items-center @justify-center @px-2 ">
          <img className="[image-rendering:pixelated] @w-7" src={`/img/CO/${icon}.gif`} alt="" />
          {text != undefined ? <p className="@px-4">{text}</p> : ""}
        </div>

    )
}