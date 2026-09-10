import { useText } from "@/lib/i18n/use-text";
import type { TableGameId } from "@/lib/mini-projects";
import { MEMORY_SYMBOLS } from "@/lib/games/memory";
import styles from "./games.module.css";
export function TableGameCover({ kind, title }: { kind: TableGameId; title: string }) {
  const t = useText();
  const color = {
    minesweeper: "#cee1d6",
    solitaire: "#195344",
    sudoku: "#e5ecf3",
    "number-merge": "#dbcab0",
    "memory-pairs": "#d9d0e7",
    "sliding-puzzle": "#214c70",
    "match-three": "#24213e",
    snake: "#142b25",
    "lights-out": "#182c44",
  }[kind];
  return (
    <div className={styles.cover}>
      <svg viewBox="0 0 400 310" role="img" aria-label={t(`${title} 게임판 구성`)}>
        <rect width="400" height="310" fill={color} />
        {t(
          kind === "match-three" &&
            Array.from({ length: 36 }, (_, i) => {
              const gem = (i * 7 + Math.floor(i / 6)) % 5;
              return (
                <g key={i}>
                  <rect
                    x={78 + (i % 6) * 41}
                    y={33 + Math.floor(i / 6) * 41}
                    width="36"
                    height="36"
                    rx="4"
                    fill={["#ebe0ff", "#ffe1de", "#ffedb2", "#d6f2df", "#dcefff"][gem]}
                  />
                  <text
                    x={96 + (i % 6) * 41}
                    y={59 + Math.floor(i / 6) * 41}
                    textAnchor="middle"
                    fontSize="23"
                    fill={["#572eaa", "#a53b39", "#846010", "#216346", "#255e93"][gem]}
                  >
                    {t(["◆", "●", "▲", "■", "✦"][gem])}
                  </text>
                </g>
              );
            }),
        )}
        {t(
          kind === "lights-out" &&
            Array.from({ length: 25 }, (_, i) => (
              <rect
                key={i}
                x={80 + (i % 5) * 49}
                y={35 + Math.floor(i / 5) * 49}
                width="43"
                height="43"
                rx="4"
                fill={[2, 6, 7, 8, 10, 11, 12, 16, 17, 22].includes(i) ? "#ffe3a0" : "#31445b"}
              />
            )),
        )}
        {t(
          kind === "snake" && (
            <>
              {t(
                Array.from({ length: 144 }, (_, i) => (
                  <rect
                    key={i}
                    x={80 + (i % 12) * 20}
                    y={35 + Math.floor(i / 12) * 20}
                    width="18"
                    height="18"
                    fill="#1c382e"
                  />
                )),
              )}
              {t(
                [88, 87, 86, 74, 62, 61, 60, 59, 47, 35].map((i, n) => (
                  <rect
                    key={i}
                    x={80 + (i % 12) * 20}
                    y={35 + Math.floor(i / 12) * 20}
                    width="18"
                    height="18"
                    rx="3"
                    fill={n === 0 ? "#e6f4a2" : "#88bf91"}
                  />
                )),
              )}
              <circle cx="270" cy="164" r="8" fill="#ff896d" />
            </>
          ),
        )}
        {t(
          kind === "minesweeper" &&
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
                  {t(
                    !closed && [1, 7, 8, 14, 20].includes(i) && (
                      <text
                        x={x + 18}
                        y={y + 26}
                        textAnchor="middle"
                        fill="#2c6591"
                        fontSize="23"
                        fontWeight="600"
                      >
                        {t((i % 3) + 1)}
                      </text>
                    ),
                  )}
                  {t(
                    i === 16 && (
                      <text x={x + 18} y={y + 27} textAnchor="middle" fill="#b35d37" fontSize="25">
                        ⚑
                      </text>
                    ),
                  )}
                </g>
              );
            }),
        )}
        {t(
          kind === "solitaire" && (
            <>
              {t(
                [0, 1, 2, 3, 4].map((i) => (
                  <g
                    key={i}
                    transform={`translate(${61 + i * 52},${47 + i * 24}) rotate(${(i - 2) * 6} 35 50)`}
                  >
                    <rect width="67" height="102" rx="5" fill="#fffdf6" stroke="#cad6c9" />
                    <text x="9" y="23" fontSize="19" fill={i % 2 ? "#bd473f" : "#243247"}>
                      {t(["K", "Q", "J", "10", "9"][i])}
                    </text>
                    <text
                      x="34"
                      y="74"
                      textAnchor="middle"
                      fontSize="38"
                      fill={i % 2 ? "#bd473f" : "#243247"}
                    >
                      {t(i % 2 ? "♥" : "♠")}
                    </text>
                  </g>
                )),
              )}
            </>
          ),
        )}
        {t(
          kind === "sudoku" && (
            <>
              {t(
                Array.from({ length: 81 }, (_, i) => {
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
                      {t(
                        i % 3 !== 0 && (
                          <text
                            x={x + 13.5}
                            y={y + 19}
                            textAnchor="middle"
                            fill="#38516b"
                            fontSize="16"
                          >
                            {t(
                              ((Math.floor(i / 9) * 3 +
                                Math.floor(Math.floor(i / 9) / 3) +
                                (i % 9)) %
                                9) +
                                1,
                            )}
                          </text>
                        ),
                      )}
                    </g>
                  );
                }),
              )}
              {t(
                [0, 1, 2, 3].map((i) => (
                  <g key={i}>
                    <path
                      d={`M${78 + i * 81} 32V275 M78 ${32 + i * 81}H321`}
                      stroke="#557087"
                      strokeWidth="2"
                    />
                  </g>
                )),
              )}
            </>
          ),
        )}
        {t(
          (kind === "number-merge" || kind === "sliding-puzzle") &&
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
                    {t(v || "")}
                  </text>
                </g>
              );
            }),
        )}
        {t(
          kind === "memory-pairs" &&
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
                    {t(open ? MEMORY_SYMBOLS[i === 1 || i === 9 ? 4 : 1] : "◇")}
                  </text>
                </g>
              );
            }),
        )}
      </svg>
    </div>
  );
}
