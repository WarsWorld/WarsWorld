import type { avaliableSVGs } from "../utils/svgPaths";
import { SVG_PATHS } from "../utils/svgPaths";

export type Props = {
  width?: string;
  height?: string;
  viewBox?: string;
  className?: string;
  svg: avaliableSVGs;
};

export function SVG({ width, height, className, viewBox, svg }: Props) {
  return (
    <svg
      className={className}
      width={width ?? "200px"}
      height={height ?? "200px"}
      viewBox={viewBox ?? "0 -960 960 960"}
      xmlns="http://www.w3.org/2000/svg"
      data-name="Layer 1"
    >
      <path d={SVG_PATHS[svg]} />
    </svg>
  );
}
