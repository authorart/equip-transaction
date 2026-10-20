// ============================================================
//  ui.js — ส่วนประกอบ UI ที่ใช้ร่วมกันทุกหน้า (UX phase 2)
//  · uiIcon(name, opts)      ไอคอน SVG ชุดเดียวกันทั้งระบบ (แทน emoji)
//  · makeCDD / cddUpdate / cddSet / cddVal   dropdown แบบ custom (รองรับ LIFF)
//      + คีย์บอร์ด, screen reader, ช่องค้นหาเมื่อมีตัวเลือก > 10
//  · uiConfirm / uiPrompt    กล่องยืนยันในหน้า (แทน confirm()/prompt())
//  · uiToast                 แจ้งเตือนสั้น ๆ (แทน alert())
//  ใช้คู่กับ brand.css
// ============================================================
(function () {
'use strict';

// ── Icons ─────────────────────────────────────────────────────
function p(d) { return '<path d="' + d + '"/>'; }
var RING = '<circle cx="12" cy="12" r="9.5"/>';
var ICONS = {
  'check-circle': RING + p('M7 12.5l3.2 3.2L17 9'),
  'lock-circle' : RING + '<rect x="8" y="11" width="8" height="6" rx="1.2"/>' + p('M9.5 11V9.5a2.5 2.5 0 015 0V11'),
  'x-circle'    : RING + p('M8.5 8.5l7 7M15.5 8.5l-7 7'),
  'clock'       : RING + p('M12 7v5l3 2'),
  'alert'       : p('M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z') + p('M12 9v4M12 17h.01'),
  'info'        : RING + p('M12 16v-5M12 8h.01'),
  'clipboard'   : '<rect x="8" y="2" width="8" height="4" rx="1"/>' + p('M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2') + p('M9 12h6M9 16h4'),
  'return'      : p('M9 14L4 9l5-5') + p('M4 9h10.5a5.5 5.5 0 010 11H11'),
  'inbox'       : p('M22 12h-6l-2 3h-4l-2-3H2') + p('M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z'),
  'send'        : p('M22 2L11 13') + p('M22 2l-7 20-4-9-9-4 20-7z'),
  'package'     : p('M16.5 9.4l-9-5.19') + p('M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z') + p('M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12'),
  'wrench'      : p('M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z'),
  'refresh'     : p('M23 4v6h-6M1 20v-6h6') + p('M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15'),
  'key'         : '<circle cx="7.5" cy="15.5" r="5.5"/>' + p('M11.4 11.6L21 2M16 7l3 3M18.5 4.5l2 2'),
  'hospital'    : '<rect x="3" y="3" width="18" height="18" rx="2"/>' + p('M12 7v6M9 10h6M9 21v-4h6v4'),
  'calendar'    : '<rect x="3" y="4" width="18" height="18" rx="2"/>' + p('M16 2v4M8 2v4M3 10h18'),
  'chart'       : p('M18 20V10M12 20V4M6 20v-6'),
  'flask'       : p('M9 3h6M10 3v6.5L4.6 18.4A1.7 1.7 0 006 21h12a1.7 1.7 0 001.4-2.6L14 9.5V3M7.5 15h9'),
  'search'      : '<circle cx="11" cy="11" r="7"/>' + p('M21 21l-4.35-4.35'),
  'x'           : p('M18 6L6 18M6 6l12 12'),
  'arrow-left'  : p('M19 12H5M12 19l-7-7 7-7'),
  'chevron-down': p('M6 9l6 6 6-6'),
  'lock'        : '<rect x="5" y="11" width="14" height="10" rx="2"/>' + p('M8 11V7a4 4 0 018 0v4'),
  'shield'      : p('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'),
  'printer'     : p('M6 9V2h12v7') + '<rect x="6" y="14" width="12" height="8"/>' + p('M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2'),
  // โลโก้หน่วยโรคระบบหายใจ (ปอด) ตาม VBD
  'lungs'       : p('M12 3v7.5M12 10.5l-2.5 2M12 10.5l2.5 2') +
                  p('M8.6 6.5C6 6.5 3 10.6 3 15.8 3 18.5 4.3 20 6.1 20c2.2 0 3.4-1.5 3.4-4V8.4a1.9 1.9 0 00-.9-1.9z') +
                  p('M15.4 6.5C18 6.5 21 10.6 21 15.8c0 2.7-1.3 4.2-3.1 4.2-2.2 0-3.4-1.5-3.4-4V8.4a1.9 1.9 0 01.9-1.9z')
};

function uiIcon(name, o) {
  o = o || {};
  var s = o.size || 20;
  return '<svg class="ic' + (o.cls ? ' ' + o.cls : '') + '" width="' + s + '" height="' + s +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (o.stroke || 2) +
    '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    (ICONS[name] || '') + '</svg>';
}

// <i data-icon="name" data-size="24"></i> → SVG
function hydrateIcons(root) {
  (root || document).querySelectorAll('i[data-icon]').forEach(function (el) {
    el.outerHTML = uiIcon(el.getAttribute('data-icon'), { size: +el.getAttribute('data-size') || 20, cls: el.className });
  });
}

// ── Custom dropdown (CDD) ─────────────────────────────────────
// API เดิม: makeCDD(id, opts, placeholder, onChange) → element, ค่าเก็บใน <input type=hidden id=id>
var openWrap = null, SEARCH_MIN = 10;

function st(wrap) { return wrap._cdd; }
function visibleOpts(wrap) {
  return Array.prototype.filter.call(st(wrap).list.querySelectorAll('.cdd-opt'), function (o) { return !o.hidden; });
}

function pos(wrap) {
  var s = st(wrap), r = s.btn.getBoundingClientRect(), list = s.list;
  var below = window.innerHeight - r.bottom - 8, above = r.top - 8;
  list.style.width = Math.max(r.width, 180) + 'px';
  list.style.left = Math.max(8, Math.min(r.left, window.innerWidth - Math.max(r.width, 180) - 8)) + 'px';
  if (below > 200 || below >= above) {
    list.style.top = (r.bottom + 2) + 'px'; list.style.bottom = '';
    list.style.maxHeight = Math.min(300, Math.max(160, below)) + 'px';
  } else {
    list.style.bottom = (window.innerHeight - r.top + 2) + 'px'; list.style.top = '';
    list.style.maxHeight = Math.min(300, above) + 'px';
  }
}

// ผูก <label> ที่อยู่ก่อนกล่อง dropdown เพื่อให้ screen reader อ่านชื่อช่องได้
function linkLabel(wrap) {
  var s = st(wrap);
  if (s.labelled) return;
  var host = wrap.parentElement, lb = host && host.previousElementSibling;
  if (!lb || lb.tagName !== 'LABEL') return;
  if (!lb.id) lb.id = 'cddlab_' + s.id;
  lb.htmlFor = s.btn.id;
  s.btn.setAttribute('aria-labelledby', lb.id + ' ' + s.txt.id);
  s.list.setAttribute('aria-labelledby', lb.id);
  s.labelled = true;
}

function closeOpen(focusBtn) {
  if (!openWrap) return;
  var s = st(openWrap);
  openWrap.classList.remove('open');
  s.btn.setAttribute('aria-expanded', 'false');
  openWrap = null;
  if (focusBtn) s.btn.focus();
}

function openCDD(wrap, viaKeyboard) {
  if (openWrap && openWrap !== wrap) closeOpen(false);
  var s = st(wrap);
  linkLabel(wrap);
  if (s.search) { s.search.value = ''; filter(wrap, ''); }
  wrap.classList.add('open');
  s.btn.setAttribute('aria-expanded', 'true');
  openWrap = wrap;
  pos(wrap);
  var sel = s.list.querySelector('.cdd-opt[aria-selected="true"]') || visibleOpts(wrap)[0];
  if (viaKeyboard && s.search) s.search.focus();
  else if (sel) sel.focus();
  if (sel) sel.scrollIntoView({ block: 'nearest' });
}

function filter(wrap, q) {
  q = (q || '').trim().toLowerCase();
  st(wrap).list.querySelectorAll('.cdd-opt').forEach(function (o) {
    o.hidden = !!q && o.textContent.toLowerCase().indexOf(q) < 0 && !o.classList.contains('cdd-ph');
  });
}

function selectOpt(wrap, o, fire) {
  var s = st(wrap), v = o ? (o.getAttribute('data-value') || '') : '';
  s.inp.value = v;
  s.txt.textContent = v ? o.textContent : s.ph;
  s.btn.classList.toggle('placeholder', !v);
  s.list.querySelectorAll('.cdd-opt').forEach(function (x) {
    var on = x === o && !!v;
    x.setAttribute('aria-selected', on ? 'true' : 'false');
    x.classList.toggle('sel', on);
  });
  if (fire && s.cb) s.cb(v);
}

function fillOpts(wrap, opts, ph) {
  var s = st(wrap);
  s.ph = ph || '— กรุณาเลือก —';
  s.box.innerHTML = '';
  var all = [{ value: '', label: s.ph, ph: true }].concat((opts || []).map(function (o) {
    return typeof o === 'string' ? { value: o, label: o } : o;
  }));
  all.forEach(function (o, i) {
    var el = document.createElement('div');
    el.className = 'cdd-opt' + (o.ph ? ' cdd-ph' : '');
    el.id = 'cddo_' + s.id + '_' + i;
    el.setAttribute('role', 'option');
    el.setAttribute('aria-selected', 'false');
    el.tabIndex = -1;
    el.setAttribute('data-value', o.value || '');
    el.textContent = o.label;
    s.box.appendChild(el);
  });
  var needSearch = (opts || []).length > SEARCH_MIN;
  s.searchWrap.hidden = !needSearch;
  s.search = needSearch ? s.searchInput : null;
  s.inp.value = '';
  s.txt.textContent = s.ph;
  s.btn.classList.add('placeholder');
}

function onListKey(wrap, e) {
  var s = st(wrap), opts = visibleOpts(wrap), i = opts.indexOf(document.activeElement);
  var inSearch = document.activeElement === s.search;
  switch (e.key) {
    case 'ArrowDown': e.preventDefault(); (opts[inSearch ? 0 : Math.min(i + 1, opts.length - 1)] || opts[0]).focus(); return;
    case 'ArrowUp':   e.preventDefault(); if (i <= 0 && s.search) s.search.focus(); else (opts[Math.max(i - 1, 0)] || opts[0]).focus(); return;
    case 'Home':      if (!inSearch) { e.preventDefault(); opts[0] && opts[0].focus(); } return;
    case 'End':       if (!inSearch) { e.preventDefault(); opts[opts.length - 1] && opts[opts.length - 1].focus(); } return;
    case 'Escape':    e.preventDefault(); e.stopPropagation(); closeOpen(true); return;
    case 'Tab':       closeOpen(false); return;
    case 'Enter':
    case ' ':
      if (inSearch && e.key === ' ') return;
      e.preventDefault();
      var o = inSearch ? opts.filter(function (x) { return !x.classList.contains('cdd-ph'); })[0] : opts[i];
      if (o) { selectOpt(wrap, o, true); closeOpen(true); }
      return;
  }
  // พิมพ์ตัวอักษรเพื่อกระโดดไปยังตัวเลือก
  if (!inSearch && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
    s.typed = (Date.now() - (s.typedAt || 0) < 600 ? s.typed : '') + e.key.toLowerCase();
    s.typedAt = Date.now();
    var hit = opts.filter(function (x) { return x.textContent.toLowerCase().indexOf(s.typed) === 0; })[0];
    if (hit) hit.focus();
  }
}

window.makeCDD = function (id, opts, ph, cb) {
  var wrap = document.createElement('div');
  wrap.className = 'cdd-wrap';
  wrap.id = 'cdd_' + id;

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'cdd-btn placeholder';
  btn.id = 'cddb_' + id;
  btn.setAttribute('aria-haspopup', 'listbox');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'cddl_' + id);
  btn.innerHTML = '<span class="cdd-txt" id="cddt_' + id + '"></span>' + uiIcon('chevron-down', { size: 18, cls: 'cdd-arr' });

  var list = document.createElement('div');
  list.className = 'cdd-list';
  list.id = 'cddl_' + id;
  list.setAttribute('role', 'listbox');

  var searchWrap = document.createElement('div');
  searchWrap.className = 'cdd-search';
  searchWrap.innerHTML = uiIcon('search', { size: 16 }) + '<input type="search" autocomplete="off" aria-label="ค้นหาตัวเลือก" placeholder="พิมพ์เพื่อค้นหา">';
  var box = document.createElement('div');
  list.appendChild(searchWrap);
  list.appendChild(box);

  var inp = document.createElement('input');
  inp.type = 'hidden'; inp.id = id; inp.name = id; inp.value = '';

  wrap.appendChild(btn); wrap.appendChild(list); wrap.appendChild(inp);
  wrap._cdd = { id: id, btn: btn, list: list, box: box, inp: inp, txt: btn.firstChild, cb: cb,
                searchWrap: searchWrap, searchInput: searchWrap.querySelector('input'), search: null };
  fillOpts(wrap, opts, ph);

  btn.addEventListener('click', function (e) {
    e.preventDefault(); e.stopPropagation();
    if (wrap.classList.contains('open')) closeOpen(false); else openCDD(wrap, e.detail === 0);
  });
  btn.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); openCDD(wrap, true); }
  });
  list.addEventListener('click', function (e) {
    var o = e.target.closest('.cdd-opt');
    if (!o) return;
    selectOpt(wrap, o, true);
    closeOpen(true);
  });
  list.addEventListener('keydown', function (e) { onListKey(wrap, e); });
  wrap._cdd.searchInput.addEventListener('input', function () { filter(wrap, this.value); });

  setTimeout(function () { linkLabel(wrap); }, 0);
  return wrap;
};

