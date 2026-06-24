# CodeSense AI

> **AI-powered automated code review platform** — connects to your GitHub repositories and delivers instant, structured pull request analysis powered by the Gemini API.

---

## ✨ Features

### 🔐 Authentication
- **GitHub OAuth 2.0** via Passport.js — one-click sign-in with your GitHub account
- **JWT sessions** stored in Redis with configurable TTL for secure, stateless auth
- **HTTP-only cookies** to protect tokens from XSS attacks
- Protected routes on both the frontend and backend

### 🔗 Repository Management
- Browse all your GitHub repositories directly from the app
- **One-click connect/disconnect** — automatically registers or removes GitHub webhooks on your behalf
- Connected repositories are persisted in MongoDB; disconnecting preserves review history

### ⚙️ Automated PR Reviews (Webhook Pipeline)
- **GitHub Webhooks**: Receives `pull_request` events in real time via the `/webhook` route
- **HMAC verification** on raw request bodies to ensure payloads are genuinely from GitHub
- **BullMQ + Redis job queue**: Heavy AI review tasks are queued and processed asynchronously by a dedicated worker (`reviewWorker.js`) — the API stays snappy while reviews run in the background
- **Gemini API**: Generates structured, multi-dimensional code analysis with scoring and actionable feedback

### 📊 Dashboard & Reviews
- Overview of all past and in-progress PR reviews
- Drill down into individual reviews via the **Review Detail** page — see file-by-file feedback and scores
- **Real-time updates via Socket.io**: The dashboard receives live review completion events without polling

### 🖊️ Manual Code Review
- Paste any code snippet into the integrated **Monaco Editor** (the same editor powering VS Code)
- Trigger an on-demand AI review without needing a GitHub PR

### 🩺 Health Check
- `GET /api/health` — verifies MongoDB, Redis, Gemini API key, and GitHub token status in one request

---

## 🗂️ Project Structure

```
CodeSense-AI/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── pages/
│       │   ├── Landing.jsx          # Marketing / entry page
│       │   ├── Dashboard.jsx        # Review overview (real-time)
│       │   ├── ReviewDetail.jsx     # Single PR review breakdown
│       │   ├── ManualReview.jsx     # Monaco Editor + on-demand review
│       │   └── Repositories.jsx     # Connect / disconnect GitHub repos
│       ├── components/
│       │   └── ProtectedRoute.jsx   # Auth-gated route wrapper
│       ├── context/
│       │   └── AuthContext.jsx      # Global auth state
│       ├── hooks/                   # Custom React hooks
│       └── api/                     # Axios API layer
│
└── server/                  # Node.js + Express backend
    └── src/
        ├── routes/
        │   ├── authRoutes.js        # GitHub OAuth, /me, /logout
        │   ├── webhook.js           # GitHub PR event receiver
        │   ├── reviews.js           # Review fetch endpoints
        │   ├── manual.js            # Manual review trigger
        │   └── repoRoutes.js        # Repo connect/disconnect
        ├── workers/
        │   └── reviewWorker.js      # BullMQ worker — runs AI reviews
        ├── queues/                  # BullMQ queue definitions
        ├── services/                # GitHub API service (webhooks, repos)
        ├── controllers/             # Route handler logic
        ├── models/                  # Mongoose schemas (User, Repo, Review)
        ├── middleware/
        │   └── authMiddleware.js    # JWT verification middleware
        ├── socket/
        │   └── socketManager.js     # Socket.io setup & event emitters
        ├── prompt/                  # Gemini prompt templates
        ├── config/                  # DB, Redis, Passport, env config
        └── utils/                   # JWT helpers, misc utilities
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, TailwindCSS 4, React Router 7 |
| **Editor** | Monaco Editor (`@monaco-editor/react`) |
| **HTTP Client** | Axios |
| **Real-time** | Socket.io (client + server) |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB (Mongoose) |
| **Cache / Queue** | Redis (ioredis), BullMQ |
| **Auth** | Passport.js (GitHub OAuth 2.0), JWT, HTTP-only cookies |
| **AI** | Google Gemini API |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- A running **Redis** instance
- A **MongoDB** database (local or Atlas)
- A **GitHub OAuth App** (Client ID + Secret)
- A **Gemini API** key
- A public webhook URL (e.g. via [ngrok](https://ngrok.com) for local dev)

### 1. Clone the repo

```bash
git clone https://github.com/ayanah24/CodeSense-AI.git
cd CodeSense-AI
```

### 2. Configure the server

```bash
cd server
cp .env.example .env   # fill in the values below
npm install
```

**`server/.env`**
```env
PORT=3000
CLIENT_URL=http://localhost:5173

MONGODB_URI=your_mongodb_connection_string
REDIS_URL=redis://localhost:6379

GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_WEBHOOK_SECRET=your_webhook_secret

WEBHOOK_URL=https://your-public-url/webhook

GEMINI_API_KEY=your_gemini_api_key

JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### 3. Configure the client

```bash
cd ../client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:3000
```

### 4. Run the app

Open **three** terminal windows:

```bash
# Terminal 1 — API server
cd server && npm run dev

# Terminal 2 — BullMQ review worker
cd server && npm run start:review-worker

# Terminal 3 — Frontend dev server
cd client && npm run dev
```

The app will be available at **http://localhost:5173**.

---

## 🔌 API Reference

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/auth/github` | ❌ | Initiate GitHub OAuth flow |
| `GET` | `/auth/github/callback` | ❌ | OAuth callback — sets JWT cookie |
| `GET` | `/auth/me` | ✅ | Get current user info |
| `POST` | `/auth/logout` | ✅ | Invalidate session |
| `POST` | `/webhook` | ❌ | Receive GitHub PR events |
| `GET` | `/api/reviews` | ✅ | List all reviews |
| `POST` | `/api/review/manual` | ✅ | Trigger a manual code review |
| `GET` | `/api/repos` | ✅ | List connected repositories |
| `GET` | `/api/repos/github` | ✅ | List all GitHub repos with connection status |
| `POST` | `/api/repos/connect` | ✅ | Connect a repo & register webhook |
| `POST` | `/api/repos/disconnect` | ✅ | Disconnect a repo & remove webhook |
| `GET` | `/api/health` | ❌ | Service health check |

---

## 🗺️ Roadmap

- [ ] RAG-based codebase context using vector embeddings
- [ ] Merge gate enforcement (block merges on low scores)
- [ ] Slack / Discord notifications on review completion
- [ ] Support for GitLab and Bitbucket webhooks
- [ ] Review history analytics & trend charts

---

## 📸 Screenshots

<img width="1920" height="872" alt="Landing Page" src="https://github.com/user-attachments/assets/9a9b8c53-a5b8-4cdd-af5c-069f09ea5569" />
<img width="1920" height="1080" alt="Dashboard" src="https://github.com/user-attachments/assets/2304dfdd-cc45-4b55-b0ca-844f9f51fa55" />
<img width="1920" height="1080" alt="Review Detail" src="https://github.com/user-attachments/assets/9dc259f9-7bc6-4466-b393-241b65db3dfb" />
<img width="1920" height="1080" alt="Manual Review" src="https://github.com/user-attachments/assets/ac7d1a77-858f-4409-b91a-5bded550c522" />
<img width="1920" height="1080" alt="Repositories" src="https://github.com/user-attachments/assets/44ed2918-f32b-4977-8c47-f337d872392a" />
