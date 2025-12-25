# 🧠 Smart Repo Insight (AI Architect)

**Instantly understand any GitHub repository. Don't read code line-by-line, let AI explain the architecture to you.**

---

## 📖 What is Smart Repo Insight?
Onboarding onto a new codebase is the hardest part of software engineering. **Smart Repo Insight** automates the discovery phase. It scans a public GitHub repository, bypasses the complexity of reading thousands of files, and uses **Google Gemini AI** to generate a high-level architectural summary.

It answers the questions:
* "What is the tech stack?"
* "Where is the business logic?"
* "How do the components connect?"

## ✨ What can this Actor do?
* **Tech Stack Detection:** AI identifies frameworks, libraries, databases, and build tools automatically.
* **Architecture Analysis:** Explains if the project is a Monorepo, MVC, Microservice, etc.
* **Purpose Summarization:** Reads the README and Package.json to explain *why* the project exists.
* **File Tree Mapping:** Extracts the full file structure (up to 100k files) using the Git Tree API.
* **Complexity Scoring:** Rates the repository complexity on a scale of 1-10.

## 🚀 How to use
1.  **Get a Key:** Get a free API key from [Google AI Studio](https://aistudio.google.com/). It takes 10 seconds.
2.  **Input:** Paste the URL of any public GitHub repository (e.g., `https://github.com/facebook/react`) and your API Key.
3.  **Run:** Click Start. In ~15 seconds, you will have a full briefing.

## 💰 Pricing
**Is this free?**
Yes. This Actor is free to run on the Apify Platform.

**Why is the API Key required?**
To ensure the tool is **scalable** and **never crashes**, we require users to bring their own free Gemini Key. This guarantees that:
1.  You never hit a "Rate Limit" caused by other users.
2.  Your analysis is private to your specific run.
3.  The tool remains free forever.

## 📥 Input Example


```json
{
  "repoUrl": "[https://github.com/facebook/react](https://github.com/facebook/react)",
  "geminiApiKey": "AIzaSy..."
}