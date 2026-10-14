"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useLocale } from "next-intl";
import { localizeEnglishTree } from "@/lib/i18n/english-tree";
import Link from "@/components/i18n/link";
import { communityCategories, communityCategoryLabels, type CommunityCategory, type CommunityPost } from "@/lib/english/community";
import styles from "./community.module.css";

function dateLabel(value: string, locale: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat(locale === "en" ? "en-US" : "ko-KR", { month: "long", day: "numeric", timeZone: "Asia/Seoul" }).format(date) : "";
}

export function EnglishCommunity() {
  const locale = useLocale();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [accountKey, setAccountKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [filter, setFilter] = useState<CommunityCategory | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<CommunityCategory>("journal");
  const [reply, setReply] = useState("");
  const [reportId, setReportId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const identity = useRef<string | null>(null);
  const requestNumber = useRef(0);

  const load = useCallback(async (signal?: AbortSignal) => {
    const request = ++requestNumber.current;
    try {
      const response = await fetch("/api/english/community", { cache: "no-store", credentials: "same-origin", signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "글을 불러오지 못했습니다.");
      if (request !== requestNumber.current || signal?.aborted) return;
      const nextKey = typeof data.accountKey === "string" ? data.accountKey : null;
      if (identity.current !== nextKey) {
        setNickname(""); setTitle(""); setBody(""); setReply(""); setReportId(null); setDeleteId(null);
      }
      identity.current = nextKey;
      setAccountKey(nextKey);
      setPosts(Array.isArray(data.posts) ? data.posts : []);
      setError("");
    } catch (failure) {
      if (request !== requestNumber.current || signal?.aborted) return;
      setError(failure instanceof Error ? failure.message : "글을 불러오지 못했습니다.");
    } finally { if (request === requestNumber.current && !signal?.aborted) setLoading(false); }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => { if (!controller.signal.aborted) void load(controller.signal); });
    const refresh = () => { if (document.visibilityState === "visible") void load(controller.signal); };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { controller.abort(); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, [load]);

  async function mutate(payload: Record<string, unknown>) {
    if (!accountKey || pending) return false;
    setPending(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/english/community", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
        body: JSON.stringify({ ...payload, accountKey }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "저장하지 못했습니다.");
      if (data.deleted) setPosts((current) => current.filter((post) => post.id !== data.postId));
      if (data.post) setPosts((current) => current.some((post) => post.id === data.post.id)
        ? current.map((post) => post.id === data.post.id ? data.post : post)
        : [data.post, ...current].slice(0, 30));
      if (data.reported) setMessage("신고가 접수되었습니다. 운영자가 내용을 확인합니다.");
      else if (payload.action === "like") setMessage(data.duplicate ? "이미 공감한 글입니다." : "공감을 남겼습니다.");
      else if (payload.action === "delete") setMessage("내가 작성한 내용을 삭제했습니다.");
      else setMessage(payload.action === "reply" ? "답글을 남겼습니다." : "학습의 한 페이지를 기록했습니다.");
      return true;
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "저장하지 못했습니다.");
      return false;
    } finally { setPending(false); }
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await mutate({ action: "create", nickname, title, body, category })) { setTitle(""); setBody(""); setFilter("all"); }
  }
  async function addReply(event: FormEvent<HTMLFormElement>, postId: string) {
    event.preventDefault();
    if (await mutate({ action: "reply", postId, nickname, body: reply })) setReply("");
  }
  async function report(event: FormEvent<HTMLFormElement>, postId: string) {
    event.preventDefault();
    if (await mutate({ action: "report", postId, body: reportReason })) { setReportId(null); setReportReason(""); }
  }
  const visiblePosts = posts.filter((post) => filter === "all" || post.category === filter);

  return localizeEnglishTree(<section className={styles.community} aria-label="영어 학습 커뮤니티">
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <span className={styles.eyebrow}>THE READING CLUB</span>
        <h2>한 문장도<br />함께라면.</h2>
        <p>막혔던 표현을 묻고,<br />오늘의 배움을 나눠요.</p>
        <div className={styles.sidebarNote}><span>OUR LITTLE RULES</span><p>서로의 속도를 존중해요.<br />작품의 결말은 제목에 쓰지 말아 주세요. 개인 연락처는 공개하지 않는 것이 좋아요.</p></div>
        <Link href="/english" className={styles.backLink}>← 이야기 서재로</Link>
      </aside>

      <div className={styles.content}>
        <div className={styles.filterBar} aria-label="게시물 분류">
          {["all", ...communityCategories].map((item) => <button key={item} type="button" aria-pressed={filter === item} className={filter === item ? styles.activeFilter : ""} onClick={() => setFilter(item as CommunityCategory | "all")}>{item === "all" ? "모든 이야기" : communityCategoryLabels[item as CommunityCategory]}</button>)}
          <span>최근 30개 글</span>
        </div>
        {error && <div className={styles.error} role="alert"><p>{error}</p><button type="button" onClick={() => { setLoading(true); void load(); }} disabled={pending}>다시 불러오기</button></div>}
        {message && <p className={styles.message} role="status">{message}</p>}
        {loading ? <div className={styles.empty} role="status"><span className={styles.emptyMark}>···</span><h3>다음 페이지를 가져오고 있어요.</h3></div>
          : !error && visiblePosts.length === 0 ? <div className={styles.empty}><span className={styles.emptyMark}>“</span><h3>{filter === "all" ? "우리의 첫 페이지는 아직 비어 있어요." : "이 분류의 첫 이야기를 기다리고 있어요."}</h3><p>오늘 배운 한 문장, 막혔던 질문,<br />이야기의 여운을 남겨 주세요.</p></div>
            : <div className={styles.posts}>{visiblePosts.map((post) => {
              const open = expanded === post.id;
              const mine = accountKey === post.authorKey;
              return <article key={post.id} className={styles.post}>
                <div className={styles.postMeta}><span className={styles.category}>{communityCategoryLabels[post.category]}</span><span data-english-user-content>{post.nickname}</span><span className={styles.growth}>Lv.{post.learnerLevel} {post.learnerTitle}</span><time dateTime={post.createdAt}>{dateLabel(post.createdAt, locale)}</time></div>
                <h3><button type="button" aria-expanded={open} aria-controls={`post-${post.id}`} onClick={() => { setExpanded(open ? null : post.id); setReply(""); setReportId(null); setDeleteId(null); }}><span data-english-user-content>{post.title}</span><span aria-hidden="true">{open ? "−" : "+"}</span></button></h3>
                <p data-english-user-content className={open ? styles.postBody : styles.postPreview}>{post.body}</p>
                <div className={styles.postActions}>
                  <button type="button" disabled={!accountKey || pending} onClick={() => void mutate({ action: "like", postId: post.id })}>♡ 공감 {post.likes}</button>
                  <button type="button" onClick={() => setExpanded(open ? null : post.id)}>답글 {post.replyCount}</button>
                  {accountKey && <button type="button" className={styles.quietAction} onClick={() => { setReportId(reportId === post.id ? null : post.id); setExpanded(post.id); }}>신고</button>}
                  {mine && <button type="button" className={styles.quietAction} onClick={() => setDeleteId(deleteId === post.id ? null : post.id)}>내 글 삭제</button>}
                </div>
                {deleteId === post.id && <div className={styles.inlineConfirm}><span>이 글을 삭제할까요?</span><button type="button" disabled={pending} onClick={async () => { if (await mutate({ action: "delete", postId: post.id })) setDeleteId(null); }}>삭제하기</button><button type="button" onClick={() => setDeleteId(null)}>취소</button></div>}
                {open && <div id={`post-${post.id}`} className={styles.discussion}>
                  {post.replies.map((item) => <div className={styles.reply} key={item.id}><div className={styles.postMeta}><strong data-english-user-content>{item.nickname}</strong><span className={styles.growth}>Lv.{item.learnerLevel}</span><time dateTime={item.createdAt}>{dateLabel(item.createdAt, locale)}</time></div><p data-english-user-content>{item.body}</p>{accountKey === item.authorKey && <button type="button" className={styles.quietAction} disabled={pending} onClick={() => void mutate({ action: "delete", postId: post.id, replyId: item.id })}>내 답글 삭제</button>}</div>)}
                  {accountKey ? <form className={styles.replyForm} onSubmit={(event) => void addReply(event, post.id)}><label htmlFor={`reply-name-${post.id}`}>닉네임</label><input id={`reply-name-${post.id}`} value={nickname} onChange={(event) => setNickname(event.target.value)} required maxLength={20} placeholder="직접 고른 이름" /><label htmlFor={`reply-${post.id}`}>답글</label><textarea id={`reply-${post.id}`} value={reply} onChange={(event) => setReply(event.target.value)} required maxLength={1200} rows={3} placeholder="한 문장부터 편하게 남겨요." /><button className={styles.smallSubmit} type="submit" disabled={pending}>{pending ? "저장 중…" : "답글 남기기"}</button></form>
                    : <Link className={styles.loginLink} href="/login?next=/english/community">로그인하고 함께 이야기하기 →</Link>}
                  {reportId === post.id && <form className={styles.reportForm} onSubmit={(event) => void report(event, post.id)}><label htmlFor={`report-${post.id}`}>운영자에게만 전달할 신고 사유</label><textarea id={`report-${post.id}`} value={reportReason} onChange={(event) => setReportReason(event.target.value)} required maxLength={500} rows={2} /><button type="submit" className={styles.smallSubmit} disabled={pending}>신고 접수</button><button type="button" onClick={() => setReportId(null)}>취소</button></form>}
                </div>}
              </article>;
            })}</div>}

        {!loading && <div className={styles.compose}>
          <div className={styles.composeHeading}><span className={styles.eyebrow}>YOUR NEXT PAGE</span><h2>오늘의 이야기를 남겨요.</h2><p>커뮤니티 활동은 학습 XP에 포함되지 않습니다.</p></div>
          {accountKey ? <form onSubmit={(event) => void create(event)}>
            <div className={styles.formRow}><label>닉네임<input value={nickname} onChange={(event) => setNickname(event.target.value)} required maxLength={20} placeholder="직접 고른 이름" /></label><label>분류<select value={category} onChange={(event) => setCategory(event.target.value as CommunityCategory)}>{communityCategories.map((item) => <option key={item} value={item}>{communityCategoryLabels[item]}</option>)}</select></label></div>
            <label>제목<input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={80} placeholder="질문 한 가지, 배움 한 가지" /></label>
            <label>내용<textarea value={body} onChange={(event) => setBody(event.target.value)} required maxLength={1200} rows={5} placeholder="영어도 한국어도 괜찮아요. 작품의 내용은 스포일러라고 알려 주세요." /></label>
            <div className={styles.composeBottom}><span>{body.length} / 1,200</span><button type="submit" disabled={pending} className={styles.submit}>{pending ? "저장 중…" : "이야기 남기기 ↗"}</button></div>
          </form> : <div className={styles.loginPanel}><p>글과 답글은 로그인 후 남길 수 있어요.<br />공개 닉네임은 직접 고릅니다.</p><Link href="/login?next=/english/community" className={styles.submit}>로그인하고 기록하기 ↗</Link></div>}
        </div>}
      </div>
    </div>
  </section>, locale);
}