window.cddUpdate = function (id, opts, ph) {
  var wrap = document.getElementById('cdd_' + id);
  if (wrap) fillOpts(wrap, opts, ph || st(wrap).ph);
};

// ตั้งค่าโดยไม่เรียก onChange (v = '' → ล้างค่า)
window.cddSet = function (id, v, l) {
  var wrap = document.getElementById('cdd_' + id);
  if (!wrap) return;
  var o = null;
  if (v) {
    st(wrap).list.querySelectorAll('.cdd-opt').forEach(function (x) { if (x.getAttribute('data-value') === v) o = x; });
    if (!o) { // ค่าที่ไม่มีในรายการ (เช่น ข้อมูลเก่า) → แสดงตามที่ส่งมา
      var s = st(wrap);
      s.inp.value = v; s.txt.textContent = l || v; s.btn.classList.remove('placeholder');
      return;
    }
  }
  selectOpt(wrap, o, false);
  if (o && l) st(wrap).txt.textContent = l;
};

window.cddVal = function (id) { var e = document.getElementById(id); return e ? e.value : ''; };

document.addEventListener('click', function (e) {
  if (openWrap && !openWrap.contains(e.target)) closeOpen(false);
}, true);
window.addEventListener('resize', function () { if (openWrap) pos(openWrap); });
document.addEventListener('scroll', function (e) {
  if (openWrap && !st(openWrap).list.contains(e.target)) pos(openWrap);
}, true);

