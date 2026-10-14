import { useText } from "@/lib/i18n/use-text";
import { localizeMetadata } from "@/lib/i18n/server";
import Link from "@/components/i18n/link";
import { Kicker, PageFrame } from "@/components/site";
import { pageMetadata } from "@/lib/metadata";
import { BRAND, emailHref } from "@/lib/site-config";
export async function generateMetadata() {
  return localizeMetadata(
    pageMetadata("/privacy", {
      description:
        "단서공방 문의, 영어 학습 기록과 커뮤니티, 학습 계정과 추리노트에서 처리하는 개인정보 안내입니다.",
    }),
  );
}
const getSections = (t: ReturnType<typeof useText>) => [
  {
    title: "1. 수집하는 개인정보",
    body: (
      <>
        <p>{t("샘플 자료 요청과 파일럿 문의를 처리하기 위해 다음 정보를 받습니다.")}</p>
        <ul>
          <li>
            {t("필수: 기관명, 연락처(휴대전화 또는 이메일), 관심 유형, 개인정보 수집·이용 동의")}
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "2. 이용 목적",
    body: (
      <ul>
        <li>{t("요청한 샘플 자료 발송")}</li>
        <li>{t("파일럿 운영 문의 확인과 일정 안내")}</li>
        <li>{t("문의 응대와 중복 요청 확인")}</li>
      </ul>
    ),
  },
  {
    title: "3. 보유 기간과 파기",
    body: (
      <p>
        {t(
          "수집한 정보는 요청 처리일로부터 최대 1년간 보관한 뒤 지체 없이 삭제합니다. 다만 관련 법령에 따라 보존이 필요한 경우에는 해당 기간만큼 분리해 보관할 수 있습니다. 동의를 철회하면 보존 의무가 없는 정보는 지체 없이 삭제합니다.",
        )}
      </p>
    ),
  },
  {
    title: "4. 전송 과정에서 이용하는 서비스",
    body: (
      <p>
        {t(
          "신청 내용은 이메일 전달을 위해 FormSubmit 서비스를 통해 전송되며, 웹사이트는 Vercel을 통해 제공됩니다. 이 과정에서 서비스 운영을 위한 서버를 경유할 수 있습니다. 단서공방은 신청 정보를 판매하거나 광고 목적으로 제3자에게 제공하지 않습니다.",
        )}
      </p>
    ),
  },
  {
    title: "5. 동의 거부와 이용자 권리",
    body: (
      <p>
        {t(
          "개인정보 수집·이용에 동의하지 않을 수 있습니다. 다만 필수 정보 제공에 동의하지 않으면 웹 양식을 통한 자료 발송이 어렵습니다. 열람, 정정, 삭제, 처리 정지 또는 동의 철회를 원하면 아래 이메일로 요청할 수 있습니다.",
        )}
      </p>
    ),
  },
  {
    title: "6. 스피킹 공부의 계정과 기록",
    body: (
      <>
        <p>
          {t(
            "스피킹 공부는 Google 로그인과 Firebase를 사용합니다. 로그인된 계정의 식별자로 학습 기록을 구분하고, 이름은 계정 표시와 인사말에 사용합니다. Google 비밀번호는 단서공방에서 받지 않습니다.",
          )}
        </p>
        <p>
          {t(
            "선택한 학습일과 분량, 완료 단계, 퀴즈 선택·시도 횟수, 직접 체크한 말하기 완료, 복습할 문항, 반복 연습·먹이 주기 완료와 일일 보상, 수조 설정과 수집 기록을 Firestore에 저장합니다. 인증코드 입력 시각은 입력 횟수를 제한하는 데 사용합니다. 녹음 파일과 음성 전사는 수집하지 않습니다.",
          )}
        </p>
        <p>
          {t(
            "로그인 쿠키는 최대 5일, 스피킹 접근 쿠키는 최대 12시간 유지됩니다. 로그아웃하면 이 브라우저의 접근 쿠키를 삭제합니다. 학습 기록은 다음 접속에서 이어서 공부하도록 보관하며, 기록 삭제는 아래 이메일로 요청할 수 있습니다.",
          )}
        </p>
        <p>
          {t(
            "기기 음성을 선택하면 브라우저·운영체제의 음성 기능이 제공된 영어 문장을 읽습니다. 선택한 음성이 온라인 서비스인 경우 그 문장이 해당 음성 제공자에게 전송될 수 있습니다. 미리 제작한 학습 음성은 사이트에서 파일로 재생합니다.",
          )}
        </p>
      </>
    ),
  },
  {
    title: "7. 학생 계정과 추리노트",
    body: (
      <>
        <p>
          {t(
            "추리노트는 Google 계정으로 로그인해 사진을 페이지별로 저장합니다. 저장된 사진은 본인만 볼 수 있으며, 학원 연결만으로 공유되지 않습니다. 사진은 등록 화면에서 삭제할 수 있습니다.",
          )}
        </p>
        <p>
          {t(
            "학원 연결을 선택하면 이름과 인증된 이메일·휴대전화 번호를 등록합니다. Firebase가 이메일 및 문자 인증을 처리하며, 휴대전화 번호는 Google에 전달되어 스팸·오용 방지에도 사용됩니다.",
          )}
        </p>
        <p>
          {t(
            "학원 가입 신청에는 이름·이메일·휴대전화 번호가 해당 학원에 전달됩니다. 학원의 승인을 받아야 연결되며, 학생은 신청 취소와 학원 탈퇴를 할 수 있습니다. 탈퇴하면 해당 학원 정보에 대한 학생의 접근이 중단되며, 기존 성적 기록은 자동 삭제되지 않습니다.",
          )}
        </p>
      </>
    ),
  },
  {
    title: "8. 영어 이야기 학습과 커뮤니티",
    body: (
      <>
        <p>
          {t(
            "영어 이야기 학습은 Google 로그인 계정의 식별자로 진도를 구분합니다. 선택한 난이도, 완료한 장면, 영역별 연습 횟수, 배운 표현과 복습 일정, 학습 날짜와 연습 경험치를 Firestore에 저장해 이어서 학습할 수 있도록 합니다. 로그인 없이 체험한 진도는 계정에 저장되지 않습니다.",
          )}
        </p>
        <p>
          {t(
            "말하기는 직접 연습한 뒤 본인이 확인하는 방식입니다. 선택하면 기기에서 녹음해 다시 들을 수 있으며 서버로 업로드하지 않습니다. 음성 전사와 발음 점수는 수집하지 않습니다. 답변은 학습 확인을 위해 처리하며, 개인 학습 기록에는 완료 상태와 복습 결과를 저장합니다.",
          )}
        </p>
        <p>
          {t(
            "학습 커뮤니티에 참여하면 선택한 닉네임과 학습 레벨·칭호, 게시글과 댓글, 작성 시각이 공개됩니다. Google 계정의 이메일과 이름은 게시글에 표시하지 않습니다. 공개 글에는 연락처나 다른 사람의 개인정보를 적지 마세요. 본인이 작성한 글과 댓글은 삭제할 수 있습니다.",
          )}
        </p>
        <p>
          {t(
            "학습 기록과 커뮤니티 참여 기록의 열람·정정·삭제를 원하면 아래 이메일로 요청할 수 있습니다. 계정의 소유자를 확인한 뒤 해당 기록을 처리합니다.",
          )}
        </p>
      </>
    ),
  },
];
export default function PrivacyPage() {
  const t = useText();
  return (
    <PageFrame>
      <section className="privacy-hero shell">
        <Kicker>{t("개인정보 처리 안내")}</Kicker>
        <h1>
          {t("개인정보를 필요한 만큼만 받고,")}
          <br />
          <em>{t("요청한 목적에만 사용합니다.")}</em>
        </h1>
        <p>
          {t(
            "이 안내는 샘플 자료 요청, 영어 이야기 학습과 커뮤니티, 스피킹 공부와 학생 계정·추리노트에서 처리하는 개인정보에 적용됩니다.",
          )}
        </p>
      </section>

      <section className="privacy-content shell" aria-label={t("개인정보 처리 안내")}>
        <div className="privacy-summary">
          <strong>{t("시행일")}</strong>
          <span>{t("2026년 7월 26일")}</span>
          <strong>{t("최근 수정")}</strong>
          <span>{t("2026년 10월 14일")}</span>
          <strong>{t("문의")}</strong>
          <a href={emailHref}>{t(BRAND.email)}</a>
        </div>

        <div className="privacy-sections">
          {t(
            getSections(t).map((section) => (
              <article key={section.title}>
                <h2>{t(section.title)}</h2>
                {t(section.body)}
              </article>
            )),
          )}

          <article>
            <h2>{t("9. 문의 및 요청")}</h2>
            <p>
              {t("개인정보 관련 요청은")}
              <a href={emailHref}>{t(BRAND.email)}</a>
              {t("으로 보내주세요. 확인 후 가능한 범위에서 신속하게 안내하겠습니다.")}
            </p>
          </article>
        </div>

        <div className="privacy-actions">
          <Link className="button button-dark" href="/academy/pilot">
            {t("검토팩 요청으로 돌아가기")}
          </Link>
          <Link href="/contact">{t("일반 문의 보기")}</Link>
        </div>
      </section>
    </PageFrame>
  );
}
