// postinstall.js
const puppeteer = require('puppeteer');
puppeteer
  .launch()
  .then(browser => browser.close())
  .catch(err => {
    console.error('Failed to install Chromium via Puppeteer:', err);
    process.exit(1);
  });
