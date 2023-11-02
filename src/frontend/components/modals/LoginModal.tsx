import { Dialog } from "@headlessui/react";
import { Dispatch, SetStateAction } from "react";
import DefaultDialogDesign from "../layout/modal/DefaultDialogDesign";
import SquareButton from "../layout/SquareButton";

interface Props {
  width?: string;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function LoginModal({ isOpen, setIsOpen, width }: Props) {
  return (
    <>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="@relative @z-40"
      >
        <DefaultDialogDesign title="LOGIN" width={width ?? "75vw"}>
          <div className="@p-10">
            <p>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eveniet,
              blanditiis quas nobis asperiores saepe earum ipsa porro unde
              maiores, rem eius iste aut officiis voluptatum voluptates ratione,
              perferendis veniam ducimus consequatur vitae aliquam mollitia
              deleniti eum. Adipisci mollitia distinctio nihil. Lorem, ipsum
              dolor sit amet consectetur adipisicing elit. Repellat iure ex
              eligendi explicabo nihil dolorum tempora odit! Totam adipisci,
              rerum dignissimos quo deserunt sunt ipsa aliquid id ad doloribus.
              Commodi eos ipsum nobis repellat necessitatibus voluptatem
              possimus eligendi quasi vero!
            </p>
          </div>
          <div className="@flex @items-end @justify-end @py-6 @px-10">
            <div className="@w-40 @h-16 @text-2xl">
              <SquareButton onClick={() => setIsOpen(false)}>
                Cancel
              </SquareButton>
            </div>
          </div>
        </DefaultDialogDesign>
      </Dialog>
    </>
  );
}
