# CLAUDE.md

이 파일은 이 저장소에서 작업할 때 Claude Code가 따라야 할 지침입니다.

## 프로젝트 개요

스마트폰에서 보기 좋은 **모바일 반응형 초대장 웹페이지**입니다.
주요 기능은 세 가지입니다.

1. **D-Day 카운트다운**: 행사일까지 남은 날짜와 시간을 보여줍니다.
2. **참석자 목록**: 함께하는 사람의 이름과 인원수를 보여줍니다.
3. **장소 지도**: 행사 장소를 지도로 보여주고 지도 앱으로 길찾기를 열 수 있게 합니다.

## 현재 행사 정보

| 항목 | 내용 |
|---|---|
| 행사 이름 | '26년 결혼기념일 해피점심 |
| 일시 | 2026년 11월 28일(토) 오후 12시 30분 |
| 참석자 | 총 3명 (김영남, 강정화, 김지율) |
| 장소 | 한남 사피드 서울 (Sapid Seoul) |
| 주소 | 서울 용산구 이태원로27길 34-1, 우영미 플래그십스토어 지하 (이태원역 2번 출구 도보 5분) |
| 카카오맵 장소 ID | 1535637929 |

## 배포

- GitHub 저장소: https://github.com/rla955800-rgb/mobile-invitation
- GitHub Pages: https://rla955800-rgb.github.io/mobile-invitation/
- `main` 브랜치 루트를 그대로 배포합니다. 푸시하면 1~2분 뒤 자동 반영됩니다.

## 기술 규칙

- **프레임워크와 라이브러리를 쓰지 않습니다.** 순수 HTML, CSS, JavaScript(ES6+)만 사용합니다.
  - React, Vue, jQuery, Bootstrap, Tailwind 같은 도구는 쓰지 않습니다.
  - npm, 번들러, 빌드 도구를 쓰지 않습니다. `index.html`을 브라우저로 바로 열면 동작해야 합니다.
- 외부 리소스는 웹폰트(Google Fonts 등)와 지도 임베드만 허용합니다.
- JavaScript는 `<script type="module">`이 아닌 일반 `<script defer>`로 불러옵니다. `file://`로 열어도 동작하게 하기 위해서입니다.

## 파일 구조

```
/
├── index.html        # 페이지 마크업
├── css/
│   └── style.css     # 모든 스타일
├── js/
│   └── main.js       # D-Day 카운트다운, 지도 버튼 등 동작
├── images/           # 사진, 아이콘 (가능하면 .webp, 가로 1200px 이하)
└── CLAUDE.md
```

새 파일이 꼭 필요할 때만 추가하고, 기능은 가능한 한 위 세 파일 안에서 해결합니다.

## 행사 정보 설정

행사 날짜, 장소 같은 바뀔 수 있는 값은 `js/main.js` 맨 위의 설정 객체 한 곳에 모읍니다.
코드 여러 곳에 날짜나 주소를 직접 적지 않습니다.

```js
const EVENT = {
  title: "'26년 결혼기념일 해피점심",
  date: '2026-11-28T12:30:00+09:00', // 반드시 한국 시간대(+09:00) 포함
  attendees: ['김영남', '강정화', '김지율'],
  placeName: '한남 사피드 서울',
  address: '서울 용산구 이태원로27길 34-1 (우영미 플래그십스토어 지하)',
  mapSearch: '사피드 서울', // 네이버 지도 검색어
  kakaoPlaceId: '1535637929', // 카카오맵 장소 ID (place.map.kakao.com/{ID})
  lat: 37.5357,
  lng: 126.9943,
};
```

- 참석자는 `attendees` 배열만 고치면 목록과 인원수(`총 N명`)가 함께 바뀝니다.
- 주소 끝의 괄호 안 설명은 화면에만 보이고, 주소 복사 때는 빠집니다.

## 모바일 반응형 원칙

- **모바일 우선(mobile-first)** 으로 작성합니다. 기본 스타일은 스마트폰 기준, 넓은 화면은 `@media (min-width: ...)`로 덧붙입니다.
- `<meta name="viewport" content="width=device-width, initial-scale=1">`을 반드시 넣습니다.
- 본문 최대 너비는 약 `480px`로 두고 가운데 정렬합니다. PC에서도 스마트폰 화면처럼 보이게 합니다.
- 좌우 여백은 최소 `16px`, 가로 스크롤이 생기지 않게 합니다.
- 기본 글자 크기는 `16px` 이상으로 합니다. iOS에서 입력창이 자동 확대되는 것을 막기 위해서입니다.
- 버튼과 링크의 터치 영역은 최소 `44px × 44px`입니다.
- 크기는 `rem`, `%`, `vw`, `clamp()`를 쓰고 고정 `px` 너비는 피합니다.
- 노치가 있는 기기를 위해 `env(safe-area-inset-*)`를 고려합니다.
- 색상, 글꼴, 간격은 `:root`의 CSS 변수로 정의하고 재사용합니다.
- 이미지에는 `alt`, `width`, `height`를 넣고, 첫 화면 아래 이미지는 `loading="lazy"`를 씁니다.

