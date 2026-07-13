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
  var libFilter = { dynasty: '全部', q: '' };

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
    (poem.content || []).forEach(function (line) {
      var div = document.createElement('div');
      div.className = 'line';
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
    current = poem;
    isTodayMode = false;
    $('#today-title').textContent = poem.title;
    $('#today-dynasty').textContent = poem.dynasty || '';
    $('#today-author').textContent = poem.author || '佚名';
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

    if (poem.background) { $('#today-bg').textContent = poem.background; show('today-bg-block', true); } else show('today-bg-block', false);
    if (poem.translation) { $('#today-trans').textContent = poem.translation; show('today-trans-block', true); } else show('today-trans-block', false);
    if (poem.note) { $('#today-note').textContent = poem.note; show('today-note-block', true); } else show('today-note-block', false);
    if (poem.appreciation) { $('#today-appr').textContent = poem.appreciation; show('today-appr-block', true); } else show('today-appr-block', false);
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
    item.innerHTML =
      '<div class="pi-title">' + escapeHtml(poem.title) + '</div>' +
      '<div class="pi-meta">' + escapeHtml(poem.dynasty || '') + ' · ' + escapeHtml(poem.author || '佚名') + '</div>' +
      '<div class="pi-content">' + escapeHtml((poem.content || []).join('')) + '</div>' +
      '<button class="pi-fav" title="收藏/取消">' + (fav ? '★' : '☆') + '</button>';
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
      if (q) {
        var hay = (p.title + ' ' + p.author + ' ' + (p.content || []).join('') + ' ' + (p.tags || []).join(' ')).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    $('#result-count').textContent = '共 ' + list.length + ' 首';
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

  /* ---------- 视图切换 ---------- */
  function switchView(name) {
    $all('.nav-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.view === name); });
    $all('.view').forEach(function (v) { v.classList.remove('active'); });
    $('#view-' + name).classList.add('active');
    if (name === 'favorites') renderFavorites();
    if (name === 'history') renderHistory();
    if (name === 'library') renderLibrary();
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
