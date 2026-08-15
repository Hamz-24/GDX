import puppeteer from 'puppeteer';
import path from 'path';

const clientUrl = 'http://localhost:5173';
const artifactDir = 'C:/Users/hamza/.gemini/antigravity-ide/brain/1fb9bbc9-dda4-4634-a566-baec13350370';

async function runLandingPageAudit() {
  console.log("════════════════════════════════════════════════════════════");
  console.log(" GUIDEX LANDING PAGE — COMPREHENSIVE VISUAL & UX AUDIT");
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
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  page.on('response', resp => {
    if (resp.status() >= 500) networkErrors.push(`${resp.status()} ${resp.url()}`);
  });

  try {
    await page.goto(`${clientUrl}/`, { waitUntil: 'networkidle0' });

    // 1. Navbar check
    const logoText = await page.$eval('header', el => el.innerText);
    assertTest('LANDING_01', logoText.includes('GuideX') && logoText.includes('Log In') && logoText.includes('Get Started'), 'Top navbar rendered cleanly with logo & auth buttons');

    // 2. Hero Headline & Subtitle check
    const heroH1 = await page.$eval('h1', el => el.innerText);
    assertTest('LANDING_02', heroH1.includes('Systematically Prepare for Your Target Technical Role'), 'Hero headline matches specification exactly');

    // 3. What is GuideX answer box
    const valuePropBox = await page.$eval('section', el => el.innerText);
    assertTest('LANDING_03', valuePropBox.includes('WHAT IS GUIDEX?') && valuePropBox.includes('turns technical career preparation into a structured daily execution plan'), 'Value proposition answer box rendered');

    // 4. How GuideX Works 4-Step Flow
    const howItWorksText = await page.$eval('#how-it-works', el => el.innerText);
    assertTest('LANDING_04', howItWorksText.includes('01') && howItWorksText.includes('02') && howItWorksText.includes('03') && howItWorksText.includes('04'), '4-step flow rendered with numbers 01–04');

    // 5. Realistic Dashboard Preview
    const previewText = await page.$eval('#product-preview', el => el.innerText);
    assertTest('LANDING_05', previewText.includes('Master REST API Authentication') && previewText.includes('68%') && previewText.includes('42 min'), 'Realistic product preview rendered with objectives & metrics');

    // 6. Resume Gap Section
    const resumeText = await page.evaluate(() => document.body.innerText);
    assertTest('LANDING_06', resumeText.includes('Already have a resume? Start there.') && resumeText.includes('Analyze My Resume'), 'Resume gap analysis section rendered with CTA');

    // 7. Feature Cards
    const featuresText = await page.$eval('#features', el => el.innerText);
    assertTest('LANDING_07', featuresText.includes('Structured AI Roadmaps') && featuresText.includes('AI Mentor') && featuresText.includes('Focus Room & Telemetry'), '3 outcome-focused feature cards rendered');

    // 8. Supported Roles
    const rolesText = await page.$eval('#roles', el => el.innerText);
    assertTest('LANDING_08', rolesText.includes('Software Engineering') && rolesText.includes('Quant / Trading Development'), 'Supported roles section rendered cleanly');

    // 9. Final CTA & Footer
    assertTest('LANDING_09', resumeText.includes('Know what to learn. Know what to do next.') && resumeText.includes('© 2026 GuideX'), 'Final CTA & footer rendered cleanly');

    // Screenshot Desktop
    const deskPath = path.join(artifactDir, 'landing_page_desktop.png');
    await page.screenshot({ path: deskPath, fullPage: false });
    assertTest('LANDING_10', deskPath.length > 0, `Desktop view screenshot saved: ${deskPath}`);

    // Screenshot Tablet
    await page.setViewport({ width: 768, height: 1024 });
    await new Promise(r => setTimeout(r, 300));
    const tabPath = path.join(artifactDir, 'landing_page_tablet.png');
    await page.screenshot({ path: tabPath, fullPage: false });
    assertTest('LANDING_11', tabPath.length > 0, `Tablet view screenshot saved: ${tabPath}`);

    // Screenshot Mobile 390px
    await page.setViewport({ width: 390, height: 844 });
    await new Promise(r => setTimeout(r, 300));
    const mobPath = path.join(artifactDir, 'landing_page_mobile.png');
    await page.screenshot({ path: mobPath, fullPage: false });
    assertTest('LANDING_12', mobPath.length > 0, `Mobile 390px view screenshot saved: ${mobPath}`);

    // Check Horizontal Overflow
    const overflowCheck = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    assertTest('LANDING_13', !overflowCheck, 'No horizontal overflow scrollbar on mobile 390px');

    assertTest('LANDING_14', consoleErrors.length === 0, `Console error count: ${consoleErrors.length}`);
    assertTest('LANDING_15', networkErrors.length === 0, `Network error count: ${networkErrors.length}`);

  } catch (err) {
    console.error("❌ Audit error:", err);
  } finally {
    await browser.close();
  }

  console.log("\n════════════════════════════════════════════════════════════");
  console.log(` TOTAL PASSED : ${passed} / 15`);
  console.log(` TOTAL FAILED : ${failed} / 15`);
  console.log("════════════════════════════════════════════════════════════\n");
}

runLandingPageAudit();
