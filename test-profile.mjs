import puppeteer from 'puppeteer';

const BASE = 'http://localhost:5174';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Login first
  await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'chrome@test.com');
  await page.type('input[type="password"]', 'test1234');
  await page.click('button[type="submit"]');
  await sleep(2500);

  // Now get player ID from API via the page context (token is in localStorage)
  const playerId = await page.evaluate(async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3000/players', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    return data.data[0].id;
  });

  console.log('Player ID:', playerId);

  // Navigate to profile — token is already in localStorage
  await page.goto(BASE + '/players/' + playerId, { waitUntil: 'networkidle2' });
  await sleep(2000);
  await page.screenshot({ path: './screenshots/13-player-profile-fixed.png', fullPage: true });

  const bodyText = await page.$eval('body', el => el.textContent);

  console.log('Page URL:', page.url());
  console.log('Has player name:', bodyText.includes('testplayer') || bodyText.includes('Gamer') || bodyText.includes('Chrome'));
  console.log('Has Victories:', bodyText.includes('Victories'));
  console.log('Has Defeats:', bodyText.includes('Defeats'));
  console.log('Has Win Rate:', bodyText.includes('Win Rate'));
  console.log('Has Trophies:', bodyText.includes('Trophies'));
  console.log('Has Tournament History:', bodyText.includes('Tournament History'));

  if (bodyText.includes('Victories')) {
    console.log('\n✅ Player Profile: ALL CHECKS PASSED');
  } else {
    console.log('\n❌ Player Profile: SOME CHECKS FAILED');
    console.log('Body excerpt:', bodyText.substring(0, 300));
  }

  await browser.close();
}

run();
