import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const baseUrl = 'http://localhost:5173';
const artifactDir = 'C:/Users/hamza/.gemini/antigravity-ide/brain/1fb9bbc9-dda4-4634-a566-baec13350370';

async function auditDashboardUI() {
  console.log("════════════════════════════════════════════════════════════");
  console.log(" GDX DASHBOARD — COMPREHENSIVE VISUAL & RESPONSIVE AUDIT");
  console.log(" Testing all 7 viewports & scroll states via Puppeteer Chrome");
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

    const userEmail = `dash_audit_${Date.now()}@gdx.test`;
    await page.type('input[type="text"]', 'Visual Auditor');
    await page.type('input[type="email"]', userEmail);
    await page.type('input[type="password"]', 'password123');

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);

    console.log("✅ Authenticated successfully! Currently at:", page.url());

    // 2. Navigate to Dashboard
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('h1');

    // Screenshot 1: TOP OF DASHBOARD (1920x1080)
    const topPath = path.join(artifactDir, 'dashboard_audit_top_1920.png');
    await page.screenshot({ path: topPath, fullPage: false });
    console.log(`📸 Screenshot Top (1920x1080): ${topPath}`);

    // Screenshot 2: MIDDLE OF DASHBOARD (1920x1080 scrolled)
    await page.evaluate(() => window.scrollTo(0, 400));
    await new Promise(r => setTimeout(r, 400));
    const midPath = path.join(artifactDir, 'dashboard_audit_mid_1920.png');
    await page.screenshot({ path: midPath, fullPage: false });
    console.log(`📸 Screenshot Middle (1920x1080 scrolled): ${midPath}`);

    // Check sticky navbar collision during scroll
    const navbarOverlap = await page.evaluate(() => {
      const header = document.querySelector('header');
      const firstCard = document.querySelector('main > div > div');
      if (!header || !firstCard) return false;
      const headerRect = header.getBoundingClientRect();
      const cardRect = firstCard.getBoundingClientRect();
      // Card top should be below header bottom or inside container
      return cardRect.top < headerRect.bottom && cardRect.bottom > headerRect.top;
    });
    console.log(`  Navbar collision test: ${navbarOverlap ? 'WARNING (Collision)' : 'PASS (Clean separation)'}`);

    // Screenshot 3: BOTTOM OF DASHBOARD (1920x1080 scrolled bottom)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 400));
    const bottomPath = path.join(artifactDir, 'dashboard_audit_bottom_1920.png');
    await page.screenshot({ path: bottomPath, fullPage: false });
    console.log(`📸 Screenshot Bottom (1920x1080 scrolled bottom): ${bottomPath}`);

    // Reset Scroll
    await page.evaluate(() => window.scrollTo(0, 0));

    // Viewport 1366x768
    console.log("\n▶ Step 2: Testing 1366px Laptop Viewport...");
    await page.setViewport({ width: 1366, height: 768 });
    await new Promise(r => setTimeout(r, 300));
    const path1366 = path.join(artifactDir, 'dashboard_audit_1366.png');
    await page.screenshot({ path: path1366, fullPage: false });
    console.log(`📸 Screenshot 1366px: ${path1366}`);

    // Viewport 1024x768
    console.log("\n▶ Step 3: Testing 1024px Tablet Landscape Viewport...");
    await page.setViewport({ width: 1024, height: 768 });
    await new Promise(r => setTimeout(r, 300));
    const path1024 = path.join(artifactDir, 'dashboard_audit_1024.png');
    await page.screenshot({ path: path1024, fullPage: false });
    console.log(`📸 Screenshot 1024px: ${path1024}`);

    // Viewport 768x1024
    console.log("\n▶ Step 4: Testing 768px Tablet Viewport...");
    await page.setViewport({ width: 768, height: 1024 });
    await new Promise(r => setTimeout(r, 300));
    const path768 = path.join(artifactDir, 'dashboard_audit_768.png');
    await page.screenshot({ path: path768, fullPage: false });
    console.log(`📸 Screenshot 768px: ${path768}`);

    // Viewport 390x844 (Mobile)
    console.log("\n▶ Step 5: Testing 390px Mobile Viewport...");
    await page.setViewport({ width: 390, height: 844 });
    await new Promise(r => setTimeout(r, 300));
    const path390 = path.join(artifactDir, 'dashboard_audit_390.png');
    await page.screenshot({ path: path390, fullPage: false });
    console.log(`📸 Screenshot 390px: ${path390}`);

    // Check horizontal scroll overflow on mobile
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

auditDashboardUI();
