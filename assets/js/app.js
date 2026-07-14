/* =========================================================
   每日诗词 · app.js
   纯前端 / 离线 / 零依赖
   - fetch data/poems.json
   - 按日期确定性选「今日诗词」
   - 换一首 / 收藏(localStorage) / 复制 / 分享
   - 朝代筛选 + 全文搜索
   - 收藏夹 / 历史回看
   - 农历显示
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 农历转换（1900–2100）----------
     算法取自 solarlunar（MIT），农历数据表与核心已逐日校验，
     含闰月正确处理；零依赖、可直接在浏览器运行。 */
  var LunarKit = (function () {
    var lunarInfo = [
      0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
      0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
      0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
      0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
      0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
      0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
      0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
      0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
      0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
      0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,
      0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
      0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
      0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
      0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
      0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
      0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,
      0x092e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
      0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
      0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
      0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a4d0,0x0d150,0x0f252,
      0x0d520];
    var nStr1 = ['日','一','二','三','四','五','六','七','八','九','十'];
    var nStr2 = ['初','十','廿','卅'];
    var nStr3 = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
    var gan = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
    var zhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    var animals = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];

    function leapMonth(y){ return lunarInfo[y-1900] & 0xf; }
    function leapDays(y){ return leapMonth(y) ? ((lunarInfo[y-1900] & 0x10000) ? 30 : 29) : 0; }
    function monthDays(y,m){ return (lunarInfo[y-1900] & (0x10000 >> m)) ? 30 : 29; }
    function lYearDays(y){
      var i, sum = 348;
      for (i = 0x8000; i > 0x8; i >>= 1) sum += (lunarInfo[y-1900] & i) ? 1 : 0;
      return sum + leapDays(y);
    }
    function toChinaMonth(m){ return nStr3[m-1] + '月'; }
    function toChinaDay(d){
      if (d === 10) return '初十';
      if (d === 20) return '二十';
      if (d === 30) return '三十';
      return nStr2[Math.floor(d/10)] + nStr1[d%10];
    }
    function solar2lunar(y, m, d) {
      y = Number(y); m = Number(m); d = Number(d);
      var offset = Math.round((Date.UTC(y, m-1, d) - Date.UTC(1900, 0, 31)) / 86400000);
      var i, temp = 0;
      for (i = 1900; i < 2101 && offset > 0; i++) { temp = lYearDays(i); offset -= temp; }
      if (offset < 0) { offset += temp; i--; }
      var year = i;
      var leap = leapMonth(year);
      var isLeap = false;
      for (i = 1; i < 13 && offset > 0; i++) {
        if (leap > 0 && i === (leap + 1) && isLeap === false) {
          --i; isLeap = true; temp = leapDays(year);
        } else {
          temp = monthDays(year, i);
        }
        if (isLeap === true && i === (leap + 1)) isLeap = false;
        offset -= temp;
      }
      if (offset === 0 && leap > 0 && i === (leap + 1)) {
        if (isLeap) { isLeap = false; } else { isLeap = true; --i; }
      }
      if (offset < 0) { offset += temp; --i; }
      var month = i;
      var day = offset + 1;
      var gz = gan[(year-4) % 10] + zhi[(year-4) % 12];
      var animal = animals[(year-4) % 12];
      return {
        year: year, month: month, day: day, isLeap: isLeap,
        gz: gz, animal: animal,
        monthCn: (isLeap ? '闰' : '') + toChinaMonth(month),
        dayCn: toChinaDay(day)
      };
    }
    return { solar2lunar: solar2lunar };
  })();

  function lunarString(date) {
    var r = LunarKit.solar2lunar(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return '农历 ' + r.gz + '年（' + r.animal + '年）' + r.monthCn + r.dayCn;
  }

  /* ---------- 工具 ---------- */
  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  var WEEK = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];

  function fmtDate(d) {
    var y = d.getFullYear();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return y + '年' + m + '月' + day + '日';
  }

  // 日期 -> YYYYMMDD 数字（用于确定性选诗）
  function ymdNum(d) {
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  function pickIndex(total, date) {
    // 用日期数字做确定性哈希，保证同一天同一首诗
    var n = ymdNum(date);
    n = (n * 2654435761) % 4294967296; // 乘大素数混淆
    n = (n ^ (n >> 15)) >>> 0;
    return n % total;
  }

  /* ---------- 全局状态 ---------- */
  var POEMS = [];
  var FAV_KEY = 'dp_favs_v1';
  var current = null;       // 当前展示的诗
  var isTodayMode = true;   // 是否为「今日」确定性诗
  var libFilter = { dynasty: '全部', q: '', stage: '全部', type: '全部' };
  var CIPAI = null;         // data/cipai.json 缓存
  var cipaiMode = 'length'; // 词牌视图分组方式：length | tone
  var AUTHORS = null;       // data/authors.json 缓存
  var currentAuthor = null;  // 当前作者视图的作者名

  function getFavs() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function setFavs(arr) {
    localStorage.setItem(FAV_KEY, JSON.stringify(arr));
    var badge = $('#fav-count');
    if (badge) badge.textContent = arr.length;
  }
  function isFaved(id) { return getFavs().indexOf(id) >= 0; }

  function toggleFav(id) {
    var arr = getFavs();
    var i = arr.indexOf(id);
    if (i >= 0) arr.splice(i, 1); else arr.push(id);
    setFavs(arr);
    return i < 0; // 返回收藏后状态
  }

  /* ---------- 渲染：单首诗内容 ---------- */
  function renderContent(target, poem) {
    target.innerHTML = '';
    var isProse = (poem.type || 'poem') === 'prose';
    target.classList.toggle('vertical', !isProse);
    target.classList.toggle('prose', isProse);
    (poem.content || []).forEach(function (line) {
      var div = document.createElement('div');
      div.className = isProse ? 'prose-p' : 'line';
      div.textContent = line;
      target.appendChild(div);
    });
  }

  function renderTags(target, poem) {
    target.innerHTML = '';
    (poem.tags || []).forEach(function (t) {
      var span = document.createElement('span');
      span.className = 'tag';
      span.textContent = t;
      target.appendChild(span);
    });
  }

  // 生成一枚小标签（用于体裁/主旨/适用场景）
  function makeChip(text, cls) {
    var span = document.createElement('span');
    span.className = 'chip ' + (cls || '');
    span.textContent = text;
    return span;
  }

  function renderPoem(poem) {
    // 切换诗词时停止正在进行的朗读
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    var readBtn0 = $('#btn-read');
    if (readBtn0) { readBtn0.textContent = '🔊 朗读'; readBtn0.classList.remove('reading'); }
    current = poem;
    isTodayMode = false;
    $('#today-title').textContent = poem.title;
    $('#today-dynasty').textContent = poem.dynasty || '';
    var authEl = $('#today-author');
    authEl.textContent = poem.author || '佚名';
    authEl.classList.toggle('has-author', !!(AUTHORS && AUTHORS[poem.author]));
    authEl.onclick = function () {
      if (AUTHORS && AUTHORS[poem.author]) openAuthor(poem.author);
    };
    renderContent($('#today-content'), poem);
    renderTags($('#today-tags'), poem);

    // 多维解读：体裁 / 主旨 / 背景 / 译文 / 注释 / 赏析 / 意境 / 名句 / 场景 / 用法
    var extra = $('#today-extra');
    function show(blockId, on) { var b = $('#' + blockId); if (b) (on ? b.classList.remove('hidden') : b.classList.add('hidden')); }

    // 顶部元信息：体裁 + 主旨
    var meta = $('#today-extra-meta');
    meta.innerHTML = '';
    if (poem.form) meta.appendChild(makeChip(poem.form, 'chip-form'));
    if (poem.theme) meta.appendChild(makeChip(poem.theme, 'chip-theme'));
    show('today-extra-meta', !!(poem.form || poem.theme));

    // 词牌详解（仅词）
    var cipaiBox = $('#today-cipai');
    if (poem.cipai && poem.cipai.name) {
      cipaiBox.innerHTML = '';
      var c = poem.cipai;
      var head = document.createElement('div');
      head.className = 'cipai-head';
      head.innerHTML = '<span class="cipai-name">' + escapeHtml(c.name) + '</span>' +
        '<span class="chip chip-form">' + escapeHtml(c.category || '') + '</span>' +
        '<span class="chip chip-theme">' + escapeHtml(c.tone || '') + '</span>' +
        (c.chars ? '<span class="chip chip-use">' + c.chars + '字</span>' : '');
      cipaiBox.appendChild(head);
      var rows = [
        ['别名', c.aka], ['格律', c.rhythm], ['起源', c.origin],
        ['风格', c.style], ['代表作', c.represent]
      ];
      rows.forEach(function (r) {
        if (!r[1]) return;
        var dl = document.createElement('div');
        dl.className = 'cipai-row';
        dl.innerHTML = '<span class="cipai-key">' + r[0] + '</span><span class="cipai-val">' + escapeHtml(r[1]) + '</span>';
        cipaiBox.appendChild(dl);
      });
      show('today-cipai-block', true);
    } else show('today-cipai-block', false);

    if (poem.background) { $('#today-bg').textContent = poem.background; show('today-bg-block', true); } else show('today-bg-block', false);
    if (poem.translation) { $('#today-trans').textContent = poem.translation; show('today-trans-block', true); } else show('today-trans-block', false);
    if (poem.enTranslation) { $('#today-en').textContent = poem.enTranslation; show('today-en-block', true); } else show('today-en-block', false);
    if (poem.note) { $('#today-note').textContent = poem.note; show('today-note-block', true); } else show('today-note-block', false);

    // 化用 · 典故来源
    var alluList = $('#today-allu');
    alluList.innerHTML = '';
    if (poem.allusions && poem.allusions.length) {
      poem.allusions.forEach(function (a) {
        if (!a || !a.phrase) return;
        var li = document.createElement('li');
        var ph = document.createElement('div');
        ph.className = 'allu-phrase';
        ph.textContent = a.phrase + (a.source ? '　·　' + a.source : '');
        var ex = document.createElement('div');
        ex.className = 'allu-explain';
        ex.textContent = a.explain || '';
        li.appendChild(ph); li.appendChild(ex);
        alluList.appendChild(li);
      });
      show('today-allu-block', true);
    } else show('today-allu-block', false);

    if (poem.appreciation) { $('#today-appr').textContent = poem.appreciation; show('today-appr-block', true); } else show('today-appr-block', false);

    // 历代评价
    var critList = $('#today-crit');
    critList.innerHTML = '';
    if (poem.criticism && poem.criticism.length) {
      poem.criticism.forEach(function (c2) {
        if (!c2 || !c2.comment) return;
        var li = document.createElement('li');
        var src = document.createElement('span');
        src.className = 'crit-source';
        src.textContent = c2.source || '评';
        var cm = document.createElement('span');
        cm.className = 'crit-comment';
        cm.textContent = c2.comment;
        li.appendChild(src); li.appendChild(cm);
        critList.appendChild(li);
      });
      show('today-crit-block', true);
    } else show('today-crit-block', false);

    if (poem.mood) { $('#today-mood').textContent = poem.mood; show('today-mood-block', true); } else show('today-mood-block', false);

    // 名句赏析（列表）
    var famList = $('#today-fam');
    famList.innerHTML = '';
    if (poem.famousLines && poem.famousLines.length) {
      poem.famousLines.forEach(function (f) {
        if (!f || !f.line) return;
        var li = document.createElement('li');
        var line = document.createElement('div');
        line.className = 'fam-line';
        line.textContent = f.line;
        var c = document.createElement('div');
        c.className = 'fam-comment';
        c.textContent = f.comment || '';
        li.appendChild(line); li.appendChild(c);
        famList.appendChild(li);
      });
      show('today-fam-block', true);
    } else show('today-fam-block', false);

    // 适用场景（标签）
    var useRow = $('#today-use');
    useRow.innerHTML = '';
    if (poem.usage && poem.usage.length) {
      poem.usage.forEach(function (u) { if (u) useRow.appendChild(makeChip(u, 'chip-use')); });
      show('today-use-block', true);
    } else show('today-use-block', false);

    if (poem.howToUse) { $('#today-how').textContent = poem.howToUse; show('today-how-block', true); } else show('today-how-block', false);

    if (!poem.background && !poem.translation && !poem.note && !poem.appreciation &&
        !poem.mood && !poem.howToUse && !(poem.famousLines && poem.famousLines.length) &&
        !(poem.usage && poem.usage.length)) extra.classList.add('hidden');

    // 收藏按钮状态
    var favBtn = $('#btn-fav');
    if (isFaved(poem.id)) { favBtn.textContent = '★ 已收藏'; favBtn.classList.add('faved'); }
    else { favBtn.textContent = '☆ 收藏'; favBtn.classList.remove('faved'); }

    // 卡片印章：取作者最后一字 / 标题首字
    $('#card-seal').textContent = (poem.title || '诗').slice(0, 1);

    // 默认收起注释/赏析，由「注·赏」按钮展开
    $('#today-extra').classList.add('hidden');
  }

  /* ---------- Toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 1800);
  }

  /* ---------- 诗库 / 收藏 / 历史 卡片列表 ---------- */
  function makeItem(poem, onClick) {
    var item = document.createElement('div');
    item.className = 'poem-item';
    var fav = isFaved(poem.id);
    var type = poem.type || 'poem';
    var typeLabel = type === 'prose' ? '散文' : '诗词';
    var stageLabel = type === 'prose' ? '散文' : (poem.stage || '其他');
    var authorHas = !!(AUTHORS && AUTHORS[poem.author]);
    var meta =
      '<span class="pi-type type-' + type + '">' + typeLabel + '</span>' +
      escapeHtml(poem.dynasty || '') + ' · ' +
      '<span class="pi-author' + (authorHas ? ' link' : '') + '"' + (authorHas ? ' data-author="' + escapeHtml(poem.author) + '"' : '') + '>' + escapeHtml(poem.author || '佚名') + '</span>' +
      ' · <span class="pi-stage">' + stageLabel + '</span>';
    item.innerHTML =
      '<div class="pi-title">' + escapeHtml(poem.title) + '</div>' +
      '<div class="pi-meta">' + meta + '</div>' +
      '<div class="pi-content">' + escapeHtml((poem.content || []).join('')) + '</div>' +
      '<button class="pi-fav" title="收藏/取消">' + (fav ? '★' : '☆') + '</button>';
    // 作者可点 -> 作者视图
    var authSpan = item.querySelector('.pi-author.link');
    if (authSpan) authSpan.addEventListener('click', function (e) {
      e.stopPropagation();
      openAuthor(authSpan.dataset.author);
    });
    item.addEventListener('click', function (e) {
      if (e.target.classList.contains('pi-fav')) {
        e.stopPropagation();
        toggleFav(poem.id);
        e.target.textContent = isFaved(poem.id) ? '★' : '☆';
        return;
      }
      onClick(poem);
    });
    return item;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderLibrary() {
    var grid = $('#results-grid');
    grid.innerHTML = '';
    var q = libFilter.q.trim().toLowerCase();
    var list = POEMS.filter(function (p) {
      if (libFilter.dynasty !== '全部' && p.dynasty !== libFilter.dynasty) return false;
      if (libFilter.stage !== '全部' && (p.stage || '其他') !== libFilter.stage) return false;
      if (libFilter.type !== '全部' && (p.type || 'poem') !== libFilter.type) return false;
      if (q) {
        var hay = (p.title + ' ' + p.author + ' ' + (p.content || []).join('') + ' ' + (p.tags || []).join(' ') + ' ' + (AUTHORS && AUTHORS[p.author] ? AUTHORS[p.author].alias : '')).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    $('#result-count').textContent = '共 ' + list.length + ' 首/篇';
    if (!list.length) {
      grid.innerHTML = '<p class="empty-tip">没有匹配的诗词，换个关键词试试。</p>';
      return;
    }
    list.forEach(function (p) {
      grid.appendChild(makeItem(p, function (poem) {
        switchView('today');
        renderPoem(poem);
      }));
    });
  }

  function renderFavorites() {
    var grid = $('#favorites-grid');
    grid.innerHTML = '';
    var favs = getFavs();
    var list = POEMS.filter(function (p) { return favs.indexOf(p.id) >= 0; });
    $('#fav-empty').classList.toggle('hidden', list.length > 0);
    list.forEach(function (p) {
      grid.appendChild(makeItem(p, function (poem) {
        switchView('today');
        renderPoem(poem);
      }));
    });
  }

  function renderHistory() {
    var grid = $('#history-grid');
    grid.innerHTML = '';
    var today = new Date();
    for (var i = 0; i < 14; i++) {
      var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      var idx = pickIndex(POEMS.length, d);
      var poem = POEMS[idx];
      var item = makeItem(poem, function (poem2) {
        switchView('today');
        renderPoem(poem2);
      });
      // 顶部加日期标注
      var label = document.createElement('div');
      label.style.cssText = 'font-size:12px;color:var(--ink-faint);margin-bottom:2px;letter-spacing:.05em;';
      label.textContent = i === 0 ? '今天 · ' + fmtDate(d) : fmtDate(d);
      item.insertBefore(label, item.firstChild);
      grid.appendChild(item);
    }
  }

  /* ---------- 词牌分类视图 ---------- */
  function initCipaiView() {
    $all('#cipai-tabs .tab').forEach(function (t) {
      t.addEventListener('click', function () {
        $all('#cipai-tabs .tab').forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active');
        cipaiMode = t.dataset.mode || 'length';
        renderCipaiGroups();
      });
    });
  }

  function renderCipai() {
    var host = $('#cipai-groups');
    if (CIPAI) { renderCipaiGroups(); return; }
    host.innerHTML = '<p class="empty-tip">正在载入词牌数据…</p>';
    fetch('data/cipai.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) { CIPAI = data; renderCipaiGroups(); })
      .catch(function (err) {
        host.innerHTML = '<p class="empty-tip">词牌数据加载失败：' + escapeHtml(err.message) + '</p>';
      });
  }

  function renderCipaiGroups() {
    var host = $('#cipai-groups');
    if (!CIPAI) return;
    host.innerHTML = '';
    var groups = cipaiMode === 'tone' ? CIPAI.classify.byTone : CIPAI.classify.byLength;
    // 分组顺序
    var order = cipaiMode === 'tone'
      ? ['婉约', '豪放', '兼备']
      : ['小令', '中调', '长调'];
    var subtitle = cipaiMode === 'tone'
      ? { '婉约': '声情缠绵、细腻含蓄', '豪放': '气象开阔、慷慨纵横', '兼备': '刚柔并济、亦婉亦豪' }
      : { '小令': '≤ 58 字，短小精炼', '中调': '59–90 字，舒展有致', '长调': '≥ 91 字，铺陈开阖' };
    order.forEach(function (gname) {
      var names = groups[gname] || [];
      if (!names.length) return;
      var section = document.createElement('div');
      section.className = 'cipai-group';
      var h = document.createElement('div');
      h.className = 'cipai-group-head';
      h.innerHTML = '<span class="cipai-group-name">' + escapeHtml(gname) + '</span>' +
        '<span class="cipai-group-sub">' + escapeHtml(subtitle[gname] || '') + '</span>' +
        '<span class="cipai-group-count">' + names.length + ' 调</span>';
      section.appendChild(h);
      var grid = document.createElement('div');
      grid.className = 'cipai-grid';
      names.forEach(function (nm) {
        var d = CIPAI.dict[nm];
        if (!d) return;
        var used = (CIPAI.usedCount && CIPAI.usedCount[nm]) || 0;
        var card = document.createElement('div');
        card.className = 'cipai-mini';
        card.innerHTML =
          '<div class="cipai-mini-head">' +
            '<span class="cipai-mini-name">' + escapeHtml(nm) + '</span>' +
            '<span class="chip chip-form">' + escapeHtml(d.category || '') + '</span>' +
            '<span class="chip chip-theme">' + escapeHtml(d.tone || '') + '</span>' +
            (d.chars ? '<span class="chip chip-use">' + d.chars + '字</span>' : '') +
            (used ? '<span class="cipai-used">本集 ' + used + ' 首</span>' : '') +
          '</div>' +
          (d.aka ? '<div class="cipai-mini-row"><b>别名</b>' + escapeHtml(d.aka) + '</div>' : '') +
          (d.rhythm ? '<div class="cipai-mini-row"><b>格律</b>' + escapeHtml(d.rhythm) + '</div>' : '') +
          (d.origin ? '<div class="cipai-mini-row"><b>起源</b>' + escapeHtml(d.origin) + '</div>' : '') +
          (d.style ? '<div class="cipai-mini-row"><b>声情</b>' + escapeHtml(d.style) + '</div>' : '') +
          (d.represent ? '<div class="cipai-mini-row"><b>代表作</b>' + escapeHtml(d.represent) + '</div>' : '');
        grid.appendChild(card);
      });
      section.appendChild(grid);
      host.appendChild(section);
    });
  }

  /* ---------- 作者视图 ---------- */
  function openAuthor(name) {
    switchView('authors');
    loadAuthors(function () { renderAuthorDetail(name); });
  }

  function loadAuthors(cb) {
    if (AUTHORS) { cb(); return; }
    fetch('data/authors.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) { AUTHORS = data; cb(); })
      .catch(function (err) { console.error('authors load fail', err); });
  }

  function renderAuthorIndex() {
    var host = $('#author-index');
    if (!AUTHORS) { host.innerHTML = '<p class="empty-tip">正在载入作者…</p>'; return; }
    host.innerHTML = '';
    Object.keys(AUTHORS).sort(function (a, b) { return AUTHORS[b].count - AUTHORS[a].count; })
      .forEach(function (name) {
        var d = AUTHORS[name];
        var chip = document.createElement('button');
        chip.className = 'author-chip';
        chip.innerHTML = escapeHtml(name) + ' <span class="author-chip-count">' + d.count + '</span>';
        chip.addEventListener('click', function () { renderAuthorDetail(name); });
        host.appendChild(chip);
      });
  }

  function renderAuthorDetail(name) {
    $('#author-index') && $('#author-index').classList.add('hidden');
    var host = $('#author-detail');
    if (!AUTHORS || !AUTHORS[name]) { host.classList.add('hidden'); return; }
    var d = AUTHORS[name];
    var works = POEMS.filter(function (p) { return p.author === name; });
    var worksHtml = works.map(function (p) {
      var t = (p.content || []).join('').slice(0, 22);
      return '<div class="author-work" data-id="' + escapeHtml(p.id) + '">' +
        '<div class="aw-title">' + escapeHtml(p.title) + '</div>' +
        '<div class="aw-content">' + escapeHtml(t) + (t.length >= 22 ? '…' : '') + '</div></div>';
    }).join('');
    host.innerHTML =
      '<button class="author-back" id="author-back">← 返回作者列表</button>' +
      '<div class="author-card">' +
        '<div class="author-seal">' + escapeHtml(name.slice(0, 1)) + '</div>' +
        '<div class="author-head"><h3>' + escapeHtml(name) + '</h3>' +
          (d.alias ? '<div class="author-alias">' + escapeHtml(d.alias) + '</div>' : '') + '</div>' +
        (d.life ? '<div class="author-meta"><span>生卒</span>' + escapeHtml(d.life) + '</div>' : '') +
        (d.birthplace ? '<div class="author-meta"><span>籍贯</span>' + escapeHtml(d.birthplace) + '</div>' : '') +
        (d.bio ? '<div class="author-bio">' + escapeHtml(d.bio) + '</div>' : '') +
        (d.style ? '<div class="author-style"><b>风格</b>' + escapeHtml(d.style) + '</div>' : '') +
        (d.rep && d.rep.length ? '<div class="author-rep"><b>代表作</b>' + d.rep.map(function (r) { return escapeHtml(r); }).join('、') + '</div>' : '') +
        (d.eval ? '<div class="author-eval"><b>历代评价</b>' + escapeHtml(d.eval) + '</div>' : '') +
        (works.length ? '<div class="author-works-title">本集作品（' + works.length + '）</div><div class="author-works">' + worksHtml + '</div>' : '') +
      '</div>';
    host.classList.remove('hidden');
    // 返回
    var back = $('#author-back');
    if (back) back.addEventListener('click', function () {
      host.classList.add('hidden');
      $('#author-index').classList.remove('hidden');
    });
    // 作品点击 -> 打开详情
    $all('#author-detail .author-work').forEach(function (w) {
      w.addEventListener('click', function () {
        var id = w.dataset.id;
        var poem = POEMS.filter(function (p) { return p.id === id; })[0];
        if (poem) { switchView('today'); renderPoem(poem); }
      });
    });
  }

  /* ---------- 视图切换 ---------- */
  function switchView(name) {
    $all('.nav-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.view === name); });
    $all('.view').forEach(function (v) { v.classList.remove('active'); });
    $('#view-' + name).classList.add('active');
    if (name === 'favorites') renderFavorites();
    if (name === 'history') renderHistory();
    if (name === 'library') renderLibrary();
    if (name === 'cipai') renderCipai();
    if (name === 'authors') {
      $('#author-detail').classList.add('hidden');
      $('#author-index').classList.remove('hidden');
      loadAuthors(renderAuthorIndex);
    }
    if (name === 'today' && isTodayMode === false) {
      // 回到今日：恢复确定性今日诗
      // 不强制重置，仅保证按钮高亮；用户点「今日」想看今天
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- 初始化 ---------- */
  function init() {
    // 日期栏
    var now = new Date();
    $('#solar-date').textContent = fmtDate(now);
    $('#lunar-date').textContent = lunarString(now);
    $('#weekday').textContent = WEEK[now.getDay()];

    // 今日诗词（确定性）
    var idx = pickIndex(POEMS.length, now);
    var todays = POEMS[idx];
    isTodayMode = true;
    renderPoem(todays);

    // 收藏徽标
    $('#fav-count').textContent = getFavs().length;
    $('#total-count').textContent = POEMS.length;

    // 导航
    $all('.nav-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.dataset.view;
        if (v === 'today') {
          // 回到今日确定性诗
          isTodayMode = true;
          renderPoem(POEMS[pickIndex(POEMS.length, new Date())]);
        }
        switchView(v);
      });
    });

    // 换一首（随机，不同于当前）
    $('#btn-change').addEventListener('click', function () {
      if (POEMS.length < 2) return;
      var r;
      do { r = Math.floor(Math.random() * POEMS.length); } while (POEMS[r].id === (current && current.id));
      isTodayMode = false;
      renderPoem(POEMS[r]);
    });

    // 朗读（浏览器语音合成 Web Speech API）
    var readBtn = $('#btn-read');
    if (readBtn) {
      if (!('speechSynthesis' in window)) {
        readBtn.disabled = true;
        readBtn.title = '当前浏览器不支持语音合成';
      }
      readBtn.addEventListener('click', function () {
        if (!('speechSynthesis' in window) || !current) return;
        var synth = window.speechSynthesis;
        // 再次点击 = 停止
        if (synth.speaking || synth.pending) {
          synth.cancel();
          readBtn.textContent = '🔊 朗读';
          readBtn.classList.remove('reading');
          return;
        }
        var text = (current.title || '') + '。' +
          (current.dynasty || '') + '，' + (current.author || '佚名') + '。' +
          (current.content || []).join('，');
        var u = new SpeechSynthesisUtterance(text);
        u.lang = 'zh-CN';
        u.rate = 0.85;   // 稍慢，适合吟诵
        u.pitch = 1;
        // 尽量挑选中文嗓音
        var voices = synth.getVoices();
        var zh = voices.filter(function (v) { return /zh|Chinese|中文|普通话/i.test(v.lang + ' ' + v.name); });
        if (zh.length) u.voice = zh[0];
        u.onend = function () { readBtn.textContent = '🔊 朗读'; readBtn.classList.remove('reading'); };
        u.onerror = function () { readBtn.textContent = '🔊 朗读'; readBtn.classList.remove('reading'); };
        readBtn.textContent = '■ 停止';
        readBtn.classList.add('reading');
        synth.speak(u);
      });
      // 某些浏览器需异步加载语音表
      if ('speechSynthesis' in window && typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = function () {};
      }
    }

    // 切走页面 / 切换诗时停止朗读
    window.addEventListener('beforeunload', function () {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    });

    // 词牌分类视图
    initCipaiView();

    // 收藏
    $('#btn-fav').addEventListener('click', function () {
      if (!current) return;
      var added = toggleFav(current.id);
      if (added) { this.textContent = '★ 已收藏'; this.classList.add('faved'); toast('已收藏'); }
      else { this.textContent = '☆ 收藏'; this.classList.remove('faved'); toast('已取消收藏'); }
      renderFavorites();
      renderLibrary();
    });

    // 复制全文
    $('#btn-copy').addEventListener('click', function () {
      if (!current) return;
      var text = current.title + '\n' + (current.dynasty || '') + '·' + (current.author || '佚名') + '\n' +
        (current.content || []).join('\n') + '\n—— 每日诗词';
      copyText(text).then(function () { toast('已复制全文'); }).catch(function () { toast('复制失败'); });
    });

    // 分享
    $('#btn-share').addEventListener('click', function () {
      if (!current) return;
      var text = current.title + '（' + (current.dynasty || '') + '·' + (current.author || '佚名') + '）\n' +
        (current.content || []).join('\n') + '\n—— 每日诗词';
      if (navigator.share) {
        navigator.share({ title: current.title, text: text }).catch(function () {});
      } else {
        copyText(text).then(function () { toast('分享文案已复制'); }).catch(function () { toast('复制失败'); });
      }
    });

    // 注释 / 赏析 展开
    $('#btn-note').addEventListener('click', function () {
      $('#today-extra').classList.toggle('hidden');
    });

    // 朝代 Tab
    $all('#dynasty-tabs .tab').forEach(function (t) {
      t.addEventListener('click', function () {
        $all('#dynasty-tabs .tab').forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active');
        libFilter.dynasty = t.dataset.dynasty;
        renderLibrary();
      });
    });

    // 学段 Tab
    $all('#stage-tabs .tab').forEach(function (t) {
      t.addEventListener('click', function () {
        $all('#stage-tabs .tab').forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active');
        libFilter.stage = t.dataset.stage;
        renderLibrary();
      });
    });

    // 类型 Tab
    $all('#type-tabs .tab').forEach(function (t) {
      t.addEventListener('click', function () {
        $all('#type-tabs .tab').forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active');
        libFilter.type = t.dataset.type;
        renderLibrary();
      });
    });

    // 搜索
    var searchInput = $('#search-input');
    var t;
    searchInput.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        libFilter.q = searchInput.value;
        renderLibrary();
      }, 150);
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.top = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        resolve();
      } catch (e) { reject(e); }
    });
  }

  /* ---------- 启动：加载数据 ---------- */
  function boot() {
    fetch('data/poems.json', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        POEMS = data;
        init();
      })
      .catch(function (err) {
        // 友好提示：本地直接打开 file:// 会触发此分支
        document.querySelector('.today-card').innerHTML =
          '<div class="poem-head"><h2 class="poem-title">数据加载失败</h2></div>' +
          '<p class="today-hint">请通过本地服务器访问（例如 <code>python3 -m http.server</code>），' +
          '或将本页部署到 GitHub Pages。错误：' + escapeHtml(err.message) + '</p>';
        console.error(err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
