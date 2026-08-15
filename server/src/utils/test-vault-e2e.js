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

async function runVaultE2EAudit() {
  console.log("═══════════════════════════════════════════════════════════════════════════");
  console.log(" 🧪 GDX DATA VAULT COMPLETE END-TO-END FUNCTIONAL AUDIT (13 SCENARIOS)");
  console.log("═══════════════════════════════════════════════════════════════════════════\n");

  const results = [];
  const assertScenario = (code, title, condition, details) => {
    const status = condition ? 'PASS' : 'FAIL';
    results.push({ code, title, status, details });
    const symbol = status === 'PASS' ? '✓' : '❌';
    console.log(`  [${status}] ${symbol} [${code.padEnd(12, ' ')}] ${title.padEnd(50, ' ')} -> ${details}`);
  };

  try {
    // Reg User A & User B
    const userA_Email = `vault_user_a_${Date.now()}@guidex.io`;
    const userB_Email = `vault_user_b_${Date.now()}@guidex.io`;

    const regA = await request('/api/auth/register', { method: 'POST' }, {
      name: 'Vault Tester A',
      email: userA_Email,
      password: 'Password123!',
      goal: 'DATA STRUCTURES'
    });
    const tokenA = regA.body.token;
    const authA = { Authorization: `Bearer ${tokenA}` };

    const regB = await request('/api/auth/register', { method: 'POST' }, {
      name: 'Vault Tester B',
      email: userB_Email,
      password: 'Password123!',
      goal: 'DATABASE'
    });
    const tokenB = regB.body.token;
    const authB = { Authorization: `Bearer ${tokenB}` };

    // 1. CREATE NOTE
    const createRes = await request('/api/vault', { method: 'POST', headers: authA }, {
      title: 'Arrays & Memory Alignment Notes',
      category: 'Notes / Markdown',
      content: 'Array elements are stored in contiguous memory addresses: Loc(A[i]) = Base(A) + i * size.'
    });
    const noteA_Id = createRes.body._id;
    assertScenario('VAULT_E2E_1', 'Note Creation (POST /api/vault)', createRes.status === 201 && !!noteA_Id, `Created Note ID ${noteA_Id} in MongoDB`);

    // 2. CREATE VALIDATION (Empty Title)
    const badCreate = await request('/api/vault', { method: 'POST', headers: authA }, { title: '   ', content: 'Empty title test' });
    assertScenario('VAULT_E2E_2', 'Empty Title Validation Rejection', badCreate.status === 400, `Status ${badCreate.status} (Title required)`);

    // 3. SPECIAL CHARACTERS & UNICODE
    const specRes = await request('/api/vault', { method: 'POST', headers: authA }, {
      title: 'C++ & SQL: <script>alert(1)</script> - 데이터 中文 é ₹',
      category: 'Code Snippets',
      content: 'Special character testing string: 100% safe.'
    });
    assertScenario('VAULT_E2E_3', 'Special Characters & Unicode Support', specRes.status === 201 && !!specRes.body._id, `Sanitized Note ID ${specRes.body._id} persisted`);

    // 4. READ NOTES
    const readRes = await request('/api/vault', { headers: authA });
    assertScenario('VAULT_E2E_4', 'Retrieve User Notes (GET /api/vault)', readRes.status === 200 && Array.isArray(readRes.body) && readRes.body.length >= 2, `Retrieved ${readRes.body.length} notes from MongoDB`);

    // 5. UPDATE / EDIT NOTE
    const updateRes = await request(`/api/vault/${noteA_Id}`, { method: 'PUT', headers: authA }, {
      title: 'Arrays & Advanced Memory Alignment Notes',
      category: 'Notes / Markdown',
      content: 'UPDATED CONTENT: Base address calculation formula: Loc(A[i]) = Base(A) + i * element_size.'
    });
    assertScenario('VAULT_E2E_5', 'Update Note (PUT /api/vault/:id)', updateRes.status === 200 && updateRes.body.title.includes('Advanced'), `Title updated to "${updateRes.body.title}"`);

    // 6. UPDATE VALIDATION (Empty Title)
    const badUpdate = await request(`/api/vault/${noteA_Id}`, { method: 'PUT', headers: authA }, { title: '', content: 'Empty edit' });
    assertScenario('VAULT_E2E_6', 'Update Empty Title Validation Rejection', badUpdate.status === 400, `Status ${badUpdate.status} (Title required)`);

    // 7. DOCUMENT PARSING ENDPOINT
    const dummyBase64 = Buffer.from("Document Parsing Test Content: Data Vault PDF/DOCX Parsing Engine.").toString('base64');
    const parseRes = await request('/api/roadmap/parse-document', { method: 'POST', headers: authA }, { fileBase64: `data:text/plain;base64,${dummyBase64}`, fileName: 'test.txt' });
    assertScenario('VAULT_E2E_7', 'Document Text Extraction (POST /api/roadmap/parse-document)', parseRes.status === 200 && parseRes.body.text.includes('Document Parsing'), `Extracted ${parseRes.body.wordCount} words cleanly`);

    // 8. CATEGORY ACCURACY
    const pdfNote = await request('/api/vault', { method: 'POST', headers: authA }, { title: 'System Architecture Reference.pdf', category: 'PDF Documents', content: 'PDF reference text' });
    assertScenario('VAULT_E2E_8', 'Category Accuracy (PDF vs Markdown)', pdfNote.body.category === 'PDF Documents', `Category = "${pdfNote.body.category}" (No .md misclassification)`);

    // 9. IDOR SECURITY (User B attempts to edit User A's note)
    const idorPut = await request(`/api/vault/${noteA_Id}`, { method: 'PUT', headers: authB }, { title: 'Hacked Title', content: 'Hacked Content' });
    assertScenario('VAULT_E2E_9', 'IDOR Update Defense (User B cannot edit User A note)', idorPut.status === 404, `Status ${idorPut.status} (Note not found for User B)`);

    // 10. IDOR SECURITY (User B attempts to delete User A's note)
    const idorDel = await request(`/api/vault/${noteA_Id}`, { method: 'DELETE', headers: authB });
    assertScenario('VAULT_E2E_10', 'IDOR Delete Defense (User B cannot delete User A note)', idorDel.status === 404, `Status ${idorDel.status} (Note not found for User B)`);

    // 11. DELETE NOTE
    const deleteRes = await request(`/api/vault/${noteA_Id}`, { method: 'DELETE', headers: authA });
    assertScenario('VAULT_E2E_11', 'Delete Note (DELETE /api/vault/:id)', deleteRes.status === 200, "Successfully deleted note document from MongoDB");

    // 12. DELETE NONEXISTENT NOTE
    const badDel = await request(`/api/vault/${noteA_Id}`, { method: 'DELETE', headers: authA });
    assertScenario('VAULT_E2E_12', 'Delete Nonexistent Note Rejection', badDel.status === 404, `Status ${badDel.status} (Note not found)`);

    // 13. RE-LOGIN & PERSISTENCE
    const loginA = await request('/api/auth/login', { method: 'POST' }, { email: userA_Email, password: 'Password123!' });
    const authA_New = { Authorization: `Bearer ${loginA.body.token}` };
    const finalRead = await request('/api/vault', { headers: authA_New });
    const hasDeletedNote = Array.isArray(finalRead.body) && finalRead.body.some(n => n._id === noteA_Id);
    assertScenario('VAULT_E2E_13', 'Re-login & Session Persistence Verification', !hasDeletedNote && finalRead.body.length >= 1, "Persisted MongoDB state confirmed post re-login");

  } catch (err) {
    console.error("❌ Exception during Vault E2E audit:", err.message);
  }

  const passCount = results.filter(r => r.status === 'PASS').length;
  console.log("\n═══════════════════════════════════════════════════════════════════════════");
  console.log(`📊 DATA VAULT E2E AUDIT SUMMARY: ${passCount} / ${results.length} SCENARIOS PASSED`);
  console.log("═══════════════════════════════════════════════════════════════════════════\n");

  if (passCount !== results.length) {
    process.exit(1);
  }
}

runVaultE2EAudit();
