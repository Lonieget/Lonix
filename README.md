# 聊天室 App

React + Vite + Supabase 多人即時聊天室

## 功能
- 即時多人聊天（WebSocket）
- 多頻道支援
- 使用者驗證（Email/Password）
- 訊息歷史記錄（PostgreSQL）
- Markdown 格式顯示
- 表情符號支援
- 在線狀態顯示（Presence）
- 深色模式自動切換
- 新增自訂頻道

---

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 建立 Supabase 專案

1. 前往 [https://supabase.com](https://supabase.com) 建立免費帳號
2. 建立新專案
3. 進入 **SQL Editor**，貼上並執行 `supabase-schema.sql` 的全部內容
4. 進入 **Project Settings > API**，複製：
   - `Project URL`
   - `anon public` key

### 3. 設定環境變數

```bash
cp .env.example .env
```

編輯 `.env`：
```
VITE_SUPABASE_URL=https://你的專案id.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon-key
```

### 4. 啟用 Realtime

在 Supabase Dashboard：
- 進入 **Database > Replication**
- 確認 `messages` 和 `profiles` 表已加入 `supabase_realtime` publication
（`supabase-schema.sql` 最後幾行已包含此指令，執行後應自動完成）

### 5. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:5173](http://localhost:5173)

---

## 部署（Vercel）

```bash
npm install -g vercel
vercel
```

設定環境變數：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 技術架構

| 層級 | 技術 |
|------|------|
| 前端框架 | React 18 + Vite |
| 樣式 | CSS Variables（原生，無框架） |
| 資料庫 | Supabase PostgreSQL |
| 即時連線 | Supabase Realtime（WebSocket） |
| 驗證 | Supabase Auth |
| Markdown | react-markdown + remark-gfm |
| 時間 | date-fns |

---

## 檔案結構

```
src/
├── lib/
│   └── supabase.js          # Supabase 客戶端
├── hooks/
│   ├── useAuth.js           # 驗證 hook
│   ├── useMessages.js       # 訊息 + 即時訂閱
│   ├── useChannels.js       # 頻道管理
│   └── useOnlineUsers.js    # 在線狀態
├── components/
│   ├── MessageItem.jsx      # 訊息元件（含頭像、Markdown）
│   ├── MessageInput.jsx     # 輸入框（含表情符號、Markdown 工具列）
│   └── Sidebar.jsx          # 側邊欄（頻道、在線成員）
├── pages/
│   ├── AuthPage.jsx         # 登入 / 註冊
│   └── ChatPage.jsx         # 主聊天介面
├── App.jsx                  # 根元件
└── main.jsx                 # 入口 + 全域樣式
```
