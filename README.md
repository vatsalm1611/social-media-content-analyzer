# Create a plain text README file with the provided content
content = """Social Media Content Analyzer (React + Node)

Extract text from PDFs/images (PDF parsing + OCR) and get quick, actionable engagement suggestions for your social posts.

Build: https://img.shields.io/badge/build-passing-brightgreen
Stack: https://img.shields.io/badge/stack-React%20%7C%20Vite%20%7C%20Node%20%7C%20Express-blue
License: https://img.shields.io/badge/license-MIT-lightgrey

---

Overview

Client: React + Vite
Server: Node.js (Express) with pdf-parse, tesseract.js, sharp, multer

What it does
- Upload a PDF or image
- Extract text (direct for PDFs, OCR for images)
- Get simple engagement insights: word count, hashtags, mentions, links, and numbered suggestions

---

Features

1. Drag & drop / file browse uploads
2. PDF text extraction (via pdf-parse)
3. Image OCR (via tesseract.js, preprocessed with sharp)
4. Robust loading/error states
5. Copy or download extracted text as .txt
6. Lightweight analyzer (no ML): word count, hashtags, mentions, links, numbered suggestions

---

Project Structure

root/
├─ client/                # React + Vite app
│  ├─ src/
│  │  ├─ components/
│  │  │  └─ Result.jsx   # Shows meta, text, suggestions (numbered)
│  │  ├─ styles.css      # UI styles
│  │  └─ main.jsx
│  └─ index.html
└─ server/                # Express API
   ├─ index.js            # /api/extract, /api/health
   └─ package.json

---

Requirements

- Node.js 18+ (LTS recommended)
- npm 9+ or pnpm/yarn
- For OCR: native libs used by sharp/tesseract.js are downloaded automatically

---

Configuration

Server (server/.env)
PORT=8080  # Optional. Defaults to 8080 if unset.

Client (client/.env)
VITE_API_BASE=http://localhost:8080  # Base URL for the server API (no trailing slash)

---

Local Development

# 1) Server
cd server
npm install
npm run dev    # starts http://localhost:8080

# 2) Client (in a new terminal)
cd client
npm install
npm run dev    # Vite dev server, defaults to http://localhost:5173

Open http://localhost:5173.
The client reads VITE_API_BASE to call the server.

---

API

GET /api/health
Health probe for uptime checks.
Response:
{ "ok": true, "status": "healthy" }

POST /api/extract (multipart/form-data)
Fields:
- file — uploaded file (PDF or image)

Response:
{
  "ok": true,
  "file": { "name": "example.pdf", "type": "application/pdf" },
  "text": "Extracted text here...",
  "analysis": {
    "wordCount": 123,
    "readingTime": 1,
    "hashtags": 2,
    "mentions": 1,
    "urls": 0,
    "suggestions": [
      "Ask a question to spark replies.",
      "Add a clear call-to-action or helpful link.",
      "... (up to 5)"
    ],
    "topKeywords": [
      { "word": "launch", "count": 3 },
      { "word": "feature", "count": 2 }
    ]
  }
}

cURL:
curl -X POST -F "file=@/path/to/your/file.png" http://localhost:8080/api/extract

---

Supported Files & Limits

- Types: application/pdf, image/png, image/jpeg, image/jpg, image/webp
- Max size: 20 MB
- For very tall screenshots, the server applies a smart center-crop before OCR to reduce header/footer noise.

---

Deployment

Server (Render/Railway/Fly/etc.)
- Command: npm start
- Port: use platform default or set PORT
- CORS: server already enables permissive CORS for GET, POST, OPTIONS

Render (example)
- Build Command: npm install
- Start Command: npm start

Client (Vercel/Netlify)
- Build: vite build → outputs to dist/
- Set VITE_API_BASE to your deployed server URL
- Add a rewrite/proxy for /api/* → server URL (optional but recommended)

Vercel (vercel.json)
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://<your-server-domain>/$1" }
  ]
}

Netlify (netlify.toml)
[[redirects]]
  from = "/api/*"
  to = "https://<your-server-domain>/:splat"
  status = 200

---

Quality, Security & Ops Notes

- No secrets in client: there are no API keys in the client code.
- Rate limiting: If exposing publicly, add a reverse-proxy or Express middleware (e.g., express-rate-limit).
- File validation: The server enforces MIME and size limits via multer.
- Error handling: Clear 400/415/500 responses; client shows user-friendly messages.
- Logging: Minimal console logs; integrate with a logger (e.g., pino/winston) for production.
- Health checks: Use /api/health for platform liveness probes.

---

Performance Tips

- OCR speed: OCR is CPU-bound. Prefer smaller, cropped images for faster results.
- Tesseract cache: First run downloads eng data; subsequent runs are faster.
- PDFs vs Images: Native text PDFs are much faster than scanned PDFs.
- Horizontal scaling: Stateless; can be scaled behind a load balancer. Pin CPU-heavy OCR behind a queue if needed.

---

Troubleshooting

- 415 Unsupported Media Type
  Only PDFs and images are allowed. Check the file’s MIME type and extension.

- 400 File too large
  Files over 20 MB are rejected. Compress or downscale.

- Tesseract slow on first run
  It downloads eng traineddata the first time. Warm up by OCR’ing a tiny image during deploy.

- CORS errors in browser
  Ensure VITE_API_BASE points to the correct server URL and the server is reachable. Rewrites help avoid mixed-origin issues.

---

Roadmap (Optional)
- OCR on scanned PDFs (per-page rasterization before OCR)
- Language selection for OCR (multi-lang support)
- Export to .md with basic formatting

---

License
MIT © Your Name
"""

path = "/mnt/data/README_Social_Media_Content_Analyzer.txt"
with open(path, "w", encoding="utf-8") as f:
    f.write(content)

path
