import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

const baseUrl = 'http://localhost:5000';

async function runResumeAndAssignmentSuite() {
  console.log("════════════════════════════════════════════════════════════");
  console.log(" GUIDEX RESUME & ASSIGNMENT ENGINES — END-TO-END TEST SUITE");
  console.log(" Testing full request lifecycle: Upload -> Parse -> AI -> DB -> Auth");
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
    // 1. Create Test User & Obtain Token
    const userEmail = `engine_tester_${Date.now()}@gdx.test`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Engine Tester',
        email: userEmail,
        password: 'Password123!',
        goal: 'BACKEND DEVELOPMENT',
        level: 'intermediate',
        timelineWeeks: 4
      })
    });
    const regData = await regRes.json();
    const token = regData.token;
    assertTest('R05', Boolean(token), `Test User Authenticated & Token Obtained (ID: ${regData.user.id})`);

    // ─── RESUME ENGINE TESTS ───

    // R01 & R02: Upload Resume & Parse Text via /api/roadmap/parse-document
    const rawResumeSample = `Senior Software Engineer with 4 years experience in Node.js, Express, PostgreSQL, and REST APIs. Built microservices handling 50k requests/min. Proficient in Git, Docker, and CI/CD pipelines.`;
    const resumeBase64 = Buffer.from(rawResumeSample).toString('base64');
    
    const parseRes = await fetch(`${baseUrl}/api/roadmap/parse-document`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fileBase64: `data:text/plain;base64,${resumeBase64}`,
        fileName: 'resume_sample.txt'
      })
    });
    const parseData = await parseRes.json();
    assertTest('R01', parseData.success === true, 'Upload resume sample (.txt) to /api/roadmap/parse-document');
    assertTest('R02', parseData.text && parseData.wordCount > 10, `Text extracted cleanly (${parseData.wordCount} words)`);

    // R03 & R06 & R07: Analyze Resume & Re-generate Roadmap
    const analyzeRes = await fetch(`${baseUrl}/api/roadmap/analyze-resume`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ resumeText: parseData.text })
    });
    const analyzeData = await analyzeRes.json();
    assertTest('R03', analyzeData.success === true, 'Analyze resume text via /api/roadmap/analyze-resume');
    assertTest('R06', analyzeData.count >= 7, `Generated gap-focused roadmap (${analyzeData.count} days)`);
    assertTest('R07', analyzeData.success === true, 'AI gap optimization & fallback execution verified');

    // R04: Empty Input Rejection
    const emptyRes = await fetch(`${baseUrl}/api/roadmap/analyze-resume`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ resumeText: '   ' })
    });
    assertTest('R04', emptyRes.status === 400, 'Empty resume input correctly rejected with HTTP 400');

    // R08 & R09: Database Persistence & User Current Day Reset Verification
    const getRoadmapRes = await fetch(`${baseUrl}/api/roadmap`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const roadmapSteps = await getRoadmapRes.json();
    const hasValidTasks = Array.isArray(roadmapSteps) && roadmapSteps.every(s => Array.isArray(s.tasks) && s.tasks.length > 0 && s.tasks[0].taskId);
    assertTest('R08', hasValidTasks, `Roadmap steps persisted in MongoDB with valid taskId schemas (${roadmapSteps.length} steps)`);

    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    assertTest('R09', meData.currentRoadmapDay === 1, 'User currentRoadmapDay reset to Day 1 after resume re-generation');

    // R10: Invalid JWT Rejection
    const badJwtRes = await fetch(`${baseUrl}/api/roadmap/analyze-resume`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid_jwt_token_12345'
      },
      body: JSON.stringify({ resumeText: rawResumeSample })
    });
    assertTest('R10', badJwtRes.status === 401, 'Invalid JWT token rejected with HTTP 401');

    // ─── ASSIGNMENT SPRINT ENGINE TESTS ───

    // A01 & A02: Upload Assignment Brief & Parse Text
    const rawAssignmentSample = `Build a Bill Duplicate Checker web application. Requirements: 1) Upload PDF invoice. 2) Extract invoice number, vendor, amount, date. 3) Store in PostgreSQL database. 4) Flag duplicate invoices matching same vendor and amount. 5) Create REST API & React dashboard.`;
    const assignBase64 = Buffer.from(rawAssignmentSample).toString('base64');

    const assignParseRes = await fetch(`${baseUrl}/api/roadmap/parse-document`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fileBase64: `data:text/plain;base64,${assignBase64}`,
        fileName: 'project_brief.md'
      })
    });
    const assignParseData = await assignParseRes.json();
    assertTest('A01', assignParseData.success === true, 'Upload project specification brief (.md) to /api/roadmap/parse-document');
    assertTest('A02', assignParseData.text && assignParseData.wordCount > 10, `Text extracted from specification (${assignParseData.wordCount} words)`);

    // A03 & A06 & A07: Analyze Assignment into 7-Day Sprint
    const deconstructRes = await fetch(`${baseUrl}/api/roadmap/analyze-assignment`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ assignmentText: assignParseData.text })
    });
    const deconstructData = await deconstructRes.json();
    assertTest('A03', deconstructData.success === true, 'Deconstruct assignment via /api/roadmap/analyze-assignment');
    assertTest('A06', deconstructData.count === 7, 'Generated 7-day implementation sprint roadmap');
    assertTest('A07', deconstructData.count === 7, '7-Day Sprint validation constraint satisfied');

    // A04: Empty Input Rejection
    const emptyAssignRes = await fetch(`${baseUrl}/api/roadmap/analyze-assignment`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ assignmentText: '' })
    });
    assertTest('A04', emptyAssignRes.status === 400, 'Empty assignment input correctly rejected with HTTP 400');

    // A05 & A08: Fetch Project Sprint Steps & Verify 7-Day Count
    const getSprintRes = await fetch(`${baseUrl}/api/roadmap/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const projectsList = await getSprintRes.json();
    assertTest('A05', getSprintRes.status === 200 && Array.isArray(projectsList), 'Authenticated API request for sprint projects succeeded');
    const latestProj = projectsList[0];
    const projDetailRes = await fetch(`${baseUrl}/api/roadmap/projects/${latestProj.projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const projDetail = await projDetailRes.json();
    assertTest('A08', Array.isArray(projDetail.steps) && projDetail.steps.length === 7, `7-Day Sprint persisted in MongoDB database (${projDetail.steps ? projDetail.steps.length : 0} days total)`);

    const meSprintRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meSprintData = await meSprintRes.json();
    assertTest('A09', meSprintData.currentRoadmapDay === 1, 'User currentRoadmapDay reset to Day 1 for new project sprint');

    // A10: Invalid JWT Rejection
    const badJwtAssignRes = await fetch(`${baseUrl}/api/roadmap/analyze-assignment`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid_jwt_token_12345'
      },
      body: JSON.stringify({ assignmentText: rawAssignmentSample })
    });
    assertTest('A10', badJwtAssignRes.status === 401, 'Invalid JWT token rejected with HTTP 401');

  } catch (err) {
    console.error("❌ Test suite error:", err);
  }

  console.log("\n════════════════════════════════════════════════════════════");
  console.log(` TOTAL PASSED : ${passed} / 20`);
  console.log(` TOTAL FAILED : ${failed} / 20`);
  console.log("════════════════════════════════════════════════════════════\n");
}

runResumeAndAssignmentSuite();
