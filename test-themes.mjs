import puppeteer from 'puppeteer';
const BASE = 'http://localhost:5174';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // DARK MODE
  console.log('📸 Dark mode...');
  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 10000 });
  await page.evaluate(() => { localStorage.setItem('theme', 'dark'); document.documentElement.setAttribute('data-theme', 'dark'); });
  await sleep(500);
  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(800);
  await page.screenshot({ path: './screenshots/theme-dark-dashboard.png', fullPage: true });
  console.log('  ✅ Dashboard dark');

  await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
  await sleep(500);
  await page.screenshot({ path: './screenshots/theme-dark-login.png', fullPage: true });
  console.log('  ✅ Login dark');

  // LIGHT MODE
  console.log('📸 Light mode...');
  await page.evaluate(() => { localStorage.setItem('theme', 'light'); document.documentElement.setAttribute('data-theme', 'light'); });
  await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
  await sleep(800);
  await page.screenshot({ path: './screenshots/theme-light-dashboard.png', fullPage: true });
  console.log('  ✅ Dashboard light');

  await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
  await sleep(500);
  await page.screenshot({ path: './screenshots/theme-light-login.png', fullPage: true });
  console.log('  ✅ Login light');

  // Login and check leaderboard in both modes
  await page.evaluate(() => { document.documentElement.setAttribute('data-theme', 'light'); });
  await page.type('input[type="email"]', 'chrome@test.com');
  await page.type('input[type="password"]', 'test1234');
  await page.click('button[type="submit"]');
  await sleep(2000);

  await page.goto(BASE + '/leaderboard', { waitUntil: 'networkidle2' });
  await sleep(800);
  await page.screenshot({ path: './screenshots/theme-light-leaderboard.png', fullPage: true });
  console.log('  ✅ Leaderboard light');

  await page.evaluate(() => { localStorage.setItem('theme', 'dark'); document.documentElement.setAttribute('data-theme', 'dark'); });
  await sleep(300);
  await page.screenshot({ path: './screenshots/theme-dark-leaderboard.png', fullPage: true });
  console.log('  ✅ Leaderboard dark');

  console.log('\n📸 Done!');
  await browser.close();
}
run();
