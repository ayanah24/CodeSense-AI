# CodeSense AI

CodeSense AI is an AI-powered code review platform designed to automate pull request reviews via GitHub Webhooks. It provides structured code analysis, feedback, and scoring to help maintain high code quality.

## Features Implemented So Far

### ⚙️ Backend (Node.js & Express)
- **GitHub Webhooks**: Configured route (`/webhook`) to receive and process payloads directly from GitHub.
- **Job Queuing**: Integrated **BullMQ** and **Redis** to queue and process heavy code review tasks asynchronously via a dedicated worker (`reviewWorker.js`).
- **MongoDB Integration**: Set up database connection using **Mongoose** to persistently store review data.
- **API Routes**:
  - `/webhook`: Listens to GitHub PR events.
  - `/api/reviews`: Fetches automated review logs and details.
  - `/api/review/manual`: Handles requests for the manual code review feature.

### 💻 Frontend (React & Vite)
- **Modern Web App**: Built with **React** and **Vite** for fast performance.
- **Styling**: Configured **TailwindCSS** for a clean, responsive, and modern UI.
- **Routing**: Implemented **React Router** for seamless page navigation.
- **Core Pages**:
  - **Landing (`Landing.jsx`)**: The main entry page of the application.
  - **Dashboard (`Dashboard.jsx`)**: An overview page to see past and current code reviews.
  - **Review Detail (`ReviewDetail.jsx`)**: A page dedicated to viewing the specific feedback and scoring of a single review.
  - **Manual Review (`ManualReview.jsx`)**: An interactive page featuring the **Monaco Editor** where users can manually paste and review code snippets.

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Monaco Editor, React Router, Axios
- **Backend**: Node.js, Express, MongoDB (Mongoose), Redis, BullMQ, CORS, Dotenv
- **AI**: Gemini API (for code analysis)

## Planned / Upcoming Features
- Real-time dashboard updates via Socket.io
- RAG-based codebase context using vector embeddings
- Slack notifications
- Merge gate enforcement on GitHub
