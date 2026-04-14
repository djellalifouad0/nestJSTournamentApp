import puppeteer from 'puppeteer';
const BASE = 'http://localhost:5174';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('📸 Capturing redesigned pages...\n');

  // Dashboard (logged out)
  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 10000 });
  await sleep(800);
  await page.screenshot({ path: './screenshots/redesign-01-dashboard.png', fullPage: true });
  console.log('✅ Dashboard');

  // Login
  await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
  await sleep(500);
  await page.screenshot({ path: './screenshots/redesign-02-login.png', fullPage: true });
  console.log('✅ Login');

  // Register
  await page.goto(BASE + '/register', { waitUntil: 'networkidle2' });
  await sleep(500);
  await page.screenshot({ path: './screenshots/redesign-03-register.png', fullPage: true });
  console.log('✅ Register');

  // Login as player
  await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'chrome@test.com');
  await page.type('input[type="password"]', 'test1234');
  await page.click('button[type="submit"]');
  await sleep(2000);
  await page.screenshot({ path: './screenshots/redesign-04-dashboard-auth.png', fullPage: true });
  console.log('✅ Dashboard (authenticated)');

  // Tournament detail
  const card = await page.$('a[href*="/tournaments/"]');
  if (card) {
    await card.click();
    await sleep(1500);
    await page.screenshot({ path: './screenshots/redesign-05-tournament.png', fullPage: true });
    console.log('✅ Tournament Detail');
  }

  // Leaderboard
  await page.goto(BASE + '/leaderboard', { waitUntil: 'networkidle2' });
  await sleep(800);
  await page.screenshot({ path: './screenshots/redesign-06-leaderboard.png', fullPage: true });
  console.log('✅ Leaderboard');

  // Games
  await page.goto(BASE + '/games', { waitUntil: 'networkidle2' });
  await sleep(800);
  await page.screenshot({ path: './screenshots/redesign-07-games.png', fullPage: true });
  console.log('✅ Games');

  // Player profile
  const pid = await page.evaluate(async () => {
    const r = await fetch('http://localhost:3001/players');
    const d = await r.json();
    return d.data[0].id;
  });
  await page.goto(BASE + '/players/' + pid, { waitUntil: 'networkidle2' });
  await sleep(1000);
  await page.screenshot({ path: './screenshots/redesign-08-profile.png', fullPage: true });
  console.log('✅ Player Profile');

  // Mobile
  await page.setViewport({ width: 375, height: 812 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
  await sleep(800);
  await page.screenshot({ path: './screenshots/redesign-09-mobile.png', fullPage: true });
  console.log('✅ Mobile Dashboard');

  await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
  await sleep(500);
  await page.screenshot({ path: './screenshots/redesign-10-mobile-login.png', fullPage: true });
  console.log('✅ Mobile Login');

  console.log('\n📸 All screenshots saved to ./screenshots/');
  await browser.close();
}
run();