## D-Day 기능

- `EVENT.date`를 기준으로 남은 **일, 시, 분, 초**를 표시합니다.
- 화면 상단 또는 눈에 잘 띄는 곳에 `D-30` 형식의 큰 표시를 둡니다.
- 1초마다 갱신하되 `setInterval` 하나만 사용합니다.
- 날짜 계산은 `Date` 객체의 밀리초 차이로 합니다. 사용자 기기의 시간대와 관계없이 맞도록 설정 날짜에 `+09:00`를 붙입니다.
- 상태별 표시:
  - 행사 전: `D-N` 과 남은 시간
  - 행사 당일: `D-Day`
  - 행사 후: `D+N` 또는 "행사가 끝났습니다" 문구, 그리고 카운트다운 정지
- 숫자는 두 자리로 맞춥니다(`05`). 글자 폭이 흔들리지 않게 `font-variant-numeric: tabular-nums`를 씁니다.

## 참석자 기능

- `EVENT.attendees`로 `<li>`를 만들어 이름을 둥근 칩 모양으로 보여주고, 위에 `총 N명`을 표시합니다.
- 이름은 `textContent`로 넣습니다.

## 장소 지도 기능

- API 키가 필요 없는 방식을 우선합니다. 기본은 **지도 `<iframe>` 임베드**입니다(예: Google 지도 임베드 URL `https://maps.google.com/maps?q=위도,경도&z=16&output=embed`).
  - `iframe`에는 `loading="lazy"`, `title`, `referrerpolicy="no-referrer-when-downgrade"`를 넣습니다.
  - 지도 영역은 `width: 100%`, `aspect-ratio: 4 / 3` 정도로 반응형을 유지합니다.
- 지도 아래에 장소 이름, 주소, 그리고 **길찾기 버튼**을 둡니다.
  - 네이버 지도: `https://map.naver.com/p/search/{mapSearch}`
  - 카카오맵: `kakaoPlaceId`가 있으면 `https://map.kakao.com/link/to/{장소ID}`, 없으면 `https://map.kakao.com/link/to/{장소명},{위도},{경도}`
  - 주소 복사 버튼: `navigator.clipboard.writeText()` 사용, 실패하면 안내 문구를 보여줍니다.
- 링크 URL에 넣는 값은 `encodeURIComponent()`로 인코딩합니다.
- 카카오맵/네이버 지도 JavaScript API처럼 키가 필요한 방식은 사용자가 요청할 때만 도입하고, 키는 코드에 직접 넣지 않고 설정 부분에 따로 둡니다.

## 코드 스타일

- 들여쓰기 2칸, 문자열은 작은따옴표, 세미콜론 사용.
- 변수는 `const`를 기본으로, 바뀌는 값만 `let`. `var`는 쓰지 않습니다.
- CSS 클래스 이름은 소문자와 하이픈(`dday-counter`, `map-section`)을 씁니다.
- HTML은 시맨틱 태그(`header`, `main`, `section`, `footer`)를 사용합니다.
- 주석은 한국어로, 의도가 분명하지 않은 부분에만 짧게 답니다.
- `innerHTML`에 외부 값을 넣지 않고 `textContent`를 사용합니다.

## 접근성

- 문서 언어는 `<html lang="ko">`.
- 카운트다운 영역은 매초 읽히지 않도록 `aria-live`를 쓰지 않습니다. 대신 `aria-label`로 요약 문구를 제공합니다.
- 색 대비는 WCAG AA(본문 4.5:1) 이상을 지킵니다.
- 애니메이션은 `prefers-reduced-motion: reduce`일 때 줄이거나 끕니다.

## 확인 방법

- 빌드 과정이 없습니다. `index.html`을 브라우저로 열어 확인합니다.
- 변경 후 확인할 것:
  - 화면 너비 360px, 390px, 768px, 1280px에서 레이아웃이 깨지지 않는지
  - 가로 스크롤이 생기지 않는지
  - D-Day가 행사 전, 당일, 후에 올바르게 표시되는지 (`EVENT.date`를 잠시 바꿔서 확인)
  - 지도가 보이고 길찾기 버튼이 올바른 위치를 여는지
  - 브라우저 콘솔에 오류가 없는지
