import Image from "next/image";
import { useLocale } from "next-intl";
import styles from "./ulleung-marble-feature.module.css";

export function UlleungMarbleFeature() {
  const en = useLocale() === "en";
  return (
    <article className={styles.card}>
      <a className={styles.picture} href="/games/ulleung-marble" tabIndex={-1} aria-hidden="true">
        <Image src="/ulleung-marble/assets/v07/promo/table-spread.webp" width={1600} height={900} alt="" sizes="(max-width: 760px) 100vw, 55vw" />
      </a>
      <div className={styles.body}>
        <p className={styles.tag}>{en ? "TRAVEL BOARD GAME · 4–8 PLAYERS · KOREAN" : "울릉도·독도 여행 보드게임 · 4–8명"}</p>
        <h2>{en ? "Ulleung Marble" : "울릉마블"}</h2>
        <p className={styles.lead}>{en ? "One more stop, or back to the port?" : "한 곳 더 볼까, 항구로 돌아갈까."}</p>
        <p>{en ? "Choose where to go, collect experiences, and decide when to rest. Only four players can claim a lap card. Explore the box and try a game at the shared table." : "여행지는 서른 곳, 내 차례는 일곱 번. 체험을 하나 더 모을지, 네 장뿐인 일주 카드를 먼저 받을지 고민해 보세요."}</p>
        <div className={styles.links}>
          <a href="/games/ulleung-marble">{en ? "See the game & film →" : "게임과 플레이 영상 보기 →"}</a>
          <a href="/ulleung-marble/tabletop/master.html">{en ? "Open the box ↗" : "상자 열어보기 ↗"}</a>
        </div>
      </div>
    </article>
  );
}
