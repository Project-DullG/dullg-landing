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

export function SectionHead({ kicker, title, lead, id, className, as: Heading = "h2" }: Props) {
  return (
    <div className={className ? `section-head ${className}` : "section-head"}>
      <Kicker>{kicker}</Kicker>
      <Heading id={id}>{title}</Heading>
      {lead ? <p>{lead}</p> : null}
    </div>
  );
}
