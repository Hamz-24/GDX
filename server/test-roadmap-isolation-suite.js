import mongoose from 'mongoose';
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

const runIsolationSuite = async () => {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log(' GUIDEX ROADMAP ISOLATION & DECOUPLING TEST SUITE (R-I01..R-I10)');
  console.log(' Testing complete database separation of Core Roadmap vs Project Sprints');
  console.log('════════════════════════════════════════════════════════════\n');

  try {
    // 1. Authenticate User A
    const userAEmail = `isolation_user_a_${Date.now()}@gdx.test`;
    const regResA = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Isolation Tester A',
        email: userAEmail,
        password: 'Password123!',
        goal: 'DATA STRUCTURES',
        level: 'intermediate',
        timelineWeeks: 4
      })
    });
    const regDataA = await regResA.json();
    const tokenA = regDataA.token;
    assertTest('R-I00', Boolean(tokenA), `User A Registered & Authenticated (${userAEmail})`);

    // R-I01: Fetch / Create Core Roadmap
    const coreRes1 = await fetch(`${baseUrl}/api/roadmap/core`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const coreSteps1 = await coreRes1.json();
    assertTest('R-I01', Array.isArray(coreSteps1) && coreSteps1.length >= 7, `Core Roadmap initialized with ${coreSteps1.length} steps`);

    // R-I02: Create Project Sprint A ("Hospital Bill Duplicate Checker")
    const assignResA = await fetch(`${baseUrl}/api/roadmap/analyze-assignment`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        assignmentText: 'need to make a bill checker for hospital that check duplicate charges in the bill'
      })
    });
    const assignDataA = await assignResA.json();
    const projectIdA = assignDataA.projectId;
    assertTest('R-I02-1', assignDataA.success === true && Boolean(projectIdA), `Created Project Sprint A (${assignDataA.title})`);

    // Verify Core Roadmap STILL EXISTS
    const coreRes2 = await fetch(`${baseUrl}/api/roadmap/core`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const coreSteps2 = await coreRes2.json();
    assertTest('R-I02-2', Array.isArray(coreSteps2) && coreSteps2.length === coreSteps1.length, `Core Roadmap 100% UNTOUCHED after Sprint A creation (${coreSteps2.length} steps intact)`);

    // R-I03: Create Project Sprint B ("E-Commerce Recommendation System")
    const assignResB = await fetch(`${baseUrl}/api/roadmap/analyze-assignment`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        assignmentText: 'Build an E-Commerce Recommendation Engine for product cross-selling'
      })
    });
    const assignDataB = await assignResB.json();
    const projectIdB = assignDataB.projectId;
    assertTest('R-I03-1', assignDataB.success === true && Boolean(projectIdB), `Created Project Sprint B (${assignDataB.title})`);

    // Fetch All Projects
    const projectsListRes = await fetch(`${baseUrl}/api/roadmap/projects`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const projectsList = await projectsListRes.json();
    assertTest('R-I03-2', Array.isArray(projectsList) && projectsList.length >= 2, `Multiple Project Sprints coexist in DB (${projectsList.length} projects found)`);

    // R-I04: Delete Project Sprint A
    const deleteResA = await fetch(`${baseUrl}/api/roadmap/projects/${projectIdA}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const deleteDataA = await deleteResA.json();
    assertTest('R-I04-1', deleteDataA.success === true, `Deleted Project Sprint A (${projectIdA})`);

    const projectsAfterDelete = await (await fetch(`${baseUrl}/api/roadmap/projects`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    })).json();
    const sprintBStillExists = projectsAfterDelete.some(p => p.projectId === projectIdB);
    const sprintAGone = !projectsAfterDelete.some(p => p.projectId === projectIdA);
    assertTest('R-I04-2', sprintBStillExists && sprintAGone, `Sprint A deleted, Sprint B remains intact`);

    // R-I05: Fetch Project Sprint B Steps
    const sprintBRes = await fetch(`${baseUrl}/api/roadmap/projects/${projectIdB}`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const sprintBData = await sprintBRes.json();
    assertTest('R-I05', sprintBData.project && Array.isArray(sprintBData.steps) && sprintBData.steps.length === 7, `Fetched Project B steps cleanly (${sprintBData.steps.length} days)`);

    // R-I06: Execute Resume Gap Import (Updates Core Roadmap)
    const resumeRes = await fetch(`${baseUrl}/api/roadmap/analyze-resume`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        resumeText: 'Experienced Node.js developer looking to master Data Structures and Algorithms.'
      })
    });
    const resumeData = await resumeRes.json();
    assertTest('R-I06-1', resumeData.success === true, `Resume Gap Import executed successfully`);

    // Verify Sprint B is STILL INTACT after Resume Gap Import
    const sprintBCheck = await (await fetch(`${baseUrl}/api/roadmap/projects/${projectIdB}`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    })).json();
    assertTest('R-I06-2', sprintBCheck.project && sprintBCheck.steps.length === 7, `Project Sprint B completely UNTOUCHED by Resume Gap Import`);

    // R-I07: Execute Assignment Parser (Creates Project C)
    const assignResC = await fetch(`${baseUrl}/api/roadmap/analyze-assignment`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        assignmentText: 'Build a Real-Time Algorithmic Trading Analytics Dashboard'
      })
    });
    const assignDataC = await assignResC.json();
    const projectIdC = assignDataC.projectId;
    assertTest('R-I07', assignDataC.success === true && Boolean(projectIdC), `Created Project Sprint C (${assignDataC.title})`);

    // R-I08: DB Persistence & Schema Isolation Verification
    const coreStepsCheck = await (await fetch(`${baseUrl}/api/roadmap/core`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    })).json();
    const projectsCheck = await (await fetch(`${baseUrl}/api/roadmap/projects`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    })).json();
    assertTest('R-I08', coreStepsCheck.length >= 7 && projectsCheck.length >= 2, `DB Persistence verified: Core (${coreStepsCheck.length} steps) + ${projectsCheck.length} active Project Sprints`);

    // R-I09: Data Scoping on Endpoints
    const isCoreClean = coreStepsCheck.every(s => s.roadmapType === 'core');
    assertTest('R-I09', isCoreClean, `Core Roadmap endpoint strictly returns roadmapType='core' steps`);

    // R-I10: Security & IDOR Isolation (User B cannot access User A's Project Sprint)
    const userBEmail = `isolation_user_b_${Date.now()}@gdx.test`;
    const regResB = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Isolation Tester B',
        email: userBEmail,
        password: 'Password123!',
        goal: 'BACKEND DEVELOPMENT'
      })
    });
    const regDataB = await regResB.json();
    const tokenB = regDataB.token;

    const idorRes = await fetch(`${baseUrl}/api/roadmap/projects/${projectIdC}`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assertTest('R-I10', idorRes.status === 404, `IDOR Protection: User B request for User A's Project Sprint C returned HTTP ${idorRes.status} (Blocked)`);

    console.log('\n════════════════════════════════════════════════════════════');
    console.log(` TOTAL PASSED : ${passedCount} / ${passedCount + failedCount}`);
    console.log(` TOTAL FAILED : ${failedCount} / ${passedCount + failedCount}`);
    console.log('════════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('❌ Test suite crash:', err);
  }
};

runIsolationSuite();
