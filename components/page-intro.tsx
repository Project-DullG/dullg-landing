import type { ReactNode } from "react";
import styles from "./page-intro.module.css";

export function PageIntro({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className={`shell ${styles.intro}`} aria-labelledby="page-title">
      <h1 id="page-title">{title}</h1>
      <p>{description}</p>
      {children && <div className={styles.related}>{children}</div>}
    </section>
  );
}
