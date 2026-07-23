# ☁️ CodeSense AI - AWS EC2 Production Deployment Guide

This guide provides a step-by-step walkthrough for deploying **CodeSense AI** to production on an **AWS EC2 instance** running **Docker Compose**, **Nginx Reverse Proxy**, and **Certbot Let's Encrypt SSL** under the custom subdomain [`https://codesense-ai.duckdns.org`](https://codesense-ai.duckdns.org).

---

## 📑 Table of Contents

- [🏗️ Production Architecture](#️-production-architecture)
- [1. AWS EC2 Instance & Security Group Setup](#1-aws-ec2-instance--security-group-setup)
- [2. Subdomain Configuration (DuckDNS)](#2-subdomain-configuration-duckdns)
- [3. Server Environment & Docker Deployment](#3-server-environment--docker-deployment)
- [4. Host Nginx & Certbot SSL/TLS Setup](#4-host-nginx--certbot-ssltls-setup)
- [5. System Maintenance & Docker Management](#5-system-maintenance--docker-management)
- [6. Application Security Hardening](#6-application-security-hardening)

---

## 🏗️ Production Architecture

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
                                      /           |           \
                                     v            v            v
                               +----------+ +-----------+ +----------+
                               | MongoDB  | |   Redis   | | Pinecone |
                               +----------+ +-----------+ +----------+
```

---

## 1. AWS EC2 Instance & Security Group Setup

### Step 1.1: Launch an EC2 Instance
1. Log into your **AWS Management Console** and open the **EC2 Dashboard**.
2. Click **Launch Instance**.
3. Configure the following parameters:
   - **Name**: `CodeSense-AI-Production`
   - **AMI**: Ubuntu Server 22.04 LTS (HVM), SSD Volume Type (64-bit x86)
   - **Instance Type**: `t3.small` or `t3.medium` (minimum 2 vCPU, 2-4 GB RAM for optimal Docker build & worker performance)
   - **Key Pair**: Select or create an SSH key pair (`codesense-key.pem`).
   - **Storage**: Configure 20–30 GB General Purpose SSD (gp3).

---

### Step 1.2: Configure Security Group Inbound Rules
Create or select a Security Group with the following inbound rules:

| Type | Protocol | Port Range | Source | Purpose |
|---|---|---|---|---|
| SSH | TCP | 22 | My IP / Admin IP | Secure Shell Access |
| HTTP | TCP | 80 | 0.0.0.0/0 | Standard Web Traffic & Let's Encrypt Verification |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Encrypted Production Web Traffic |

---

## 2. Subdomain Configuration (DuckDNS)

1. Go to [DuckDNS.org](https://www.duckdns.org) and log in.
2. Under **Domains**, register your domain name: `codesense-ai`.
3. Set the **IP Address** to your AWS EC2 instance's **Elastic IP** (or Public IPv4 address).
4. Save the changes. Your full domain will be:
   ```
   codesense-ai.duckdns.org
   ```
5. Test DNS propagation locally or on the server:
   ```bash
   nslookup codesense-ai.duckdns.org
   ```

---

## 3. Server Environment & Docker Deployment

### Step 3.1: Connect to EC2 & Install Dependencies

SSH into your server:
```bash
ssh -i /path/to/codesense-key.pem ubuntu@codesense-ai.duckdns.org
```

Install Docker, Docker Compose, and Git:
```bash
# Update package list
sudo apt update && sudo apt upgrade -y

# Install Docker & Docker Compose
sudo apt install -y docker.io docker-compose-v2 git curl jq

# Enable Docker service
sudo systemctl enable --now docker

# Add current user to Docker group
sudo usermod -aG docker $USER

# Re-log into SSH shell to apply group changes
exit
```

---

### Step 3.2: Clone Repository & Configure Environment

SSH back into the instance:
```bash
git clone https://github.com/ayanah24/CodeSense-AI.git
cd CodeSense-AI
```

Create the production backend environment file `server/.env`:
```bash
cat << 'EOF' > server/.env
PORT=5000
CLIENT_URL=https://codesense-ai.duckdns.org

# Database & Cache (Using Docker service names)
MONGODB_URI=mongodb://mongo:27017/codesense
REDIS_URL=redis://redis:6379

# GitHub OAuth App Configuration
GITHUB_CLIENT_ID=your_production_github_client_id
GITHUB_CLIENT_SECRET=your_production_github_client_secret
GITHUB_CALLBACK_URL=https://codesense-ai.duckdns.org/auth/github/callback
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_WEBHOOK_SECRET=your_production_webhook_secret

# Public Webhook URL
WEBHOOK_URL=https://codesense-ai.duckdns.org/webhook

# AI Models & Vector Database
GEMINI_API_KEY=your_production_gemini_api_key
PINECONE_API_KEY=your_production_pinecone_api_key
PINECONE_INDEX=codesense-index

# Security & Secrets
JWT_SECRET=your_production_jwt_secret_key
ENCRYPTION_KEY=32_byte_hex_string_for_aes_256_cbc
NODE_ENV=production
EOF
```

---

### Step 3.3: Build & Launch Docker Containers

Run Docker Compose to build images and launch services in detached mode:

```bash
docker compose up -d --build
```

Verify that all 5 microservices are running:
```bash
docker compose ps
```

Expected Output:
```
NAME                 COMMAND                  SERVICE   STATUS    PORTS
codesense-client-1   "/docker-entrypoint.…"   client    running   0.0.0.0:8000->80/tcp
codesense-mongo-1    "docker-entrypoint.s…"   mongo     running   0.0.0.0:27017->27017/tcp
codesense-redis-1    "docker-entrypoint.s…"   redis     running   0.0.0.0:6379->6379/tcp
codesense-server-1   "docker-entrypoint.s…"   server    running   0.0.0.0:5000->5000/tcp
codesense-worker-1   "docker-entrypoint.s…"   worker    running   
```

---

## 4. Host Nginx & Certbot SSL/TLS Setup

### Step 4.1: Install Host Nginx & Certbot
Install Nginx and Certbot on the Ubuntu host machine to handle public HTTPS traffic:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

---

### Step 4.2: Configure Host Nginx Reverse Proxy

Edit `/etc/nginx/sites-available/default`:

```bash
sudo nano /etc/nginx/sites-available/default
```

Replace the contents with the following configuration:

```nginx
server {
    listen 80;
    server_name codesense-ai.duckdns.org;

    # React Frontend Client (Docker Port 8000)
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Express Authentication Routes (Docker Port 5000)
    location /auth {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # GitHub Webhook Endpoint (Docker Port 5000)
    location /webhook {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }

    # Express API Routes (Docker Port 5000)
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.io WebSockets (Docker Port 5000)
    location /socket.io {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Test Nginx configuration for syntax errors:
```bash
sudo nginx -t
```

---

### Step 4.3: Provision Let's Encrypt SSL/TLS Certificate

Obtain free SSL certificates via Certbot:

```bash
sudo certbot --nginx -d codesense-ai.duckdns.org
```

Certbot automatically:
1. Validates domain ownership via ACME HTTP challenge.
2. Generates SSL certificates under `/etc/letsencrypt/live/codesense-ai.duckdns.org/`.
3. Updates your Nginx configuration to enable HTTPS on port 443 and auto-redirect HTTP to HTTPS (301).

Reload Nginx:
```bash
sudo systemctl reload nginx
```

Verify certificate auto-renewal:
```bash
sudo certbot renew --dry-run
```

---

## 5. System Maintenance & Docker Management

### Useful Management Commands:

- **View Live Container Logs**:
  ```bash
  # API Server logs
  docker compose logs -f server

  # BullMQ Worker logs
  docker compose logs -f worker
  ```

- **Re-deploy Latest Changes**:
  ```bash
  git pull origin main
  docker compose up -d --build
  ```

- **Restart All Services**:
  ```bash
  docker compose restart
  ```

---

## 6. Application Security Hardening

- **HMAC Verification**: Raw webhook request bodies are validated against `GITHUB_WEBHOOK_SECRET` using HMAC SHA-256 (`X-Hub-Signature-256`).
- **AES-256-CBC Encryption**: OAuth tokens stored in MongoDB are encrypted at rest using AES-256-CBC algorithms.
- **SHA-256 Hashed API Keys**: Headless CI/CD API keys (`csk_live_...`) are stored strictly as SHA-256 hashes.
- **HTTP-Only Cookies**: JWT tokens are issued with `HttpOnly`, `SameSite=Lax`, and `Secure` flags.
- **Rate Limiting**: Express middleware throttles key generation (`/api/keys`) and API review triggers (`/api/v1/review`).
- **Helmet Security Headers**: Strict HTTP headers protection against XSS, clickjacking, and MIME-sniffing attacks.
