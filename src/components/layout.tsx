import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
// TODO: Hook can be removed after media query is implemented for tailwind
import { useMediaQuery } from 'utils/useMediaQuery';

interface Props {
  footer?: boolean;
  children: JSX.Element;
}

const layoutGridRows = {
  withFooter: '@grid-rows-[100px_1fr_160px]',
  noFooter: '@grid-rows-[100px_1fr]',
};

const layoutGridRows850H = {
  withFooter: '@grid-rows-[60px_1fr_140px]',
  noFooter: '@grid-rows-[60px_1fr]',
};

export function Layout({ footer, children }: Props) {
  // TODO: Hook can be removed after media query is implemented for tailwind
  const query800H = useMediaQuery('(max-height: 850px)');
  let gridStyling;

  if (query800H) {
    gridStyling = layoutGridRows850H;
  } else {
    gridStyling = layoutGridRows;
  }

  return (
    <div
      className={`@grid @h-full @relative ${
        footer ? gridStyling['withFooter'] : gridStyling['noFooter']
      } layout`}
    >
      <Navbar />
      <main className="@flex @justify-center @items-center">{children}</main>
      {footer && <Footer />}
    </div>
  );
}
