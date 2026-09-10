"use client";
import { useText } from "@/lib/i18n/use-text";
import { useRef, useState, type ReactNode } from "react";
import { validateStudent, type StudentData } from "@/lib/validators";
import styles from "./student-workspace.module.css";
export type StudentItem = StudentData & {
  id: string;
};
export type ClassItem = {
  id: string;
  name: string;
};
export const schoolYear = (year: number) =>
  year <= 6 ? `초등 ${year}학년` : year <= 9 ? `중등 ${year - 6}학년` : `고등 ${year - 9}학년`;
type Props = {
  students: StudentItem[];
  classes: ClassItem[];
  onSave: (data: StudentData, id?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  detail?: (student: StudentItem) => ReactNode;
  demo?: boolean;
  limited?: boolean;
};
export function StudentWorkspace({
  students,
  classes,
  onSave,
  onDelete,
  detail,
  demo,
  limited,
}: Props) {
  const t = useText();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [selected, setSelected] = useState<string | null>(students[0]?.id ?? null);
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const panel = useRef<HTMLElement>(null);
  const student = students.find((item) => item.id === selected);
  const visible = students.filter(
    (item) =>
      (group === "all" || item.classId === group) &&
      item.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  const className = (id: string) => classes.find((item) => item.id === id)?.name ?? "미배정";
  function open(id: string | null) {
    setSelected(id);
    setCreating(false);
    setEditing(false);
    setDeleting(false);
    setError("");
    requestAnimationFrame(() => panel.current?.focus());
  }
  return (
    <div className={styles.workspace}>
      <header className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>{t("학생 관리")}</span>
          <h1>{t("학원생")}</h1>
          <p>{t("학생 정보를 확인하고 반을 배정하세요.")}</p>
        </div>
        <button
          className={styles.primary}
          onClick={() => {
            open(null);
            setCreating(true);
          }}
        >
          {t("+ 학생 등록")}
        </button>
      </header>
      <dl className={styles.summary}>
        <div>
          <dt>{t(limited ? "불러온 학생" : "등록 학생")}</dt>
          <dd>
            {t(students.length)}
            <small>{t("명")}</small>
          </dd>
        </div>
        <div>
          <dt>{t("운영 중인 반")}</dt>
          <dd>
            {t(classes.length)}
            <small>{t("개")}</small>
          </dd>
        </div>
        <div>
          <dt>{t("반 미배정")}</dt>
          <dd>
            {t(students.filter((item) => !item.classId).length)}
            <small>{t("명")}</small>
          </dd>
        </div>
      </dl>
      {t(
        limited && (
          <p>{t("최근 등록한 100명 기준입니다. 검색도 불러온 학생 안에서 이루어집니다.")}</p>
        ),
      )}
      <p className={styles.feedback} role="status">
        {t(message || "학생을 선택하면 상세 정보가 열립니다.")}
      </p>
      <div className={styles.layout}>
        <section className={styles.directory} aria-label={t("학생 목록")}>
          <div className={styles.filters}>
            <label>
              {t("이름 검색")}
              <input
                type="search"
                placeholder={t("학생 이름")}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label>
              {t("반")}
              <select value={group} onChange={(event) => setGroup(event.target.value)}>
                <option value="all">{t("전체 반")}</option>
                <option value="">{t("미배정")}</option>
                {t(
                  classes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {t(item.name)}
                    </option>
                  )),
                )}
              </select>
            </label>
          </div>
          <div className={styles.listHead}>
            <span>{t("학생 \u00B7 학년")}</span>
            <span>{t("반")}</span>
          </div>
          <ul className={styles.list}>
            {t(
              visible.map((item, index) => (
                <li key={item.id}>
                  <button
                    className={selected === item.id ? styles.selected : ""}
                    onClick={() => open(item.id)}
                    aria-pressed={selected === item.id}
                  >
                    <span className={styles.identity}>
                      <span className={styles.avatar} aria-hidden="true">
                        {t(String(index + 1).padStart(2, "0"))}
                      </span>
                      <span>
                        <strong>{t(item.name)}</strong>
                        <small>{t(schoolYear(item.grade))}</small>
                      </span>
                    </span>
                    <span className={styles.chip}>{t(className(item.classId))}</span>
                  </button>
                </li>
              )),
            )}
          </ul>
          {t(
            !visible.length && (
              <div className={styles.empty}>
                <h3>{t(students.length ? "검색 결과가 없습니다" : "첫 학생을 등록하세요")}</h3>
                <p>
                  {t(
                    students.length
                      ? "검색어와 반 선택을 확인해 주세요."
                      : "위의 학생 등록 버튼에서 이름과 반을 입력할 수 있습니다.",
                  )}
                </p>
              </div>
            ),
          )}
          <p className={styles.count}>
            {t(visible.length)}
            {t("명 표시 \u00B7 전체")}
            {t(students.length)}
            {t("명")}
          </p>
        </section>
        <section
          ref={panel}
          tabIndex={-1}
          className={styles.detail}
          aria-label={t("학생 상세 정보")}
        >
          {t(
            creating || (student && editing) ? (
              <form
                key={creating ? "new" : student!.id}
                onSubmit={async (event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  const data: StudentData = {
                    name: String(form.get("name") ?? "").trim(),
                    grade: Number(form.get("grade")),
                    parentContact: String(form.get("contact") ?? "").trim(),
                    classId: String(form.get("classId") ?? ""),
                  };
                  const invalid = validateStudent(data);
                  if (invalid) {
                    setError(invalid);
                    return;
                  }
                  setBusy(true);
                  setError("");
                  try {
                    await onSave(data, creating ? undefined : student!.id);
                    setCreating(false);
                    setEditing(false);
                    setMessage(`${data.name} 정보를 ${demo ? "예시에 반영" : "저장"}했습니다.`);
                  } catch (err) {
                    setError(
                      err instanceof Error
                        ? err.message
                        : "저장하지 못했습니다. 다시 시도해 주세요.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <h2>{t(creating ? "학생 등록" : "학생 정보 수정")}</h2>
                <p>
                  {t(
                    demo
                      ? "실제 개인정보 대신 가상 정보를 입력해 주세요."
                      : "이름과 학년, 보호자 연락처는 필수입니다.",
                  )}
                </p>
                <fieldset disabled={busy} className={styles.fields}>
                  <label>
                    {t("학생 이름")}
                    <input
                      name="name"
                      required
                      maxLength={50}
                      defaultValue={creating ? "" : student!.name}
                    />
                  </label>
                  <label>
                    {t("학년")}
                    <select name="grade" defaultValue={creating ? "6" : student!.grade}>
                      {t(
                        Array.from({ length: 12 }, (_, i) => (
                          <option key={i} value={i + 1}>
                            {t(schoolYear(i + 1))}
                          </option>
                        )),
                      )}
                    </select>
                  </label>
                  <label>
                    {t("보호자 연락처")}
                    <input
                      name="contact"
                      type="tel"
                      required
                      maxLength={40}
                      defaultValue={creating ? "" : student!.parentContact}
                      placeholder={t(demo ? "예시 연락처" : "010-0000-0000")}
                    />
                  </label>
                  <label>
                    {t("배정할 반")}
                    <select name="classId" defaultValue={creating ? "" : student!.classId}>
                      <option value="">{t("미배정")}</option>
                      {t(
                        classes.map((item) => (
                          <option key={item.id} value={item.id}>
                            {t(item.name)}
                          </option>
                        )),
                      )}
                    </select>
                  </label>
                  <div className={styles.actions}>
                    <button className={styles.primary} type="submit">
                      {t(busy ? "처리 중…" : demo ? "예시에 적용" : "저장")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCreating(false);
                        setEditing(false);
                        setError("");
                      }}
                    >
                      {t("취소")}
                    </button>
                  </div>
                </fieldset>
              </form>
            ) : student ? (
              <>
                <span className={styles.eyebrow}>{t("학생 상세")}</span>
                <h2>{t(student.name)}</h2>
                <dl className={styles.facts}>
                  <div>
                    <dt>{t("학년")}</dt>
                    <dd>{t(schoolYear(student.grade))}</dd>
                  </div>
                  <div>
                    <dt>{t("배정 반")}</dt>
                    <dd>{t(className(student.classId))}</dd>
                  </div>
                  <div>
                    <dt>{t("보호자 연락처")}</dt>
                    <dd>{t(student.parentContact)}</dd>
                  </div>
                </dl>
                <div className={styles.actions}>
                  <button onClick={() => setEditing(true)}>{t("정보 수정 \u00B7 반 배정")}</button>
                </div>
                {t(detail?.(student))}
                <div className={styles.danger}>
                  {t(
                    deleting ? (
                      <>
                        <p>
                          {t(student.name)}
                          {t("학생과 연결된 성적 기록을 삭제합니다. 되돌릴 수 없습니다.")}
                        </p>
                        <div className={styles.actions}>
                          <button
                            disabled={busy}
                            onClick={async () => {
                              setBusy(true);
                              setError("");
                              try {
                                await onDelete(student.id);
                                open(null);
                                setMessage("학생과 연결된 성적 기록을 삭제했습니다.");
                              } catch (err) {
                                setError(
                                  err instanceof Error ? err.message : "삭제하지 못했습니다.",
                                );
                              } finally {
                                setBusy(false);
                              }
                            }}
                          >
                            {t(busy ? "삭제 중…" : "삭제 확인")}
                          </button>
                          <button disabled={busy} onClick={() => setDeleting(false)}>
                            {t("취소")}
                          </button>
                        </div>
                      </>
                    ) : (
                      <button onClick={() => setDeleting(true)}>{t("학생 삭제")}</button>
                    ),
                  )}
                </div>
              </>
            ) : (
              <div className={styles.empty}>
                <span className={styles.eyebrow}>{t("학생 상세")}</span>
                <h2>{t("학생을 선택해 주세요")}</h2>
                <p>{t("기본 정보와 배정 반을 확인하고 수정할 수 있습니다.")}</p>
              </div>
            ),
          )}
          {t(
            error && (
              <p role="alert" className={styles.error}>
                {t(error)}
              </p>
            ),
          )}
        </section>
      </div>
    </div>
  );
}
