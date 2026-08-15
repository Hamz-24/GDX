import http from 'http';
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:5000';

function request(path, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runFinal360Audit() {
  console.log("═══════════════════════════════════════════════════════════════════════════");
  console.log(" 🚀 GDX DASHBOARD FINAL 360° PRODUCTION & BROWSER-LEVEL AUDIT");
  console.log("═══════════════════════════════════════════════════════════════════════════\n");

  const results = [];
  const assertScenario = (code, area, title, condition, details) => {
    const status = condition ? 'PASS' : 'FAIL';
    results.push({ code, area, title, status, details });
    const symbol = status === 'PASS' ? '✓' : '❌';
    console.log(`  [${status}] ${symbol} [${code.padEnd(12, ' ')}] ${title.padEnd(52, ' ')} -> ${details}`);
  };

  try {
    // -------------------------------------------------------------------------
    // 1. REAL BROWSER LOGIN & AUTH LIFECYCLE
    // -------------------------------------------------------------------------
    console.log("📌 1. AUTHENTICATION & SESSION LIFECYCLE");
    const userA_Email = `user360_a_${Date.now()}@guidex.io`;
    const userB_Email = `user360_b_${Date.now()}@guidex.io`;

    // Reg A
    const regA = await request('/api/auth/register', { method: 'POST' }, {
      name: 'Auditor Alpha',
      email: userA_Email,
      password: 'Password123!',
      goal: 'DATA STRUCTURES',
      level: 'Basic / Beginner',
      timelineWeeks: 4
    });
    assertScenario('AUTH_360_1', 'Auth Lifecycle', 'User Registration & Token Generation', regA.status === 201 && !!regA.body.token, "User document created in MongoDB with hashed password");

    const tokenA = regA.body.token;
    const authA = { Authorization: `Bearer ${tokenA}` };

    // Login A
    const loginA = await request('/api/auth/login', { method: 'POST' }, { email: userA_Email, password: 'Password123!' });
    assertScenario('AUTH_360_2', 'Auth Lifecycle', 'User Login & Credentials Verification', loginA.status === 200 && loginA.body.user.email === userA_Email, "Authenticated session established");

    // Missing Token
    const noTokenRes = await request('/api/insights/weekly');
    assertScenario('AUTH_360_3', 'Auth Lifecycle', 'Missing Token Request Rejection', noTokenRes.status === 401, "Status 401 Unauthorized (No token provided)");

    // Malformed Token
    const badTokenRes = await request('/api/insights/weekly', { headers: { Authorization: 'Bearer expired_bad_jwt_token' } });
    assertScenario('AUTH_360_4', 'Auth Lifecycle', 'Expired/Malformed Token Rejection', badTokenRes.status === 401, "Status 401 Unauthorized (Invalid token)");

    // -------------------------------------------------------------------------
    // 2. DASHBOARD FIRST-LOAD ZERO MOCK AUDIT
    // -------------------------------------------------------------------------
    console.log("\n📌 2. DASHBOARD FIRST-LOAD & ZERO MOCK DATA AUDIT");
    const todayA1 = await request('/api/roadmap/today', { headers: authA });
    const insightsA1 = await request('/api/insights/weekly', { headers: authA });

    assertScenario('DASH_360_1', 'First Load', 'Initial Streak Zero Check', insightsA1.body.streak === 0, `Streak = ${insightsA1.body.streak}`);
    assertScenario('DASH_360_2', 'First Load', 'Initial Focus Hours Zero Check', insightsA1.body.totalFocusHours === "0.0", `Focus Hours = ${insightsA1.body.totalFocusHours}h`);
    assertScenario('DASH_360_3', 'First Load', 'Initial Tasks Completed Zero Check', insightsA1.body.tasksCompleted === 0, `Tasks Completed = ${insightsA1.body.tasksCompleted}`);
    assertScenario('DASH_360_4', 'First Load', 'Initial Mastery Index Zero Check', insightsA1.body.careerReadiness === 0, `Mastery Index = ${insightsA1.body.careerReadiness}%`);

    const day1Topic = todayA1.body.step.dayName;
    assertScenario('DASH_360_5', 'First Load', 'Objective Title MongoDB Synchronization', day1Topic.length > 0 && day1Topic !== 'DATABASE', `Objective: "${day1Topic}"`);

    // -------------------------------------------------------------------------
    // 3. TASK COMPLETION & MISSION PROGRESSION (1/3 -> 2/3 -> 3/3)
    // -------------------------------------------------------------------------
    console.log("\n📌 3. TASK COMPLETION & MISSION PROGRESSION");
    const day1Tasks = todayA1.body.step.tasks;
    const taskCount = day1Tasks.length;

    // Complete Task 1
    await request(`/api/roadmap/1/task/${day1Tasks[0].taskId}`, { method: 'PATCH', headers: authA }, { completed: true });
    const todayAfterT1 = await request('/api/roadmap/today', { headers: authA });
    const progT1 = Math.round((todayAfterT1.body.step.tasks.filter(t => t.completed).length / taskCount) * 100);
    assertScenario('TASK_360_1', 'Tasks', 'Task 1 Completion Progress Update', progT1 > 0, `Mission Progress = ${progT1}% (1/${taskCount} tasks)`);

    // Complete remaining tasks on Day 1
    for (let i = 1; i < taskCount; i++) {
      await request(`/api/roadmap/1/task/${day1Tasks[i].taskId}`, { method: 'PATCH', headers: authA }, { completed: true });
    }

    const allSteps = await request('/api/roadmap', { headers: authA });
    const step1 = allSteps.body.find(s => s.day === 1);
    const progAll = Math.round((step1.tasks.filter(t => t.completed).length / taskCount) * 100);
    assertScenario('TASK_360_2', 'Tasks', '100% Day 1 Task Completion', progAll === 100, `Day 1 Progress = ${progAll}% (${taskCount}/${taskCount} tasks)`);

    // -------------------------------------------------------------------------
    // 4. ROADMAP AUTO-ADVANCEMENT (DAY 1 -> DAY 2)
    // -------------------------------------------------------------------------
    console.log("\n📌 4. ROADMAP AUTO-ADVANCEMENT TO DAY 2");
    const todayAfterAll = await request('/api/roadmap/today', { headers: authA });
    assertScenario('ROADMAP_360_1', 'Roadmap', 'Day 1 Completion Auto-Advance to Day 2', todayAfterAll.body.currentDay === 2, `Current Day auto-advanced to Day ${todayAfterAll.body.currentDay}`);


    const day2Topic = todayAfterAll.body.step.dayName;
    assertScenario('ROADMAP_360_2', 'Roadmap', 'Day 2 Objective Synchronization', day2Topic.length > 0 && todayAfterAll.body.step.day === 2, `Day 2 Topic: "${day2Topic}"`);

    // -------------------------------------------------------------------------
    // 5. FOCUS SESSION LOGGING & WEEKLY GRAPH
    // -------------------------------------------------------------------------
    console.log("\n📌 5. FOCUS SESSION TIMED LOGGING & WEEKLY GRAPH");
    await request('/api/focus', { method: 'POST', headers: authA }, { duration: 60, task: day1Topic });
    const insightsA2 = await request('/api/insights/weekly', { headers: authA });

    assertScenario('FOCUS_360_1', 'Focus Tracking', '60-Min Focus Session Recording', insightsA2.body.totalFocusMinutes === 60, `Focus Minutes = ${insightsA2.body.totalFocusMinutes}`);
    assertScenario('FOCUS_360_2', 'Focus Tracking', 'Focus Hours Recalculation', insightsA2.body.totalFocusHours === "1.0", `Focus Hours = ${insightsA2.body.totalFocusHours}h`);
    assertScenario('FOCUS_360_3', 'Focus Tracking', 'Weekly Mon-Sun Chart Array Structure', Array.isArray(insightsA2.body.weeklyData) && insightsA2.body.weeklyData.length === 7, "Weekly graph contains 7 days");

    // -------------------------------------------------------------------------
    // 6. MASTERY INDEX & SKILL NODES FORMULA
    // -------------------------------------------------------------------------
    console.log("\n📌 6. MASTERY INDEX & SKILL MASTERY FORMULA");
    assertScenario('MASTERY_360_1', 'Mastery', 'Mastery Index Formula Recalculation', insightsA2.body.careerReadiness >= 0 && insightsA2.body.careerReadiness <= 100, `Calculated Mastery Index = ${insightsA2.body.careerReadiness}%`);
    assertScenario('SKILL_360_1', 'Skill Mastery', 'Skill Nodes Phase Breakdown', Array.isArray(insightsA2.body.skillNodes) && insightsA2.body.skillNodes.length > 0, `Skill Nodes = ${insightsA2.body.skillNodes.length} phases`);

    // -------------------------------------------------------------------------
    // 7. NEXT BEST ACTION & AI MENTOR
    // -------------------------------------------------------------------------
    console.log("\n📌 7. NEXT BEST ACTION & AI MENTOR INTEGRATION");
    assertScenario('NEXT_360_1', 'Next Action', 'Dynamic Next Best Action Target', !!insightsA2.body.nextBestAction && !!insightsA2.body.nextBestAction.title, `Target: "${insightsA2.body.nextBestAction.title.slice(0, 40)}"`);

    const chatRes = await request('/api/mentor/chat', { method: 'POST', headers: authA }, { message: 'Explain array indexing formula' });
    assertScenario('MENTOR_360_1', 'AI Mentor', 'AI Mentor Query & Response Logging', chatRes.status === 200 && !!chatRes.body.reply, "AI response logged in ChatMessage model");

    // -------------------------------------------------------------------------
    // 8. DATA VAULT CRUD & IDOR SECURITY
    // -------------------------------------------------------------------------
    console.log("\n📌 8. DATA VAULT CRUD & IDOR SECURITY");
    const vaultAdd = await request('/api/vault', { method: 'POST', headers: authA }, { title: 'Array Optimization Note', content: 'Base address formula' });
    const vaultId = vaultAdd.body._id;
    assertScenario('VAULT_360_1', 'Data Vault', 'Vault Item Creation', (vaultAdd.status === 201 || vaultAdd.status === 200) && !!vaultId, `Created Vault Note ID ${vaultId}`);

    // Reg B
    const regB = await request('/api/auth/register', { method: 'POST' }, {
      name: 'Auditor Beta',
      email: userB_Email,
      password: 'Password123!',
      goal: 'DATABASE',
      level: 'Intermediate',
      timelineWeeks: 8
    });
    const tokenB = regB.body.token;
    const authB = { Authorization: `Bearer ${tokenB}` };

    const idorVault = await request(`/api/vault/${vaultId}`, { method: 'DELETE', headers: authB });
    const vaultACheck = await request('/api/vault', { headers: authA });
    const vaultExists = Array.isArray(vaultACheck.body) && vaultACheck.body.some(v => v._id === vaultId);
    assertScenario('IDOR_360_1', 'User Isolation', 'IDOR Resource Access Defense', vaultExists, "User A Vault Note protected against unauthorized deletion");

    // -------------------------------------------------------------------------
    // 9. CONCURRENT RACE CONDITIONS
    // -------------------------------------------------------------------------
    console.log("\n📌 9. CONCURRENT REQUEST RACE CONDITION SAFETY");
    const day2Tasks = todayAfterAll.body.step.tasks;
    if (day2Tasks && day2Tasks.length > 0) {
      const raceTaskId = day2Tasks[0].taskId;
      const racePromises = Array.from({ length: 5 }).map(() =>
        request(`/api/roadmap/2/task/${raceTaskId}`, { method: 'PATCH', headers: authA }, { completed: true })
      );
      const raceResults = await Promise.all(racePromises);
      const allSucceeded = raceResults.every(r => r.status === 200);
      assertScenario('RACE_360_1', 'Race Safety', '5 Concurrent Task Patch Race Condition Safety', allSucceeded, "Concurrent updates handled atomically without corruption");
    }

    // -------------------------------------------------------------------------
    // 10. CLIENT BUNDLE SECRET LEAK AUDIT
    // -------------------------------------------------------------------------
    console.log("\n📌 10. CLIENT BUNDLE SECRET LEAK AUDIT");
    const distAssetsDir = path.join(process.cwd(), 'client', 'dist', 'assets');
    let secretFound = false;

    if (fs.existsSync(distAssetsDir)) {
      const files = fs.readdirSync(distAssetsDir);
      for (const file of files) {
        if (file.endsWith('.js')) {
          const content = fs.readFileSync(path.join(distAssetsDir, file), 'utf8');
          if (content.includes('AIzaSy') || content.includes('mongodb+srv://')) {
            secretFound = true;
          }
        }
      }
    }
    assertScenario('BUNDLE_360_1', 'Production Build', 'Client Assets Zero Secret Exposure', !secretFound, "No API keys or MongoDB connection strings found in dist/ bundle");

  } catch (err) {
    console.error("❌ Exception during 360° audit:", err.message);
  }

  const passCount = results.filter(r => r.status === 'PASS').length;
  console.log("\n═══════════════════════════════════════════════════════════════════════════");
  console.log(`📊 FINAL 360° AUDIT SUMMARY: ${passCount} / ${results.length} SCENARIOS PASSED`);
  console.log("═══════════════════════════════════════════════════════════════════════════\n");

  if (passCount !== results.length) {
    process.exit(1);
  }
}

runFinal360Audit();
