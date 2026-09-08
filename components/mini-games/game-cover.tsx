import type { MiniGameId } from "@/lib/mini-projects";
import { isArcadeGame } from "@/lib/mini-projects";
import { TableGameCover } from "./table-game-cover";
import { TILE_COLORS } from "./assets";
import styles from "./games.module.css";

export function GameCover({ kind, title }: { kind: MiniGameId; title: string }) {
  if (!isArcadeGame(kind)) return <TableGameCover kind={kind} title={title} />;
  return (
    <div className={`${styles.cover} ${styles[kind]}`}>
      <svg viewBox="0 0 400 310" role="img" aria-label={`${title} 게임 화면 구성`}>
        {kind === "block-stack" ? (
          <>
            <rect width="400" height="310" fill="#101a30" />
            <rect x="54" y="22" width="292" height="264" rx="6" fill="#081121" />
            {Array.from({ length: 80 }, (_, i) => {
              const x = i % 10,
                y = Math.floor(i / 10);
              return (
                <rect
                  key={i}
                  x={62 + x * 28}
                  y={30 + y * 31}
                  width="26"
                  height="29"
                  fill="none"
                  stroke="#1d2a41"
                />
              );
            })}
            {Array.from({ length: 30 }, (_, i) => {
              const x = i % 10,
                y = Math.floor(i / 10);
              if ((y === 0 && x > 3 && x < 7) || (y === 1 && x === 5)) return null;
              return (
                <image
                  key={i}
                  href={`/assets/games/tiles/${TILE_COLORS[(Math.floor(x / 2) + y) % 7]}.png`}
                  x={62 + x * 28}
                  y={185 + y * 30}
                  width="27"
                  height="29"
                />
              );
            })}
            {[
              [4, 1],
              [3, 2],
              [4, 2],
              [5, 2],
            ].map(([x, y]) => (
              <image
                key={`${x}-${y}`}
                href="/assets/games/tiles/pink.png"
                x={62 + x * 28}
                y={30 + y * 30}
                width="27"
                height="29"
              />
            ))}
          </>
        ) : kind === "bumper-room" ? (
          <>
            <rect width="400" height="310" fill="#163e37" />
            <rect
              x="45"
              y="18"
              width="310"
              height="280"
              rx="38"
              fill="#194942"
              stroke="#e7c27c"
              strokeWidth="3"
            />
            {[62, 96, 134].map((r) => (
              <circle key={r} cx="200" cy="152" r={r} fill="none" stroke="#32665a" />
            ))}
            {[
              [132, 97],
              [268, 97],
              [200, 183],
            ].map(([x, y]) => (
              <g key={x}>
                <circle cx={x} cy={y + 3} r="37" fill="#102f2c" />
                <circle cx={x} cy={y} r="34" fill="#548777" />
                <image
                  href="/assets/games/bumper.png"
                  x={x - 27}
                  y={y - 27}
                  width="54"
                  height="54"
                />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontFamily="sans-serif"
                  fill="#664c15"
                >
                  100
                </text>
              </g>
            ))}
            <image
              href="/assets/games/paddle.png"
              x="88"
              y="252"
              width="90"
              height="15"
              transform="rotate(12 88 252)"
            />
            <image
              href="/assets/games/paddle.png"
              x="222"
              y="252"
              width="90"
              height="15"
              transform="rotate(-12 312 252)"
            />
            <image href="/assets/games/ball.png" x="258" y="180" width="17" height="17" />
          </>
        ) : (
          <>
            <rect width="400" height="310" fill="#526e4b" />
            <rect x="60" width="280" height="310" fill="#343c46" />
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <rect x="54" y={i * 72} width="6" height="36" fill="#e8e1cf" />
                <rect x="340" y={i * 72} width="6" height="36" fill="#e8e1cf" />
                <image
                  href="/assets/games/racing/tree.png"
                  x="5"
                  y={i * 85 - 25}
                  width="42"
                  height="42"
                />
                <image
                  href="/assets/games/racing/tree.png"
                  x="355"
                  y={i * 85 + 20}
                  width="42"
                  height="42"
                />
              </g>
            ))}
            <path
              d="M153 0V310 M247 0V310"
              stroke="#b4b9b7"
              strokeWidth="2"
              strokeDasharray="25 35"
            />
            <image href="/assets/games/racing/player.png" x="181" y="210" width="38" height="70" />
            <image
              href="/assets/games/racing/traffic.png"
              x="88"
              y="65"
              width="38"
              height="70"
              transform="rotate(180 107 100)"
            />
            <image
              href="/assets/games/racing/traffic.png"
              x="276"
              y="135"
              width="38"
              height="70"
              transform="rotate(180 295 170)"
            />
          </>
        )}
      </svg>
    </div>
  );
}
