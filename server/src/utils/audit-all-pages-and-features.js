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

async function auditAllFeatures() {
  console.log("═══════════════════════════════════════════════════════════════════════════");
  console.log(" 🔍 GDX FULL END-TO-END APPLICATION FEATURE & BUTTON AUDIT");
  console.log("═══════════════════════════════════════════════════════════════════════════\n");

  const results = [];
  const addResult = (feature, status, details) => {
    results.push({ feature, status, details });
    const symbol = status === 'PASS' ? '✓' : '❌';
    console.log(`  [${status.padEnd(4, ' ')}] ${symbol} ${feature.padEnd(45, ' ')} : ${details}`);
  };

  try {
    // 1. AUTHENTICATION FEATURE AUDIT
    console.log("📌 1. AUTHENTICATION & SESSION SYSTEM");
    const testEmail = `audit_user_${Date.now()}@guidex.io`;
    const regRes = await request('/api/auth/register', { method: 'POST' }, {
      name: 'Audit User',
      email: testEmail,
      password: 'Password123!',
      goal: 'DATA STRUCTURES',
      level: 'Basic / Beginner',
      timelineWeeks: 4
    });

    if (regRes.status === 201 && regRes.body.token) {
      addResult('User Registration (POST /api/auth/register)', 'PASS', `Token generated, user registered`);
    } else {
      addResult('User Registration (POST /api/auth/register)', 'FAIL', `Status ${regRes.status}: ${JSON.stringify(regRes.body)}`);
    }

    const token = regRes.body.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    const meRes = await request('/api/auth/me', { headers: authHeaders });
    if (meRes.status === 200 && meRes.body.email === testEmail) {
      addResult('Profile Sync (GET /api/auth/me)', 'PASS', `Retrieved authenticated user details`);
    } else {
      addResult('Profile Sync (GET /api/auth/me)', 'FAIL', `Status ${meRes.status}`);
    }

    // 2. DASHBOARD & ROADMAP SOURCE OF TRUTH AUDIT
    console.log("\n📌 2. DASHBOARD & ROADMAP SINGLE SOURCE OF TRUTH");
    const roadRes = await request('/api/roadmap', { headers: authHeaders });
    if (roadRes.status === 200 && Array.isArray(roadRes.body) && roadRes.body.length > 0) {
      addResult('Roadmap Generation (GET /api/roadmap)', 'PASS', `Generated ${roadRes.body.length} roadmap steps`);
    } else {
      addResult('Roadmap Generation (GET /api/roadmap)', 'FAIL', `Status ${roadRes.status}`);
    }

    const todayRes = await request('/api/roadmap/today', { headers: authHeaders });
    if (todayRes.status === 200 && todayRes.body.step) {
      addResult('Dashboard Mission Sync (GET /api/roadmap/today)', 'PASS', `Day ${todayRes.body.currentDay}: "${todayRes.body.step.dayName}"`);
    } else {
      addResult('Dashboard Mission Sync (GET /api/roadmap/today)', 'FAIL', `Status ${todayRes.status}`);
    }

    // 3. TASK COMPLETION & AUTO-ADVANCE AUDIT
    console.log("\n📌 3. TASK COMPLETION & PROGRESS TRACKING");
    if (todayRes.body && todayRes.body.step && todayRes.body.step.tasks && todayRes.body.step.tasks.length > 0) {
      const firstTask = todayRes.body.step.tasks[0];
      const taskRes = await request(`/api/roadmap/1/task/${firstTask.taskId}`, {
        method: 'PATCH',
        headers: authHeaders
      }, { completed: true });

      if (taskRes.status === 200) {
        addResult('Task Toggle Checkbox (PATCH /api/roadmap/:day/task/:id)', 'PASS', `Task "${firstTask.title.slice(0, 30)}" marked completed`);
      } else {
        addResult('Task Toggle Checkbox (PATCH /api/roadmap/:day/task/:id)', 'FAIL', `Status ${taskRes.status}`);
      }
    }

    // 4. DAILY CONCEPT TOPIC-CONSTRAINED ENGINE AUDIT
    console.log("\n📌 4. DAILY CONCEPT ENGINE & STAGE 1-4 VISUALIZERS");
    const conceptRes = await request('/api/roadmap/concept/1', { headers: authHeaders });
    if (conceptRes.status === 200 && conceptRes.body.concept) {
      const c = conceptRes.body.concept;
      addResult('Daily Concept On-Demand AI (GET /api/roadmap/concept/1)', 'PASS', `VisualType: [${c.visualType}] for "${c.title}"`);
    } else {
      addResult('Daily Concept On-Demand AI (GET /api/roadmap/concept/1)', 'FAIL', `Status ${conceptRes.status}`);
    }

    // 5. DOCUMENT PARSING (PDF / DOCX) AUDIT
    console.log("\n📌 5. DOCUMENT TEXT PARSING ENGINE (PDF/DOCX/TXT)");
    const dummyTxtBase64 = Buffer.from("Education: Bachelor of Computer Science\nSkills: Python, JavaScript, React, SQL\nExperience: Software Engineer Intern").toString('base64');
    const parseRes = await request('/api/roadmap/parse-document', {
      method: 'POST',
      headers: authHeaders
    }, { fileBase64: `data:text/plain;base64,${dummyTxtBase64}`, fileName: 'resume.txt' });

    if (parseRes.status === 200 && parseRes.body.text && parseRes.body.text.includes('Education')) {
      addResult('Document Parser Endpoint (POST /api/roadmap/parse-document)', 'PASS', `Extracted ${parseRes.body.wordCount} words cleanly`);
    } else {
      addResult('Document Parser Endpoint (POST /api/roadmap/parse-document)', 'FAIL', `Status ${parseRes.status}`);
    }

    // 6. AI MENTOR CHAT SYSTEM AUDIT
    console.log("\n📌 6. AI MENTOR CHAT & CONVERSATION HISTORY");
    const chatRes = await request('/api/mentor/chat', {
      method: 'POST',
      headers: authHeaders
    }, { message: 'Explain array base address calculation formula' });

    if (chatRes.status === 200 && chatRes.body.reply) {
      addResult('AI Mentor Chat (POST /api/mentor/chat)', 'PASS', `Received AI reply (${chatRes.body.reply.length} chars)`);
    } else {
      addResult('AI Mentor Chat (POST /api/mentor/chat)', 'FAIL', `Status ${chatRes.status}`);
    }

    const histRes = await request('/api/mentor/history', { headers: authHeaders });
    if (histRes.status === 200 && Array.isArray(histRes.body)) {
      addResult('AI Mentor History Sync (GET /api/mentor/history)', 'PASS', `Retrieved ${histRes.body.length} chat turns`);
    } else {
      addResult('AI Mentor History Sync (GET /api/mentor/history)', 'FAIL', `Status ${histRes.status}`);
    }

    // 7. DATA VAULT AUDIT
    console.log("\n📌 7. DATA VAULT KNOWLEDGE MANAGEMENT");
    const vaultAdd = await request('/api/vault', {
      method: 'POST',
      headers: authHeaders
    }, { title: 'Array Optimization Note', content: 'Base address formula: Loc(A[i]) = Base(A) + i * size', category: 'Notes' });

    if ((vaultAdd.status === 200 || vaultAdd.status === 201) && (vaultAdd.body._id || vaultAdd.body.item)) {
      const itemId = vaultAdd.body._id || vaultAdd.body.item._id;
      addResult('Data Vault Add Note (POST /api/vault)', 'PASS', `Created note ID ${itemId}`);
      
      // Delete vault note
      const vaultDel = await request(`/api/vault/${itemId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (vaultDel.status === 200) {
        addResult('Data Vault Delete Note (DELETE /api/vault/:id)', 'PASS', `Successfully deleted vault note`);
      } else {
        addResult('Data Vault Delete Note (DELETE /api/vault/:id)', 'FAIL', `Status ${vaultDel.status}`);
      }
    } else {
      addResult('Data Vault Add Note (POST /api/vault)', 'FAIL', `Status ${vaultAdd.status}`);
    }


    // 8. FOCUS MODE TIMED STUDY SESSION AUDIT
    console.log("\n📌 8. FOCUS MODE TIMED STUDY SESSIONS");
    const focusRes = await request('/api/focus', {
      method: 'POST',
      headers: authHeaders
    }, { duration: 25, task: 'Array Memory Layout', notes: 'Mastered base address math' });

    if (focusRes.status === 200 || focusRes.status === 201) {
      addResult('Focus Mode Session Record (POST /api/focus)', 'PASS', `Logged 25 min focus session`);
    } else {
      addResult('Focus Mode Session Record (POST /api/focus)', 'FAIL', `Status ${focusRes.status}`);
    }

    // 9. INSIGHTS & WEEKLY METRICS AUDIT
    console.log("\n📌 9. INSIGHTS & WEEKLY METRICS ENGINE");
    const insightsRes = await request('/api/insights/weekly', { headers: authHeaders });
    if (insightsRes.status === 200 && insightsRes.body.careerReadiness !== undefined) {
      addResult('Insights Weekly Metrics (GET /api/insights/weekly)', 'PASS', `Career Readiness: ${insightsRes.body.careerReadiness}%, Streak: ${insightsRes.body.streak}`);
    } else {
      addResult('Insights Weekly Metrics (GET /api/insights/weekly)', 'FAIL', `Status ${insightsRes.status}`);
    }

  } catch (err) {
    console.error("❌ Exception during full app audit:", err.message);
  }

  const passCount = results.filter(r => r.status === 'PASS').length;
  console.log("\n═══════════════════════════════════════════════════════════════════════════");
  console.log(`📊 FULL APP E2E FEATURE AUDIT SUMMARY: ${passCount} / ${results.length} PASSED`);
  console.log("═══════════════════════════════════════════════════════════════════════════\n");
}

auditAllFeatures();
