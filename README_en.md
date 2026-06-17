# 🧠 Code Review Simulator — Audax

A web tool that simulates a senior engineer's code review, powered by AI. Paste any code snippet and get structured feedback on **correctness**, **efficiency**, **readability**, and **best practices** in seconds.

![status](https://img.shields.io/badge/status-active-brightgreen)
![license](https://img.shields.io/badge/license-MIT-blue)

## ✨ Demo

> Paste your code → pick the language → hit "Run review" → get a full analysis with scores, detected issues, and improvement suggestions.

## 🚀 Features

- **AI-powered review**: analysis generated dynamically from the input code, using a language model (Claude, via API).
- **Multi-language support**: JavaScript, Python, TypeScript, Java, C++, and Rust.
- **Visual scoring**: cards showing a 1–10 score across four key categories.
- **Categorized issue detection**: bugs, performance, style, security, and logic, each with its own color-coded tag.
- **Actionable suggestions** plus an overall review summary.
- **Light/dark mode** with `localStorage` persistence and an animated transition.
- **Built-in example snippets** (buggy JS, slow Python, untyped TS) to try the tool without writing your own code.
- **Glassmorphism design**: frosted-glass UI, animated background blobs, and Inter typography.
- **Fully responsive**, with a score grid that adapts to small screens.

## 🛠️ Tech stack

- **HTML5 / CSS3** — CSS variables for light/dark theming, `backdrop-filter` for the glass effect.
- **Vanilla JavaScript** — no frameworks or build dependencies.
- **Google Fonts (Inter)** for typography.
- **Backend API** (`/api/review`) acting as a proxy to the Claude (Anthropic) API to generate the code review as structured JSON.

## 📁 Project structure

```
.
├── index.html        # Entire project: markup, styles, and logic
└── README.md
```

This is a single-file project, designed to be simple to deploy and easy to read.

## ⚙️ Running it locally

This project needs a lightweight backend that exposes the `/api/review` endpoint and forwards the request to the Anthropic (Claude) API.

1. Clone the repository:
   ```bash
   git clone https://github.com/edyventturedev/code-review-simulator.git
   cd code-review-simulator
   ```
2. Set up an `/api/review` endpoint that accepts `{ model, max_tokens, system, messages }` and calls the Claude API using your own API key (for example, via a Vercel/Netlify serverless function or an Express server).
3. Set your `ANTHROPIC_API_KEY` as an environment variable on your backend.
4. Serve `index.html` with any static server (Live Server, `npx serve`, etc.).

> 💡 If you just want to showcase the design without connecting the AI, the frontend still works fine; the "Run review" button will simply show a connection error since the endpoint won't be found.

## 🎨 Customization

- Colors for each theme (light/dark) are centralized in CSS variables (`:root` and `[data-theme="dark"]`), so changing the palette is as simple as editing those variables.
- You can add more languages by editing the `EXT` object and adding a matching `.lang-btn` button.
- Example snippets are defined in the `SAMPLES` object inside the script.

## 👤 Author

**Eduardo Ventura**

- GitHub: [@edyventturedev](https://github.com/edyventturedev)
- LinkedIn: [Eduardo Ventura](https://www.linkedin.com/in/eduardo-ventura-44517a1b6/)

## 📄 License

This project is available under the MIT License. Feel free to use and adapt it.
