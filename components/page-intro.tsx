import { useText } from "@/lib/i18n/use-text";
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
  const t = useText();
  return (
    <section className={`shell ${styles.intro}`} aria-labelledby="page-title">
      <h1 id="page-title">{t(title)}</h1>
      <p>{t(description)}</p>
      {t(children && <div className={styles.related}>{t(children)}</div>)}
    </section>
  );
}
