import { useText } from "@/lib/i18n/use-text";
import { getWorkRetailer } from "@/lib/work-retailers";
import styles from "./work-purchase.module.css";

export function WorkPurchase({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const t = useText();
  const retailer = getWorkRetailer(slug);
  if (!retailer) return null;
  return (
    <div className={styles.purchase}>
      <a className={styles.link} href={retailer.url} target="_blank" rel="noopener noreferrer">
        {t(retailer.actionLabel)}
      </a>
      {!compact && (
        <small>
          {t("판매처")}: {t(retailer.seller)} ·{" "}
          {t("가격과 배송 안내는 판매 페이지에서 확인하세요.")}
        </small>
      )}
    </div>
  );
}
