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

async function runDaySyncE2EAudit() {
  console.log("═══════════════════════════════════════════════════════════════════════════");
  console.log(" 🧪 GDX DAY SYNC & MARK-AS-DONE CHECKBOX E2E AUDIT");
  console.log("═══════════════════════════════════════════════════════════════════════════\n");

  const results = [];
  const assertScenario = (code, title, condition, details) => {
    const status = condition ? 'PASS' : 'FAIL';
    results.push({ code, title, status, details });
    const symbol = status === 'PASS' ? '✓' : '❌';
    console.log(`  [${status}] ${symbol} [${code.padEnd(12, ' ')}] ${title.padEnd(50, ' ')} -> ${details}`);
  };

  try {
    const testEmail = `day_sync_${Date.now()}@guidex.io`;
    const regRes = await request('/api/auth/register', { method: 'POST' }, {
      name: 'Day Sync Tester',
      email: testEmail,
      password: 'Password123!',
      goal: 'DATA STRUCTURES'
    });

    const token = regRes.body.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    assertScenario('DAY_SYNC_1', 'User Registration & Auth Token', regRes.status === 201 && !!token, 'User registered & authenticated');

    // 2. FETCH TODAY ROADMAP DAY (Initial = Day 1)
    const todayRes1 = await request('/api/roadmap/today', { headers: authHeaders });
    assertScenario('DAY_SYNC_2', 'GET /api/roadmap/today (Initial Day 1)', todayRes1.status === 200 && todayRes1.body.currentDay === 1, `Current Day: ${todayRes1.body.currentDay}`);

    // 3. FETCH CONCEPT FOR DAY 1
    const conceptRes1 = await request('/api/roadmap/concept/1', { headers: authHeaders });
    assertScenario('DAY_SYNC_3', 'GET /api/roadmap/concept/1 (Dynamic Day 1 Concept)', conceptRes1.status === 200 && !!conceptRes1.body.concept?.title, `Day 1 Concept Title: "${conceptRes1.body.concept?.title}"`);

    // 4. MARK DAY 1 AS COMPLETED VIA PATCH /api/roadmap/1/complete
    const completeRes1 = await request('/api/roadmap/1/complete', { method: 'PATCH', headers: authHeaders }, { completed: true });
    assertScenario('DAY_SYNC_4', 'PATCH /api/roadmap/1/complete (Mark Day 1 Completed)', completeRes1.status === 200 && completeRes1.body.step?.completed === true, 'Day 1 completed in MongoDB');

    // 5. VERIFY AUTO-ADVANCE TO DAY 2 IN MONGODB
    const todayRes2 = await request('/api/roadmap/today', { headers: authHeaders });
    assertScenario('DAY_SYNC_5', 'MongoDB Auto-Advance (User.currentRoadmapDay = 2)', todayRes2.status === 200 && todayRes2.body.currentDay === 2, `Advanced to Day ${todayRes2.body.currentDay}`);

    // 6. FETCH CONCEPT FOR DAY 2 (TOPIC CONSTRAINED TO DAY 2)
    const conceptRes2 = await request('/api/roadmap/concept/2', { headers: authHeaders });
    assertScenario('DAY_SYNC_6', 'GET /api/roadmap/concept/2 (Dynamic Day 2 Concept)', conceptRes2.status === 200 && !!conceptRes2.body.concept?.title, `Day 2 Concept Title: "${conceptRes2.body.concept?.title}"`);

    // 7. MARK DAY 2 AS COMPLETED VIA PATCH /api/roadmap/2/complete
    const completeRes2 = await request('/api/roadmap/2/complete', { method: 'PATCH', headers: authHeaders }, { completed: true });
    assertScenario('DAY_SYNC_7', 'PATCH /api/roadmap/2/complete (Mark Day 2 Completed)', completeRes2.status === 200 && completeRes2.body.step?.completed === true, 'Day 2 completed in MongoDB');

    // 8. VERIFY AUTO-ADVANCE TO DAY 3 IN MONGODB
    const todayRes3 = await request('/api/roadmap/today', { headers: authHeaders });
    assertScenario('DAY_SYNC_8', 'MongoDB Auto-Advance (User.currentRoadmapDay = 3)', todayRes3.status === 200 && todayRes3.body.currentDay === 3, `Advanced to Day ${todayRes3.body.currentDay}`);

    // 9. VERIFY WEEKLY INSIGHTS STREAK & PROGRESS SYNC
    const insightsRes = await request('/api/insights/weekly', { headers: authHeaders });
    assertScenario('DAY_SYNC_9', 'GET /api/insights/weekly (Streak & Mastery Sync)', insightsRes.status === 200 && insightsRes.body.streak >= 2, `Synced Streak: ${insightsRes.body.streak}, Readiness: ${insightsRes.body.careerReadiness}%`);

  } catch (err) {
    console.error("❌ Exception during Day Sync E2E audit:", err.message);
  }

  const passCount = results.filter(r => r.status === 'PASS').length;
  console.log("\n═══════════════════════════════════════════════════════════════════════════");
  console.log(`📊 DAY SYNC AUDIT SUMMARY: ${passCount} / ${results.length} SCENARIOS PASSED`);
  console.log("═══════════════════════════════════════════════════════════════════════════\n");

  if (passCount !== results.length) process.exit(1);
}

runDaySyncE2EAudit();
