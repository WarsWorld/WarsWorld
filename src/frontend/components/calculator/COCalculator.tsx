import { CO } from "../../../shared/schemas/co";
import IconText from "./IconText";
import COSelect from "./COSelect";

type Props = {
  co: CO
  commtower: number
  gold: number
  capture: number
  coPower: boolean
}


export default function COCalculator({ co,coPower,capture,commtower,gold }: Props) {
  return (<>
    <div className="@col-span-6 @flex @bg-bg-tertiary @justify-between @align-middle @items-center ">
      <div className="@flex">
        <COSelect CO={co}/>
        <IconText icon={"redstar"} />
        <IconText icon={"bluestar"} />
      </div>

      <IconText icon={"commtower"} text={commtower}/>
      <IconText icon={"coin"} text={gold}/>
      <IconText icon={"capture"} text={capture}/>



    </div>
  </>);
}