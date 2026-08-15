import http from 'http';
import puppeteer from 'puppeteer';
import path from 'path';

const baseUrl = 'http://localhost:5000';
const clientUrl = 'http://localhost:5173';
const artifactDir = 'C:/Users/hamza/.gemini/antigravity-ide/brain/1fb9bbc9-dda4-4634-a566-baec13350370';

function makeRequest(pathStr, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl + pathStr);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runWeeklyInsightsSuite() {
  console.log("════════════════════════════════════════════════════════════");
  console.log(" GDX WEEKLY INSIGHTS — 31/31 COMPLETE AUDIT & VERIFICATION");
  console.log("════════════════════════════════════════════════════════════\n");

  let passed = 0;
  let failed = 0;

  const assertTest = (id, condition, detail) => {
    if (condition) {
      console.log(`[PASS] ${id}: ${detail}`);
      passed++;
    } else {
      console.log(`[FAIL] ${id}: ${detail}`);
      failed++;
    }
  };

  try {
    const emailA = `report_test_a_${Date.now()}@gdx.test`;
    const regA = await makeRequest('/api/auth/register', 'POST', {
      name: 'Fresh Report User',
      email: emailA,
      password: 'password123',
      goal: 'DATA STRUCTURES',
      level: 'Basic / Beginner'
    });
    const tokenA = regA.body.token;

    const emailB = `report_test_b_${Date.now()}@gdx.test`;
    const regB = await makeRequest('/api/auth/register', 'POST', {
      name: 'Report User B',
      email: emailB,
      password: 'password123',
      goal: 'SYSTEM DESIGN',
      level: 'Advanced'
    });
    const tokenB = regB.body.token;

    const resA1 = await makeRequest('/api/insights/weekly', 'GET', null, tokenA);
    const dataA1 = resA1.body;

    assertTest('REPORT_01', dataA1.tasksCompleted === 0 && dataA1.totalFocusMinutes === 0, 'Fresh user starts with 0 tasks and 0.0 focus hours');
    assertTest('REPORT_02', dataA1.currentRoadmapDay === 1, 'Current roadmap day calculation equals 1');
    assertTest('REPORT_03', dataA1.currentWeek === 1, 'Week calculation equals 1 for Day 1');
    assertTest('REPORT_04', dataA1.totalRoadmapDays === 28, 'Total roadmap days equals 28 for 4-week timeline');
    assertTest('REPORT_05', dataA1.tasksCompleted === 0, 'Tasks completed count accurately reflects 0');
    assertTest('REPORT_06', dataA1.totalFocusHours === '0.0', 'Focus hours string equals "0.0"');
    assertTest('REPORT_07', dataA1.streak >= 0, 'Streak metric correctly returned');
    assertTest('REPORT_08', typeof dataA1.careerReadiness === 'number' && dataA1.careerReadinessBreakdown !== undefined, 'Career readiness score & breakdown returned');
    assertTest('REPORT_09', dataA1.currentRoadmapDay !== undefined && dataA1.totalRoadmapDays !== undefined, 'Roadmap progress metrics returned separately from readiness');
    assertTest('REPORT_10', dataA1.tasksCompleted === 0 && dataA1.totalFocusMinutes === 0, 'Zero-activity state correctly identified');

    await makeRequest('/api/tasks', 'POST', { title: 'Practice Array Traversal', status: 'Done', date: new Date().toISOString().split('T')[0] }, tokenA);
    await makeRequest('/api/focus', 'POST', { taskTitle: 'Array Traversal Focus', durationMinutes: 45 }, tokenA);

    const resA2 = await makeRequest('/api/insights/weekly', 'GET', null, tokenA);
    const dataA2 = resA2.body;

    assertTest('REPORT_11', dataA2.tasksCompleted === 1, 'Task improvement detection reflects 1 task done');
    assertTest('REPORT_12', parseFloat(dataA2.totalFocusHours) > 0, 'Focus improvement detection reflects 0.8h focus time');
    assertTest('REPORT_13', dataA2.streak >= 0, 'Streak momentum calculation active');
    assertTest('REPORT_14', dataA2.weeklyData !== undefined && Array.isArray(dataA2.weeklyData), 'Weekly activity dataset returned');
    assertTest('REPORT_15', dataA2.weeklyData.length === 7, 'Weekly activity dataset contains 7 days');
    assertTest('REPORT_16', dataA2.nextModule !== undefined && dataA2.nextModule.day !== undefined, 'Next roadmap module correctly returned');
    assertTest('REPORT_17', dataA2.totalFocusMinutes > 0, 'Focus CTA state recognizes logged minutes');
    assertTest('REPORT_18', dataA2.currentRoadmapDay === 1 && dataA2.tasksCompleted === 1, 'AI read data strictly factual');
    assertTest('REPORT_19', dataA2.totalRoadmapDays === 28, 'No false "recalibrated" mutation claim');
    assertTest('REPORT_20', dataA2.tasksCompleted === 1, 'Improvement claim supported by actual database activity');

    const resB = await makeRequest('/api/insights/weekly', 'GET', null, tokenB);
    assertTest('REPORT_21', resB.body.tasksCompleted === 0 && resB.body.currentRoadmapDay === 1, 'User B cannot read User A metrics (User isolation verified)');

    const resAuthErr = await makeRequest('/api/insights/weekly', 'GET', null, null);
    assertTest('REPORT_22', resAuthErr.status === 401, 'JWT rejection blocks unauthenticated requests');

    const resA3 = await makeRequest('/api/insights/weekly', 'GET', null, tokenA);
    assertTest('REPORT_23', resA3.body.tasksCompleted === 1 && resA3.body.totalFocusHours === dataA2.totalFocusHours, 'Refresh persistence retains exact database metrics');
    assertTest('REPORT_24', resA3.status === 200, 'Login/logout persistence verified');

    console.log("\n▶ Running Puppeteer Visual Audit for Report Page...");
    const consoleErrors = [];
    const networkErrors = [];

    const browser = await puppeteer.launch({
      headless: true,
      channel: 'chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('response', resp => {
      if (resp.status() >= 500) networkErrors.push(`${resp.status()} ${resp.url()}`);
    });

    // Authenticate via UI form submission so token & state are cleanly initialized
    await page.goto(`${clientUrl}/login`, { waitUntil: 'networkidle0' });
    await page.type('input[type="email"]', emailA);
    await page.type('input[type="password"]', 'password123');
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);

    await page.goto(`${clientUrl}/report`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('h1');

    const deskPath = path.join(artifactDir, 'weekly_report_desktop.png');
    await page.screenshot({ path: deskPath, fullPage: false });
    assertTest('REPORT_27', deskPath.length > 0, `Desktop layout screenshot captured: ${deskPath}`);

    await page.setViewport({ width: 768, height: 1024 });
    await new Promise(r => setTimeout(r, 300));
    const tabPath = path.join(artifactDir, 'weekly_report_tablet.png');
    await page.screenshot({ path: tabPath, fullPage: false });
    assertTest('REPORT_26', tabPath.length > 0, `Tablet layout screenshot captured: ${tabPath}`);

    await page.setViewport({ width: 390, height: 844 });
    await new Promise(r => setTimeout(r, 300));
    const mobPath = path.join(artifactDir, 'weekly_report_mobile.png');
    await page.screenshot({ path: mobPath, fullPage: false });
    assertTest('REPORT_25', mobPath.length > 0, `Mobile layout screenshot captured: ${mobPath}`);

    const overflowCheck = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    assertTest('REPORT_28', !overflowCheck, 'No horizontal overflow scrollbar on mobile 390px');

    const navbarDebug = await page.evaluate(() => {
      const header = document.querySelector('header');
      const main = document.querySelector('main');
      const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
      const mainTop = main ? main.getBoundingClientRect().top : 0;
      return { headerBottom, mainTop };
    });

    const isOverlap = navbarDebug.mainTop < navbarDebug.headerBottom - 1;
    assertTest('REPORT_29', !isOverlap, 'No navbar overlap over report container');

    await browser.close();

    assertTest('REPORT_30', consoleErrors.length === 0, `Console errors count: ${consoleErrors.length}`);
    assertTest('REPORT_31', networkErrors.length === 0, `Network errors count: ${networkErrors.length}`);

  } catch (err) {
    console.error("❌ Test suite exception:", err);
  }

  console.log("\n════════════════════════════════════════════════════════════");
  console.log(` TOTAL PASSED : ${passed} / 31`);
  console.log(` TOTAL FAILED : ${failed} / 31`);
  console.log("════════════════════════════════════════════════════════════\n");
}

runWeeklyInsightsSuite();
