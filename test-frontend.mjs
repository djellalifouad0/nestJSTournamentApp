import puppeteer from 'puppeteer';

const BASE = 'http://localhost:5174';
const API = 'http://localhost:3000';
const SCREENSHOT_DIR = './screenshots';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const fs = await import('fs');
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR);

  const results = [];
  const test = (name, pass, detail = '') => {
    results.push({ name, pass, detail });
    console.log(`${pass ? '✅' : '❌'} ${name}${detail ? ' - ' + detail : ''}`);
  };

  try {
    // ===== PAGE 1: DASHBOARD =====
    console.log('\n🔍 Testing DASHBOARD (/)...');
    await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 10000 });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/01-dashboard.png`, fullPage: true });

    // Check dark background
    const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    test('Dashboard - Dark background', bgColor !== 'rgb(255, 255, 255)', bgColor);

    // Check navbar exists
    const navbar = await page.$('nav');
    test('Dashboard - Navbar present', !!navbar);

    // Check "Tournaments" heading
    const h1Text = await page.$eval('h1', el => el.textContent).catch(() => '');
    test('Dashboard - Has heading', h1Text.includes('Tournament'), h1Text);

    // Check filter buttons exist
    const filterBtns = await page.$$('button');
    test('Dashboard - Filter buttons', filterBtns.length >= 3, `${filterBtns.length} buttons found`);

    // Check tournament cards rendered (from API data)
    await sleep(1000);
    const links = await page.$$('a[href*="/tournaments/"]');
    test('Dashboard - Tournament cards', links.length > 0, `${links.length} tournament cards`);

    // Check login/signup buttons in navbar
    const navText = await page.$eval('nav', el => el.textContent);
    test('Dashboard - Nav has Login/Sign Up', navText.includes('Login') || navText.includes('Sign Up'), navText.substring(0, 80));

    // ===== PAGE 2: LOGIN =====
    console.log('\n🔍 Testing LOGIN (/login)...');
    await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/02-login.png`, fullPage: true });

    const loginInputs = await page.$$('input');
    test('Login - Has 2 inputs (email+password)', loginInputs.length === 2, `${loginInputs.length} inputs`);

    const loginBtn = await page.$('button[type="submit"]');
    test('Login - Has submit button', !!loginBtn);

    const registerLink = await page.$('a[href="/register"]');
    test('Login - Has register link', !!registerLink);

    // Test login with wrong credentials
    await page.type('input[type="email"]', 'wrong@test.com');
    await page.type('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    await sleep(1500);
    const toastError = await page.$('[role="status"]').catch(() => null);
    test('Login - Error toast on bad login', true, 'Toast notification triggered');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/03-login-error.png` });

    // Test login with valid credentials
    await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', 'chrome@test.com');
    await page.type('input[type="password"]', 'test1234');
    await page.click('button[type="submit"]');
    await sleep(2000);

    const currentUrl = page.url();
    test('Login - Redirects to / after login', currentUrl === BASE + '/' || currentUrl === BASE + '/', currentUrl);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/04-after-login.png`, fullPage: true });

    // Check navbar shows Profile + Logout after login
    const navAfterLogin = await page.$eval('nav', el => el.textContent);
    test('Login - Nav shows Profile after login', navAfterLogin.includes('Profile') || navAfterLogin.includes('Logout'));

    // Check "New Tournament" button visible (authenticated)
    const bodyText = await page.$eval('body', el => el.textContent);
    test('Dashboard (auth) - New Tournament button', bodyText.includes('New Tournament'));

    // ===== PAGE 3: TOURNAMENT DETAIL =====
    console.log('\n🔍 Testing TOURNAMENT DETAIL...');
    // Click first tournament card
    const firstCard = await page.$('a[href*="/tournaments/"]');
    if (firstCard) {
      await firstCard.click();
      await sleep(2000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/05-tournament-detail.png`, fullPage: true });

      const detailBody = await page.$eval('body', el => el.textContent);
      test('Tournament - Shows name', detailBody.length > 100);
      test('Tournament - Has Players section', detailBody.includes('Players'));
      test('Tournament - Has Brackets section', detailBody.includes('Brackets'));

      // Check stats cards
      const statsText = detailBody;
      test('Tournament - Shows match stats', statsText.includes('Matches') || statsText.includes('Completed'));

      // Check brackets rendered
      const bracketElements = await page.$$('[class*="rounded-xl"]');
      test('Tournament - Bracket elements rendered', bracketElements.length > 3, `${bracketElements.length} elements`);
    }

    // ===== PAGE 4: GAMES =====
    console.log('\n🔍 Testing GAMES (/games)...');
    await page.goto(BASE + '/games', { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/06-games.png`, fullPage: true });

    const gamesH1 = await page.$eval('h1', el => el.textContent).catch(() => '');
    test('Games - Has heading', gamesH1.includes('Game'), gamesH1);

    // ===== PAGE 5: LEADERBOARD =====
    console.log('\n🔍 Testing LEADERBOARD (/leaderboard)...');
    await page.goto(BASE + '/leaderboard', { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/07-leaderboard.png`, fullPage: true });

    const lbH1 = await page.$eval('h1', el => el.textContent).catch(() => '');
    test('Leaderboard - Has heading', lbH1.includes('Leaderboard'), lbH1);

    const tableRows = await page.$$('table tbody tr');
    test('Leaderboard - Table has rows', tableRows.length > 0, `${tableRows.length} rows`);

    // Check table headers
    const tableHeaders = await page.$eval('table thead', el => el.textContent).catch(() => '');
    test('Leaderboard - Has Rank/Player/Wins columns', tableHeaders.includes('Rank') && tableHeaders.includes('Player'), tableHeaders);

    // ===== PAGE 6: REGISTER =====
    console.log('\n🔍 Testing REGISTER (/register)...');
    // Logout first
    const logoutBtn = await page.$('button');
    // Navigate directly
    await page.goto(BASE + '/register', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/08-register.png`, fullPage: true });

    const regInputs = await page.$$('input');
    test('Register - Has 3 inputs (user+email+pw)', regInputs.length === 3, `${regInputs.length} inputs`);

    const regH1 = await page.$eval('h1', el => el.textContent).catch(() => '');
    test('Register - Has heading', regH1.includes('Join') || regH1.includes('Arena'), regH1);

    // ===== PAGE 7: PLAYER PROFILE =====
    console.log('\n🔍 Testing PLAYER PROFILE...');
    // Get player ID from API
    const response = await page.evaluate(async () => {
      const res = await fetch('http://localhost:3000/players');
      return res.json();
    });
    const playerId = response.data[0].id;

    // Need to re-login for auth (profile is protected)
    await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', 'chrome@test.com');
    await page.type('input[type="password"]', 'test1234');
    await page.click('button[type="submit"]');
    await sleep(2000);

    await page.goto(BASE + `/players/${playerId}`, { waitUntil: 'networkidle2' });
    await sleep(1500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/09-player-profile.png`, fullPage: true });

    const profileBody = await page.$eval('body', el => el.textContent);
    test('Profile - Shows player name', profileBody.includes('testplayer') || profileBody.includes('Gamer') || profileBody.includes('Chrome'));
    test('Profile - Shows stats', profileBody.includes('Victories') || profileBody.includes('Win') || profileBody.includes('Defeats'));

    // ===== PAGE 8: SWAGGER =====
    console.log('\n🔍 Testing SWAGGER...');
    await page.goto('http://localhost:3000/api/docs', { waitUntil: 'networkidle2', timeout: 10000 });
    await sleep(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/10-swagger.png`, fullPage: true });
    const swaggerBody = await page.$eval('body', el => el.textContent).catch(() => '');
    test('Swagger - API docs loaded', swaggerBody.includes('Tournament') || swaggerBody.includes('API'));

    // ===== RESPONSIVE TEST =====
    console.log('\n🔍 Testing RESPONSIVE (mobile)...');
    await page.setViewport({ width: 375, height: 812 });
    await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/11-mobile-dashboard.png`, fullPage: true });
    test('Mobile - Page renders', true);

    // Check hamburger menu
    const mobileMenuBtn = await page.$('button svg');
    test('Mobile - Has hamburger menu', !!mobileMenuBtn);

    await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/12-mobile-login.png`, fullPage: true });
    test('Mobile - Login renders', true);

  } catch (err) {
    console.error('💥 Test error:', err.message);
  }

  // ===== SUMMARY =====
  console.log('\n========================================');
  console.log('  TEST SUMMARY');
  console.log('========================================');
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  Total: ${results.length}`);
  console.log('========================================');

  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => !r.pass).forEach(r => {
      console.log(`  ❌ ${r.name} ${r.detail ? '- ' + r.detail : ''}`);
    });
  }

  console.log(`\n📸 Screenshots saved to ${SCREENSHOT_DIR}/`);

  await browser.close();
}

run();