// ── Dialog (confirm / prompt) ─────────────────────────────────
function uiDialog(o) {
  return new Promise(function (resolve) {
    var prev = document.activeElement;
    var bg = document.createElement('div');
    bg.className = 'ui-dlg-bg';
    var hasField = o.field != null;
    bg.innerHTML =
      '<div class="ui-dlg" role="dialog" aria-modal="true" aria-labelledby="uiDlgT" aria-describedby="uiDlgM">' +
        '<div class="ui-dlg-hd">' + (o.icon ? '<span class="ui-dlg-ic' + (o.danger ? ' danger' : '') + '">' + uiIcon(o.icon, { size: 24 }) + '</span>' : '') +
          '<h2 id="uiDlgT"></h2></div>' +
        '<p id="uiDlgM"></p>' +
        (hasField ? '<label class="ui-dlg-lbl" for="uiDlgF"></label><textarea id="uiDlgF" rows="3"></textarea>' : '') +
        '<div class="ui-dlg-btns"><button type="button" class="ui-btn ghost" data-r="0"></button>' +
          '<button type="button" class="ui-btn ' + (o.danger ? 'danger' : 'primary') + '" data-r="1"></button></div>' +
      '</div>';
    bg.querySelector('#uiDlgT').textContent = o.title || '';
    bg.querySelector('#uiDlgM').textContent = o.message || '';
    if (!o.message) bg.querySelector('#uiDlgM').remove();
    var okBtn = bg.querySelector('[data-r="1"]'), noBtn = bg.querySelector('[data-r="0"]');
    okBtn.textContent = o.ok || 'ยืนยัน';
    noBtn.textContent = o.cancel || 'ยกเลิก';
    var field = bg.querySelector('#uiDlgF');
    if (field) {
      bg.querySelector('.ui-dlg-lbl').textContent = o.field.label || '';
      field.placeholder = o.field.placeholder || '';
      if (o.field.required) {
        okBtn.disabled = true;
        field.addEventListener('input', function () { okBtn.disabled = !field.value.trim(); });
      }
    }
    function done(ok) {
      document.removeEventListener('keydown', onKey, true);
      bg.remove();
      document.body.classList.remove('ui-noscroll');
      if (prev && prev.focus) prev.focus();
      resolve(field ? (ok ? field.value.trim() : null) : ok);
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done(false); return; }
      if (e.key !== 'Tab') return;
      var f = Array.prototype.filter.call(bg.querySelectorAll('button,textarea'), function (x) { return !x.disabled; });
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    okBtn.addEventListener('click', function () { done(true); });
    noBtn.addEventListener('click', function () { done(false); });
    bg.addEventListener('click', function (e) { if (e.target === bg) done(false); });
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(bg);
    document.body.classList.add('ui-noscroll');
    (field || (o.danger ? noBtn : okBtn)).focus();
  });
}

