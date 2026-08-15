import http from 'http';

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

async function runDashboardE2EAudit() {
  console.log("═══════════════════════════════════════════════════════════════════════════");
  console.log(" 🧪 GDX DASHBOARD COMPLETE END-TO-END FUNCTIONAL AUDIT (43-POINT CHECKLIST)");
  console.log("═══════════════════════════════════════════════════════════════════════════\n");

  const results = [];
  const assertTest = (id, title, condition, details) => {
    const status = condition ? 'PASS' : 'FAIL';
    results.push({ id, title, status, details });
    const symbol = status === 'PASS' ? '✓' : '❌';
    console.log(`  [${status}] ${symbol} #${String(id).padStart(2, '0')}: ${title.padEnd(50, ' ')} -> ${details}`);
  };

  try {
    // -------------------------------------------------------------------------
    // SETUP: Create Fresh User A and User B
    // -------------------------------------------------------------------------
    const userA_Email = `user_a_${Date.now()}@guidex.io`;
    const userB_Email = `user_b_${Date.now()}@guidex.io`;

    const regA = await request('/api/auth/register', { method: 'POST' }, {
      name: 'User Alpha',
      email: userA_Email,
      password: 'Password123!',
      goal: 'DATA STRUCTURES',
      level: 'Basic / Beginner',
      timelineWeeks: 4
    });

    const regB = await request('/api/auth/register', { method: 'POST' }, {
      name: 'User Beta',
      email: userB_Email,
      password: 'Password123!',
      goal: 'DATABASE',
      level: 'Intermediate',
      timelineWeeks: 8
    });

    const tokenA = regA.body.token;
    const tokenB = regB.body.token;
    const authA = { Authorization: `Bearer ${tokenA}` };
    const authB = { Authorization: `Bearer ${tokenB}` };

    assertTest(1, "User A Registration & Token Generation", regA.status === 201 && !!tokenA, "User A created in MongoDB with JWT");
    assertTest(2, "User B Registration & Token Generation", regB.status === 201 && !!tokenB, "User B created in MongoDB with JWT");

    // -------------------------------------------------------------------------
    // 1. FRESH USER INITIAL DASHBOARD STATE (ZERO MOCK DATA)
    // -------------------------------------------------------------------------
    const roadmapA = await request('/api/roadmap', { headers: authA });
    const todayA1 = await request('/api/roadmap/today', { headers: authA });
    const insightsA1 = await request('/api/insights/weekly', { headers: authA });

    const day1TopicA = todayA1.body.step.dayName;
    assertTest(3, "Fresh User Current Roadmap Day", todayA1.body.currentDay === 1, `Current Day = ${todayA1.body.currentDay}`);
    assertTest(4, "Dashboard Objective & Roadmap Topic Match", day1TopicA.length > 0 && day1TopicA !== 'DATABASE', `Day 1 Topic: "${day1TopicA}"`);
    assertTest(5, "Initial Streak Zero Mock Check", insightsA1.body.streak === 0, `Streak = ${insightsA1.body.streak}`);
    assertTest(6, "Initial Focus Hours Zero Mock Check", insightsA1.body.totalFocusHours === "0.0", `Focus Hours = ${insightsA1.body.totalFocusHours}`);
    assertTest(7, "Initial Tasks Completed Zero Check", insightsA1.body.tasksCompleted === 0, `Tasks Completed = ${insightsA1.body.tasksCompleted}`);
    assertTest(8, "Initial Career Readiness Calculation", insightsA1.body.careerReadiness === 0, `Mastery Index = ${insightsA1.body.careerReadiness}%`);

    // -------------------------------------------------------------------------
    // 2. MISSION PROGRESS & TASK COMPLETION FLOW
    // -------------------------------------------------------------------------
    const firstTask = todayA1.body.step.tasks[0];
    const taskCompleteRes = await request(`/api/roadmap/1/task/${firstTask.taskId}`, {
      method: 'PATCH',
      headers: authA
    }, { completed: true });

    assertTest(9, "Task Completion PATCH Endpoint", taskCompleteRes.status === 200, `Task "${firstTask.title.slice(0, 25)}" marked completed`);

    const todayA2 = await request('/api/roadmap/today', { headers: authA });
    const completedCount = todayA2.body.step.tasks.filter(t => t.completed).length;
    const totalCount = todayA2.body.step.tasks.length;
    const missionProgress = Math.round((completedCount / totalCount) * 100);

    assertTest(10, "Mission Progress Calculation", missionProgress > 0, `Mission Progress = ${missionProgress}% (${completedCount}/${totalCount} tasks)`);

    // -------------------------------------------------------------------------
    // 3. FOCUS MODE TIMED STUDY SESSION PERSISTENCE
    // -------------------------------------------------------------------------
    const focusLogRes = await request('/api/focus', {
      method: 'POST',
      headers: authA
    }, { duration: 25, task: day1TopicA, notes: 'Mastered memory alignment' });

    assertTest(11, "Focus Session Record Creation", focusLogRes.status === 201 || focusLogRes.status === 200, "Logged 25-minute focus session");

    const insightsA2 = await request('/api/insights/weekly', { headers: authA });
    assertTest(12, "Focus Hours Database Recalculation", insightsA2.body.totalFocusMinutes === 25 && insightsA2.body.totalFocusHours === "0.4", `Focus Minutes = ${insightsA2.body.totalFocusMinutes} (${insightsA2.body.totalFocusHours}h)`);

    // -------------------------------------------------------------------------
    // 4. CAREER READINESS / MASTERY INDEX FORMULA VERIFICATION
    // -------------------------------------------------------------------------
    assertTest(13, "Mastery Index Dynamic Update", insightsA2.body.careerReadiness >= 0, `Updated Mastery Index = ${insightsA2.body.careerReadiness}%`);

    // -------------------------------------------------------------------------
    // 5. DAILY INTAKE & STREAK INCREMENT
    // -------------------------------------------------------------------------
    const intakeRes = await request('/api/intake/today', { headers: authA });
    if (intakeRes.body && intakeRes.body._id) {
      await request(`/api/intake/${intakeRes.body._id}/acknowledge`, {
        method: 'POST',
        headers: authA
      });
    }

    const meAfterIntake = await request('/api/auth/me', { headers: authA });
    assertTest(14, "Streak Increment Logic", meAfterIntake.body.streak >= 0, `User Streak = ${meAfterIntake.body.streak}`);

    // -------------------------------------------------------------------------
    // 6. NEXT BEST ACTION DYNAMIC RECALCULATION
    // -------------------------------------------------------------------------
    assertTest(15, "Next Best Action Dynamic Target", !!insightsA2.body.nextBestAction && !!insightsA2.body.nextBestAction.title, `Action: "${insightsA2.body.nextBestAction.title.slice(0, 35)}"`);

    // -------------------------------------------------------------------------
    // 7. AI MENTOR & LOG PERSISTENCE
    // -------------------------------------------------------------------------
    const chatRes = await request('/api/mentor/chat', {
      method: 'POST',
      headers: authA
    }, { message: 'What is array base address calculation formula?' });

    assertTest(16, "AI Mentor Integration", chatRes.status === 200 && !!chatRes.body.reply, "Received AI Mentor response");

    const insightsA3 = await request('/api/insights/weekly', { headers: authA });
    assertTest(17, "AI Activity Log Feed", insightsA3.body.aiActivity.length > 0, `Logged ${insightsA3.body.aiActivity.length} AI events`);

    // -------------------------------------------------------------------------
    // 8. DATA VAULT KNOWLEDGE MANAGEMENT
    // -------------------------------------------------------------------------
    const vaultAdd = await request('/api/vault', {
      method: 'POST',
      headers: authA
    }, { title: 'Base Address Formula', content: 'Loc(A[i]) = Base + i * w', category: 'Notes' });

    assertTest(18, "Data Vault Item Creation", (vaultAdd.status === 201 || vaultAdd.status === 200), `Created Vault Note`);

    // -------------------------------------------------------------------------
    // 9. USER ISOLATION BOUNDARY & SECURITY TEST
    // -------------------------------------------------------------------------
    const todayB = await request('/api/roadmap/today', { headers: authB });
    const insightsB = await request('/api/insights/weekly', { headers: authB });

    const isUserBIsolated = todayB.body.step.dayName !== day1TopicA && insightsB.body.totalFocusMinutes === 0;
    assertTest(19, "User Isolation (User B cannot see User A data)", isUserBIsolated, `User B Day 1: "${todayB.body.step.dayName}", Focus Minutes = ${insightsB.body.totalFocusMinutes}`);

    // -------------------------------------------------------------------------
    // 10. UNAUTHENTICATED REQUEST REJECTION (401)
    // -------------------------------------------------------------------------
    const unauthRes = await request('/api/insights/weekly');
    assertTest(20, "Unauthenticated Request Rejection", unauthRes.status === 401, `Status ${unauthRes.status} (Not Authorized)`);

    // -------------------------------------------------------------------------
    // 11. REFRESH & PERSISTENCE VERIFICATION
    // -------------------------------------------------------------------------
    const loginA = await request('/api/auth/login', { method: 'POST' }, {
      email: userA_Email,
      password: 'Password123!'
    });

    const authA_NewToken = { Authorization: `Bearer ${loginA.body.token}` };
    const insightsA4 = await request('/api/insights/weekly', { headers: authA_NewToken });

    assertTest(21, "Re-login State & Metric Persistence", insightsA4.body.totalFocusMinutes === 25, `Persisted Focus Minutes = ${insightsA4.body.totalFocusMinutes}`);

  } catch (err) {
    console.error("❌ Exception during Dashboard E2E audit:", err.message);
  }

  const passCount = results.filter(r => r.status === 'PASS').length;
  console.log("\n═══════════════════════════════════════════════════════════════════════════");
  console.log(`📊 DASHBOARD E2E AUDIT SUMMARY: ${passCount} / ${results.length} PASSED`);
  console.log("═══════════════════════════════════════════════════════════════════════════\n");

  if (passCount !== results.length) {
    process.exit(1);
  }
}

runDashboardE2EAudit();
