import Navbar from "./Navbar";
import Footer from "./Footer";
import React from "react";

interface Props {
  children: JSX.Element
}

export default function Layout({children}: Props) {
  return (
    <div className="layout">
      <Navbar />
      <main className="layoutContent">{children}</main>
      <Footer />
    </div>
  )
}
