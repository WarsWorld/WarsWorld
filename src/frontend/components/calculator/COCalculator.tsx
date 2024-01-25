import {CO} from "../../../shared/schemas/co";

type Props = {
    player: CO
}


export default function COCalculator({player}:Props) {
    return (<>
            <div className="@col-span-6 @flex @bg-bg-tertiary @justify-between">
                <img src="/img/CO/pixelated/sami-small.png" alt=""/>
                <img src="/img/CO/redstar.gif" alt=""/>
                <img src="/img/CO/bluestar.gif" alt=""/>
                <p>ComTowers</p>
                <p>Gold</p>



            </div>
        </>)
}