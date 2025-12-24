# 🧠 Smart Repo Insight (AI Architect)

**Stop reading code line-by-line. Let AI explain the architecture to you.**

This Actor turns any public GitHub repository into a comprehensive **Developer Briefing**. It doesn't just scrape files; it uses **Google Gemini AI** to analyze the tech stack, summarize the project's purpose, and map the file structure in seconds.

## 🚀 Why use this?
- **⚡ Instant Onboarding:** Understand a new repo in 30 seconds instead of 30 minutes.
- **🤖 AI-Powered Analysis:** Uses Gemini 1.5 Flash to read `package.json` and `README.md` to give you a "Senior Developer" summary.
- **📂 Full Context:** Extracts the entire file tree (without hitting GitHub timeouts) so you can see the project skeleton.
- **💰 Cheap & Fast:** Uses the GitHub API (efficient) + Gemini Flash (fast/cheap).

## 🛠 Features
| Feature | Description |
| :--- | :--- |
| **Tech Stack Detection** | AI identifies frameworks, libraries, and databases automatically. |
| **High-Level Summary** | A concise, human-readable explanation of what the project *actually* does. |
| **File Tree Extraction** | Maps up to 100,000 files using the Git Tree API (recursive). |
| **LLM Context Ready** | Generates a prompt you can copy-paste into ChatGPT/Claude to ask specific coding questions. |

## ⚙️ How to Setup (Required)

### 1. Get a Free Gemini API Key
To enable the AI analysis, you need a key from Google.
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click **Create API Key**.
3. Copy the key.

### 2. Run the Actor
In the Input tab:
- **Repo URL:** Paste the link to any public GitHub repository (e.g., `https://github.com/facebook/react`).
- **Gemini API Key:** Paste your key from step 1.

*(Note: Your API Key is processed securely and never stored or shared.)*

## 📦 Output Example
The Actor produces a clean JSON dataset suitable for automated workflows or AI Agents:

```json
{
  "repo": "facebook/react",
  "stars": 213000,
  "ai_readme_summary": "React is a JavaScript library for building user interfaces...",
  "ai_dependency_analysis": "Core: React, Scheduler. Build: Rollup. Test: Jest...",
  "file_tree": [
    "packages/react/index.js",
    "packages/react-dom/index.js",
    ...
  ]
}
⚠️ Limits & Privacy
Public Repos Only: This tool works best with open-source repositories.

Rate Limits: If you analyze huge repos rapidly, you may hit GitHub's unauthenticated rate limit. The Actor handles this gracefully by warning you, but for heavy usage, we recommend forking this actor and adding your own GitHub Token.

👨‍💻 For AI Agents (MCP)
This Actor is designed to be a "tool" for other AI agents. If you are building a coding assistant, you can call this Actor via API to get the "Context" of a repo before generating code fixes.

Built for the Apify $1M Challenge.


### 3. Final Step: `tsconfig.json`
Since we are building TypeScript in Docker, ensure you have a `tsconfig.json` in your root folder. If you don't have one, run `npx tsc --init` or create a file with this content:

```json
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "outDir": "dist",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true
    },
    "include": ["src/**/*"]
}

You are now ready to build and push!

1. npm install
2. npm run build (Test locally)
3. apify push (Deploy to cloud)