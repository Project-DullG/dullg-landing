import { useText } from "@/lib/i18n/use-text";
import Link from "@/components/i18n/link";
import { Kicker, PageFrame } from "@/components/site";
export default function NotFound() {
  const t = useText();
  return (
    <PageFrame>
      <section className="inner-hero shell not-found">
        <Kicker>404</Kicker>
        <h1>
          {t("찾는 페이지가")}
          <br />
          <em>{t("여기에는 없습니다.")}</em>
        </h1>
        <p>
          {t("주소가 바뀌었거나 잘못 입력되었을 수 있습니다. 아래에서 원하는 곳으로 이동하세요.")}
        </p>
        <div className="not-found-actions">
          <Link className="button button-dark" href="/">
            {t("홈으로")}
          </Link>
          <Link href="/academy">{t("교육 수업팩")}</Link>
          <Link href="/works">{t("작품")}</Link>
          <Link href="/contact">{t("문의하기")}</Link>
        </div>
      </section>
    </PageFrame>
  );
}
