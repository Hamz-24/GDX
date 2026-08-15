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

const runCompleteDataIntegritySuite = async () => {
  console.log('\n════════════════════════════════════════════════════════════════════');
  console.log(' GUIDEX COMPLETE END-TO-END DATA INTEGRITY & PERSISTENCE SUITE');
  console.log(' Testing User A & B isolation, MongoDB persistence, versioning,');
  console.log(' multi-format extraction, Project Sprints, & security guards');
  console.log('════════════════════════════════════════════════════════════════════\n');

  try {
    // -------------------------------------------------------------
    // SECTION 1: AUTHENTICATION & JWT SECURITY
    // -------------------------------------------------------------
    const userAEmail = `audit_user_a_${Date.now()}@gdx.test`;
    const regResA = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Audit Tester A',
        email: userAEmail,
        password: 'Password123!',
        goal: 'DATA STRUCTURES',
        level: 'beginner',
        timelineWeeks: 4
      })
    });
    const regDataA = await regResA.json();
    const tokenA = regDataA.token;
    assertTest('AUDIT-01', Boolean(tokenA && (regDataA.user?.id || regDataA.user?._id)), `User A Registered & JWT Token Issued (${userAEmail})`);

    const loginResA = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userAEmail, password: 'Password123!' })
    });
    const loginDataA = await loginResA.json();
    assertTest('AUDIT-02', Boolean(loginDataA.token), 'User A Authenticated via Login API');

    const meResA = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const meDataA = await meResA.json();
    assertTest('AUDIT-03', meDataA.email === userAEmail && meDataA.goal === 'DATA STRUCTURES', 'User A /me Profile Verified');

    // JWT Security Guard Checks
    const noTokenRes = await fetch(`${baseUrl}/api/auth/me`);
    assertTest('AUDIT-04-1', noTokenRes.status === 401, 'Missing Token Request Rejected with HTTP 401');

    const badTokenRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { 'Authorization': 'Bearer invalid_fake_jwt_token' }
    });
    assertTest('AUDIT-04-2', badTokenRes.status === 401, 'Invalid JWT Token Request Rejected with HTTP 401');

    // -------------------------------------------------------------
    // SECTION 2: PROFILE PERSISTENCE & GOAL UPDATE SAFE TRANSACTION
    // -------------------------------------------------------------
    const updateProfRes = await fetch(`${baseUrl}/api/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ name: 'Audit Tester Alpha', level: 'intermediate', timelineWeeks: 4 })
    });
    const updatedProf = await updateProfRes.json();
    assertTest('AUDIT-05', updatedProf.name === 'Audit Tester Alpha' && updatedProf.level === 'intermediate', 'User A Profile Updated via PUT /api/profile');

    // Re-verify profile persistence via /me
    const verifyMe = await (await fetch(`${baseUrl}/api/auth/me`, { headers: { 'Authorization': `Bearer ${tokenA}` } })).json();
    assertTest('AUDIT-06', verifyMe.name === 'Audit Tester Alpha', 'Profile Update Persisted in MongoDB');

    // -------------------------------------------------------------
    // SECTION 3: CORE ROADMAP GENERATION & DOMAIN CONTENT RELEVANCE
    // -------------------------------------------------------------
    const coreRoadmap = await (await fetch(`${baseUrl}/api/roadmap/core`, { headers: { 'Authorization': `Bearer ${tokenA}` } })).json();
    assertTest('AUDIT-07', Array.isArray(coreRoadmap) && coreRoadmap.length === 28, `Core Roadmap Generated (28 Total Days) for "${verifyMe.goal}"`);

    // Verify zero unrelated React/Next.js content in Data Structures Roadmap
    const hasUnrelatedReact = coreRoadmap.some(s => {
      const text = `${s.dayName || ''} ${s.context || ''}`.toUpperCase();
      return text.includes('REACT 19') || text.includes('NEXT.JS') || text.includes('ZUSTAND');
    });
    assertTest('AUDIT-08', !hasUnrelatedReact, 'Zero unrelated React/Next.js topics in Data Structures Roadmap');

    const hasDsaTopics = coreRoadmap.some(s => {
      const text = `${s.dayName || ''} ${s.context || ''}`.toUpperCase();
      return text.includes('ARRAY') || text.includes('TREE') || text.includes('GRAPH') || text.includes('HEAP') || text.includes('HASH');
    });
    assertTest('AUDIT-09', hasDsaTopics, 'Core Roadmap contains domain-matched Data Structures topics');

    // -------------------------------------------------------------
    // SECTION 4: TASK COMPLETION, DAY ADVANCEMENT & ROLLBACK
    // -------------------------------------------------------------
    const firstStep = coreRoadmap[0];
    const taskToComplete = firstStep.tasks[0];
    const patchTaskRes = await (await fetch(`${baseUrl}/api/roadmap/1/task/${taskToComplete.taskId}?roadmapType=core`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ completed: true })
    })).json();
    assertTest('AUDIT-10', patchTaskRes.tasks.find(t => t.taskId === taskToComplete.taskId).completed === true, 'Task Completion Toggled & Saved to MongoDB');

    const completeDayRes = await (await fetch(`${baseUrl}/api/roadmap/1/complete?roadmapType=core`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ completed: true })
    })).json();
    assertTest('AUDIT-11', completeDayRes.currentRoadmapDay === 2, 'Day 1 Marked Complete & Current Roadmap Day Advanced to Day 2');

    const uncheckDayRes = await (await fetch(`${baseUrl}/api/roadmap/1/complete?roadmapType=core`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ completed: false })
    })).json();
    assertTest('AUDIT-12', uncheckDayRes.currentRoadmapDay === 1, 'Day Completion Rollback Decremented Current Day back to Day 1');

    // Re-complete Day 1
    await fetch(`${baseUrl}/api/roadmap/1/complete?roadmapType=core`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ completed: true })
    });

    // -------------------------------------------------------------
    // SECTION 5: RESUME ENGINE MULTI-FORMAT EXTRACTION & VERSIONING
    // -------------------------------------------------------------
    // TXT extraction
    const parseTxtRes = await (await fetch(`${baseUrl}/api/roadmap/parse-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ fileBase64: 'data:text/plain;base64,U2tpbGxzOiBQeXRob24sIERhdGEgU3RydWN0dXJlcywgQWxnb3JpdGhtcywgVHJlZXMsIEdyYXBocw==', fileName: 'resume.txt' })
    })).json();
    assertTest('AUDIT-13', parseTxtRes.success === true && parseTxtRes.wordCount >= 5, `Document Extraction (.txt) Succeeded (${parseTxtRes.wordCount} words)`);

    // JSON extraction
    const parseJsonRes = await (await fetch(`${baseUrl}/api/roadmap/parse-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ fileBase64: 'data:application/json;base64,ewogICJuYW1lIjogIkF1ZGl0IFRlc3RlciIsCiAgInNraWxscyI6IFsiRGF0YSBTdHJ1Y3R1cmVzIiwgIkFsa29yaXRobXMiXQp9', fileName: 'resume.json' })
    })).json();
    assertTest('AUDIT-14', parseJsonRes.success === true, 'Document Extraction (.json) Succeeded');

    // Resume Gap Import (Version 2)
    const resumeAnalyzeRes = await (await fetch(`${baseUrl}/api/roadmap/analyze-resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ resumeText: parseTxtRes.text })
    })).json();
    assertTest('AUDIT-15', resumeAnalyzeRes.success === true && resumeAnalyzeRes.version === 2, `AI Resume Gap Import Created Core Roadmap Version v${resumeAnalyzeRes.version}`);

    // Version History & Restoration Check
    const historyRes = await (await fetch(`${baseUrl}/api/roadmap/history`, { headers: { 'Authorization': `Bearer ${tokenA}` } })).json();
    assertTest('AUDIT-16', Array.isArray(historyRes) && historyRes.length === 2, 'Core Roadmap Version History Retained Version v1 & Version v2');

    const restoreRes = await (await fetch(`${baseUrl}/api/roadmap/restore/1`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    })).json();
    assertTest('AUDIT-17', restoreRes.success === true && restoreRes.version === 1, 'Core Roadmap Version Rollback Restored Version v1');

    // Restore back to Version v2
    await fetch(`${baseUrl}/api/roadmap/restore/2`, { method: 'POST', headers: { 'Authorization': `Bearer ${tokenA}` } });

    // -------------------------------------------------------------
    // SECTION 6: ASSIGNMENT PARSER & MULTIPLE PROJECT SPRINTS
    // -------------------------------------------------------------
    // Create Project Sprint A
    const sprintARes = await (await fetch(`${baseUrl}/api/roadmap/analyze-assignment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ assignmentText: 'Build a Hospital Bill Duplicate Checker System with Python and React' })
    })).json();
    const projIdA = sprintARes.projectId;
    assertTest('AUDIT-18', sprintARes.success === true && sprintARes.count === 7, `Assignment Parser Created 7-Day Project Sprint A ("${sprintARes.title}")`);

    // Verify Core Roadmap was 100% UNTOUCHED by Project Sprint creation
    const coreAfterSprint = await (await fetch(`${baseUrl}/api/roadmap/core`, { headers: { 'Authorization': `Bearer ${tokenA}` } })).json();
    assertTest('AUDIT-19', coreAfterSprint.length === 28, 'Core Roadmap 100% UNTOUCHED after Project Sprint creation');

    // Create Project Sprint B
    const sprintBRes = await (await fetch(`${baseUrl}/api/roadmap/analyze-assignment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ assignmentText: 'Build an E-Commerce Recommendation Engine with Machine Learning' })
    })).json();
    const projIdB = sprintBRes.projectId;
    assertTest('AUDIT-20', sprintBRes.success === true && sprintBRes.count === 7, `Assignment Parser Created Project Sprint B ("${sprintBRes.title}")`);

    // Verify multiple projects coexist in DB
    const projectsList = await (await fetch(`${baseUrl}/api/roadmap/projects`, { headers: { 'Authorization': `Bearer ${tokenA}` } })).json();
    assertTest('AUDIT-21', Array.isArray(projectsList) && projectsList.length >= 2, `Multiple Project Sprints Coexist in DB (${projectsList.length} projects)`);

    // Complete a task in Project Sprint B & verify persistence
    const sprintBDetails = await (await fetch(`${baseUrl}/api/roadmap/projects/${projIdB}`, { headers: { 'Authorization': `Bearer ${tokenA}` } })).json();
    const projStep1 = sprintBDetails.steps[0];
    const patchProjTask = await (await fetch(`${baseUrl}/api/roadmap/1/task/${projStep1.tasks[0].taskId}?roadmapType=project&projectId=${projIdB}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ completed: true })
    })).json();
    assertTest('AUDIT-22', patchProjTask.tasks[0].completed === true, 'Project Sprint Task Completion Saved to MongoDB');

    // Delete Project Sprint A & verify Sprint B remains intact
    const delProjRes = await (await fetch(`${baseUrl}/api/roadmap/projects/${projIdA}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    })).json();
    assertTest('AUDIT-23', delProjRes.success === true, 'Project Sprint A Deleted Successfully');

    const projectsAfterDel = await (await fetch(`${baseUrl}/api/roadmap/projects`, { headers: { 'Authorization': `Bearer ${tokenA}` } })).json();
    assertTest('AUDIT-24', projectsAfterDel.some(p => p.projectId === projIdB) && !projectsAfterDel.some(p => p.projectId === projIdA), 'Sprint B Preserved Intact after Sprint A Deletion');

    // -------------------------------------------------------------
    // SECTION 7: TASKS MANAGEMENT
    // -------------------------------------------------------------
    const newTask = await (await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ title: 'Implement Binary Search Tree balancing', description: 'AVL tree rotations', priority: 'P0', estimatedMinutes: 30 })
    })).json();
    assertTest('AUDIT-25', Boolean(newTask._id), `Task Created (ID: ${newTask._id})`);

    const editTask = await (await fetch(`${baseUrl}/api/tasks/${newTask._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ title: 'Implement Binary Search Tree balancing (Updated)', priority: 'P1' })
    })).json();
    assertTest('AUDIT-26', editTask.title.includes('Updated'), 'Task Title Updated & Persisted');

    const searchTask = await (await fetch(`${baseUrl}/api/tasks?q=balancing`, { headers: { 'Authorization': `Bearer ${tokenA}` } })).json();
    assertTest('AUDIT-27', Array.isArray(searchTask) && searchTask.length >= 1, 'Task Search Query (q=balancing) Matched Task');

    const delTask = await (await fetch(`${baseUrl}/api/tasks/${newTask._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    })).json();
    assertTest('AUDIT-28', Boolean(delTask.id), 'Task Deleted Successfully');

    // -------------------------------------------------------------
    // SECTION 8: FOCUS ROOM & LOGGING
    // -------------------------------------------------------------
    const focusLog = await (await fetch(`${baseUrl}/api/focus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ duration: 45, task: 'Algorithms Practice Session', notes: 'Solved 2 LeetCode Tree problems' })
    })).json();
    assertTest('AUDIT-29', Boolean(focusLog._id && focusLog.duration === 45), `Focus Session Logged (ID: ${focusLog._id}, 45 mins)`);

    const focusSummary = await (await fetch(`${baseUrl}/api/focus/summary`, { headers: { 'Authorization': `Bearer ${tokenA}` } })).json();
    assertTest('AUDIT-30', focusSummary.count >= 1 && focusSummary.totalMinutes >= 45, 'Focus Session Aggregated in Summary API');

    // -------------------------------------------------------------
    // SECTION 9: DATA VAULT & AI EXPLAIN
    // -------------------------------------------------------------
    const vaultNote = await (await fetch(`${baseUrl}/api/vault`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ title: 'Graph Traversal BFS vs DFS', content: 'BFS uses a Queue for level-order traversal. DFS uses a Stack/recursion.', tags: ['dsa', 'graphs'] })
    })).json();
    assertTest('AUDIT-31', Boolean(vaultNote._id), `Vault Note Created (ID: ${vaultNote._id})`);

    const explainVault = await (await fetch(`${baseUrl}/api/vault/${vaultNote._id}/explain`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    })).json();
    assertTest('AUDIT-32', Boolean(explainVault.explanation && explainVault.item), 'Vault Note AI Explanation Generated & Persisted');

    // -------------------------------------------------------------
    // SECTION 10: AI MENTOR & DAILY CONCEPT
    // -------------------------------------------------------------
    const mentorReply = await (await fetch(`${baseUrl}/api/mentor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ message: 'Explain Dijkstra algorithm simply', persona: 'socratic' })
    })).json();
    assertTest('AUDIT-33', Boolean(mentorReply.reply || mentorReply.message), 'AI Mentor Response Received');

    const conceptObj = await (await fetch(`${baseUrl}/api/roadmap/concept/1`, { headers: { 'Authorization': `Bearer ${tokenA}` } })).json();
    assertTest('AUDIT-34', Boolean((conceptObj.title || conceptObj.concept?.title)), 'Daily Concept Generated with Valid Title & Payload');

    // -------------------------------------------------------------
    // SECTION 11: WEEKLY INSIGHTS & DASHBOARD AGGREGATION
    // -------------------------------------------------------------
    const weeklyInsights = await (await fetch(`${baseUrl}/api/insights/weekly`, { headers: { 'Authorization': `Bearer ${tokenA}` } })).json();
    assertTest('AUDIT-35', weeklyInsights.totalFocusMinutes >= 45 && typeof weeklyInsights.careerReadiness === 'number', 'Weekly Insights Computed Live Metrics from MongoDB');

    // -------------------------------------------------------------
    // SECTION 12: USER B CREATION & IDOR SECURITY ISOLATION
    // -------------------------------------------------------------
    const userBEmail = `audit_user_b_${Date.now()}@gdx.test`;
    const regResB = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Audit Tester B',
        email: userBEmail,
        password: 'Password123!',
        goal: 'BACKEND DEVELOPMENT',
        level: 'intermediate',
        timelineWeeks: 6
      })
    });
    const tokenB = (await regResB.json()).token;
    assertTest('AUDIT-36', Boolean(tokenB), `User B Registered & Authenticated (${userBEmail})`);

    // IDOR Access Checks: User B attempting to access User A resources
    const idorVault = await fetch(`${baseUrl}/api/vault/${vaultNote._id}`, { headers: { 'Authorization': `Bearer ${tokenB}` } });
    assertTest('AUDIT-37-1', idorVault.status === 404, 'IDOR Guard: User B access to User A Vault Note blocked (404)');

    const idorProject = await fetch(`${baseUrl}/api/roadmap/projects/${projIdB}`, { headers: { 'Authorization': `Bearer ${tokenB}` } });
    assertTest('AUDIT-37-2', idorProject.status === 404, 'IDOR Guard: User B access to User A Project Sprint B blocked (404)');

    // Verify User B receives isolated Backend Development Roadmap
    const coreRoadmapB = await (await fetch(`${baseUrl}/api/roadmap/core`, { headers: { 'Authorization': `Bearer ${tokenB}` } })).json();
    assertTest('AUDIT-38', Array.isArray(coreRoadmapB) && coreRoadmapB.length === 42, `User B Core Roadmap Isolated (42 Days for "BACKEND DEVELOPMENT")`);

    console.log('\n════════════════════════════════════════════════════════════════════');
    console.log(` TOTAL PASSED : ${passedCount} / ${passedCount + failedCount}`);
    console.log(` TOTAL FAILED : ${failedCount} / ${passedCount + failedCount}`);
    console.log('════════════════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('❌ Complete Data Integrity Suite Crash:', err);
  }
};

runCompleteDataIntegritySuite();
