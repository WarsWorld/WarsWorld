import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useMediaQuery } from 'utils/useMediaQuery';

interface Props {
  footer?: boolean;
  children: JSX.Element;
}

export function Layout({ footer, children }: Props) {
  const query800H = useMediaQuery('(max-height: 800px)');

  if (typeof window !== 'undefined') {
    if (footer) {
      if (query800H) {
        window.document.documentElement.style.setProperty(
          '--layoutGridRows',
          '60px 1fr 140px',
        );
      } else {
        window.document.documentElement.style.setProperty(
          '--layoutGridRows',
          '100px 1fr 160px',
        );
      }
    } else {
      if (query800H) {
        window.document.documentElement.style.setProperty(
          '--layoutGridRows',
          '60px 1fr',
        );
      } else {
        window.document.documentElement.style.setProperty(
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
      {footer ? <Footer /> : null}
    </div>
  );
}
