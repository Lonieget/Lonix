import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const style = document.createElement('style')
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #ffffff;
    --surface:  #f8f8f7;
    --sidebar:  #f4f4f2;
    --hover:    #f0f0ee;
    --active:   #e9e9e7;
    --border:   #e2e2df;
    --text:     #1a1a18;
    --muted:    #878783;
    --accent:   #e8e8e5;
    --code-bg:  #f4f4f2;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg:       #1a1a18;
      --surface:  #222220;
      --sidebar:  #1e1e1c;
      --hover:    #2a2a28;
      --active:   #2e2e2c;
      --border:   #2e2e2c;
      --text:     #e8e8e4;
      --muted:    #7a7a76;
      --accent:   #2e2e2c;
      --code-bg:  #252523;
    }
  }

  html, body, #root {
    height: 100%;
    font-family: 'DM Sans', -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--muted); }

  input, textarea, button { font-family: inherit; }

  input:focus, textarea:focus {
    border-color: var(--muted) !important;
    outline: none;
  }

  a { color: inherit; }

  /* Markdown styles */
  .markdown-body h1, .markdown-body h2, .markdown-body h3 {
    font-weight: 500; margin: 8px 0 4px; color: var(--text);
  }
  .markdown-body ul, .markdown-body ol {
    padding-left: 20px; margin: 4px 0;
  }
  .markdown-body blockquote {
    border-left: 3px solid var(--border);
    padding-left: 12px; color: var(--muted); margin: 6px 0;
  }
  .markdown-body table {
    border-collapse: collapse; font-size: 13px; margin: 6px 0;
  }
  .markdown-body th, .markdown-body td {
    border: 1px solid var(--border); padding: 5px 10px;
  }
  .markdown-body th { background: var(--surface); font-weight: 500; }
`
document.head.appendChild(style)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
