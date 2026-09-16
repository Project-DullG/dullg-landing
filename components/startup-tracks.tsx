export function StartupTracks({ en }: { en: boolean }) {
  return <section id="tracks">
    <h2>{en ? "General/technology or local: which track fits?" : "일반·기술 분야와 로컬 분야, 무엇이 다른가요?"}</h2>
    <p>{en ? "Choose a track based on what your business offers, not simply where you live. The 2026 second-round notice asks applicants to select one track that fits both their idea and eligibility." : "사는 곳보다 사업이 무엇을 제공하는지 보고 판단하세요. 2026년 2차 모집 안내는 아이디어의 성격과 지원 자격에 맞는 한 가지 트랙을 선택하도록 안내합니다."}</p>
    <h3>{en ? "General/technology: a new way to solve a problem" : "일반·기술 분야: 새로운 방식으로 불편을 해결하는 사업"}</h3>
    <p>{en ? "This track covers ideas that use or combine innovative approaches and technology to solve a problem or create value. Technology is not limited to AI: focus on what changes for the customer and how the product or service works." : "새로운 발상이나 기술을 활용·결합해 불편을 해결하거나 새로운 가치를 만드는 아이디어입니다. AI를 쓴다는 설명만으로 끝내지 말고, 고객의 어떤 문제를 어떤 제품이나 서비스로 해결하는지 적으세요."}</p>
    <p>{en ? "Class example: a tool that collects club attendance and task submissions. Explain the work it saves, how it differs from a spreadsheet, and how you would test it with one club first." : "수업용 예시: 동아리 출석과 과제 제출을 한곳에서 확인하는 도구. 어떤 수고를 줄이는지, 기존 스프레드시트와 무엇이 다른지, 동아리 한 곳에서 어떻게 시험할지 설명합니다."}</p>
    <h3>{en ? "Local: a business built around regional resources" : "로컬 분야: 지역의 자원과 특색을 활용하는 사업"}</h3>
    <p>{en ? "This track focuses on regional resources, culture, specialties or spaces, and on earning revenue while working with the local community. Name the resource, the customer and how local people or businesses participate." : "특정 지역의 자원·문화·특산물·공간 등을 활용하고, 지역사회와 협력하며 수익을 만드는 아이디어입니다. 어떤 지역 자원을 쓰는지, 누가 구매하는지, 지역 주민이나 업체가 어떻게 참여하는지 설명하세요."}</p>
    <p>{en ? "Class example: an Ulleungdo experience that combines local walking routes with a resident’s explanation of island life. Describe the route, the local partner’s role, the price and how revenue is shared. This is a proposed classroom example, not an existing program." : "수업용 예시: 울릉도 산책 코스와 주민의 생활 이야기를 묶은 체험 상품. 이동 경로, 함께할 주민의 역할, 판매 가격과 수익 배분을 정리합니다. 실제 운영 중인 상품이 아니라 설명을 위한 제안입니다."}</p>
    <h3>{en ? "If both seem relevant" : "둘 다 해당하는 것 같다면"}</h3>
    <ul>
      <li>{en ? "Ask what the customer is paying for: a reusable solution, or an experience or product tied to a particular place? This is a comparison question, not an official eligibility test." : "고객이 돈을 내는 이유가 여러 곳에서 쓸 수 있는 해결 방법인지, 그 지역의 자원과 경험인지 비교해보세요. 분야를 검토하기 위한 질문이지 공식 자격 판정 기준은 아닙니다."}</li>
      <li>{en ? "Living on Ulleungdo does not automatically make an idea local. A local project can also use AI or an app. Explain the business itself rather than relying on the location or tool name." : "울릉도에서 시작한다고 무조건 로컬은 아닙니다. 로컬 사업도 AI나 앱을 활용할 수 있습니다. 지역명이나 사용하는 도구만으로 분야를 정하지 마세요."}</li>
      <li>{en ? "Write one sentence each about the customer, offer, role of regional resources and revenue. If still unsure, ask the program office before submitting." : "고객·상품·지역 자원의 역할·수익 구조를 한 문장씩 적어보세요. 그래도 애매하면 신청 전에 운영기관에 문의하세요."}</li>
    </ul>
    <pre>{en ? "My idea is [idea]. Compare it with the general/technology and local track descriptions. Explain the customer, offer, regional resources and revenue model, list what is still unknown, and suggest questions for the program office. Do not state that I am eligible or will be selected." : "내 아이디어는 [아이디어]야. 일반·기술 분야와 로컬 분야의 설명을 기준으로 비교해줘. 고객, 상품, 지역 자원의 역할, 수익 구조를 정리하고 아직 모르는 내용과 운영기관에 물어볼 질문을 나눠줘. 신청 자격이나 선정 여부를 확정하지 마."}</pre>
    <p>{en ? "The examples above are teaching examples, not approved projects or selection guarantees. Check the current notice for eligibility and excluded business categories; AI cannot decide eligibility for you." : "위 예시는 이해를 돕기 위한 수업용 예시이며, 지원 대상이나 선정이 확정된 사업이 아닙니다. 신청 자격과 제외 업종은 최신 공고에서 별도로 확인하세요. AI의 추천이 자격 확인을 대신하지는 않습니다."}</p>
    <p>{en ? "Sources: 2026 second-round announcements · checked September 16, 2026. " : "출처: 2026년 2차 모집 안내 · 확인일 2026.09.16. "}
      <a href="https://lis.mju.ac.kr/bbs/sba/253/235011/artclView.do" target="_blank" rel="noopener noreferrer">{en ? "Track descriptions ↗" : "분야별 설명 ↗"}</a>{" · "}
      <a href="https://verum.cku.ac.kr/bbs/cku_kr/1202/366822/artclView.do" target="_blank" rel="noopener noreferrer">{en ? "Notice and eligibility guidance ↗" : "모집공고와 지원 자격 안내 ↗"}</a>
    </p>
  </section>;
}