// uiConfirm({title, message, ok, cancel, danger, icon}) → Promise<boolean>
window.uiConfirm = function (o) {
  return uiDialog(Object.assign({ icon: o && o.danger ? 'alert' : 'info' }, o));
};
// uiPrompt({title, message, label, placeholder, ok, cancel, required, danger}) → Promise<string|null>
window.uiPrompt = function (o) {
  o = o || {};
  return uiDialog(Object.assign({}, o, { field: { label: o.label, placeholder: o.placeholder, required: o.required } }));
};

// ── Toast ─────────────────────────────────────────────────────
// uiToast(message, 'info' | 'success' | 'error', ms)
window.uiToast = function (msg, type, ms) {
  type = type || 'info';
  var host = document.getElementById('uiToasts');
  if (!host) {
    host = document.createElement('div');
    host.id = 'uiToasts';
    host.className = 'ui-toasts';
    host.setAttribute('role', 'status');
    host.setAttribute('aria-live', 'polite');
    document.body.appendChild(host);
  }
  var t = document.createElement('div');
  t.className = 'ui-toast ' + type;
  t.innerHTML = uiIcon(type === 'error' ? 'alert' : type === 'success' ? 'check-circle' : 'info', { size: 20 }) + '<span></span>';
  t.lastChild.textContent = msg;
  host.appendChild(t);
  setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 250); }, ms || (type === 'error' ? 6000 : 3500));
};

