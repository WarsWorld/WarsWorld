import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useMediaQuery } from 'utils/useMediaQuery';

interface Props {
  addFooter?: boolean;
  children: JSX.Element;
}

export default function Layout({ addFooter, children }: Props) {
  const query800H = useMediaQuery('(max-height: 800px)');

  if (typeof document !== 'undefined') {
    if (addFooter) {
      if (query800H) {
        document.documentElement.style.setProperty(
          '--layoutGridRows',
          '60px 1fr 140px',
        );
      } else {
        document.documentElement.style.setProperty(
          '--layoutGridRows',
          '100px 1fr 160px',
        );
      }
    } else {
      if (query800H) {
        document.documentElement.style.setProperty(
          '--layoutGridRows',
          '60px 1fr',
        );
      } else {
        document.documentElement.style.setProperty(
          '--layoutGridRows',
          '100px 1fr',
        );
      }
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
