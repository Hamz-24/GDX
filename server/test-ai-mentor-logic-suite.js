import http from 'http';

const baseUrl = 'http://localhost:5000';

function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runMentorLogicSuite() {
  console.log("════════════════════════════════════════════════════════════");
  console.log(" GDX AI MENTOR — 20/20 LOGIC & INTENT VERIFICATION SUITE");
  console.log("════════════════════════════════════════════════════════════\n");

  let passedCount = 0;
  let failedCount = 0;

  const assertTest = (id, condition, detail) => {
    if (condition) {
      console.log(`[PASS] ${id}: ${detail}`);
      passedCount++;
    } else {
      console.log(`[FAIL] ${id}: ${detail}`);
      failedCount++;
    }
  };

  try {
    // 1. Create User A
    const emailA = `mentor_test_a_${Date.now()}@gdx.test`;
    const regA = await makeRequest('/api/auth/register', 'POST', {
      name: 'Mentor Student A',
      email: emailA,
      password: 'password123',
      goal: 'DATA STRUCTURES',
      level: 'Basic / Beginner'
    });
    const tokenA = regA.body.token;

    // 2. Create User B
    const emailB = `mentor_test_b_${Date.now()}@gdx.test`;
    const regB = await makeRequest('/api/auth/register', 'POST', {
      name: 'Mentor Student B',
      email: emailB,
      password: 'password123',
      goal: 'SYSTEM DESIGN',
      level: 'Advanced'
    });
    const tokenB = regB.body.token;

    // MENTOR_01: "explain stack to me"
    const r1 = await makeRequest('/api/mentor/chat', 'POST', { message: 'explain stack to me' }, tokenA);
    const reply1 = r1.body.reply || '';
    assertTest('MENTOR_01', reply1.includes('Stack') && (reply1.includes('LIFO') || reply1.includes('linear')), 'Explain stack to me returns actual Stack explanation');

    // MENTOR_02: "Explain Day 8: DATA STRUCTURES - SEC_8: Data types for DATA STRUCTURES."
    const r2 = await makeRequest('/api/mentor/chat', 'POST', { message: 'Explain Day 8: DATA STRUCTURES - SEC_8: Data types for DATA STRUCTURES.' }, tokenA);
    const reply2 = r2.body.reply || '';
    assertTest('MENTOR_02', reply2.includes('Data Types') && !reply2.includes('The primary focus for DATA STRUCTURES - SEC_8'), 'Roadmap metadata prompt returns actual Data Types explanation');

    // MENTOR_03: "explaindata types" (glued typo)
    const r3 = await makeRequest('/api/mentor/chat', 'POST', { message: 'explaindata types' }, tokenA);
    const reply3 = r3.body.reply || '';
    assertTest('MENTOR_03', reply3.includes('Data Types') && (reply3.includes('Integer') || reply3.includes('Float') || reply3.includes('int')), 'Glued typo "explaindata types" parsed correctly');

    // MENTOR_04: "data types?"
    const r4 = await makeRequest('/api/mentor/chat', 'POST', { message: 'data types?' }, tokenA);
    const reply4 = r4.body.reply || '';
    assertTest('MENTOR_04', reply4.includes('Data Types'), 'Short query "data types?" returns Data Types explanation');

    // MENTOR_05: "what is an array?"
    const r5 = await makeRequest('/api/mentor/chat', 'POST', { message: 'what is an array?' }, tokenA);
    const reply5 = r5.body.reply || '';
    assertTest('MENTOR_05', reply5.includes('Array'), 'Definition query "what is an array?" returns Array explanation');

    // MENTOR_06: "stack vs queue"
    const r6 = await makeRequest('/api/mentor/chat', 'POST', { message: 'stack vs queue' }, tokenA);
    const reply6 = r6.body.reply || '';
    assertTest('MENTOR_06', reply6.includes('Stack') && reply6.includes('Queue') && (reply6.includes('LIFO') || reply6.includes('FIFO')), 'Comparison query "stack vs queue" returns comparison table');

    // MENTOR_07: "show Python code for stack"
    const r7 = await makeRequest('/api/mentor/chat', 'POST', { message: 'show Python code for stack' }, tokenA);
    const reply7 = r7.body.reply || '';
    assertTest('MENTOR_07', reply7.includes('```python') && reply7.includes('push'), 'Code request returns Python code block');

    // MENTOR_08: "give me an example" (Follow-up)
    const r8 = await makeRequest('/api/mentor/chat', 'POST', { message: 'give me an example' }, tokenA);
    const reply8 = r8.body.reply || '';
    assertTest('MENTOR_08', reply8.length > 20, 'Follow-up query "give me an example" generates example');

    // MENTOR_09: "quiz me on data types"
    const r9 = await makeRequest('/api/mentor/chat', 'POST', { message: 'quiz me on data types' }, tokenA);
    const reply9 = r9.body.reply || '';
    assertTest('MENTOR_09', reply9.includes('Quiz') || reply9.includes('Question'), 'Quiz request returns interactive practice quiz');

    // MENTOR_10: "what am I learning today?"
    const r10 = await makeRequest('/api/mentor/chat', 'POST', { message: 'what am I learning today?' }, tokenA);
    const reply10 = r10.body.reply || '';
    assertTest('MENTOR_10', reply10.length > 20, 'Roadmap query "what am I learning today?" returns learning milestone');

    // MENTOR_11: "explain today's topic"
    const r11 = await makeRequest('/api/mentor/chat', 'POST', { message: "explain today's topic" }, tokenA);
    const reply11 = r11.body.reply || '';
    assertTest('MENTOR_11', reply11.length > 20, 'Roadmap query "explain today\'s topic" returns topic lesson');

    // MENTOR_12: Topic switching (stack -> linked list)
    const r12 = await makeRequest('/api/mentor/chat', 'POST', { message: 'what is a linked list?' }, tokenA);
    const reply12 = r12.body.reply || '';
    assertTest('MENTOR_12', reply12.includes('Linked List') || reply12.includes('Node'), 'Topic switching switches to Linked List');

    // MENTOR_13: Follow-up code for linked list
    const r13 = await makeRequest('/api/mentor/chat', 'POST', { message: 'show code' }, tokenA);
    const reply13 = r13.body.reply || '';
    assertTest('MENTOR_13', reply13.includes('```') || reply13.includes('Node') || reply13.includes('class'), 'Follow-up "show code" generates relevant code');

    // MENTOR_14: Typo handling ("explaindatatype")
    const r14 = await makeRequest('/api/mentor/chat', 'POST', { message: 'explaindatatype' }, tokenA);
    const reply14 = r14.body.reply || '';
    assertTest('MENTOR_14', reply14.includes('Data Types') || reply14.includes('int'), 'Typo "explaindatatype" handled correctly');

    // MENTOR_15: Short query handling ("example")
    const r15 = await makeRequest('/api/mentor/chat', 'POST', { message: 'example' }, tokenA);
    const reply15 = r15.body.reply || '';
    assertTest('MENTOR_15', reply15.length > 15, 'Short query "example" handled gracefully');

    // MENTOR_16: Long query handling
    const longMsg = 'Can you please explain how a stack data structure manages function call stacks during recursion in detail?';
    const r16 = await makeRequest('/api/mentor/chat', 'POST', { message: longMsg }, tokenA);
    const reply16 = r16.body.reply || '';
    assertTest('MENTOR_16', reply16.length > 30, 'Long query handled with detailed response');

    // MENTOR_17: AI history persistence
    const histA = await makeRequest('/api/mentor/history', 'GET', null, tokenA);
    assertTest('MENTOR_17', Array.isArray(histA.body) && histA.body.length > 10, 'Chat messages persisted in ChatMessage collection');

    // MENTOR_18: Refresh persistence
    assertTest('MENTOR_18', histA.body.some(m => m.role === 'user') && histA.body.some(m => m.role === 'ai'), 'Chat history contains user and ai message pairs');

    // MENTOR_19: User isolation
    const histB = await makeRequest('/api/mentor/history', 'GET', null, tokenB);
    assertTest('MENTOR_19', Array.isArray(histB.body) && histB.body.length === 0, 'User B cannot read User A chat history (User B history is empty)');

    // MENTOR_20: Unauthorized request
    const r20 = await makeRequest('/api/mentor/history', 'GET', null, null);
    assertTest('MENTOR_20', r20.status === 401, 'Unauthorized request rejected with status 401');

  } catch (err) {
    console.error('❌ Exception in test suite:', err);
  }

  console.log("\n════════════════════════════════════════════════════════════");
  console.log(` TOTAL PASSED : ${passedCount} / 20`);
  console.log(` TOTAL FAILED : ${failedCount} / 20`);
  console.log("════════════════════════════════════════════════════════════\n");
}

runMentorLogicSuite();
