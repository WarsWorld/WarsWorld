import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface Props {
  addFooter?: boolean;
  children: JSX.Element;
}

export default function Layout({ addFooter, children }: Props) {
  if (typeof document !== 'undefined') {
    if (addFooter) {
      document.documentElement.style.setProperty(
        '--layoutGridRows',
        '100px 1fr 160px',
      );
    } else {
      document.documentElement.style.setProperty(
        '--layoutGridRows',
        '100px 1fr',
      );
    }
  }

  return (
    <div className="@grid @relative @h-full @w-screen layout">
      <Navbar />
      <main className="@flex @h-full @w-screen @justify-center @items-center">
        {children}
      </main>
      {addFooter ? <Footer /> : null}
    </div>
  );
}
