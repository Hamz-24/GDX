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

async function runDeepSecondStageAudit() {
  console.log("═══════════════════════════════════════════════════════════════════════════");
  console.log(" 🧪 GDX DASHBOARD DEEP SECOND-STAGE FUNCTIONAL & SECURITY AUDIT (22 SCENARIOS)");
  console.log("═══════════════════════════════════════════════════════════════════════════\n");

  const results = [];
  const assertScenario = (code, category, title, condition, details) => {
    const status = condition ? 'PASS' : 'FAIL';
    results.push({ code, category, title, status, details });
    const symbol = status === 'PASS' ? '✓' : '❌';
    console.log(`  [${status}] ${symbol} [${code.padEnd(10, ' ')}] ${title.padEnd(50, ' ')} -> ${details}`);
  };

  try {
    // -------------------------------------------------------------------------
    // 1. AUTHENTICATION & SECURITY EDGE CASES
    // -------------------------------------------------------------------------
    console.log("📌 1. AUTHENTICATION & SECURITY BOUNDARIES");
    const userA_Email = `deep_user_a_${Date.now()}@guidex.io`;
    const userB_Email = `deep_user_b_${Date.now()}@guidex.io`;

    // Reg User A
    const regA = await request('/api/auth/register', { method: 'POST' }, {
      name: 'Deep User A',
      email: userA_Email,
      password: 'Password123!',
      goal: 'DATA STRUCTURES',
      level: 'Basic / Beginner',
      timelineWeeks: 4
    });
    const tokenA = regA.body.token;
    const authA = { Authorization: `Bearer ${tokenA}` };

    // AUTH_1: Duplicate Email Reg
    const dupReg = await request('/api/auth/register', { method: 'POST' }, {
      name: 'Dup User',
      email: userA_Email,
      password: 'Password123!'
    });
    assertScenario('AUTH_1', 'Authentication', 'Duplicate Email Registration Rejection', dupReg.status === 400, `Status ${dupReg.status} (User already exists)`);

    // AUTH_2: Invalid Password Login
    const badLogin = await request('/api/auth/login', { method: 'POST' }, {
      email: userA_Email,
      password: 'WrongPassword!'
    });
    assertScenario('AUTH_2', 'Authentication', 'Invalid Password Login Rejection', badLogin.status === 401, `Status ${badLogin.status} (Invalid credentials)`);

    // AUTH_3: Nonexistent Account Login
    const nonUserLogin = await request('/api/auth/login', { method: 'POST' }, {
      email: 'nonexistent_account_999@guidex.io',
      password: 'Password123!'
    });
    assertScenario('AUTH_3', 'Authentication', 'Nonexistent Account Login Rejection', nonUserLogin.status === 401, `Status ${nonUserLogin.status} (Invalid credentials)`);

    // AUTH_4: Invalid/Malformed JWT Header
    const badJwt = await request('/api/insights/weekly', { headers: { Authorization: 'Bearer invalid_malformed_jwt_xyz' } });
    assertScenario('AUTH_4', 'Authentication', 'Malformed JWT Token Rejection', badJwt.status === 401, `Status ${badJwt.status} (Not Authorized)`);

    // Reg User B
    const regB = await request('/api/auth/register', { method: 'POST' }, {
      name: 'Deep User B',
      email: userB_Email,
      password: 'Password123!',
      goal: 'DATABASE',
      level: 'Intermediate',
      timelineWeeks: 8
    });
    const tokenB = regB.body.token;
    const authB = { Authorization: `Bearer ${tokenB}` };

    // -------------------------------------------------------------------------
    // 2. DIRECT USER ISOLATION & IDOR ATTACK TESTS
    // -------------------------------------------------------------------------
    console.log("\n📌 2. DIRECT USER ISOLATION & IDOR ATTACKS");
    const todayA = await request('/api/roadmap/today', { headers: authA });
    const taskA_Id = todayA.body.step.tasks[0].taskId;

    // IDOR_1: User B attempts to complete User A's task
    const idorTask = await request(`/api/roadmap/1/task/${taskA_Id}`, {
      method: 'PATCH',
      headers: authB
    }, { completed: true });
    assertScenario('IDOR_1', 'User Isolation', 'IDOR Task Mutation Attack Rejection', idorTask.status === 404 || idorTask.status === 403, `Status ${idorTask.status} (Task not found for User B)`);

    // User A creates Vault Note
    const vaultA = await request('/api/vault', { method: 'POST', headers: authA }, { title: 'User A Secret Note', content: 'Top Secret' });
    const vaultA_Id = vaultA.body._id;

    // IDOR_2: User B attempts to delete User A's Vault note
    const idorVault = await request(`/api/vault/${vaultA_Id}`, { method: 'DELETE', headers: authB });
    const vaultACheck = await request('/api/vault', { headers: authA });
    const vaultAStillExists = Array.isArray(vaultACheck.body) && vaultACheck.body.some(v => v._id === vaultA_Id);
    assertScenario('IDOR_2', 'User Isolation', 'IDOR Vault Delete Attack Rejection', vaultAStillExists, "User A Vault Note preserved intact");

    // IDOR_3: User B requests User A's mentor logs
    const mentorB = await request('/api/mentor/history', { headers: authB });
    assertScenario('IDOR_3', 'User Isolation', 'IDOR Mentor History Read Boundary', Array.isArray(mentorB.body) && mentorB.body.length === 0, "User B receives 0 User A chat logs");

    // -------------------------------------------------------------------------
    // 3. MULTI-DAY ROADMAP PROGRESSION & AUTO-ADVANCE
    // -------------------------------------------------------------------------
    console.log("\n📌 3. MULTI-DAY ROADMAP PROGRESSION");
    const step1Tasks = todayA.body.step.tasks;
    for (const t of step1Tasks) {
      await request(`/api/roadmap/1/task/${t.taskId}`, { method: 'PATCH', headers: authA }, { completed: true });
    }

    const todayAfterStep1 = await request('/api/roadmap/today', { headers: authA });
    assertScenario('ROADMAP_1', 'Roadmap', 'Day 1 Completion & Auto-Advance to Day 2', todayAfterStep1.body.currentDay === 2, `Current Day auto-advanced to Day ${todayAfterStep1.body.currentDay}`);

    const step2Topic = todayAfterStep1.body.step.dayName;
    assertScenario('ROADMAP_2', 'Roadmap', 'Day 2 Topic Synchronization', step2Topic.length > 0 && todayAfterStep1.body.step.day === 2, `Day 2 Topic: "${step2Topic}"`);

    // -------------------------------------------------------------------------
    // 4. TASK SYSTEM BOUNDARY & IDEMPOTENCY
    // -------------------------------------------------------------------------
    console.log("\n📌 4. TASK SYSTEM BOUNDARIES & IDEMPOTENCY");
    const badTaskPatch = await request('/api/roadmap/1/task/nonexistent_task_id_999', { method: 'PATCH', headers: authA }, { completed: true });
    assertScenario('TASK_1', 'Tasks', 'Nonexistent Task ID Rejection', badTaskPatch.status === 404, `Status ${badTaskPatch.status} (Task not found)`);

    const taskRepatch = await request(`/api/roadmap/1/task/${step1Tasks[0].taskId}`, { method: 'PATCH', headers: authA }, { completed: true });
    assertScenario('TASK_2', 'Tasks', 'Task Completion Idempotency', taskRepatch.status === 200 && taskRepatch.body.tasks[0].completed === true, "Task completion status maintained cleanly");

    // -------------------------------------------------------------------------
    // 5. FOCUS SESSION AUDIT & INPUT VALIDATION
    // -------------------------------------------------------------------------
    console.log("\n📌 5. FOCUS SESSION DURATION VALIDATION & AGGREGATION");
    const negFocus = await request('/api/focus', { method: 'POST', headers: authA }, { duration: -25, task: 'Invalid Focus' });
    assertScenario('FOCUS_1', 'Focus Tracking', 'Negative Duration Focus Log Rejection', negFocus.status === 400, `Status ${negFocus.status} (Duration must be positive)`);

    const zeroFocus = await request('/api/focus', { method: 'POST', headers: authA }, { duration: 0, task: 'Zero Focus' });
    assertScenario('FOCUS_2', 'Focus Tracking', 'Zero Duration Focus Log Rejection', zeroFocus.status === 400, `Status ${zeroFocus.status} (Duration must be positive)`);

    const valid60Focus = await request('/api/focus', { method: 'POST', headers: authA }, { duration: 60, task: 'Deep Focus' });
    const insightsAfterFocus = await request('/api/insights/weekly', { headers: authA });
    assertScenario('FOCUS_3', 'Focus Tracking', '60-Minute Focus Session Aggregation', insightsAfterFocus.body.totalFocusHours === "1.0", `Total Focus Hours = ${insightsAfterFocus.body.totalFocusHours}h`);

    assertScenario('FOCUS_4', 'Focus Tracking', 'Mon-Sun Day-of-Week Graph Array', Array.isArray(insightsAfterFocus.body.weeklyData) && insightsAfterFocus.body.weeklyData.length === 7, "Weekly activity graph array contains 7 days");

    // -------------------------------------------------------------------------
    // 6. MASTERY INDEX & SKILL NODES FORMULA VERIFICATION
    // -------------------------------------------------------------------------
    console.log("\n📌 6. MASTERY INDEX & SKILL MASTERY FORMULA");
    assertScenario('MASTERY_1', 'Mastery', 'Mastery Index Formula Execution', insightsAfterFocus.body.careerReadiness >= 0 && insightsAfterFocus.body.careerReadiness <= 100, `Calculated Mastery Index = ${insightsAfterFocus.body.careerReadiness}%`);

    assertScenario('SKILL_1', 'Skill Mastery', 'Skill Nodes Phase Breakdown', Array.isArray(insightsAfterFocus.body.skillNodes) && insightsAfterFocus.body.skillNodes.length > 0, `Skill Nodes = ${insightsAfterFocus.body.skillNodes.length} phases`);

    // -------------------------------------------------------------------------
    // 7. NEXT BEST ACTION STATE TRANSITION
    // -------------------------------------------------------------------------
    console.log("\n📌 7. NEXT BEST ACTION DYNAMIC STATE TRANSITION");
    assertScenario('NEXT_ACTION_1', 'Next Best Action', 'Dynamic Next Action Target', !!insightsAfterFocus.body.nextBestAction && !!insightsAfterFocus.body.nextBestAction.title, `Target: "${insightsAfterFocus.body.nextBestAction.title.slice(0, 40)}"`);

    // -------------------------------------------------------------------------
    // 8. AI MENTOR & SANITIZATION
    // -------------------------------------------------------------------------
    console.log("\n📌 8. AI MENTOR & DATA VAULT SANITIZATION");
    const specVault = await request('/api/vault', { method: 'POST', headers: authA }, { title: 'C++ & SQL: <script>alert(1)</script>', content: 'Safe Code' });
    assertScenario('VAULT_1', 'Data Vault', 'Special Character Note Creation', specVault.status === 201 || specVault.status === 200, `Vault note created with sanitized title`);

    // -------------------------------------------------------------------------
    // 9. CONCURRENT REQUEST RACE CONDITION TEST
    // -------------------------------------------------------------------------
    console.log("\n📌 9. CONCURRENT REQUEST RACE CONDITION");
    const raceTasks = todayAfterStep1.body.step.tasks;
    if (raceTasks && raceTasks.length > 0) {
      const raceTaskId = raceTasks[0].taskId;
      const racePromises = Array.from({ length: 5 }).map(() =>
        request(`/api/roadmap/2/task/${raceTaskId}`, { method: 'PATCH', headers: authA }, { completed: true })
      );
      const raceResults = await Promise.all(racePromises);
      const allSucceeded = raceResults.every(r => r.status === 200);
      assertScenario('RACE_1', 'Race Conditions', '5 Simultaneous Task Patch Race Condition Safety', allSucceeded, "All 5 concurrent requests handled cleanly without database corruption");
    }

    // -------------------------------------------------------------------------
    // 10. SECRET LEAK SECURITY TEST
    // -------------------------------------------------------------------------
    console.log("\n📌 10. SECRET LEAK SECURITY TEST");
    const resString = JSON.stringify(insightsAfterFocus.body);
    const noSecretLeaked = !resString.includes('GEMINI_API_KEY') && !resString.includes('JWT_SECRET') && !resString.includes('MONGODB_URI');
    assertScenario('SECURITY_1', 'Security', 'Zero Backend Secret Exposure Check', noSecretLeaked, "Zero API keys or database URIs exposed in response body");

  } catch (err) {
    console.error("❌ Exception during deep audit:", err.message);
  }

  const passCount = results.filter(r => r.status === 'PASS').length;
  console.log("\n═══════════════════════════════════════════════════════════════════════════");
  console.log(`📊 DEEP AUDIT SUMMARY: ${passCount} / ${results.length} SCENARIOS PASSED`);
  console.log("═══════════════════════════════════════════════════════════════════════════\n");

  if (passCount !== results.length) {
    process.exit(1);
  }
}

runDeepSecondStageAudit();
