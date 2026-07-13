/* =========================================================
   scripts/pick-today.js
   可选：每天定时把「今日诗词」写进 data/manifest.json 快照。
   前端本身在前端按日期确定性选诗，不依赖此文件；
   此文件仅用于「历史回看」可扩展到真实线上快照、或做统计。
   用法：node scripts/pick-today.js
   依赖：Node 18+（使用内置 fetch / fs）
   ========================================================= */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');

// 与前端一致的确定性选诗算法
function ymdNum(d) {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}
function pickIndex(total, date) {
  let n = ymdNum(date);
  n = (n * 2654435761) % 4294967296;
  n = (n ^ (n >> 15)) >>> 0;
  return n % total;
}

function main() {
  const poemsPath = path.join(DATA, 'poems.json');
  if (!fs.existsSync(poemsPath)) {
    console.error('[pick-today] 未找到 data/poems.json，请先运行 node scripts/build-dataset.js');
    process.exit(1);
  }
  const poems = JSON.parse(fs.readFileSync(poemsPath, 'utf8'));
  const now = new Date();
  const idx = pickIndex(poems.length, now);
  const poem = poems[idx];

  const manifest = {
    date: ymdNum(now).toString(),
    isoDate: now.toISOString().slice(0, 10),
    index: idx,
    total: poems.length,
    poem: {
      id: poem.id,
      title: poem.title,
      dynasty: poem.dynasty,
      author: poem.author
    }
  };

  const outPath = path.join(DATA, 'manifest.json');
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log('[pick-today] 今日诗词已写入:', manifest.poem.title, '(' + manifest.poem.author + ')');
}

main();
