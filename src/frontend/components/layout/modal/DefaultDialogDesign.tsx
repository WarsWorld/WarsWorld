import { Dialog } from "@headlessui/react";
import { ReactNode } from "react";
import PageTitle from "../PageTitle";

interface Props {
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
                <div className="@h-1 @w-full @bg-gradient-to-r @from-primary-dark @from-10% @via-primary @to-primary-dark @to-90%" />
              </Dialog.Panel>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
