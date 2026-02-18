# DevLens AI — Developer Portfolio Intelligence Platform

AI-powered GitHub portfolio analysis engine that maps developer skills, scores code quality, and generates personalized career recommendations using LLM-powered evaluation.

**Tech Stack:** Next.js 14 · TypeScript · Groq AI (Llama 3.3 70B) · GitHub API · Recharts · Tailwind CSS · Vercel

---

## 🚀 Complete Setup Guide (VSCode → Live Demo)

### Prerequisites
- [Node.js 18+](https://nodejs.org/) installed
- [Git](https://git-scm.com/) installed  
- [VSCode](https://code.visualstudio.com/) installed
- A free [Groq API key](https://console.groq.com) (takes 30 seconds)
- A free [GitHub Personal Access Token](https://github.com/settings/tokens) (optional but recommended)
- A free [Vercel account](https://vercel.com) (for deployment)

---

### Step 1: Open in VSCode

If you downloaded/cloned this project:

```bash
# Navigate into the project folder
cd devlens-ai

# Open in VSCode
code .
```

### Step 2: Install Dependencies

Open the VSCode integrated terminal (`Ctrl+`` ` or `Cmd+`` `) and run:

```bash
npm install
```

### Step 3: Set Up Environment Variables

1. Copy the example env file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and add your keys:

   **Groq API Key (REQUIRED - free):**
   - Go to [https://console.groq.com](https://console.groq.com)
   - Sign up / log in
   - Go to "API Keys" → "Create API Key"
   - Copy the key and paste it as `GROQ_API_KEY`

   **GitHub Token (OPTIONAL but recommended):**
   - Go to [https://github.com/settings/tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Check `public_repo` scope only
   - Copy the token and paste it as `GITHUB_TOKEN`
   - *Without this, you're limited to 60 GitHub API requests/hour. With it: 5,000/hour.*

Your `.env.local` should look like:
```
GROQ_API_KEY=gsk_abc123your_actual_key_here
GITHUB_TOKEN=ghp_abc123your_actual_token_here
```

### Step 4: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.  
Try analyzing a GitHub username like `torvalds`, `sindresorhus`, or your own!

### Step 5: Test the Build

```bash
npm run build
```

Make sure it builds with no errors before deploying.

---

## 🌐 Deploy to Vercel (Free — Get Your Live Demo Link)

### Option A: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   - Follow the prompts (accept defaults for all questions)
   - When asked about environment variables or to link to an existing project, say No to create a new one

4. **Add environment variables:**
   ```bash
   vercel env add GROQ_API_KEY
   # Paste your Groq API key when prompted, select all environments

   vercel env add GITHUB_TOKEN
   # Paste your GitHub token when prompted, select all environments
   ```

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

6. **Your live URL will be printed** — something like `https://devlens-ai.vercel.app`

### Option B: Deploy via Vercel Dashboard (GUI)

1. **Push to GitHub first:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: DevLens AI"
   
   # Create a new repo on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/devlens-ai.git
   git branch -M main
   git push -u origin main
   ```

2. **Go to [vercel.com/new](https://vercel.com/new)**

3. **Import your GitHub repository** (`devlens-ai`)

4. **Add Environment Variables** before clicking Deploy:
   - `GROQ_API_KEY` → your Groq key
   - `GITHUB_TOKEN` → your GitHub token

5. **Click Deploy** — Vercel will build and deploy automatically

6. **Your live URL** will be shown on the dashboard (e.g., `https://devlens-ai.vercel.app`)

---

## 📝 Adding to Your Resume

Replace the Chinese Checkers project with:

```
DevLens AI – Developer Portfolio Intelligence Platform | Next.js, TypeScript, Groq AI, GitHub API | Live Demo
• Built AI-powered developer analytics platform that profiles GitHub portfolios by analyzing code 
  quality, contribution patterns, and tech stack depth across 50+ repositories; generates 
  comprehensive skill assessments with personalized career roadmaps in under 15 seconds.
• Designed interactive analysis dashboard with real-time skill radar charts, language distribution 
  visualizations, and AI-generated recommendations; deployed on Vercel with in-memory caching 
  achieving sub-200ms cached response times.
```

**Make "Live Demo" a hyperlink** to your deployed Vercel URL.

---

## Project Structure

```
devlens-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page with search
│   │   ├── layout.tsx                  # Root layout + metadata
│   │   ├── globals.css                 # Custom theme + animations
│   │   ├── analyze/[username]/
│   │   │   └── page.tsx                # Analysis dashboard (main results)
│   │   └── api/analyze/
│   │       └── route.ts                # Backend API: GitHub fetch + AI analysis
│   ├── components/
│   │   ├── SkillRadar.tsx              # Radar chart (Recharts)
│   │   ├── LanguageBar.tsx             # Language distribution bars
│   │   ├── RepoGrid.tsx                # Repository cards with quality scores
│   │   └── LoadingState.tsx            # Animated loading with progress phases
│   └── lib/
│       ├── types.ts                    # TypeScript interfaces
│       ├── github.ts                   # GitHub API client + data processing
│       └── ai.ts                       # Groq AI analysis pipeline
├── public/
├── Dockerfile                          # Container support
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
```

---

## Architecture

```
User Input (GitHub username)
       │
       ▼
┌─────────────────────┐
│   Next.js API Route  │
│   /api/analyze       │
├─────────────────────┤
│  1. Check cache      │──► In-memory cache (1hr TTL)
│  2. Fetch GitHub     │──► GitHub REST API (user + repos)
│  3. Compute stats    │──► Language distribution, metrics
│  4. AI Analysis      │──► Groq API (Llama 3.3 70B)
│  5. Score repos      │──► Quality heuristic engine
│  6. Cache + return   │
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│   React Dashboard    │
│   Interactive charts │
│   Skill radar        │
│   AI recommendations │
└─────────────────────┘
```

---

## License

MIT
