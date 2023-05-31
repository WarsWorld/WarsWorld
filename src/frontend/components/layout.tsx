import React from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface Props {
  footer?: boolean;
  children: JSX.Element | JSX.Element[];
}

export function Layout({ footer, children }: Props) {
  return (
    <div className="@grid @h-full layout">
      <Navbar />
      <div className="@grid @relative">
        <main className="@h-full">{children}</main>
        {footer && <Footer />}
      </div>
    </div>
  );
}
