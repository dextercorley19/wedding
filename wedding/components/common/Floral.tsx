import type { FC, SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Decorative motifs lifted from our invitation suite: clustered blue
 * hydrangea blossoms on a sage vine. Everything here is presentational, so
 * each SVG is hidden from assistive tech.
 */

/** A single four-petal hydrangea floret. */
const Floret: FC<{ cx: number; cy: number; scale?: number; rotate?: number }> = ({
  cx,
  cy,
  scale = 1,
  rotate = 0,
}) => (
  <g transform={`translate(${cx} ${cy}) rotate(${rotate}) scale(${scale})`}>
    {[0, 90, 180, 270].map((angle) => (
      <ellipse
        key={angle}
        cx={0}
        cy={-4.6}
        rx={3.5}
        ry={4.4}
        transform={`rotate(${angle})`}
        fill="var(--hydrangea)"
        fillOpacity={0.9}
      />
    ))}
    <circle r={1.3} fill="var(--hydrangea-deep)" />
  </g>
);

/** Florets massed into the rounded head of a hydrangea bloom. */
const Bloom: FC<{ cx: number; cy: number; scale?: number }> = ({ cx, cy, scale = 1 }) => (
  <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
    <Floret cx={0} cy={-8} scale={0.92} rotate={12} />
    <Floret cx={-8.5} cy={-2} scale={0.88} rotate={-20} />
    <Floret cx={8.5} cy={-2} scale={0.88} rotate={25} />
    <Floret cx={-4.5} cy={7} scale={0.8} rotate={40} />
    <Floret cx={4.5} cy={7} scale={0.8} rotate={-8} />
    <Floret cx={0} cy={0} scale={0.95} rotate={30} />
  </g>
);

/** A pointed sage leaf with a centre vein. */
const Leaf: FC<{ cx: number; cy: number; rotate?: number; scale?: number }> = ({
  cx,
  cy,
  rotate = 0,
  scale = 1,
}) => (
  <g transform={`translate(${cx} ${cy}) rotate(${rotate}) scale(${scale})`}>
    <path d="M0 0 C6 -4 13 -3.5 17 0 C13 3.5 6 4 0 0 Z" fill="var(--sage)" fillOpacity={0.85} />
    <path d="M1 0 H15" stroke="var(--sage-deep)" strokeOpacity={0.5} strokeWidth={0.6} />
  </g>
);

/**
 * Horizontal vine used to separate sections, echoing the border that runs
 * around the invitation.
 */
export const FloralDivider: FC<{ className?: string }> = ({ className }) => (
  <div className={cn("flex justify-center", className)} aria-hidden="true">
    <svg
      viewBox="0 0 320 56"
      className="h-12 w-64 sm:w-80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 28 C70 28 100 20 160 20 C220 20 250 28 300 28"
        stroke="var(--sage)"
        strokeOpacity={0.55}
        strokeWidth={1}
      />
      <Leaf cx={64} cy={26} rotate={-158} scale={0.85} />
      <Leaf cx={108} cy={23} rotate={22} scale={0.75} />
      <Leaf cx={212} cy={23} rotate={158} scale={0.75} />
      <Leaf cx={256} cy={26} rotate={-22} scale={0.85} />
      <Bloom cx={86} cy={24} scale={0.62} />
      <Bloom cx={160} cy={20} scale={0.8} />
      <Bloom cx={234} cy={24} scale={0.62} />
    </svg>
  </div>
);

/** A small upright sprig, used to crown the invitation panel. */
export const FloralSprig: FC<{ className?: string }> = ({ className }) => (
  <div className={cn("flex justify-center", className)} aria-hidden="true">
    <svg viewBox="0 0 120 48" className="h-10 w-28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 40 C36 40 44 22 60 22 C76 22 84 40 106 40"
        stroke="var(--sage)"
        strokeOpacity={0.5}
        strokeWidth={1}
      />
      <Leaf cx={30} cy={37} rotate={-150} scale={0.7} />
      <Leaf cx={90} cy={37} rotate={-30} scale={0.7} />
      <Bloom cx={60} cy={20} scale={0.72} />
    </svg>
  </div>
);

/**
 * Corner vine for framed panels. Renders the top-left orientation; flip it
 * with CSS transforms for the remaining three corners.
 */
export const FloralCorner: FC<SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
  <svg
    viewBox="0 0 96 96"
    className={cn("h-16 w-16", className)}
    fill="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M6 90 C6 52 22 22 60 10" stroke="var(--sage)" strokeOpacity={0.5} strokeWidth={1} />
    <Leaf cx={9} cy={68} rotate={-108} scale={0.62} />
    <Leaf cx={22} cy={38} rotate={-64} scale={0.62} />
    <Leaf cx={48} cy={16} rotate={-22} scale={0.62} />
    <Bloom cx={13} cy={50} scale={0.52} />
    <Bloom cx={34} cy={23} scale={0.46} />
    <Bloom cx={64} cy={10} scale={0.52} />
  </svg>
);
