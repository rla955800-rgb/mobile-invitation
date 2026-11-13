// 행사 정보는 이곳 한 군데에서만 수정합니다.
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

const DAY_MS = 24 * 60 * 60 * 1000;
const eventTime = new Date(EVENT.date).getTime();

const pad = (n) => String(n).padStart(2, '0');

// 한국 시간 기준 자정의 타임스탬프 (D-Day 일수 계산용)
function kstMidnight(time) {
  const kst = new Date(time + 9 * 60 * 60 * 1000);
  return Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate());
}

function formatEventDate() {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(eventTime));
}

function fillEventInfo() {
  const values = { ...EVENT, dateText: formatEventDate() };
  document.querySelectorAll('[data-event]').forEach((el) => {
    el.textContent = values[el.dataset.event];
  });
  document.title = EVENT.title;

  const list = document.getElementById('attendee-list');
  EVENT.attendees.forEach((name) => {
    const li = document.createElement('li');
    li.textContent = name;
    list.append(li);
  });
  document.getElementById('attendee-count').textContent = `총 ${EVENT.attendees.length}명`;
}

function setupCountdown() {
  const badge = document.getElementById('dday-badge');
  const countdown = document.getElementById('countdown');
  const message = document.getElementById('countdown-message');
  const units = {};
  countdown.querySelectorAll('[data-unit]').forEach((el) => {
    units[el.dataset.unit] = el;
  });

  let timer = null;

  function update() {
    const now = Date.now();
    const remain = Math.max(0, eventTime - now);
    const dayDiff = Math.round((kstMidnight(eventTime) - kstMidnight(now)) / DAY_MS);

    if (dayDiff > 0) {
      badge.textContent = `D-${dayDiff}`;
    } else if (dayDiff === 0) {
      badge.textContent = 'D-Day';
    } else {
      badge.textContent = `D+${-dayDiff}`;
    }

    const days = Math.floor(remain / DAY_MS);
    const hours = Math.floor((remain % DAY_MS) / 3600000);
    const minutes = Math.floor((remain % 3600000) / 60000);
    const seconds = Math.floor((remain % 60000) / 1000);

    units.days.textContent = pad(days);
    units.hours.textContent = pad(hours);
    units.minutes.textContent = pad(minutes);
    units.seconds.textContent = pad(seconds);
    countdown.setAttribute('aria-label', `행사까지 ${days}일 ${hours}시간 ${minutes}분 남았습니다`);

    if (remain === 0) {
      message.textContent = dayDiff === 0 ? '오늘이 행사일입니다!' : '행사가 끝났습니다. 함께해 주셔서 감사합니다.';
      countdown.setAttribute('aria-label', message.textContent);
      clearInterval(timer);
    }
  }

  update();
  timer = setInterval(update, 1000);
}

function setupMap() {
  const { placeName, address, mapSearch, kakaoPlaceId, lat, lng } = EVENT;

  document.getElementById('map-iframe').src =
    `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
  document.getElementById('naver-link').href =
    `https://map.naver.com/p/search/${encodeURIComponent(mapSearch)}`;
  // 장소 ID가 있으면 카카오맵에 등록된 장소로 바로 길찾기
  document.getElementById('kakao-link').href = kakaoPlaceId
    ? `https://map.kakao.com/link/to/${kakaoPlaceId}`
    : `https://map.kakao.com/link/to/${encodeURIComponent(placeName)},${lat},${lng}`;

  const status = document.getElementById('copy-status');
  document.getElementById('copy-address').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(address.replace(/\s*\(.*\)$/, ''));
      status.textContent = '주소를 복사했습니다.';
    } catch {
      status.textContent = '복사하지 못했습니다. 주소를 길게 눌러 복사해 주세요.';
    }
  });
}

fillEventInfo();
setupCountdown();
setupMap();
