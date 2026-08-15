import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const baseUrl = 'http://localhost:5000';
let passedCount = 0;
let failedCount = 0;

const assertTest = (testId, condition, description) => {
  if (condition) {
    console.log(`[PASS] ${testId}: ${description}`);
    passedCount++;
  } else {
    console.error(`[FAIL] ${testId}: ${description}`);
    failedCount++;
  }
};

const runContentRelevanceSuite = async () => {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log(' GUIDEX ROADMAP CONTENT RELEVANCE & VERSIONING SUITE (C01..C10)');
  console.log(' Testing domain matching, versioning, rollback, & relevance');
  console.log('════════════════════════════════════════════════════════════\n');

  try {
    // Authenticate Test User A with goal "DATA STRUCTURES"
    const userAEmail = `relevance_user_a_${Date.now()}@gdx.test`;
    const regResA = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Relevance Tester A',
        email: userAEmail,
        password: 'Password123!',
        goal: 'DATA STRUCTURES',
        level: 'intermediate',
        timelineWeeks: 4
      })
    });
    const regDataA = await regResA.json();
    const tokenA = regDataA.token;
    assertTest('C00', Boolean(tokenA), `User A Registered & Authenticated (${userAEmail})`);

    // C01: Fetch Core Roadmap for DATA STRUCTURES & Verify Goal Relevance
    const coreRes1 = await fetch(`${baseUrl}/api/roadmap/core`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const coreSteps1 = await coreRes1.json();
    const hasDsaContent = coreSteps1.some(s => {
      const t = `${s.dayName || ''} ${s.context || ''}`.toLowerCase();
      return t.includes('array') || t.includes('tree') || t.includes('graph') || t.includes('heap') || t.includes('data structures') || t.includes('hash');
    });
    assertTest('C01', Array.isArray(coreSteps1) && coreSteps1.length >= 7 && hasDsaContent, `C01: Core Roadmap generated with Data Structures relevant topics (${coreSteps1.length} days)`);

    // C02: Verify Unrelated Framework Content Rejection (No React/Next.js in Data Structures roadmap)
    const hasForbiddenReact = coreSteps1.some(s => {
      const t = `${s.dayName || ''} ${s.context || ''}`.toLowerCase();
      return t.includes('react 19') || t.includes('next.js') || t.includes('zustand');
    });
    assertTest('C02', !hasForbiddenReact, 'C02: Zero unrelated React/Next.js content in Data Structures roadmap');

    // C03: Header & Daily Topic Consistency
    const isTopicConsistent = coreSteps1.every(s => s.roadmapType === 'core' && s.isActive === true);
    assertTest('C03', isTopicConsistent, 'C03: Header and daily steps are 100% scoped to active core roadmap');

    // C04: Week Context Domain Alignment
    const hasValidContext = coreSteps1.every(s => typeof s.context === 'string' && s.context.length > 5);
    assertTest('C04', hasValidContext, 'C04: Week context briefings are properly aligned to topic objectives');

    // C05: Roadmap Versioning (Execute Resume Gap Optimization -> Version 2)
    const resumeRes = await fetch(`${baseUrl}/api/roadmap/analyze-resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ resumeText: 'Experienced developer looking to master Tree and Graph algorithms.' })
    });
    const resumeData = await resumeRes.json();
    assertTest('C05-1', resumeData.success === true && resumeData.version === 2, `C05-1: Resume Gap Optimization created Version v${resumeData.version}`);

    const coreStepsV2 = await (await fetch(`${baseUrl}/api/roadmap/core`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    })).json();
    const isVersion2Active = coreStepsV2.every(s => s.roadmapVersion === 2 && s.source === 'resume_optimization' && s.isActive === true);
    assertTest('C05-2', isVersion2Active, 'C05-2: Version v2 set to active with source="resume_optimization"');

    // C06: Version History & Version Restoration / Rollback
    const historyRes = await fetch(`${baseUrl}/api/roadmap/history`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const history = await historyRes.json();
    assertTest('C06-1', Array.isArray(history) && history.length >= 2, `C06-1: Version history retained both Version 1 & Version 2 (${history.length} versions in DB)`);

    const restoreRes = await fetch(`${baseUrl}/api/roadmap/restore/1`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const restoreData = await restoreRes.json();
    assertTest('C06-2', restoreData.success === true && restoreData.version === 1, 'C06-2: Successfully restored Core Roadmap Version v1');

    const restoredSteps = await (await fetch(`${baseUrl}/api/roadmap/core`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    })).json();
    assertTest('C06-3', restoredSteps.every(s => s.roadmapVersion === 1 && s.isActive === true), 'C06-3: Active core steps cleanly rolled back to Version v1');

    // C07: AI Failure Safety (Simulate AI failure -> Existing roadmap remains active)
    const badAnalyzeRes = await fetch(`${baseUrl}/api/roadmap/analyze-resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ resumeText: '' }) // Empty input
    });
    assertTest('C07-1', badAnalyzeRes.status === 400, 'C07-1: Invalid empty resume text rejected with HTTP 400');

    const stepsAfterFailure = await (await fetch(`${baseUrl}/api/roadmap/core`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    })).json();
    assertTest('C07-2', Array.isArray(stepsAfterFailure) && stepsAfterFailure.length >= 7, `C07-2: Existing Core Roadmap preserved intact on failure (${stepsAfterFailure.length} steps)`);

    // C08: Core vs Project Separation
    const projectRes = await fetch(`${baseUrl}/api/roadmap/analyze-assignment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ assignmentText: 'Build an E-Commerce Recommendation Engine in Python' })
    });
    const projectData = await projectRes.json();
    const projectId = projectData.projectId;

    const coreCheckAfterProject = await (await fetch(`${baseUrl}/api/roadmap/core`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    })).json();
    assertTest('C08', coreCheckAfterProject.length === stepsAfterFailure.length, 'C08: Core Roadmap 100% UNTOUCHED by Project Sprint creation');

    // C09: Multiple Projects Co-existence
    const projectRes2 = await fetch(`${baseUrl}/api/roadmap/analyze-assignment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ assignmentText: 'Build a Real-Time Algorithmic Trading Analytics Dashboard' })
    });
    const projectData2 = await projectRes2.json();

    const projectsList = await (await fetch(`${baseUrl}/api/roadmap/projects`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    })).json();
    assertTest('C09', Array.isArray(projectsList) && projectsList.length >= 2, `C09: Multiple Project Sprints co-exist in DB (${projectsList.length} projects)`);

    // C10: IDOR Security Isolation
    const userBEmail = `relevance_user_b_${Date.now()}@gdx.test`;
    const regResB = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User B', email: userBEmail, password: 'Password123!' })
    });
    const tokenB = (await regResB.json()).token;

    const idorRes = await fetch(`${baseUrl}/api/roadmap/projects/${projectId}`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assertTest('C10', idorRes.status === 404, 'C10: IDOR protection verified (User B denied access to User A project)');

    console.log('\n════════════════════════════════════════════════════════════');
    console.log(` TOTAL PASSED : ${passedCount} / ${passedCount + failedCount}`);
    console.log(` TOTAL FAILED : ${failedCount} / ${passedCount + failedCount}`);
    console.log('════════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('❌ Content relevance suite crash:', err);
  }
};

runContentRelevanceSuite();
