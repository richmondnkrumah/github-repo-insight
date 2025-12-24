import { Actor } from 'apify';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

interface Input {
    repoUrl: string;
    geminiApiKey: string;
}
await Actor.init();

Actor.main(async () => {
    // 1. Get Input
    const input = await Actor.getInput<Input>();
    if (!input?.repoUrl) throw new Error('Input "repoUrl" is required');
    if (!input?.geminiApiKey) throw new Error('Input "geminiApiKey" is required');

    const { repoUrl, geminiApiKey } = input;
    
    // 2. Load Dev-Side Token (Required for Rate Limits)
    const githubToken = process.env.GITHUB_TOKEN_SECRET;
    if (!githubToken) {
        console.warn("WARNING: 'GITHUB_TOKEN_SECRET' environment variable is missing. Rate limits will be strict (60/hr).");
    }

    // 3. Parse URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) throw new Error('Invalid GitHub URL');
    const [_, owner, repo] = match;

    console.log(`🚀 Starting analysis for: ${owner}/${repo}`);

    const config = {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            ...(githubToken && { 'Authorization': `token ${githubToken}` })
        },
        validateStatus: (status: number) => status < 500
    };

    const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;

    try {
        // 4. Retrieve Data (Parallel Requests)
        console.log("... Fetching Repo Data, Languages, Tree, Readme, Package.json");
        
        const [repoRes, langRes, readmeRes, treeRes, pkgRes] = await Promise.all([
            // Metadata
            axios.get(baseUrl, config),
            // Languages
            axios.get(`${baseUrl}/languages`, config),
            // Readme
            axios.get(`${baseUrl}/readme`, config),
            // Git Tree (Recursive) - The Skeleton
            axios.get(`${baseUrl}/git/trees/main?recursive=1`, config).catch(() => 
                axios.get(`${baseUrl}/git/trees/master?recursive=1`, config)
            ),
            // Package.json (Direct content fetch)
            axios.get(`${baseUrl}/contents/package.json`, config)
        ]);

        if (repoRes.status === 404) throw new Error(`Repository not found (or private). This tool only works with Public Repos.`);

        // 5. Process Raw Data
        
        // A. File Tree
        let treeStructure: string[] = [];
        if (treeRes?.data?.tree) {
            // We take paths, filter out images/locks, and limit to 500 files to keep payload reasonable
            treeStructure = treeRes.data.tree
                .filter((f: any) => f.type === 'blob' && !f.path.match(/\.(png|jpg|jpeg|svg|ico|lockb|lock)$/))
                .map((f: any) => f.path);
        }

        // B. Readme Content
        let readmeContent = "";
        if (readmeRes.status === 200 && readmeRes.data.content) {
            readmeContent = Buffer.from(readmeRes.data.content, 'base64').toString('utf-8');
        }

        // C. Package.json Content
        let pkgContent = "";
        if (pkgRes.status === 200 && pkgRes.data.content) {
            pkgContent = Buffer.from(pkgRes.data.content, 'base64').toString('utf-8');
        }

        // 6. AI ANALYSIS (The Core Value)
        console.log("... Sending to Gemini for Analysis");
        
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: " gemini-2.5-flash-lite" });

        const prompt = `
You are a Technical Documentation Specialist. Analyze this GitHub repository data.

DATA PROVIDED:
1. PACKAGE.JSON CONTENT:
${pkgContent ? pkgContent.slice(0, 5000) : "Not found"}

2. README CONTENT (Truncated):
${readmeContent.slice(0, 15000)}

3. FILE STRUCTURE (First 200 files):
${treeStructure.slice(0, 200).join('\n')}

---
YOUR TASK:
Produce a JSON response with exactly these two fields:
1. "dependency_summary": Analyze the package.json. List the core Frameworks, Libraries, and Tools used. Do not list version numbers, just the names and what they do (e.g. "React: UI Library").
2. "high_level_overview": Summarize the README. Explain what this project DOES, who it is for, and its main features in simple English. 

Output strictly valid JSON.
        `;

        const result = await model.generateContent(prompt);
        const aiText = result.response.text();
        
        // Clean up AI output to ensure it's valid JSON (sometimes they add markdown blocks)
        const cleanedJson = aiText.replace(/```json|```/g, '').trim();
        let aiData = { dependency_summary: "AI Parsing Failed", high_level_overview: "AI Parsing Failed" };
        
        try {
            aiData = JSON.parse(cleanedJson);
        } catch (e) {
            console.error("Failed to parse AI JSON response", e);
            aiData["high_level_overview"] = aiText; // Fallback to raw text
        }

        // 7. Output Final Dataset
        await Actor.pushData({
            repo: `${owner}/${repo}`,
            description: repoRes.data.description,
            stars: repoRes.data.stargazers_count,
            languages: langRes.data, // Returns object like { TypeScript: 12000, HTML: 500 }
            ai_dependency_analysis: aiData.dependency_summary,
            ai_readme_summary: aiData.high_level_overview,
            file_tree: treeStructure // The full list for the user
        });

        console.log("✅ Success! Data pushed to dataset.");

    } catch (error: any) {
        console.error("Fatal Error:", error.message);
        throw error;
    }
});