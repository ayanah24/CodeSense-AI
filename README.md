# 🚀 CodeSense AI

> **AI-Powered Automated Code Review Platform & CI/CD Security Gatekeeper**  
> Connect your GitHub repositories, automate Pull Request reviews using Google Gemini AI and Pinecone RAG context, or integrate CodeSense AI directly into your CI/CD pipelines via API keys.

---

🌐 **Live Application**: [https://codesense-ai.duckdns.org](https://codesense-ai.duckdns.org)

---

## 📑 Table of Contents

- [✨ Core Features](#-core-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🗂️ Project Structure](#️-project-structure)
- [🛠️ Tech Stack](#️-tech-stack)
- [💻 Local Development Setup](#-local-development-setup)
- [⚡ Webhook Setup (Website & GitHub PRs)](#-webhook-setup-website--github-prs)
- [⚙️ CI/CD Integration Setup (API Keys & Workflows)](#️-cicd-integration-setup-api-keys--workflows)
- [☁️ Production Deployment (AWS EC2, Nginx, Certbot SSL)](#️-production-deployment) — See full guide in [DEPLOYMENT.md](DEPLOYMENT.md)
- [🔌 API Reference](#-api-reference)
- [📸 Screenshots](#-screenshots)

---

## ✨ Core Features

### 🔐 Authentication & Security
- **GitHub OAuth 2.0**: One-click authentication via Passport.js.
- **AES-256-CBC Encryption**: User OAuth tokens are encrypted before being saved to MongoDB.
- **JWT Sessions**: Secure session handling using HTTP-only cookies and Redis session storage.
- **API Key Management (`csk_live_...`)**: Cryptographically generated API keys hashed with SHA-256 at rest for secure CI/CD authentication.

### 🔗 Automated GitHub Webhook Pipeline
- **Auto Webhook Management**: Connecting a repo automatically creates a GitHub Webhook via the API with HMAC SHA-256 secrets; disconnecting cleans it up.
- **Real-Time Asynchronous Processing**: GitHub `pull_request` events are received at `/webhook`, validated via HMAC signature, and queued into **BullMQ** backed by **Redis**.
- **Agentic AI & RAG Context**: Pull request diffs are analyzed by a multi-stage LangGraph review graph using **Google Gemini AI** and relevant codebase vector embeddings retrieved from **Pinecone**.
- **Automated Feedback & Merge Gates**: Reviews post line-by-line comments directly to the GitHub PR and pass/fail status checks enforce merge quality.

### ⚙️ CI/CD & CLI Integration
- **Headless Code Analysis**: Submit code diffs from any CI/CD pipeline (GitHub Actions, GitLab CI, Jenkins, Bitbucket Pipelines) using `POST /api/v1/review`.
- **Asynchronous Polling**: Submit diffs instantly and poll `GET /api/v1/review/:jobId` until processing completes.

### 📊 Real-Time Dashboard & Manual Code Review
- **Socket.io Live Updates**: Completed reviews trigger instant frontend UI refreshes without manual page reloads.
- **Monaco Editor**: Integrated VS Code editor interface for manual code snippet review.
- **Multi-Dimensional Scoring**: Detailed scores (0–100) across Overall Quality, Security, Performance, Code Style, and Test Coverage.

---

## 🏗️ System Architecture

```
                       +-----------------------------------+
                       |         GitHub Repository         |
                       +-----------------------------------+
                         /                               \
        (1. Webhook PR Event)                  (2. CI/CD Pipeline API Call)
                       /                                   \
                      v                                     v
       +-------------------------------+         +-------------------------------+
       | POST /webhook (HMAC SHA-256)  |         | POST /api/v1/review (API Key) |
       +-------------------------------+         +-------------------------------+
                      \                                     /
                       v                                   v
       +-----------------------------------------------------------------+
       |               Nginx Reverse Proxy / SSL (Certbot)              |
       |                   codesense-ai.duckdns.org                      |
       +-----------------------------------------------------------------+
                                       |
                                       v
       +-----------------------------------------------------------------+
       |                     Express 5 API Server                        |
       +-----------------------------------------------------------------+
                     /                 |                 \
                    /                  v                  \
                   v            +-------------+            v
        +------------------+    |   Redis     |    +------------------+
        |     MongoDB      |    | Cache/Queue |    |   Pinecone Vector|
        | (Encrypted Tokens|    +-------------+    | (Codebase RAG)   |
        | & Review Stores) |           |           +------------------+
        +------------------+           v                    |
                                +--------------+            |
                                | BullMQ Worker| <----------+
                                +--------------+
                                       |
                                       v
                           +------------------------+
                           |  Google Gemini AI Graph|
                           +------------------------+
                                       |
                                       v
                +----------------------------------------------+
                | 1. Post Comment to GitHub PR                 |
                | 2. Set Merge Gate Commit Status              |
                | 3. Broadcast Real-Time Update via Socket.io  |
                +----------------------------------------------+
```

---

## 🗂️ Project Structure

```
CodeSense-AI/
├── client/                      # React 19 + Vite Frontend Application
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── api/                 # Axios API instances & service functions
│   │   ├── components/          # Reusable UI components & Protected Routes
│   │   ├── context/             # Global AuthContext & Socket state
│   │   ├── hooks/               # Custom React hooks
│   │   └── pages/               # Application Pages
│   │       ├── Dashboard.jsx    # PR reviews overview & real-time feed
│   │       ├── Landing.jsx      # Marketing page
│   │       ├── ManualReview.jsx # Monaco Editor snippet review
│   │       ├── Repositories.jsx # GitHub Repository OAuth connect/disconnect
│   │       └── ReviewDetail.jsx # Detailed breakdown & file diff inspection
│   ├── Dockerfile               # Multi-stage build (Node -> Nginx)
│   ├── nginx.conf               # Container-level Nginx routing
│   └── vite.config.js           # Vite build settings
│
├── server/                      # Node.js + Express 5 Backend API
│   ├── src/
│   │   ├── agents/              # LangGraph AI agent review state graph
│   │   ├── config/              # MongoDB, Redis, Passport, Pinecone configs
│   │   ├── controllers/         # Handler logic for repos, auth, and reviews
│   │   ├── middleware/          # JWT auth & API key validation middleware
│   │   ├── models/              # Mongoose schemas (User, Repo, Review, ApiKey)
│   │   ├── prompt/              # Prompt templates for Gemini AI
│   │   ├── queues/              # BullMQ queue declarations
│   │   ├── routes/              # Express route definitions
│   │   │   ├── apiKeyRoutes.js  # Management of csk_live_... keys
│   │   │   ├── authRoutes.js    # Passport OAuth & JWT cookies
│   │   │   ├── repoRoutes.js    # Repo connect/disconnect & webhooks
│   │   │   ├── reviewApiRoutes.js # Headless CI/CD review endpoints
│   │   │   ├── reviews.js       # Dashboard review retrieval
│   │   │   └── webhook.js       # GitHub PR webhook payload handler
│   │   ├── services/            # GitHub API, Diff Parser, Pinecone RAG
│   │   ├── socket/              # Socket.io connection & event broadcaster
│   │   ├── utils/               # Encryption, JWT helpers & API key utilities
│   │   └── workers/             # Dedicated BullMQ async worker process
│   └── Dockerfile               # Express server container configuration
│
├── docker-compose.yml           # Microservices composition spec
├── SECURITY.md                  # Security policies & API Key documentation
└── README.md                    # Project documentation
```

---

## 🛠️ Tech Stack

| Domain | Technology / Tool |
|---|---|
| **Frontend Framework** | React 19, Vite 8, React Router 7 |
| **Styling & UI** | TailwindCSS 4, Lucide Icons, Framer Motion |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) |
| **Real-Time Communication** | Socket.io (Client & Server) |
| **Backend API** | Node.js, Express 5 |
| **Queue & Worker System** | BullMQ, Redis 7 (ioredis) |
| **Database & ORM** | MongoDB 6, Mongoose |
| **Vector Search / RAG** | Pinecone Vector Database |
| **AI Intelligence** | Google Gemini API (via `@google/genai` & `@langchain/langgraph`) |
| **Authentication** | Passport.js (GitHub OAuth 2.0), JWT (HTTP-Only Cookies), Crypto API Keys |
| **Reverse Proxy & SSL** | Nginx, Certbot (Let's Encrypt) |
| **Containerization** | Docker, Docker Compose |
| **Hosting & Cloud** | AWS EC2 (Ubuntu 22.04 LTS), DuckDNS Dynamic DNS |

---

## 💻 Local Development Setup

### Prerequisites
- Node.js ≥ 18.x
- Docker & Docker Compose (Recommended) OR local MongoDB & Redis instances
- GitHub OAuth Application
- Google Gemini API Key

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/ayanah24/CodeSense-AI.git
cd CodeSense-AI
```

---

### Step 2: Configure Environment Variables

#### 1. Server Environment (`server/.env`)
Create `server/.env` with the following variables:

```env
PORT=5000
CLIENT_URL=http://localhost:5173

# Databases
MONGODB_URI=mongodb://localhost:27017/codesense
REDIS_URL=redis://localhost:6379

# GitHub OAuth App
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_WEBHOOK_SECRET=your_secret_webhook_key

# Public Webhook URL (use ngrok for local testing)
WEBHOOK_URL=https://your-ngrok-subdomain.ngrok-free.app/webhook

# AI & Vector DB
GEMINI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=codesense-index

# Security
JWT_SECRET=your_super_secret_jwt_key
ENCRYPTION_KEY=32_byte_hex_string_for_aes_256_cbc
NODE_ENV=development
```

#### 2. Client Environment (`client/.env`)
Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

---

### Step 3: Run with Docker Compose (Recommended)

To run the full stack (API, Worker, Client, Mongo, Redis) with a single command:

```bash
docker compose up -d --build
```

Access the application at **http://localhost:8000** (or **http://localhost:5173** if running Vite locally).

---

### Step 4: Run Manually (Without Docker)

1. **Start Backend Services**:
   ```bash
   cd server
   npm install

   # Terminal 1: Express Server
   npm run dev

   # Terminal 2: BullMQ Review Worker
   npm run start:review-worker
   ```

2. **Start Frontend Client**:
   ```bash
   cd client
   npm install

   # Terminal 3: Vite Dev Server
   npm run dev
   ```

---

## ⚡ Webhook Setup (Website & GitHub PRs)

CodeSense AI automates pull request reviews by registering webhooks on connected repositories.

```
+------------------+         +------------------+         +------------------+
| User Connects    | ----->  | Webhook Registered| ----->  | Developer Opens  |
| Repo in Dashboard|         | on GitHub Repo   |         | Pull Request     |
+------------------+         +------------------+         +------------------+
                                                                   |
                                                                   v
+------------------+         +------------------+         +------------------+
| GitHub Comment & | <-----  | BullMQ Worker    | <-----  | HMAC Signature   |
| Status Check Set |         | Executes Gemini  |         | Verified /webhook|
+------------------+         +------------------+         +------------------+
```

### How to Enable Webhook PR Reviews:

1. **Log In via GitHub**:
   - Open [CodeSense AI](https://codesense-ai.duckdns.org) and click **Sign in with GitHub**.

2. **Connect a Repository**:
   - Navigate to the **Repositories** page.
   - Click **Connect** next to any repository.
   - CodeSense AI automatically uses your authenticated token to create a webhook on GitHub targeting `https://codesense-ai.duckdns.org/webhook` with the events: `pull_request`.

3. **Open a Pull Request**:
   - Create or update any Pull Request in the connected repository.
   - CodeSense AI receives the `pull_request` event, verifies the payload using HMAC SHA-256 (`X-Hub-Signature-256`), and pushes the review task into BullMQ.

4. **Automated Feedback**:
   - The BullMQ worker analyzes the diff using Gemini AI + Pinecone codebase context.
   - The review feedback is posted as a comment on the GitHub PR.
   - A **GitHub Commit Status Check** (`CodeSense AI / Code Review`) is set to `success` or `failure` based on whether the overall quality score exceeds 70/100.

---

## ⚙️ CI/CD Integration Setup (API Keys & Workflows)

CodeSense AI supports headless integration for automated pipelines (GitHub Actions, GitLab CI, Jenkins, Bitbucket) using generated API keys (`csk_live_...`).

### 1. Generate an API Key
1. Sign in to [CodeSense AI](https://codesense-ai.duckdns.org).
2. Open the **API Keys** section.
3. Click **Generate New Key**, enter a key description (e.g. `github-actions-ci`), and copy the generated secret key (`csk_live_...`).
> ⚠️ **Note**: The raw key is shown only once and stored hashed with SHA-256 in the database.

---

### 2. GitHub Actions Setup Guide

#### Add Secret to GitHub Repository:
1. Go to your GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Click **New repository secret**.
3. Name: `CODESENSE_API_KEY`
4. Value: `csk_live_your_generated_api_key`

#### Create `.github/workflows/codesense.yml`:

```yaml
name: CodeSense AI Code Review Gate

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  codesense-review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate PR Diff
        run: |
          git diff origin/${{ github.base_ref }}...HEAD > pr_diff.patch
          echo "Diff size: $(wc -c < pr_diff.patch) bytes"

      - name: Submit Review to CodeSense AI
        id: submit_review
        run: |
          # Escape diff for JSON payload
          DIFF_CONTENT=$(jq -Rs . < pr_diff.patch)
          REPO_NAME="${{ github.repository }}"
          
          RESPONSE=$(curl -s -X POST "https://codesense-ai.duckdns.org/api/v1/review" \
            -H "Authorization: Bearer ${{ secrets.CODESENSE_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d "{\"diff\": $DIFF_CONTENT, \"repoName\": \"$REPO_NAME\"}")

          JOB_ID=$(echo "$RESPONSE" | jq -r '.jobId')
          if [ "$JOB_ID" == "null" ] || [ -z "$JOB_ID" ]; then
            echo "Failed to submit review: $RESPONSE"
            exit 1
          fi

          echo "Submitted review job ID: $JOB_ID"
          echo "job_id=$JOB_ID" >> $GITHUB_OUTPUT

      - name: Poll Review Completion
        run: |
          JOB_ID="${{ steps.submit_review.outputs.job_id }}"
          echo "Polling job $JOB_ID..."

          for i in {1..30}; do
            STATUS_RESP=$(curl -s -X GET "https://codesense-ai.duckdns.org/api/v1/review/$JOB_ID" \
              -H "Authorization: Bearer ${{ secrets.CODESENSE_API_KEY }}")

            STATUS=$(echo "$STATUS_RESP" | jq -r '.status')
            echo "Attempt $i: Status = $STATUS"

            if [ "$STATUS" == "completed" ]; then
              SCORE=$(echo "$STATUS_RESP" | jq -r '.result.score.overall')
              PASSED=$(echo "$STATUS_RESP" | jq -r '.result.passed')
              SUMMARY=$(echo "$STATUS_RESP" | jq -r '.result.summary')

              echo "=========================================="
              echo "Review Complete!"
              echo "Overall Score: $SCORE/100"
              echo "Passed: $PASSED"
              echo "Summary: $SUMMARY"
              echo "=========================================="

              if [ "$PASSED" != "true" ]; then
                echo "❌ CodeSense AI Review Failed (Score: $SCORE < 70)"
                exit 1
              fi
              echo "✅ CodeSense AI Review Passed!"
              exit 0
            elif [ "$STATUS" == "failed" ]; then
              echo "❌ Review processing failed on CodeSense AI worker"
              exit 1
            fi

            sleep 5
          done

          echo "⏱️ Review timed out waiting for completion"
          exit 1
```

---

### 3. cURL / Shell CLI Example

You can submit any code diff directly using cURL:

```bash
# 1. Submit Code Diff
RESPONSE=$(curl -s -X POST "https://codesense-ai.duckdns.org/api/v1/review" \
  -H "Authorization: Bearer csk_live_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "repoName": "my-org/my-app",
    "diff": "diff --git a/index.js b/index.js\nindex 123..456 100644\n--- a/index.js\n+++ b/index.js\n@@ -1,3 +1,3 @@\n-const secret = \"12345\";\n+const secret = process.env.SECRET;"
  }')

JOB_ID=$(echo $RESPONSE | jq -r '.jobId')
echo "Job Queued: $JOB_ID"

# 2. Check Job Status
curl -s -X GET "https://codesense-ai.duckdns.org/api/v1/review/$JOB_ID" \
  -H "Authorization: Bearer csk_live_your_api_key_here"
```

---

## ☁️ Production Deployment

CodeSense AI is deployed live in production on an **AWS EC2 instance** running **Docker Compose**, **Nginx Reverse Proxy**, and **Certbot Let's Encrypt SSL** behind the domain [`https://codesense-ai.duckdns.org`](https://codesense-ai.duckdns.org).

For complete, step-by-step instructions on setting up AWS EC2, DuckDNS, Nginx reverse proxying, Certbot SSL, Docker container orchestration, and security hardening, please refer to the dedicated deployment guide:

📖 **[Read the Full AWS EC2 Deployment Guide (DEPLOYMENT.md)](DEPLOYMENT.md)**

### High-Level Deployment Architecture:

```
[ Incoming User / Webhook / CI Request ]
                   |
                   v  (Port 80 HTTP / Port 443 HTTPS)
+-------------------------------------------------------------+
| AWS EC2 Security Group (Inbound Rules: 80, 443, 22)         |
+-------------------------------------------------------------+
                   |
                   v
+-------------------------------------------------------------+
| Host Nginx + Certbot SSL (codesense-ai.duckdns.org)         |
|  - Manages Let's Encrypt SSL/TLS certificates               |
|  - Terminates HTTPS                                         |
|  - Proxies traffic to internal Docker container ports       |
+-------------------------------------------------------------+
       |                                   |
       | proxy_pass http://127.0.0.1:8000  | proxy_pass http://127.0.0.1:5000
       v                                   v
+-----------------------------+     +-----------------------------+
| Docker: Client Container    |     | Docker: Server Container    |
| (Nginx serving React Vite)  |     | (Express API + Socket.io)   |
+-----------------------------+     +-----------------------------+
                                                   |
                                                   v
                                    +-----------------------------+
                                    | Docker: Worker Container    |
                                    | (BullMQ Async AI Worker)    |
                                    +-----------------------------+
```

### Key Security Features Included:
- **HMAC Payload Verification**: `/webhook` verifies raw body signatures against `GITHUB_WEBHOOK_SECRET` using SHA-256.
- **Tokens Encrypted at Rest**: User GitHub OAuth tokens are encrypted using **AES-256-CBC** before being persisted in MongoDB.
- **Hashed API Keys**: API keys (`csk_live_...`) are saved strictly as **SHA-256 hashes**.
- **HTTP-Only Cookies**: JWT authentication tokens are stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
- **Rate Limiting & Helmet Headers**: Express endpoints use strict rate limits and security headers to prevent brute-force attacks.

---

## 🔌 API Reference

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| `GET` | `/` | None | Server health ping |
| `GET` | `/api/health` | None | Service dependencies status check (MongoDB, Redis, Gemini, GitHub) |
| `GET` | `/auth/github` | None | Initiates GitHub OAuth 2.0 flow |
| `GET` | `/auth/github/callback` | None | OAuth callback handler; issues JWT cookie |
| `GET` | `/auth/me` | JWT Cookie | Retrieves logged-in user profile |
| `POST` | `/auth/logout` | JWT Cookie | Clears authentication session cookies |
| `GET` | `/api/repos` | JWT Cookie | Lists connected user repositories |
| `GET` | `/api/repos/github` | JWT Cookie | Lists all user GitHub repos with connection status |
| `POST` | `/api/repos/connect` | JWT Cookie | Connects repo & registers GitHub webhook |
| `POST` | `/api/repos/disconnect` | JWT Cookie | Disconnects repo & removes GitHub webhook |
| `GET` | `/api/reviews` | JWT Cookie | Fetches review history for dashboard |
| `POST` | `/api/review/manual` | JWT Cookie | Triggers Monaco Editor snippet code review |
| `POST` | `/api/keys` | JWT Cookie | Generates a new CI/CD API Key (`csk_live_...`) |
| `GET` | `/api/keys` | JWT Cookie | Fetches list of active API keys |
| `DELETE` | `/api/keys/:id` | JWT Cookie | Revokes an existing API key |
| `POST` | `/webhook` | HMAC SHA-256 | Incoming GitHub `pull_request` webhook receiver |
| `POST` | `/api/v1/review` | API Key (`Bearer`) | Submits code diff for asynchronous review |
| `GET` | `/api/v1/review/:jobId` | API Key (`Bearer`) | Polls status & results of a queued review job |

---

## 📸 Screenshots

<img width="1920" height="872" alt="Landing Page" src="https://github.com/user-attachments/assets/9a9b8c53-a5b8-4cdd-af5c-069f09ea5569" />
<img width="1920" height="1080" alt="Dashboard" src="https://github.com/user-attachments/assets/2304dfdd-cc45-4b55-b0ca-844f9f51fa55" />
<img width="1920" height="1080" alt="Review Detail" src="https://github.com/user-attachments/assets/9dc259f9-7bc6-4466-b393-241b65db3dfb" />
<img width="1920" height="1080" alt="Manual Review" src="https://github.com/user-attachments/assets/ac7d1a77-858f-4409-b91a-5bded550c522" />
<img width="1920" height="1080" alt="Repositories" src="https://github.com/user-attachments/assets/44ed2918-f32b-4977-8c47-f337d872392a" />

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
