"use client";
import { useText } from "@/lib/i18n/use-text";
import Link from "@/components/i18n/link";
import { Footer, Header, Kicker } from "@/components/site";
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}) {
  const t = useText();
  return (
    <>
      <Header />
      <main id="main-content">
        <section className="inner-hero shell not-found">
          <Kicker>{t("오류")}</Kicker>
          <h1>
            {t("페이지를 불러오지")}
            <br />
            <em>{t("못했습니다.")}</em>
          </h1>
          <p>
            {t(
              "잠시 후 다시 시도해 주세요. 계속 반복되면 문의 페이지로 알려주시면 확인하겠습니다.",
            )}
          </p>
          {t(
            error.digest ? (
              <p className="not-found-digest">
                {t("오류 코드:")}
                {t(error.digest)}
              </p>
            ) : null,
          )}
          <div className="not-found-actions">
            <button className="button button-dark" type="button" onClick={reset}>
              {t("다시 시도")}
            </button>
            <Link href="/">{t("홈으로")}</Link>
            <Link href="/contact">{t("문의하기")}</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
