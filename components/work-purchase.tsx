import { useText } from "@/lib/i18n/use-text";
import { workRetailers } from "@/lib/work-retailers";
import styles from "./work-purchase.module.css";

export function WorkPurchase({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const t = useText();
  const retailer = workRetailers[slug];
  if (!retailer) return null;
  return <div className={styles.purchase}>
    <a className={styles.link} href={retailer.url} target="_blank" rel="noopener noreferrer">
      {t("네이버 스마트스토어에서 구매 ↗")}
    </a>
    {!compact && <small>{t("판매처: 보틀링컴퍼니 · 가격과 배송 안내는 판매 페이지에서 확인하세요.")}</small>}
  </div>;
}
