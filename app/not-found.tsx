import Link from "next/link";
import { Kicker, PageFrame } from "@/components/site";

export default function NotFound() {
  return (
    <PageFrame>
      <section className="inner-hero shell not-found">
        <Kicker>404</Kicker>
        <h1>
          찾는 페이지가
          <br />
          <em>여기에는 없습니다.</em>
        </h1>
        <p>주소가 바뀌었거나 잘못 입력되었을 수 있습니다. 아래에서 원하는 곳으로 이동하세요.</p>
        <div className="not-found-actions">
          <Link className="button button-dark" href="/">
            홈으로
          </Link>
          <Link href="/academy">교육 수업팩</Link>
          <Link href="/works">작품</Link>
          <Link href="/contact">문의하기</Link>
        </div>
      </section>
    </PageFrame>
  );
}
