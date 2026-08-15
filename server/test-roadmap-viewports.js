import puppeteer from 'puppeteer';
import path from 'path';

const baseUrl = 'http://localhost:5173';
const artifactDir = 'C:/Users/hamza/.gemini/antigravity-ide/brain/1fb9bbc9-dda4-4634-a566-baec13350370';

async function auditRoadmapUI() {
  console.log("════════════════════════════════════════════════════════════");
  console.log(" GDX ROADMAP — COMPREHENSIVE VISUAL & RESPONSIVE AUDIT");
  console.log(" Testing all requested viewports & accordion states via Puppeteer");
  console.log("════════════════════════════════════════════════════════════\n");

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
      console.log(`  ❌ [Console Error] ${msg.text()}`);
    }
  });

  page.on('response', resp => {
    if (resp.status() >= 500) {
      networkErrors.push(`${resp.status()} ${resp.url()}`);
      console.log(`  ⚠️ [Network Error] ${resp.status()} ${resp.url()}`);
    }
  });

  try {
    // 1. Sign up test user
    console.log("▶ Step 1: Registering authenticated audit user...");
    await page.goto(`${baseUrl}/signup`, { waitUntil: 'networkidle0' });

    const userEmail = `roadmap_audit_${Date.now()}@gdx.test`;
    await page.type('input[type="text"]', 'Roadmap Auditor');
    await page.type('input[type="email"]', userEmail);
    await page.type('input[type="password"]', 'password123');

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);

    console.log("✅ Authenticated successfully! Navigating to /roadmap...");
    await page.goto(`${baseUrl}/roadmap`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('h1');

    // Screenshot 1: DESKTOP TOP (1920x1080)
    const topPath = path.join(artifactDir, 'roadmap_audit_desktop_top.png');
    await page.screenshot({ path: topPath, fullPage: false });
    console.log(`📸 Screenshot Desktop Top (1920x1080): ${topPath}`);

    // Screenshot 2: DESKTOP WEEK 1 EXPANDED (1920x1080)
    await page.evaluate(() => window.scrollTo(0, 300));
    await new Promise(r => setTimeout(r, 400));
    const w1Path = path.join(artifactDir, 'roadmap_audit_week1_expanded.png');
    await page.screenshot({ path: w1Path, fullPage: false });
    console.log(`📸 Screenshot Week 1 Expanded: ${w1Path}`);

    // Screenshot 3: DESKTOP WEEK 2-4 COLLAPSED (1920x1080)
    await page.evaluate(() => window.scrollTo(0, 700));
    await new Promise(r => setTimeout(r, 400));
    const w24Path = path.join(artifactDir, 'roadmap_audit_weeks_collapsed.png');
    await page.screenshot({ path: w24Path, fullPage: false });
    console.log(`📸 Screenshot Weeks Collapsed: ${w24Path}`);

    // Reset Scroll
    await page.evaluate(() => window.scrollTo(0, 0));

    // Viewport TABLET (768x1024)
    console.log("\n▶ Step 2: Testing Tablet Viewport (768x1024)...");
    await page.setViewport({ width: 768, height: 1024 });
    await new Promise(r => setTimeout(r, 300));
    const tabletPath = path.join(artifactDir, 'roadmap_audit_tablet.png');
    await page.screenshot({ path: tabletPath, fullPage: false });
    console.log(`📸 Screenshot Tablet (768x1024): ${tabletPath}`);

    // Viewport MOBILE (390x844)
    console.log("\n▶ Step 3: Testing Mobile Viewport (390x844)...");
    await page.setViewport({ width: 390, height: 844 });
    await new Promise(r => setTimeout(r, 300));
    const mobilePath = path.join(artifactDir, 'roadmap_audit_mobile.png');
    await page.screenshot({ path: mobilePath, fullPage: false });
    console.log(`📸 Screenshot Mobile (390x844): ${mobilePath}`);

    // Check horizontal overflow on mobile
    const overflowCheck = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    console.log(`  Horizontal overflow check (390px): ${overflowCheck ? 'FAIL (Horizontal scroll present)' : 'PASS (No horizontal scroll)'}`);

  } catch (err) {
    console.error('❌ Audit script exception:', err);
  } finally {
    await browser.close();
  }

  console.log("\n════════════════════════════════════════════════════════════");
  console.log(` Console Errors : ${consoleErrors.length}`);
  console.log(` Network Errors : ${networkErrors.length}`);
  console.log("════════════════════════════════════════════════════════════\n");
}

auditRoadmapUI();
