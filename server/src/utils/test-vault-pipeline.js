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

async function runVaultPipelineAudit() {
  console.log("═══════════════════════════════════════════════════════════════════════════");
  console.log(" 🔍 GDX DATA VAULT UPLOAD & DISPLAY PIPELINE DIAGNOSTIC AUDIT");
  console.log("═══════════════════════════════════════════════════════════════════════════\n");

  const results = [];
  const assertStep = (step, title, condition, details) => {
    const status = condition ? 'PASS' : 'FAIL';
    results.push({ step, title, status, details });
    const symbol = status === 'PASS' ? '✓' : '❌';
    console.log(`  [${status}] ${symbol} [STEP ${String(step).padStart(2, '0')}] ${title.padEnd(50, ' ')} -> ${details}`);
  };

  try {
    const testEmail = `vault_pipeline_${Date.now()}@guidex.io`;
    const regRes = await request('/api/auth/register', { method: 'POST' }, {
      name: 'Vault Pipeline Tester',
      email: testEmail,
      password: 'Password123!',
      goal: 'DATA STRUCTURES'
    });

    const token = regRes.body.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    assertStep(1, 'User Registration & Auth Token', regRes.status === 201 && !!token, 'Authenticated JWT token generated');

    // 2. CREATE NOTE VIA POST
    const noteTitle = 'Database Normalization 1NF to 3NF Notes';
    const noteCat = 'Personal Notes';
    const noteContent = '1NF: Atomic values. 2NF: No partial dependencies. 3NF: No transitive dependencies.';

    const createRes = await request('/api/vault', { method: 'POST', headers: authHeaders }, {
      title: noteTitle,
      category: noteCat,
      content: noteContent
    });

    assertStep(2, 'POST /api/vault Create Endpoint', createRes.status === 201 && !!createRes.body._id, `Created Note ID: ${createRes.body._id}`);

    // 3. VERIFY MONGODB DOCUMENT STRUCTURE & USER ID
    const savedItem = createRes.body;
    const isDocValid = savedItem._id && savedItem.title === noteTitle && savedItem.category === noteCat && savedItem.userId;
    assertStep(3, 'MongoDB Document Integrity & User ID', isDocValid, `Saved Title: "${savedItem.title}", User ID Scoped`);

    // 4. VERIFY GET /api/vault RETRIEVAL
    const getRes = await request('/api/vault', { headers: authHeaders });
    const items = getRes.body;
    const foundInGet = Array.isArray(items) && items.some(i => i._id === savedItem._id);
    assertStep(4, 'GET /api/vault Endpoint Retrieval', foundInGet, `Retrieved ${items.length} vault items from MongoDB`);

    // 5. CATEGORY NORMALIZATION MATCHING
    const normalizeCategory = (cat) => {
      if (!cat) return 'Personal Notes';
      const c = cat.toLowerCase();
      if (c.includes('pdf')) return 'PDF Documents';
      if (c.includes('code')) return 'Code Snippets';
      if (c.includes('md') || c.includes('markdown')) return 'Notes / Markdown';
      if (c.includes('txt') || c.includes('text')) return 'Text Documents';
      return 'Personal Notes';
    };

    const normCat = normalizeCategory(savedItem.category);
    assertStep(5, 'Category Normalization Matching', normCat === 'Personal Notes', `Normalized Category: "${normCat}"`);

    // 6. FILTERING LOGIC SIMULATION
    const activeTabAll = 'All';
    const activeTabMatch = 'Personal Notes';
    const activeTabMismatch = 'PDF Documents';

    const matchesAll = items.filter(i => activeTabAll === 'All' || normalizeCategory(i.category) === activeTabAll);
    const matchesCategory = items.filter(i => activeTabMatch === 'All' || normalizeCategory(i.category) === activeTabMatch);
    const matchesMismatch = items.filter(i => activeTabMismatch === 'All' || normalizeCategory(i.category) === activeTabMismatch);

    assertStep(6, 'Filtering Under "ALL" Tab', matchesAll.length === 1, `1 item displayed under "ALL"`);
    assertStep(7, 'Filtering Under "Personal Notes" Tab', matchesCategory.length === 1, `1 item displayed under "Personal Notes"`);
    assertStep(8, 'Filtering Under "PDF Documents" Tab', matchesMismatch.length === 0, `0 items displayed under "PDF Documents" (Correct filtering behavior)`);

  } catch (err) {
    console.error("❌ Exception during Data Vault pipeline diagnostic:", err.message);
  }

  const passCount = results.filter(r => r.status === 'PASS').length;
  console.log("\n═══════════════════════════════════════════════════════════════════════════");
  console.log(`📊 DATA VAULT PIPELINE DIAGNOSTIC SUMMARY: ${passCount} / ${results.length} PASSED`);
  console.log("═══════════════════════════════════════════════════════════════════════════\n");
}

runVaultPipelineAudit();
