import type { TableGameId } from "@/lib/mini-projects";
import { MEMORY_SYMBOLS } from "@/lib/games/memory";
import styles from "./games.module.css";
export function TableGameCover({ kind, title }: { kind: TableGameId; title: string }) {
  const color = {
    minesweeper: "#cee1d6",
    solitaire: "#195344",
    sudoku: "#e5ecf3",
    "number-merge": "#dbcab0",
    "memory-pairs": "#d9d0e7",
    "sliding-puzzle": "#214c70",
  }[kind];
  return (
    <div className={styles.cover}>
      <svg viewBox="0 0 400 310" role="img" aria-label={`${title} 게임판 구성`}>
        <rect width="400" height="310" fill={color} />
        {kind === "minesweeper" &&
          Array.from({ length: 36 }, (_, i) => {
            const x = 78 + (i % 6) * 41,
              y = 33 + Math.floor(i / 6) * 41,
              closed = i % 6 > 2 || i > 23;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width="37"
                  height="37"
                  rx="3"
                  fill={closed ? "#f8fcf9" : "#b7d0c1"}
                  stroke="#a9c2b2"
                />
                {!closed && [1, 7, 8, 14, 20].includes(i) && (
                  <text
                    x={x + 18}
                    y={y + 26}
                    textAnchor="middle"
                    fill="#2c6591"
                    fontSize="23"
                    fontWeight="600"
                  >
                    {(i % 3) + 1}
                  </text>
                )}
                {i === 16 && (
                  <text x={x + 18} y={y + 27} textAnchor="middle" fill="#b35d37" fontSize="25">
                    ⚑
                  </text>
                )}
              </g>
            );
          })}
        {kind === "solitaire" && (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <g
                key={i}
                transform={`translate(${61 + i * 52},${47 + i * 24}) rotate(${(i - 2) * 6} 35 50)`}
              >
                <rect width="67" height="102" rx="5" fill="#fffdf6" stroke="#cad6c9" />
                <text x="9" y="23" fontSize="19" fill={i % 2 ? "#bd473f" : "#243247"}>
                  {["K", "Q", "J", "10", "9"][i]}
                </text>
                <text
                  x="34"
                  y="74"
                  textAnchor="middle"
                  fontSize="38"
                  fill={i % 2 ? "#bd473f" : "#243247"}
                >
                  {i % 2 ? "♥" : "♠"}
                </text>
              </g>
            ))}
          </>
        )}
        {kind === "sudoku" && (
          <>
            {Array.from({ length: 81 }, (_, i) => {
              const x = 78 + (i % 9) * 27,
                y = 32 + Math.floor(i / 9) * 27;
              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width="27"
                    height="27"
                    fill={i % 4 ? "#fff" : "#edf2f6"}
                    stroke="#d1dbe4"
                    strokeWidth=".5"
                  />
                  {i % 3 !== 0 && (
                    <text x={x + 13.5} y={y + 19} textAnchor="middle" fill="#38516b" fontSize="16">
                      {((Math.floor(i / 9) * 3 + Math.floor(Math.floor(i / 9) / 3) + (i % 9)) % 9) +
                        1}
                    </text>
                  )}
                </g>
              );
            })}
            {[0, 1, 2, 3].map((i) => (
              <g key={i}>
                <path
                  d={`M${78 + i * 81} 32V275 M78 ${32 + i * 81}H321`}
                  stroke="#557087"
                  strokeWidth="2"
                />
              </g>
            ))}
          </>
        )}
        {(kind === "number-merge" || kind === "sliding-puzzle") &&
          Array.from({ length: 16 }, (_, i) => {
            const values = [2, 0, 0, 2, 4, 8, 4, 0, 8, 32, 16, 2, 16, 128, 64, 8],
              v =
                kind === "number-merge"
                  ? values[i]
                  : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0, 12, 13, 14, 11, 15][i],
              x = 76 + (i % 4) * 63,
              y = 30 + Math.floor(i / 4) * 63;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width="57"
                  height="57"
                  rx="5"
                  fill={
                    kind === "sliding-puzzle"
                      ? v
                        ? "#daeaf6"
                        : "#173854"
                      : v >= 32
                        ? "#a97829"
                        : v >= 8
                          ? "#e1a263"
                          : "#f3e7d2"
                  }
                />
                <text
                  x={x + 28.5}
                  y={y + 39}
                  textAnchor="middle"
                  fontSize={v >= 100 ? "25" : "30"}
                  fontWeight="650"
                  fill={kind === "sliding-puzzle" ? "#254862" : v >= 32 ? "#fff" : "#655035"}
                >
                  {v || ""}
                </text>
              </g>
            );
          })}
        {kind === "memory-pairs" &&
          Array.from({ length: 12 }, (_, i) => {
            const x = 66 + (i % 4) * 70,
              y = 39 + Math.floor(i / 4) * 78,
              open = [1, 4, 9].includes(i);
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width="61"
                  height="68"
                  rx="5"
                  fill={open ? "#fff" : "#685882"}
                  stroke="#eee9f5"
                  strokeWidth="3"
                />
                <text
                  x={x + 30}
                  y={y + 47}
                  textAnchor="middle"
                  fontSize="35"
                  fill={open ? "#725a90" : "#b8aacb"}
                >
                  {open ? MEMORY_SYMBOLS[i === 1 || i === 9 ? 4 : 1] : "◇"}
                </text>
              </g>
            );
          })}
      </svg>
    </div>
  );
}
