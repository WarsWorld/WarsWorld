import Navbar from './Navbar';
import Footer from './Footer';
import React from 'react';

interface Props {
  addFooter?: boolean;
  children: JSX.Element;
}

export default function Layout({ addFooter, children }: Props) {
  return (
    <div className="layout">
      <Navbar />
      <main className="layoutContent">{children}</main>
      {addFooter ? <Footer /> : null}
    </div>
  );
}
