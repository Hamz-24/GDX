import 'dotenv/config';

const baseUrl = 'http://localhost:5000';

async function runMasterAppSuite() {
  console.log('════════════════════════════════════════════════════════════');
  console.log(' GUIDEX PLATFORM — 100% COMPREHENSIVE MASTER AUDIT SUITE');
  console.log(' Testing all 12 modules, endpoints, buttons & flows');
  console.log('════════════════════════════════════════════════════════════\n');

  const results = [];
  function logTest(id, module, name, pass, details = '') {
    const status = pass ? 'PASS' : 'FAIL';
    results.push({ id, module, name, pass, details });
    console.log(`[${status}] [${module}] ${id}: ${name} ${details ? '(' + details + ')' : ''}`);
  }

  try {
    // -------------------------------------------------------------
    // MODULE 1: AUTH & PROFILE
    // -------------------------------------------------------------
    const emailA = `master_user_a_${Date.now()}@gdx.test`;
    const passA = 'password123';
    
    // M01-T01: Registration
    const regRes = await fetch(baseUrl + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Master Tester Alpha', email: emailA, password: passA, goal: 'DATA STRUCTURES', level: 'intermediate', timelineWeeks: 4 })
    }).then(r => r.json());
    const tokenA = regRes.token;
    const userAId = String(regRes.user.id || regRes.user._id);
    const headersA = { 'Authorization': 'Bearer ' + tokenA, 'Content-Type': 'application/json' };
    logTest('M01-T01', 'Auth & Profile', 'User Registration & JWT Token Issue', Boolean(tokenA && userAId), `User ID: ${userAId}`);

    // M01-T02: Login
    const loginRes = await fetch(baseUrl + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailA, password: passA })
    }).then(r => r.json());
    logTest('M01-T02', 'Auth & Profile', 'User Login Authentication', loginRes.token && loginRes.user.email === emailA, `Email: ${emailA}`);

    // M01-T03: Get Profile Me
    const meRes = await fetch(baseUrl + '/api/auth/me', { headers: headersA }).then(r => r.json());
    logTest('M01-T03', 'Auth & Profile', 'Fetch Authenticated Profile /me', String(meRes._id || meRes.id) === userAId, `Name: ${meRes.name}`);

    // M01-T04: Update Profile Settings
    const updateProf = await fetch(baseUrl + '/api/profile', {
      method: 'PUT',
      headers: headersA,
      body: JSON.stringify({ goal: 'SYSTEM DESIGN', timelineWeeks: 4, level: 'Advanced / Interview Ready' })
    }).then(r => r.json());
    logTest('M01-T04', 'Auth & Profile', 'Update Profile Settings (PUT /api/profile)', updateProf.goal === 'SYSTEM DESIGN' && updateProf.timelineWeeks === 4, `New Goal: ${updateProf.goal}`);

    // -------------------------------------------------------------
    // MODULE 2: DASHBOARD & METRICS
    // -------------------------------------------------------------
    const dashObj = await fetch(baseUrl + '/api/roadmap/today', { headers: headersA }).then(r => r.json());
    logTest('M02-T01', 'Dashboard', 'Today Objective API (/api/roadmap/today)', Boolean(dashObj.currentDay && dashObj.step), `Today Day: ${dashObj.currentDay}`);

    const dashMetrics = await fetch(baseUrl + '/api/insights/weekly', { headers: headersA }).then(r => r.json());
    logTest('M02-T02', 'Dashboard', 'Weekly Metrics & Streak Sync', dashMetrics.currentRoadmapDay !== undefined && dashMetrics.weeklyData.length === 7, `Current Day: ${dashMetrics.currentRoadmapDay}`);

    // -------------------------------------------------------------
    // MODULE 3: ROADMAP & GOAL ENGINE
    // -------------------------------------------------------------
    let stepsA = await fetch(baseUrl + '/api/roadmap', { headers: headersA }).then(r => r.json());
    logTest('M03-T01', 'Roadmap', 'Auto-Generate Multi-Week Roadmap', Array.isArray(stepsA) && stepsA.length === 28, `Generated ${stepsA.length} days`);

    const week1Dist = stepsA.filter(s => s.week === 1).length;
    logTest('M03-T02', 'Roadmap', 'Week Distribution Math (7 Days / Week)', week1Dist === 7, `Week 1 days: ${week1Dist}`);

    const day1Task = stepsA[0].tasks[0];
    const patchTaskRes = await fetch(baseUrl + `/api/roadmap/1/task/${day1Task.taskId}`, {
      method: 'PATCH',
      headers: headersA,
      body: JSON.stringify({ completed: true })
    }).then(r => r.json());
    logTest('M03-T03', 'Roadmap', 'Toggle Task Completion (PATCH /api/roadmap/:day/task/:taskId)', patchTaskRes.tasks[0].completed === true, `Task ${day1Task.taskId} completed`);

    const day1DoneRes = await fetch(baseUrl + '/api/roadmap/1/complete', {
      method: 'PATCH',
      headers: headersA,
      body: JSON.stringify({ completed: true })
    }).then(r => r.json());
    logTest('M03-T04', 'Roadmap', 'Day Completion & Auto-Advancement', day1DoneRes.currentRoadmapDay === 2, `Advanced to Day: ${day1DoneRes.currentRoadmapDay}`);

    const day1UncheckRes = await fetch(baseUrl + '/api/roadmap/1/complete', {
      method: 'PATCH',
      headers: headersA,
      body: JSON.stringify({ completed: false })
    }).then(r => r.json());
    logTest('M03-T05', 'Roadmap', 'Day Completion Rollback', day1UncheckRes.currentRoadmapDay === 1, `Rolled back to Day: ${day1UncheckRes.currentRoadmapDay}`);

    await fetch(baseUrl + '/api/roadmap/1/complete', { method: 'PATCH', headers: headersA, body: JSON.stringify({ completed: true }) });

    // -------------------------------------------------------------
    // MODULE 4: DAILY CONCEPT & SIMULATORS
    // -------------------------------------------------------------
    const conceptRes = await fetch(baseUrl + '/api/roadmap/concept/1', { headers: headersA }).then(r => r.json());
    logTest('M04-T01', 'Daily Concept', 'Topic-Constrained Concept Module', Boolean(conceptRes.concept && conceptRes.concept.title), `Title: ${conceptRes.concept?.title}`);

    // -------------------------------------------------------------
    // MODULE 5: FOCUS & TASKS MANAGEMENT
    // -------------------------------------------------------------
    const newTaskCreated = await fetch(baseUrl + '/api/tasks', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({ title: 'Build Microservice Gateway', description: 'Setup Express & JWT proxy', priority: 'P0', estimatedMinutes: 25 })
    }).then(r => r.json());
    logTest('M05-T01', 'Focus & Tasks', 'Task Creation (POST /api/tasks)', Boolean(newTaskCreated._id), `Task ID: ${newTaskCreated._id}`);

    const editTaskRes = await fetch(baseUrl + `/api/tasks/${newTaskCreated._id}`, {
      method: 'PATCH',
      headers: headersA,
      body: JSON.stringify({ title: 'Build Microservice Gateway (Updated)', priority: 'P1' })
    }).then(r => r.json());
    logTest('M05-T02', 'Focus & Tasks', 'Task Editing (PATCH /api/tasks/:id)', editTaskRes.title.includes('Updated'), `Updated Title: ${editTaskRes.title}`);

    const searchTaskRes = await fetch(baseUrl + '/api/tasks?q=gateway', { headers: headersA }).then(r => r.json());
    logTest('M05-T03', 'Focus & Tasks', 'Task Search Filter (q=gateway)', searchTaskRes.length === 1, `Matched: ${searchTaskRes[0]?.title}`);

    const toggleTaskRes = await fetch(baseUrl + `/api/tasks/${newTaskCreated._id}`, {
      method: 'PATCH',
      headers: headersA,
      body: JSON.stringify({ completed: true })
    }).then(r => r.json());
    logTest('M05-T04', 'Focus & Tasks', 'Task Status Toggle (Pending -> Done)', toggleTaskRes.status === 'Done', `Status: ${toggleTaskRes.status}`);

    const delTaskRes = await fetch(baseUrl + `/api/tasks/${newTaskCreated._id}`, { method: 'DELETE', headers: headersA }).then(r => r.json());
    logTest('M05-T05', 'Focus & Tasks', 'Task Deletion (DELETE /api/tasks/:id)', delTaskRes.id === newTaskCreated._id, 'Task removed from DB');

    // -------------------------------------------------------------
    // MODULE 6: FOCUS CONSOLE & TIMER
    // -------------------------------------------------------------
    const focusLogRes = await fetch(baseUrl + '/api/focus', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({ duration: 30, task: 'Deep Focus Session', notes: 'Completed 30 min focus sprint' })
    }).then(r => r.json());
    logTest('M06-T01', 'Focus Console', 'Log Completed Focus Session (POST /api/focus)', Boolean(focusLogRes._id && focusLogRes.duration === 30), `Log ID: ${focusLogRes._id}`);

    const focusHist = await fetch(baseUrl + '/api/focus', { headers: headersA }).then(r => r.json());
    logTest('M06-T02', 'Focus Console', 'Fetch Focus History & Summary (GET /api/focus)', focusHist.totalMinutes === 30 && focusHist.totalHours === 0.5, `Total Mins: ${focusHist.totalMinutes}`);

    const focusSummary = await fetch(baseUrl + '/api/focus/summary', { headers: headersA }).then(r => r.json());
    logTest('M06-T03', 'Focus Console', 'Focus Summary Stats API (/api/focus/summary)', focusSummary.count === 1, `Total Sessions: ${focusSummary.count}`);

    // -------------------------------------------------------------
    // MODULE 7: DATA VAULT (KNOWLEDGE BASE)
    // -------------------------------------------------------------
    const noteCreated = await fetch(baseUrl + '/api/vault', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({ title: 'React 19 Server Actions Rule', content: 'Always use server components by default to send less JS to client.' })
    }).then(r => r.json());
    logTest('M07-T01', 'Data Vault', 'Create Vault Note (POST /api/vault)', Boolean(noteCreated._id), `Note ID: ${noteCreated._id}`);

    const noteUpdated = await fetch(baseUrl + `/api/vault/${noteCreated._id}`, {
      method: 'PATCH',
      headers: headersA,
      body: JSON.stringify({ title: 'React 19 Server Actions & RSC Rule' })
    }).then(r => r.json());
    logTest('M07-T02', 'Data Vault', 'Edit Vault Note (PATCH /api/vault/:id)', noteUpdated.title.includes('RSC Rule'), `Title: ${noteUpdated.title}`);

    const vaultExplain = await fetch(baseUrl + `/api/vault/${noteCreated._id}/explain`, {
      method: 'POST',
      headers: headersA
    }).then(r => r.json());
    logTest('M07-T03', 'Data Vault', 'Explain Note with AI (/api/vault/:id/explain)', Boolean(vaultExplain.explanation), 'AI explanation generated & saved');

    const vaultList = await fetch(baseUrl + '/api/vault', { headers: headersA }).then(r => r.json());
    logTest('M07-T04', 'Data Vault', 'Fetch User Vault Notes (GET /api/vault)', vaultList.length >= 1, `Vault Notes Count: ${vaultList.length}`);

    // -------------------------------------------------------------
    // MODULE 8: AI MENTOR & SOCRATIC TUTOR
    // -------------------------------------------------------------
    const mentorChat = await fetch(baseUrl + '/api/mentor/chat', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({ message: 'Explain dynamic programming memoization in simple terms.' })
    }).then(r => r.json());
    logTest('M08-T01', 'AI Mentor', 'Socratic AI Guidance Chat (POST /api/mentor/chat)', Boolean(mentorChat.reply), 'AI reply received');

    // -------------------------------------------------------------
    // MODULE 9: RESUME GAP IMPORT
    // -------------------------------------------------------------
    const resumeRes = await fetch(baseUrl + '/api/roadmap/analyze-resume', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({ resumeText: 'Senior Backend Engineer proficient in Node.js, looking to master Distributed Systems and Raft Consensus.' })
    }).then(r => r.json());
    logTest('M09-T01', 'Resume Gap Import', 'Analyze Resume & Optimize Roadmap (/api/roadmap/analyze-resume)', resumeRes.count > 0, `Created ${resumeRes.count} gap-focused steps`);

    // -------------------------------------------------------------
    // MODULE 10: ASSIGNMENT PARSER
    // -------------------------------------------------------------
    const assignRes = await fetch(baseUrl + '/api/roadmap/analyze-assignment', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({ assignmentText: 'Build an LRU cache with O(1) get and put operations using doubly linked list and hash map.' })
    }).then(r => r.json());
    logTest('M10-T01', 'Assignment Parser', 'Deconstruct Project Sprint (/api/roadmap/analyze-assignment)', assignRes.count === 7, `Generated ${assignRes.count} sprint days`);

    // -------------------------------------------------------------
    // MODULE 11: WEEKLY INSIGHTS ANALYTICS
    // -------------------------------------------------------------
    const finalInsights = await fetch(baseUrl + '/api/insights/weekly', { headers: headersA }).then(r => r.json());
    logTest('M11-T01', 'Weekly Insights', 'Live Career Readiness & Skill Breakdown', finalInsights.careerReadiness >= 0 && finalInsights.skillNodes.length > 0, `Readiness Score: ${finalInsights.careerReadiness}%`);

    // -------------------------------------------------------------
    // MODULE 12: USER ISOLATION & IDOR SECURITY
    // -------------------------------------------------------------
    const emailB = `master_user_b_${Date.now()}@gdx.test`;
    const regB = await fetch(baseUrl + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Master Tester Beta', email: emailB, password: passA, goal: 'GO LANG' })
    }).then(r => r.json());
    const headersB = { 'Authorization': 'Bearer ' + regB.token, 'Content-Type': 'application/json' };

    const idorVault = await fetch(baseUrl + `/api/vault/${noteCreated._id}`, { method: 'DELETE', headers: headersB });
    logTest('M12-T01', 'Security & Isolation', 'IDOR Data Isolation Attack (User B vs User A Vault Note)', idorVault.status === 404, `Status: ${idorVault.status} (Attack Blocked)`);

    const unauthReq = await fetch(baseUrl + '/api/roadmap', { headers: { 'Authorization': 'Bearer invalid_token' } });
    logTest('M12-T02', 'Security & Isolation', 'Expired / Invalid JWT Security Guard', unauthReq.status === 401, `Status: ${unauthReq.status} (Rejected)`);

  } catch (err) {
    console.error('❌ Error during master audit:', err);
  }

  console.log('\n════════════════════════════════════════════════════════════');
  console.log(` MASTER AUDIT COMPLETE: ${results.filter(r => r.pass).length} / ${results.length} PASSED`);
  console.log('════════════════════════════════════════════════════════════\n');
}

runMasterAppSuite();
