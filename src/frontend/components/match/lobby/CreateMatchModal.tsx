import { Dialog } from "@headlessui/react";
import { usePlayers } from "frontend/context/players";
import DefaultDialogDesign from "../../layout/modal/DefaultDialogDesign";
import CreateMatch from "../card/CreateMatch";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

/** Create Match promoted from an always-open form to an on-demand modal action. */
export default function CreateMatchModal({ isOpen, onClose }: Props) {
  const { currentPlayer, setCurrentPlayer } = usePlayers();

  return (
    <Dialog open={isOpen} onClose={onClose} className="@relative @z-40">
      <DefaultDialogDesign title="Create match" width="min(680px, 92vw)">
        <div className="@px-6 @py-6 smallscreen:@px-10">
          <CreateMatch
            currentPlayer={currentPlayer}
            setCurrentPlayer={setCurrentPlayer}
            onCreated={onClose}
          />
        </div>
      </DefaultDialogDesign>
    </Dialog>
  );
}
