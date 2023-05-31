import React from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface Props {
  footer?: boolean;
  children: JSX.Element | JSX.Element[];
}

export function Layout({ footer, children }: Props) {
  return (
    <div className="@grid  layout">
      <Navbar />
      <div className="@grid  @relative ">
        <main className="">{children}</main>
        {footer && <Footer />}
      </div>
    </div>
  );
}
