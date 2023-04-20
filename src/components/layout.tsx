import Navbar from './Navbar';
import Footer from './Footer';
import React from 'react';

interface Props {
  addFooter?: boolean;
  children: JSX.Element;
}

export default function Layout({ addFooter, children }: Props) {
  if (typeof document !== 'undefined') {
    if (addFooter) {
      document.documentElement.style.setProperty(
        '--layoutGridRows',
        '100px 1fr 120px',
      );
    } else {
      document.documentElement.style.setProperty(
        '--layoutGridRows',
        '100px 1fr',
      );
    }
  }

  return (
    <div className="layout">
      <Navbar />
      <main className="layoutContent">{children}</main>
      {addFooter ? <Footer /> : null}
    </div>
  );
}
