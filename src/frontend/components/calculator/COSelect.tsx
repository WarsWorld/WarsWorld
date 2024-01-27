import type {CO } from "../../../shared/schemas/co";

type Props = {
    CO: CO,
}


export default function COSelect({CO}:Props) {
    return (
      <div className="@w-16 @">
        <img className="@h-full @w-full [image-rendering:pixelated]" src={`/img/CO/pixelated/${CO}-small.png`} alt="" />

      </div>

    )
}