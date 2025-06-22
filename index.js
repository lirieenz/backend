import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';

const app = express();

// ✅ Allow CORS from your Netlify site
const allowedOrigin = 'https://genuine-melba-08fe31.netlify.app';
app.use(cors({ origin: allowedOrigin }));

app.use(express.json());

app.post('/fetch-chords', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.startsWith('https://tabs.ultimate-guitar.com')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // ✅ Required for Render
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });

    const raw = await page.evaluate(() => {
      const container = document.querySelector('pre');
      return container ? container.innerText : '';
    });

    await browser.close();

    if (!raw.trim()) {
      return res.status(500).json({ error: 'No chords found' });
    }

    res.json({ raw });
  } catch (err) {
    console.error('Fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch chords', detail: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`UG Proxy running on port ${PORT}`));
