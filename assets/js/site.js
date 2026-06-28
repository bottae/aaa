/* KWS SPORTS — 시안 인터랙션 (백엔드 없음, 시각 데모용) */
(function () {
  'use strict';

  /* ---- mobile drawer ---- */
  var toggle = document.querySelector('.menu-toggle');
  var drawer = document.getElementById('drawer');
  if (toggle && drawer) {
    var close = drawer.querySelector('[data-close]');
    toggle.addEventListener('click', function () { drawer.classList.add('open'); document.body.style.overflow = 'hidden'; });
    if (close) close.addEventListener('click', function () { drawer.classList.remove('open'); document.body.style.overflow = ''; });
    drawer.addEventListener('click', function (e) { if (e.target === drawer) { drawer.classList.remove('open'); document.body.style.overflow = ''; } });
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.acc-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.acc-item');
      var ans = item.querySelector('.acc-a');
      var isOpen = item.classList.toggle('open');
      ans.style.maxHeight = isOpen ? (ans.scrollHeight + 'px') : '0';
      q.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  /* ---- scroll reveal ---- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reveals.forEach(function (e) { e.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { threshold: 0.12 });
      reveals.forEach(function (e) { io.observe(e); });
    }
  }

  /* =====================================================
     BOOKING DEMO (booking.html)
     ===================================================== */
  var booking = document.getElementById('booking-app');
  if (!booking) return;

  var KRW = function (n) { return n.toLocaleString('ko-KR') + '원'; };

  var FACILITIES = {
    par3: { name: '파3 9홀 코스', unit: '1인', basePrice: 30000, slotLabel: '티오프 시간' },
    range: { name: '드라이빙 레인지 타석', unit: '1시간', basePrice: 18000, slotLabel: '이용 시간' },
    academy: { name: '아카데미 레슨', unit: '1회', basePrice: 60000, slotLabel: '레슨 시간' }
  };

  var state = { facility: 'par3', day: null, slot: null, people: 1 };

  /* tabs */
  booking.querySelectorAll('.tab').forEach(function (t) {
    t.addEventListener('click', function () {
      booking.querySelectorAll('.tab').forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      state.facility = t.dataset.fac;
      state.slot = null;
      renderSlots();
      renderSummary();
      var ph = booking.querySelector('#slot-label');
      if (ph) ph.textContent = FACILITIES[state.facility].slotLabel;
    });
  });

  /* calendar (current month, demo availability) */
  var cal = booking.querySelector('#calendar');
  function buildCalendar() {
    if (!cal) return;
    var dows = ['일', '월', '화', '수', '목', '금', '토'];
    var html = dows.map(function (d) { return '<div class="dow">' + d + '</div>'; }).join('');
    // demo month: 30 days, starting on Wednesday (offset 3)
    var offset = 3, days = 30, today = 8;
    for (var i = 0; i < offset; i++) html += '<div class="day muted-day"></div>';
    for (var d = 1; d <= days; d++) {
      if (d < today) { html += '<div class="day muted-day">' + d + '</div>'; continue; }
      var full = (d % 9 === 0); // a few full days
      var cls = 'day' + (full ? ' full' : '');
      html += '<button class="' + cls + '" data-day="' + d + '"' + (full ? ' disabled' : '') + '>' +
              d + '<span class="dotbar"></span></button>';
    }
    cal.innerHTML = html;
    cal.querySelectorAll('.day[data-day]').forEach(function (cell) {
      cell.addEventListener('click', function () {
        if (cell.classList.contains('full')) return;
        cal.querySelectorAll('.day').forEach(function (x) { x.classList.remove('sel'); });
        cell.classList.add('sel');
        state.day = parseInt(cell.dataset.day, 10);
        renderSummary();
      });
    });
  }

  /* slots */
  var slotWrap = booking.querySelector('#slots');
  var TIMES = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  function renderSlots() {
    if (!slotWrap) return;
    slotWrap.innerHTML = TIMES.map(function (t, i) {
      var full = (i % 7 === 4);
      var left = full ? 0 : ((i * 3 + 2) % 6) + 1;
      return '<button class="slot' + (full ? ' full' : '') + '" data-time="' + t + '"' + (full ? ' disabled' : '') + '>' +
        '<div class="t">' + t + '</div><div class="left">' + (full ? '마감' : '잔여 ' + left) + '</div></button>';
    }).join('');
    slotWrap.querySelectorAll('.slot:not(.full)').forEach(function (s) {
      s.addEventListener('click', function () {
        slotWrap.querySelectorAll('.slot').forEach(function (x) { x.classList.remove('sel'); });
        s.classList.add('sel');
        state.slot = s.dataset.time;
        renderSummary();
      });
    });
  }

  /* people stepper */
  var peopleEl = booking.querySelector('#people');
  booking.querySelectorAll('[data-step]').forEach(function (b) {
    b.addEventListener('click', function () {
      var n = state.people + parseInt(b.dataset.step, 10);
      state.people = Math.max(1, Math.min(8, n));
      if (peopleEl) peopleEl.textContent = state.people;
      renderSummary();
    });
  });

  /* summary */
  function renderSummary() {
    var f = FACILITIES[state.facility];
    var set = function (id, v) { var el = booking.querySelector(id); if (el) el.textContent = v; };
    set('#s-fac', f.name);
    set('#s-day', state.day ? ('6월 ' + state.day + '일') : '날짜를 선택하세요');
    set('#s-slot', state.slot || '시간을 선택하세요');
    set('#s-people', state.people + '명');
    var qty = state.facility === 'par3' ? state.people : (state.facility === 'academy' ? 1 : state.people);
    var total = f.basePrice * qty;
    set('#s-unit', KRW(f.basePrice) + ' / ' + f.unit);
    set('#s-total', KRW(total));
    var btn = booking.querySelector('#book-confirm');
    if (btn) btn.disabled = !(state.day && state.slot);
  }

  /* demo confirm */
  var confirmBtn = booking.querySelector('#book-confirm');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function () {
      var note = booking.querySelector('#book-note');
      if (note) { note.hidden = false; note.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });
  }

  buildCalendar();
  renderSlots();
  renderSummary();
})();
