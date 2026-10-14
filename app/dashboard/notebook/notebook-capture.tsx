"use client";

import { useRef, useState, type ChangeEvent } from "react";
import Link from "@/components/i18n/link";
import { useText } from "@/lib/i18n/use-text";
import styles from "./notebook.module.css";

export type NotebookSavedPage = {
  page: number;
  version: string;
  byteLength: number;
  updatedAt: number;
};

type Props = { savedPages: NotebookSavedPage[] };

const pages = [
  { page: 1, title: "표지", description: "이름·학생 코드·인물·날짜" },
  { page: 2, title: "기록하며 플레이하기", description: "안내·선택" },
  { page: 3, title: "지금의 생각", description: "판단·근거" },
  { page: 4, title: "생각을 이어 보기", description: "근거 연결·다음 행동" },
  { page: 5, title: "투표 전, 나의 선택", description: "최종 투표·이유" },
  { page: 6, title: "말과 시간", description: "발언·시간 메모" },
  { page: 7, title: "단서 연결 메모", description: "단서와 생각을 연결한 메모" },
  { page: 8, title: "기록을 남긴 뒤에는", description: "제출 안내·선택" },
];
const maxOriginalBytes = 20 * 1024 * 1024;
const maxSavedBytes = 700000;

async function canvasJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("사진을 처리하지 못했습니다. 다른 사진으로 다시 시도해 주세요.")),
      "image/jpeg",
      quality,
    );
  });
}

/** Canvas export respects decoded image orientation and omits the original EXIF data. */
export async function compressNotebookPhoto(file: File): Promise<Blob> {
  if (/\.(?:heic|heif)$/i.test(file.name) || /image\/(?:heic|heif)/i.test(file.type)) {
    throw new Error("HEIC 사진은 지원하지 않습니다. JPG·PNG·WebP 사진을 선택해 주세요.");
  }
  if (
    !/^(?:image\/jpeg|image\/png|image\/webp)$/.test(file.type) &&
    !(file.type === "" && /\.(?:jpe?g|png|webp)$/i.test(file.name))
  ) {
    throw new Error("JPG·PNG·WebP 사진만 등록할 수 있습니다.");
  }
  if (!file.size || file.size > maxOriginalBytes) {
    throw new Error("20MB 이하의 사진을 선택해 주세요.");
  }

  let image: ImageBitmap | HTMLImageElement;
  let objectUrl: string | null = null;
  try {
    image = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    objectUrl = URL.createObjectURL(file);
    const fallback = new Image();
    fallback.src = objectUrl;
    try {
      await fallback.decode();
      image = fallback;
    } catch {
      URL.revokeObjectURL(objectUrl);
      throw new Error("사진을 열지 못했습니다. 다른 사진을 선택해 주세요.");
    }
  }

  try {
    const width = image instanceof HTMLImageElement ? image.naturalWidth : image.width;
    const height = image instanceof HTMLImageElement ? image.naturalHeight : image.height;
    if (!width || !height) throw new Error("사진을 열지 못했습니다. 다른 사진을 선택해 주세요.");
    const initialScale = Math.min(1, 2200 / Math.max(width, height));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("사진을 처리하지 못했습니다. 다른 사진으로 다시 시도해 주세요.");
    for (let attempt = 0; attempt < 6; attempt++) {
      const scale = initialScale * Math.pow(0.85, attempt);
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.92, 0.84, 0.76, 0.68, 0.6]) {
        const blob = await canvasJpeg(canvas, quality);
        if (blob.size <= maxSavedBytes) return blob;
      }
    }
    throw new Error("사진 크기를 줄이지 못했습니다. 더 가까이 찍은 사진으로 다시 시도해 주세요.");
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    if (!(image instanceof HTMLImageElement)) image.close();
  }
}

async function responseError(response: Response, fallback: string) {
  const data = await response.json().catch(() => null);
  return data && typeof data.error === "string" ? data.error : fallback;
}

function validSavedPage(value: unknown, page: number): value is NotebookSavedPage {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<NotebookSavedPage>;
  return (
    item.page === page &&
    typeof item.version === "string" &&
    Boolean(item.version) &&
    typeof item.byteLength === "number" &&
    item.byteLength > 0 &&
    item.byteLength <= maxSavedBytes &&
    typeof item.updatedAt === "number" &&
    Number.isFinite(item.updatedAt)
  );
}

