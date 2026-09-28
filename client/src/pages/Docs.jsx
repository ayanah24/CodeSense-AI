import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const sections = [
  { id: 'overview', label: 'Overview', group: 'START HERE' },
  { id: 'quickstart', label: 'Quick start', group: 'START HERE' },
  { id: 'github', label: 'GitHub pull requests', group: 'WORKFLOWS' },
  { id: 'manual', label: 'Manual review', group: 'WORKFLOWS' },
  { id: 'api', label: 'CI/CD API', group: 'WORKFLOWS' },
  { id: 'local-dev', label: 'Local development', group: 'BUILD & RUN' },
  { id: 'architecture', label: 'How it works', group: 'BUILD & RUN' },
  { id: 'troubleshooting', label: 'Troubleshooting', group: 'BUILD & RUN' },
];

const localEnv = `PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/codesense
REDIS_HOST=localhost
REDIS_PORT=6379

GITHUB_CLIENT_ID=your_oauth_client_id
GITHUB_CLIENT_SECRET=your_oauth_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback
GITHUB_TOKEN=your_github_token_for_pr_comments_and_statuses
GITHUB_WEBHOOK_SECRET=replace_with_a_random_secret
WEBHOOK_URL=https://your-public-url/webhook

GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index

JWT_SECRET=replace_with_a_long_random_secret
TOKEN_ENCRYPTION_KEY=64_hex_characters_from_32_random_bytes`;

const submitExample = `git diff origin/main...HEAD > codesense.patch

curl -sS -X POST "$CODESENSE_URL/api/v1/review" \\
  -H "Authorization: Bearer $CODESENSE_API_KEY" \\
  -H "Content-Type: application/json" \\
  --data "$(jq -n --rawfile diff codesense.patch '{diff: $diff}')"`;

const pollExample = `curl -sS "$CODESENSE_URL/api/v1/review/$JOB_ID" \\
  -H "Authorization: Bearer $CODESENSE_API_KEY"`;

function CodeBlock({ code, language = 'bash', label }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="docs-code-block">
      <div className="docs-code-head">
        <span>{label || language}</span>
        <button type="button" onClick={copyCode} aria-label={`Copy ${label || language}`}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}

function Step({ number, title, children }) {
  return (
    <div className="docs-step">
      <span className="docs-step-number">{number}</span>
      <div><h3>{title}</h3><div className="docs-step-copy">{children}</div></div>
    </div>
  );
}

