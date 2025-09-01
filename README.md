# 📊 Social Media Content Analyzer

A modern tool to extract text from PDFs & images using OCR and provide quick, actionable engagement insights for social media posts.  
Built with React + Vite (frontend) and Node.js + Express (backend), powered by pdf-parse, Tesseract.js, and Sharp.

---

## ✨ Features
- 📂 File Uploads: Drag & drop or browse PDFs and images  
- 🔎 Smart Text Extraction:  
  - PDFs → direct text parsing  
  - Images → OCR (with Sharp preprocessing)  
- 📊 Engagement Insights:  
  - Word count & reading time  
  - Hashtags, mentions, links  
  - Top keywords  
  - Actionable improvement suggestions  
- ⚡ Robust UX: Handles large files (up to 20 MB) with clear error messages  
- 📥 Export Options: Copy or download extracted text  

---

## 🚀 Getting Started

### Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/vatsalm1611/social-media-content-analyzer.git
   cd social-media-content-analyzer
   ```

2. Start the backend:
   ```bash
   cd server
   npm install
   npm run dev   # http://localhost:8080
   ```

3. Start the frontend:
   ```bash
   cd client
   npm install
   npm run dev   # http://localhost:5173
   ```

---

## ☁️ Deployment (Render)

This project runs as a single web service on Render.  

- **Build Command**
  ```bash
  npm ci --prefix client && npm run build --prefix client && npm ci --prefix server
  ```

- **Start Command**
  ```bash
  npm start --prefix server
  ```

- **Health Check Path** → `/api/health`  

🔗 Live Demo: *https://social-media-content-analyzer-3vyn.onrender.com/*

---

## 🛠 Tech Stack
- Frontend: React, Vite, Tailwind CSS  
- Backend: Node.js, Express  
- Libraries: pdf-parse, Tesseract.js, Sharp, Multer  
- Deployment: Render (single service)  

---

## 📂 Project Structure
```
social-media-content-analyzer/
├── client/           # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── FileUpload.jsx
│       │   └── Result.jsx
│       ├── styles.css
│       └── main.jsx
└── server/           # Express backend
    ├── index.js      # API routes (/api/extract, /api/health)
    └── package.json
```

---

## 🔗 API Endpoints

### Health Check
```http
GET /api/health
→ { "ok": true, "status": "healthy" }
```

### Extract Text
```http
POST /api/extract
FormData: file=<pdf/image>
```

**Response**
```json
{
  "ok": true,
  "file": { "name": "example.pdf", "type": "application/pdf" },
  "text": "Extracted text here...",
  "analysis": {
    "wordCount": 123,
    "hashtags": 2,
    "mentions": 1,
    "urls": 0,
    "suggestions": [
      "Ask a question to spark replies.",
      "Add a clear call-to-action..."
    ],
    "topKeywords": [
      { "word": "launch", "count": 3 }
    ]
  }
}
```

---

## 🐛 Troubleshooting
- **415 Unsupported Media Type** → Only PDFs & images are allowed  
- **400 File Too Large** → Max size = 20 MB  
- **OCR Slow on First Run** → Tesseract downloads trained data once  
- **CORS Errors** → Ensure `VITE_API_BASE` matches backend URL  

---

## 📈 Roadmap
- Multi-language OCR support  
- OCR on scanned PDFs  
- Export results as Markdown  
- Rate limiting & logging for production  

---

## 📜 License
MIT © Vatsal Mishra  

---

⚡ Built with ❤ using modern web technologies ⚡
