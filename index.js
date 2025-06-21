import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/fetch-chords', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.startsWith('https://tabs.ultimate-guitar.com')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });
    const raw = await page.evaluate(() => {
      const container = document.querySelector('pre');
      return container ? container.innerText : '';
    });


    console.log("=== RAW CHORDS SAMPLE ===");
    console.log(raw.slice(0, 300));


    console.log("Fetched raw chords:", raw.slice(0, 300));


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