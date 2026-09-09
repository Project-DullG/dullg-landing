import type { ReactNode } from "react";
import { Kicker } from "./site";

type Props = {
  kicker?: ReactNode;
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
 * that participate in a parent grid keep their wrapper through className.
 * Page introductions use PageIntro, which always keeps its own layout box.
 */
export function SectionHead({ kicker, title, lead, id, className, as: Heading = "h2" }: Props) {
  return (
    <div className={className ? `section-head ${className}` : "section-head"}>
      {kicker ? <Kicker>{kicker}</Kicker> : null}
      <Heading id={id}>{title}</Heading>
      {lead ? <p>{lead}</p> : null}
    </div>
  );
}