export function NotebookCapture({ savedPages }: Props) {
  const t = useText();
  const [saved, setSaved] = useState<Record<number, NotebookSavedPage>>(() =>
    Object.fromEntries(savedPages.map((item) => [item.page, item])),
  );
  const [selected, setSelected] = useState(
    () => pages.find((item) => !savedPages.some((photo) => photo.page === item.page))?.page ?? 1,
  );
  const [operation, setOperation] = useState<{
    page: number;
    phase: "prepare" | "upload" | "delete";
  } | null>(null);
  const [retry, setRetry] = useState<{ page: number; file: File } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ page: number; message: string } | null>(null);
  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);
  const capturePanel = useRef<HTMLElement>(null);
  const busy = operation !== null;
  const current = pages[selected - 1];
  const photo = saved[selected];
  const count = pages.filter((item) => saved[item.page]).length;
  const photoUrl = (item: NotebookSavedPage) =>
    `/api/notebook/pages/${item.page}?v=${encodeURIComponent(item.version)}`;

  function selectPage(page: number) {
    if (busy) return;
    setSelected(page);
    setDeleteConfirm(null);
    setError(null);
    setNotice(null);
    requestAnimationFrame(() => {
      capturePanel.current?.focus();
      capturePanel.current?.scrollIntoView({ block: "start" });
    });
  }

  async function savePhoto(file: File, page: number) {
    if (busy) return;
    setError(null);
    setNotice(null);
    setDeleteConfirm(null);
    setRetry({ page, file });
    setOperation({ page, phase: "prepare" });
    try {
      const image = await compressNotebookPhoto(file);
      setOperation({ page, phase: "upload" });
      const response = await fetch(`/api/notebook/pages/${page}`, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: image,
        cache: "no-store",
      });
      if (!response.ok)
        throw new Error(
          await responseError(response, "사진을 저장하지 못했습니다. 다시 시도해 주세요."),
        );
      const result: unknown = await response.json();
      if (!validSavedPage(result, page))
        throw new Error("저장 결과를 확인하지 못했습니다. 다시 시도해 주세요.");
      const nextSaved = { ...saved, [page]: result };
      setSaved(nextSaved);
      setRetry(null);
      setNotice({ page, message: "사진을 저장했습니다." });
      if (!saved[page]) {
        const next =
          pages.find((item) => item.page > page && !nextSaved[item.page]) ??
          pages.find((item) => !nextSaved[item.page]);
        if (next) {
          setSelected(next.page);
          requestAnimationFrame(() => {
            capturePanel.current?.focus();
            capturePanel.current?.scrollIntoView({ block: "start" });
          });
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "사진을 저장하지 못했습니다. 다시 시도해 주세요.",
      );
    } finally {
      setOperation(null);
    }
  }

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (file) void savePhoto(file, selected);
  }

  async function deletePhoto(page: number) {
    if (busy || !saved[page]) return;
    setOperation({ page, phase: "delete" });
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/notebook/pages/${page}`, {
        method: "DELETE",
        cache: "no-store",
      });
      if (!response.ok)
        throw new Error(
          await responseError(response, "사진을 삭제하지 못했습니다. 다시 시도해 주세요."),
        );
      const nextSaved = { ...saved };
      delete nextSaved[page];
      setSaved(nextSaved);
      if (retry?.page === page) setRetry(null);
      setDeleteConfirm(null);
      setNotice({ page, message: "사진을 삭제했습니다." });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "사진을 삭제하지 못했습니다. 다시 시도해 주세요.",
      );
    } finally {
      setOperation(null);
    }
  }

  return (
    <section className={styles.workspace} aria-labelledby="notebook-title" aria-busy={busy}>
      <header className={styles.heading}>
        <span className={styles.eyebrow}>{t("나의 추리노트")}</span>
        <h1 id="notebook-title">{t("추리노트 사진 등록")}</h1>
        <p>{t("글씨와 쪽 번호가 모두 보이게 찍어 주세요.")}</p>
        <span className={styles.progress}>
          {t(count)} / 8 {t("쪽 저장됨")}
        </span>
      </header>
      <section
        ref={capturePanel}
        tabIndex={-1}
        className={styles.capture}
        aria-labelledby="notebook-page-title"
      >
        <div className={styles.captureHeading}>
          <span className={styles.eyebrow}>
            {t(`${selected}쪽`)}
          </span>
          <h2 id="notebook-page-title">{t(current.title)}</h2>
          <p>{t(current.description)}</p>
        </div>
        {photo ? (
          <div className={styles.preview}>
            {/* eslint-disable-next-line @next/next/no-img-element -- This URL requires the signed-in user's session cookie. */}
            <img src={photoUrl(photo)} alt={`${t(`${selected}쪽`)} ${t("등록 사진")}`} />
          </div>
        ) : (
          <div className={styles.emptyPreview}>
            <p>{t("이 쪽의 사진을 찍거나 앨범에서 선택하세요.")}</p>
          </div>
        )}
        <input
          ref={camera}
          className={styles.fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          aria-label={t("카메라로 사진 선택")}
          disabled={busy}
          onChange={choosePhoto}
        />
        <input
          ref={gallery}
          className={styles.fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label={t("앨범에서 사진 선택")}
          disabled={busy}
          onChange={choosePhoto}
        />
        <div className={styles.actions}>
          <button
            className={styles.primary}
            type="button"
            onClick={() => camera.current?.click()}
            disabled={busy}
          >
            {t("카메라로 찍기")}
          </button>
          <button type="button" onClick={() => gallery.current?.click()} disabled={busy}>
            {t("앨범에서 선택")}
          </button>
        </div>
        {photo && (
          <p className={styles.helper}>{t("새 사진이 저장될 때까지 기존 사진이 유지됩니다.")}</p>
        )}
        <p role="status" className={styles.feedback}>
          {notice && (
            <>
              {t(`${notice.page}쪽`)} · {" "}
              {t(notice.message)}
            </>
          )}
        </p>
        {operation && (
          <p role="status" className={styles.feedback}>
            {t(`${operation.page}쪽`)} · {" "}
            {t(
              operation.phase === "prepare"
                ? "사진을 준비하고 있습니다."
                : operation.phase === "upload"
                  ? "사진을 저장하고 있습니다."
                  : "사진을 삭제하고 있습니다.",
            )}
          </p>
        )}
        {error && (
          <p role="alert" className={styles.error}>
            {t(error)}
          </p>
        )}
        {retry && !busy && (
          <button
            type="button"
            className={styles.retry}
            onClick={() => savePhoto(retry.file, retry.page)}
          >
            {t(`${retry.page}쪽`)} {t("사진 다시 저장")}
          </button>
        )}
        {photo && (
          <div className={styles.deleteArea}>
            {deleteConfirm === selected ? (
              <div role="group" aria-label={t("사진 삭제 확인")}>
                <p>{t("선택한 쪽의 사진을 삭제할까요?")}</p>
                <div className={styles.actions}>
                  <button
                    className={styles.danger}
                    type="button"
                    disabled={busy}
                    onClick={() => deletePhoto(selected)}
                  >
                    {t("삭제 확인")}
                  </button>
                  <button type="button" disabled={busy} onClick={() => setDeleteConfirm(null)}>
                    {t("취소")}
                  </button>
                </div>
              </div>
            ) : (
              <button
                className={styles.deleteButton}
                type="button"
                disabled={busy}
                onClick={() => setDeleteConfirm(selected)}
              >
                {t("이 쪽 사진 삭제")}
              </button>
            )}
          </div>
        )}
      </section>
      <nav aria-label={t("추리노트 쪽 선택")} className={styles.pages}>
        {pages.map((item) => (
          <button
            key={item.page}
            type="button"
            className={selected === item.page ? styles.selectedPage : styles.page}
            aria-pressed={selected === item.page}
            disabled={busy}
            onClick={() => selectPage(item.page)}
          >
            <span className={styles.pageNumber}>
              {t(`${item.page}쪽`)}
            </span>
            <span className={styles.thumbnail}>
              {saved[item.page] ? (
                // eslint-disable-next-line @next/next/no-img-element -- Private authenticated image must bypass the public image optimizer.
                <img src={photoUrl(saved[item.page])} alt="" loading="lazy" />
              ) : (
                <span aria-hidden="true" className={styles.blankPage}>
                  {t(item.page)}
                </span>
              )}
            </span>
            <strong>{t(item.title)}</strong>
            <small className={saved[item.page] ? styles.savedLabel : styles.emptyLabel}>
              {t(saved[item.page] ? "등록됨" : "아직 없음")}
            </small>
          </button>
        ))}
      </nav>
      <p className={styles.feedback}>
        {t("사진은 한 쪽씩 자동 저장됩니다. 8쪽을 한 번에 등록하지 않아도 됩니다.")}
      </p>
      <details className={styles.guide}>
        <summary>{t("사진 등록 안내")}</summary>
        <ul>
          <li>{t("종이를 평평하게 두고 밝은 곳에서 찍어 주세요.")}</li>
          <li>{t("JPG·PNG·WebP 사진을 사용할 수 있습니다. 사진 한 장은 20MB 이하여야 합니다.")}</li>
          <li>{t("사진은 본인 계정에 저장되며 학원이나 선생님에게 공유되지 않습니다.")}</li>
        </ul>
      </details>
      <footer className={styles.footer}>
        <Link href="/dashboard/my">{t("내 정보와 학원 연결 보기")}</Link>
        <Link href="/dashboard/register">{t("학원 연결을 위한 본인 인증 (선택)")}</Link>
        <Link href="/privacy">{t("개인정보 처리 안내")}</Link>
      </footer>
    </section>
  );
}
