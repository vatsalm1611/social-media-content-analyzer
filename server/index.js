require('dotenv/config');
const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');

const app = express();
const SERVER_PORT = Number(process.env.PORT) || 8080;

/** Upload constraints */
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

/** Core middleware */
app.use(cors({ origin: true, methods: ['GET', 'POST', 'OPTIONS'] }));
app.use(express.json({ limit: '25mb' }));

/** In-memory single-file upload */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype === 'application/pdf' ||
      file.mimetype.startsWith('image/');
    return ok ? cb(null, true)
              : cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file'));
  },
});

/** Health check for uptime probes */
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, status: 'healthy' });
});

/** Ensure at least 5 actionable tips */
function ensureFiveTips(list) {
  const fallbacks = [
    'Use a strong opening line.',
    'Break long text into short chunks.',
    'Add a relevant image or short clip.',
    'Post when your audience is active.',
    'Keep tone consistent and concise.',
  ];
  const seen = new Set(list);
  for (const tip of fallbacks) {
    if (seen.size >= 5) break;
    if (!seen.has(tip)) { list.push(tip); seen.add(tip); }
  }
  return list.slice(0, 5);
}

/** Engagement-only analysis (no sentiment) */
function buildEngagementInsights(text = '') {
  const wordCount   = (text.match(/\b[\p{L}\p{N}_'-]+\b/gu) || []).length;
  const readingTime = Math.ceil(wordCount / 200); // ~200 wpm

  const hasQuestion = /\?/u.test(text);
  const hashtags    = text.match(/#\w+/g) || [];
  const mentions    = text.match(/@\w+/g) || [];
  const urls        = text.match(/\bhttps?:\/\/\S+/gi) || [];
  const hasCtaVerb  = /\b(like|share|follow|check|click|subscribe|comment|save)\b/i.test(text);
  const hasEmoji    = /\p{Extended_Pictographic}/u.test(text);

  const tips = [];
  if (wordCount < 40) tips.push('Post is short—add context or details.');
  if (wordCount > 220) tips.push('Post is long—trim or add line breaks.');
  if (!hasQuestion) tips.push('Ask a question to spark replies.');
  if (!hasCtaVerb && urls.length === 0) tips.push('Add a clear call-to-action or helpful link.');
  if (!hasEmoji) tips.push('Add a tasteful emoji for scannability.');
  if (hashtags.length < 2) tips.push('Consider adding 2–5 relevant hashtags.');
  if (mentions.length === 0) tips.push('Tag relevant accounts to expand reach.');

  // quick-and-simple keyword frequency (stopwords filtered)
  const freq = {};
  const stop = new Set(['the','is','and','to','a','of','in','on','for','with','at','by','an','be','this','that','it']);
  (text.toLowerCase().match(/\b[\p{L}\p{N}_'-]{3,}\b/gu) || [])
    .filter(w => !stop.has(w))
    .forEach(w => { freq[w] = (freq[w] || 0) + 1; });

  const topKeywords = Object.entries(freq)
    .sort((a,b) => b[1]-a[1])
    .slice(0,5)
    .map(([word,count]) => ({ word, count }));

  return {
    wordCount,
    readingTime,
    hashtags: hashtags.length,
    mentions: mentions.length,
    urls: urls.length,
    suggestions: ensureFiveTips(tips),
    topKeywords,
  };
}

/** Helper: count letters/digits to choose better OCR variant */
const countAlnum = (s) => ((s || '').match(/[A-Za-z0-9]/g) || []).length;

/** Main extraction endpoint */
app.post('/api/extract', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: 'No file uploaded' });
    }

    const { originalname, mimetype, buffer } = req.file;
    const supported =
      ALLOWED_TYPES.has(mimetype) || mimetype.startsWith('image/') || mimetype === 'application/pdf';
    if (!supported) {
      return res.status(415).json({ ok: false, error: `Unsupported type: ${mimetype}` });
    }

    let extractedText = '';

    if (mimetype === 'application/pdf') {
      // PDF → direct text
      const parsed = await pdfParse(buffer).catch(() => null);
      extractedText = (parsed?.text || '').trim();
    } else if (mimetype.startsWith('image/')) {
      // Image → preprocess → OCR
      const rotated = sharp(buffer).rotate();
      const meta = await rotated.metadata();

      // pragmatic center-crop for tall screenshots (e.g., feed headers/footers)
      let working = rotated;
      if (meta?.height && meta?.width && meta.height > 600) {
        const cutTop = Math.round(meta.height * 0.12);
        const cutBottom = Math.round(meta.height * 0.18);
        const height = Math.max(50, meta.height - cutTop - cutBottom);
        working = rotated.extract({ left: 0, top: cutTop, width: meta.width, height });
      }

      const resized = await working.png().toBuffer();
      const prepped = await sharp(resized).grayscale().normalize().threshold(165).toBuffer();

      const ocrCfg = { tessedit_pageseg_mode: 6, preserve_interword_spaces: '1' };
      const [p1, p2] = await Promise.allSettled([
        Tesseract.recognize(prepped, 'eng', ocrCfg),
        Tesseract.recognize(resized, 'eng', ocrCfg),
      ]);

      const t1 = p1.status === 'fulfilled' ? (p1.value?.data?.text || '').trim() : '';
      const t2 = p2.status === 'fulfilled' ? (p2.value?.data?.text || '').trim() : '';
      extractedText = countAlnum(t1) >= countAlnum(t2) ? t1 : t2;

      // strip social chrome noise
      extractedText = extractedText
        .replace(/\b(Like|Comment|Share|News Feed|Yesterday at .*|\d+\s*comments?|\d+\s*likes?)\b/gi, '')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }

    const analysis = buildEngagementInsights(extractedText || '');

    return res.json({
      ok: true,
      file: { name: originalname, type: mimetype },
      text: extractedText,
      analysis,
    });
  } catch (err) {
    if (err instanceof multer.MulterError) {
      const msg = err.code === 'LIMIT_FILE_SIZE'
        ? 'File too large (max 20MB)'
        : 'Invalid file upload';
      return res.status(400).json({ ok: false, error: msg });
    }
    console.error('[extract] error:', err);
    return res.status(500).json({ ok: false, error: 'Extraction failed' });
  }
});

/** --- Serve React build (Vite: client/dist) --- */
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

/** SPA fallback: non-API routes -> index.html */
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  return res.sendFile(path.join(clientBuildPath, 'index.html'));
});

/** Fallback 404 (API ke liye) */
app.use((_req, res) => {
  res.status(404).json({ ok: false, error: 'Route not found' });
});

/** Boot */
app.listen(SERVER_PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${SERVER_PORT}`);
});
