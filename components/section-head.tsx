import type { ReactNode } from "react";
import { Kicker } from "./site";

type Props = {
  kicker: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  id?: string;
  className?: string;
  as?: "h1" | "h2";
};

/**
 * The CSS selector `[class="section-head"]` (an exact match) sets
 * `display: contents` on this wrapper, so it disappears from layout when it
 * has no other className. Passing ANY `className` here breaks that exact
 * match and keeps a real box in the grid/flow instead — that's why callers
 * like `works-hero-head`, `activity-hero-head`, `sitemap-hero-head`, and
 * `funding-archive-head` exist: they carry no CSS rules of their own, they
 * only exist to opt a given SectionHead out of `display: contents`.
 */
export function SectionHead({ kicker, title, lead, id, className, as: Heading = "h2" }: Props) {
  return (
    <div className={className ? `section-head ${className}` : "section-head"}>
      <Kicker>{kicker}</Kicker>
      <Heading id={id}>{title}</Heading>
      {lead ? <p>{lead}</p> : null}
    </div>
  );
}