export default function Docs() {
  const [active, setActive] = useState('overview');

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Documentation | CodeSense AI';
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: '-96px 0px -72% 0px' });

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => {
      observer.disconnect();
      document.title = previousTitle;
    };
  }, []);

  const groups = [...new Set(sections.map((section) => section.group))];

  return (
    <div className="docs-page">
      <header className="docs-header">
        <div className="docs-header-inner">
          <Link to="/" className="docs-brand" aria-label="CodeSense AI home">
            <span className="docs-brand-mark">&lt;/&gt;</span>
            <span>CodeSense <b>AI</b></span>
          </Link>
          <nav className="docs-top-nav" aria-label="Main navigation">
            <Link to="/">Home</Link>
            <Link to="/manual">Manual review</Link>
            <Link className="docs-nav-cta" to="/dashboard">Open dashboard <span aria-hidden="true">↗</span></Link>
          </nav>
        </div>
      </header>

      <div className="docs-layout">
        <aside className="docs-sidebar" aria-label="Documentation contents">
          <div className="docs-sidebar-title">DOCUMENTATION</div>
          {groups.map((group) => (
            <div className="docs-nav-group" key={group}>
              <div className="docs-nav-group-label">{group}</div>
              {sections.filter((section) => section.group === group).map((section) => (
                <a key={section.id} href={`#${section.id}`} className={active === section.id ? 'is-active' : ''}>
                  {section.label}
                </a>
              ))}
            </div>
          ))}
          <div className="docs-sidebar-note">
            <span className="docs-status-dot" />
            <span>Built for your review workflow</span>
          </div>
        </aside>

        <main className="docs-article">
          <div className="docs-breadcrumb"><Link to="/">CodeSense AI</Link><span>/</span><span>Documentation</span></div>

          <section id="overview" className="docs-section docs-intro">
            <div className="docs-eyebrow"><span>PRODUCT GUIDE</span><span>•</span><span>6 MIN READ</span></div>
            <h1>Ship better code, <em>with context.</em></h1>
            <p className="docs-lede">CodeSense AI reviews pull requests, explains risks, and brings actionable feedback into the places your team already works. Connect GitHub for automatic reviews, or send a diff from your CI pipeline.</p>
            <div className="docs-callout docs-callout-info">
              <span className="docs-callout-icon">i</span>
              <p><strong>Choose your path.</strong> Connect a GitHub repository for hands-off PR reviews, use the API for CI/CD, or open Manual Review to inspect a code snippet.</p>
            </div>
            <div className="docs-workflow-links">
              <a href="#github"><span className="workflow-index">01</span><span><b>GitHub reviews</b><small>Automate every pull request</small></span><span className="workflow-arrow">↗</span></a>
              <a href="#api"><span className="workflow-index">02</span><span><b>CI/CD API</b><small>Review diffs from a pipeline</small></span><span className="workflow-arrow">↗</span></a>
              <Link to="/manual"><span className="workflow-index">03</span><span><b>Manual review</b><small>Try a snippet in the browser</small></span><span className="workflow-arrow">↗</span></Link>
            </div>
          </section>

          <section id="quickstart" className="docs-section">
            <div className="docs-section-kicker">01 / FIRST REVIEW</div>
            <h2>Quick start</h2>
            <p>For the fastest start, use the hosted app. You’ll need a GitHub account and access to the repository you want CodeSense AI to review.</p>
            <div className="docs-steps">
              <Step number="1" title="Sign in with GitHub">Choose <strong>Login with GitHub</strong> and authorize CodeSense AI. Repository access is requested so the app can install and remove webhooks for repositories you select.</Step>
              <Step number="2" title="Connect a repository">Open <strong>Repositories</strong>, choose <strong>Add repository</strong>, select a repo, and confirm webhook installation.</Step>
              <Step number="3" title="Open a pull request">Open or update a pull request in that repository. The webhook queues a review automatically.</Step>
              <Step number="4" title="Read the result">Find the completed review in your dashboard. CodeSense AI also posts a summary comment and a commit status to the pull request.</Step>
            </div>
            <div className="docs-inline-actions"><Link to="/dashboard" className="docs-button-primary">Go to dashboard <span>↗</span></Link><Link to="/manual" className="docs-text-link">Try a manual review <span>→</span></Link></div>
          </section>

          <section id="github" className="docs-section">
            <div className="docs-section-kicker">02 / AUTOMATED REVIEWS</div>
            <h2>GitHub pull requests</h2>
            <p>Connecting a repository installs a <code>pull_request</code> webhook. New and updated pull requests are reviewed asynchronously, so GitHub doesn’t have to wait for the AI pipeline to finish.</p>
            <div className="docs-flow" aria-label="Pull request review flow">
              <div><span>01</span><b>PR event</b><small>GitHub sends a signed webhook</small></div><i>→</i>
              <div><span>02</span><b>Review job</b><small>Redis and BullMQ queue the diff</small></div><i>→</i>
              <div><span>03</span><b>AI analysis</b><small>Agents score and explain findings</small></div><i>→</i>
              <div><span>04</span><b>Feedback</b><small>Dashboard, PR comment, status</small></div>
            </div>
            <h3>What the review includes</h3>
            <p>Each result includes an overall score and individual security, performance, quality, and test scores, plus a summary, findings, suggested fixes, and positive notes. A score of 70 or higher sets a successful commit status; a lower score sets a failing status.</p>
            <div className="docs-callout docs-callout-warm"><span className="docs-callout-icon">!</span><p><strong>Repository indexing is separate.</strong> The review pipeline can use Pinecone codebase context when vectors exist for a connected repo. The current Repositories screen does not expose an indexing control; indexing is available through the authenticated <code>POST /api/repos/:repoId/index</code> endpoint.</p></div>
            <p className="docs-muted">Disconnecting a repository removes its webhook and stops future automatic reviews. Existing review history is preserved.</p>
          </section>

          <section id="manual" className="docs-section">
            <div className="docs-section-kicker">03 / QUICK EXPERIMENTS</div>
            <h2>Manual review</h2>
            <p>Use Manual Review to submit a code snippet without connecting a repository. Select a language, add the code, and start the review to see the score and findings.</p>
            <Link to="/manual" className="docs-button-secondary">Open Manual Review <span>↗</span></Link>
          </section>

          <section id="api" className="docs-section">
            <div className="docs-section-kicker">04 / CI INTEGRATION</div>
            <h2>Review diffs from CI/CD</h2>
            <p>The review API uses bearer API keys and returns immediately with a job ID. Poll that ID until the review completes, then use the score to decide whether your pipeline should pass.</p>
            <div className="docs-steps docs-steps-compact">
              <Step number="1" title="Create a key">Sign in, open <strong>API Keys</strong>, and generate a key. Copy it when shown; the raw key is only revealed once.</Step>
              <Step number="2" title="Submit a unified diff">Send a <code>POST</code> request to <code>/api/v1/review</code> with a <code>diff</code> string. <code>repoName</code> is optional.</Step>
              <Step number="3" title="Poll the job">Use the returned <code>jobId</code> with <code>GET /api/v1/review/:jobId</code>. When complete, the response includes scores, findings, and <code>passed</code>.</Step>
            </div>
            <CodeBlock code={submitExample} label="Submit a review · cURL" />
            <div className="docs-response-label">Accepted response</div>
            <CodeBlock language="json" code={`{
  "jobId": "<job-id>",
  "status": "queued"
}`} label="JSON" />
            <p className="docs-code-caption">Store <code>jobId</code> in your CI step output, then poll it with the same API key.</p>
            <CodeBlock code={pollExample} label="Check review status · cURL" />
            <div className="docs-response-label">Completed response</div>
            <CodeBlock language="json" code={`{
  "jobId": "<job-id>",
  "status": "completed",
  "result": {
    "summary": "Review summary...",
    "score": { "overall": 84, "security": 90, "performance": 78, "quality": 82, "tests": 80 },
    "issues": [],
    "positives": [],
    "passed": true
  }
}`} label="JSON" />
            <div className="docs-callout docs-callout-info"><span className="docs-callout-icon">i</span><p><strong>Keep the key private.</strong> Store it in your CI provider’s secret manager. Never commit it to your repository or print it in build logs.</p></div>
          </section>

          <section id="local-dev" className="docs-section">
            <div className="docs-section-kicker">05 / SELF-HOSTING</div>
            <h2>Run CodeSense AI locally</h2>
            <p>For local development, run MongoDB and Redis, then start the API, worker, and Vite client in separate terminals. GitHub webhook testing also needs a public HTTPS URL that can reach your local API.</p>
            <h3>Prerequisites</h3>
            <ul className="docs-check-list"><li>Node.js 20 or later and npm</li><li>Docker with Compose, or local MongoDB and Redis services</li><li>GitHub OAuth app, GitHub token for comments/statuses, Groq and Gemini API keys, and a Pinecone index</li></ul>
            <h3>1. Configure the server</h3>
            <p>Create <code>server/.env</code>. Generate strong random values for <code>JWT_SECRET</code> and <code>GITHUB_WEBHOOK_SECRET</code>. Generate the encryption key with Node and paste the 64-character hex output into <code>TOKEN_ENCRYPTION_KEY</code>.</p>
            <CodeBlock code={`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`} label="Generate encryption key" />
            <CodeBlock code={localEnv} label="server/.env · template" />
            <h3>2. Start the data services</h3>
            <CodeBlock code="docker compose up -d mongo redis" label="Terminal" />
            <h3>3. Configure and start the app</h3>
            <p>Create <code>client/.env</code> with <code>VITE_API_URL=http://localhost:5000</code>. Install dependencies once in each package, then keep the API and worker running while you use the app.</p>
            <CodeBlock code={`# Terminal 1: API server
cd server
npm install
npm run dev

# Terminal 2: review worker
cd server
npm run start:review-worker

# Terminal 3: web client
cd client
npm install
npm run dev`} label="Terminal" />
            <div className="docs-callout docs-callout-warm"><span className="docs-callout-icon">!</span><p><strong>Webhook callback.</strong> Set <code>WEBHOOK_URL</code> to a reachable public URL ending in <code>/webhook</code> (for local work, use a secure tunnel). Set the GitHub OAuth callback URL to <code>http://localhost:5000/auth/github/callback</code>.</p></div>
          </section>

          <section id="architecture" className="docs-section">
            <div className="docs-section-kicker">06 / UNDER THE HOOD</div>
            <h2>How a review moves through the system</h2>
            <p>The API accepts work and the separate worker processes it. MongoDB stores users, connected repositories, API keys, and completed reviews. Redis backs the queue and live completion events.</p>
            <div className="docs-architecture">
              <div><span className="arch-number">A</span><span><b>Ingress</b><small>GitHub webhook or authenticated API request</small></span></div>
              <div className="arch-connector" />
              <div><span className="arch-number">B</span><span><b>Queue</b><small>BullMQ stores review jobs in Redis</small></span></div>
              <div className="arch-connector" />
              <div><span className="arch-number">C</span><span><b>Analysis</b><small>LangGraph agents inspect the diff; Pinecone context is optional</small></span></div>
              <div className="arch-connector" />
              <div><span className="arch-number">D</span><span><b>Delivery</b><small>MongoDB result, dashboard event, and GitHub feedback</small></span></div>
            </div>
            <p className="docs-muted">The review uses Groq for diff classification and Gemini for structured review and embeddings. Pinecone provides repository context when the repository has been indexed.</p>
          </section>

          <section id="troubleshooting" className="docs-section docs-last-section">
            <div className="docs-section-kicker">07 / FIXES</div>
            <h2>Troubleshooting</h2>
            <details><summary>My pull request is not being reviewed</summary><p>Confirm the repository is connected and active, the webhook URL is publicly reachable, and the <code>pull_request</code> event is enabled on GitHub. Check API logs for signature errors and make sure the worker process is running.</p></details>
            <details><summary>The API stays at queued or active</summary><p>Check that Redis is reachable and the review worker is running against the same Redis host and port as the API. Worker errors are printed in the worker terminal.</p></details>
            <details><summary>GitHub OAuth returns an error</summary><p>Make sure the callback URL in your GitHub OAuth app exactly matches <code>GITHUB_CALLBACK_URL</code>, and that the server’s <code>CLIENT_URL</code> points to the client origin.</p></details>
            <details><summary>My API key is rejected</summary><p>Use the complete key beginning with <code>csk_live_</code> as a bearer token. If it was revoked or lost after creation, generate a new key from API Keys.</p></details>
            <div className="docs-footer-cta"><div><span>READY WHEN YOU ARE</span><h3>Put the guide into practice.</h3></div><div><Link to="/dashboard" className="docs-button-primary">Open dashboard <span>↗</span></Link><Link to="/" className="docs-text-link">Back to CodeSense AI <span>→</span></Link></div></div>
          </section>

          <footer className="docs-footer"><Link to="/">CodeSense AI</Link><span>Documentation for safer, clearer code reviews.</span><span>© 2026</span></footer>
        </main>
      </div>
    </div>
  );
}
