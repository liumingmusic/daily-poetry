# 每日诗词 · Daily Poetry

一个**纯静态、零构建、完全离线**的中国古诗词每日推荐网站。每天按日期确定性地推一首名篇，含标题、朝代、作者、全文与（可选）注释、赏析。无后端、无 API key、不依赖任何外部服务。

> 线上示例（部署后替换）：`https://<your-name>.github.io/daily-poetry/`

## 特性

- 📜 **每日一首**：同一天所有访客看到同一首诗，次日自动换新（按 `YYYYMMDD` 做确定性哈希选诗）。
- 🔄 **换一首**：随机浏览，随时切换。
- ⭐ **收藏**：基于 `localStorage`，刷新不丢。
- 📋 **复制 / 🔗 分享**：一键复制全文或用系统分享面板。
- 🔍 **检索**：按朝代（唐 / 宋 / 诗经 / 元 / 其他）筛选，支持标题 / 作者 / 正文 / 标签全文搜索。
- 📚 **收藏夹 / 🕑 历史回看**：回看往日「今日诗词」。
- 📅 **农历**：头部显示公历 + 农历（纯前端算法，1900–2100）。
- 📱 **移动端适配**：禁缩放、无横向溢出、正文 ≥16px、按钮触控 ≥44px；竖排（古典韵味）在手机端自动回退为横排。
- 🎨 **古典美学**：宣纸米白底、水墨边框、印泥红印章、衬线字体。

## 目录结构

```
daily-poetry/
├── index.html
├── assets/
│   ├── css/style.css
│   └── js/app.js
├── data/
│   ├── poems.json         # 内置离线诗词（核心数据集，147 首名篇）
│   └── manifest.json      # 可选：每日快照（由 Actions 写入）
├── scripts/
│   ├── build-dataset.js   # 重新生成 poems.json（含内置精选数组）
│   └── pick-today.js      # 可选：写当日快照
├── .github/workflows/pick.yml   # 可选：每日定时快照
├── package.json
├── .gitignore
└── README.md
```

## 本地运行

> 由于浏览器安全策略，`fetch('data/poems.json')` 需通过 HTTP 访问（直接双击 `index.html` 的 `file://` 会被拦截）。请用本地静态服务器：

```bash
cd daily-poetry
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080/
```

任意静态服务器均可（`npx serve`、VS Code Live Server 等）。

## 重新生成 / 扩充数据集

```bash
node scripts/build-dataset.js     # 读取脚本内置的精选数组，写出 data/poems.json
node scripts/pick-today.js        # 写当日快照到 data/manifest.json
```

`build-dataset.js` 内置 **147 首**经人工核校、简体中文的历代名篇（唐 88 / 宋 35 / 诗经 10 / 元 4 / 其他 10），开箱即用。

如需扩充：在 `build-dataset.js` 的 `rawPoems` 数组中按统一结构追加条目（`id` 唯一、`content` 为逐句数组），重新运行脚本即可。也可扩展脚本从本地 `chinese-poetry` 开源仓库合并数据（`CHINESE_POETRY_DIR` 环境变量）。

### 数据字段

```json
{
  "id": "tang-0001",
  "title": "静夜思",
  "dynasty": "唐",
  "author": "李白",
  "content": ["床前明月光，", "疑是地上霜。", "举头望明月，", "低头思故乡。"],
  "tags": ["思乡", "五言绝句"],
  "note": "可选：注释",
  "appreciation": "可选：赏析"
}
```

## 部署到 GitHub Pages

1. 在 GitHub 新建仓库（如 `daily-poetry`），推送本项目。
2. 仓库 **Settings → Pages → Build and deployment → Source：Deploy from a branch**，分支选 `main`、目录选 `/ (root)`。
3. 访问 `https://<your-name>.github.io/daily-poetry/`。

（可选）启用 `.github/workflows/pick.yml` 后，Actions 每天 UTC 22:00 自动把当日诗词写入 `data/manifest.json` 并提交，方便历史统计。

## 技术说明

- 无任何运行时依赖，未使用任何框架或构建工具。
- `app.js` 内置农历转换（1900–2100 通用表算法），无外部库。
- 今日诗词的确定性：`hash = (YYYYMMDD * 2654435761) mod 2^32`，再对诗词总数取模，保证可复现、跨设备一致。
- 完全离线：断网仍可浏览全部内置诗词。

## 许可

本站代码以 MIT 许可开源。内置诗词数据选自历代公开名篇，仅供学习与赏析。
