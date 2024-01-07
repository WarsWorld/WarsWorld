import { Dialog } from "@headlessui/react";
import type { ReactNode } from "react";
import PageTitle from "../PageTitle";
import OrangeGradientLine from "../decorations/OrangeGradientLine";

type Props = {
  width?: string;
  title?: string;
  children: ReactNode;
}

export default function DefaultDialogDesign({ children, width, title }: Props) {
  return (
    <>
      <div className="@fixed @inset-0 @bg-black/80" aria-hidden="true" />
      <div className="@fixed @inset-0 @w-screen @overflow-y-scroll">
        <div className="@flex @flex-col @min-h-full @items-center @justify-center @w-full">
          <div className="@py-16" style={{ width: width ?? "75vw" }}>
            <div className="@w-full @h-full @rounded-xl @overflow-hidden @shadow-xl @shadow-black">
              <Dialog.Panel className="@bg-bg-secondary">
                <PageTitle>{title}</PageTitle>
                {children}
                <OrangeGradientLine />
              </Dialog.Panel>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