// ── ปุ่มย้อนกลับ ─────────────────────────────────────────────
// ลำดับ: มีหน้าก่อนหน้า → ย้อนกลับ · เปิดจากหน้าอื่นเป็นหน้าต่างใหม่ → ปิด ·
//        เปิดใน LINE (LIFF) → ปิดหน้าต่าง · ไม่มีทางกลับ → ไปหน้า fallback
// o.fallback   หน้าที่จะไปเมื่อย้อนกลับไม่ได้ (เช่น 'dashboard.html')
// o.isDirty()  คืน true ถ้ามีข้อมูลที่ยังไม่บันทึก → ถามก่อนออก
// o.preferClose  หน้า LIFF (dashboard/admin): ใน LINE ให้ปิดหน้าต่างก่อน (history มีหน้า login ของ LINE ปนอยู่)
function inLiffClient() {
  try { return !!(window.liff && liff.isInClient && liff.isInClient()); } catch (e) { return false; }
}
window.uiCanGoBack = function (o) {
  o = o || {};
  return history.length > 1 || !!window.opener || inLiffClient() || !!o.fallback;
};
window.uiBack = async function (o) {
  o = o || {};
  if (o.isDirty && o.isDirty() && !(await uiConfirm({
    title: 'ออกจากหน้านี้?', message: 'ข้อมูลที่กรอกไว้จะไม่ถูกบันทึก', ok: 'ออกจากหน้านี้', cancel: 'กรอกต่อ', danger: true }))) return;
  if (o.preferClose && inLiffClient()) { liff.closeWindow(); return; }
  if (history.length > 1) { history.back(); return; }
  if (window.opener) { window.close(); }
  if (inLiffClient()) { liff.closeWindow(); return; }
  setTimeout(function () { if (o.fallback) location.href = o.fallback; }, window.opener ? 300 : 0);
};

// ── การ์ด/แถวที่กดได้ (role="button" หรือ data-click) → กด Enter/Space ได้เหมือนปุ่ม ──
document.addEventListener('keydown', function (e) {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches &&
      e.target.matches('[role="button"]:not(button),[data-click]')) {
    e.preventDefault();
    e.target.click();
  }
});

window.uiIcon = uiIcon;
window.hydrateIcons = hydrateIcons;
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { hydrateIcons(); });
else hydrateIcons();
})();
