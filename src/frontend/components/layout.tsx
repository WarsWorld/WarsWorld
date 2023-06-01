import React from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface Props {
  footer?: boolean;
  children: React.ReactElement | React.ReactElement[];
}

export function Layout({ footer, children }: Props) {
  return (
    <div
      className={`@h-full @relative layout ${
        footer ? "withFooter" : "noFooter"
      }`}
    >
      <Navbar />
      <main>{children}</main>
      {footer && <Footer />}
    </div>
  );
}
