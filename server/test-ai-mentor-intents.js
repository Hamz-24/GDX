import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'guidex_super_secret_jwt_key_change_this_in_production';

const mockUserId = '64aef0011223344556677889';
const mockUser = {
  id: mockUserId,
  email: 'intent_test_user@gdx.test',
  name: 'Test User',
  goal: 'DATA STRUCTURES',
  level: 'Beginner',
  timelineWeeks: 4,
  currentRoadmapDay: 1,
  streak: 3
};

const token = jwt.sign(mockUser, JWT_SECRET, { expiresIn: '1h' });

const questionsToTest = [
  { label: 'TEST A (Greeting)', input: 'hi' },
  { label: 'TEST B (Concept Definition)', input: 'What is a stack?' },
  { label: 'TEST C (Example Request)', input: 'Give me an example.' },
  { label: 'TEST D (Confusion Handling)', input: "I don't understand." },
  { label: 'TEST E (Why Question)', input: 'Why does it work?' },
  { label: 'TEST F (Code Request)', input: 'Show me Python code.' },
  { label: 'TEST G (FAANG Interview Evaluation)', input: 'How would a FAANG interviewer evaluate DATA STRUCTURES?' },
  { label: 'TEST H (Quiz Request)', input: 'Quiz me.' },
  { label: 'TEST I (Study Planning)', input: 'What should I learn next?' },
  { label: 'TEST J (Progress Query)', input: 'How am I doing?' },
];

async function runIntentTests() {
  console.log("════════════════════════════════════════════════════════════");
  console.log(" GDX AI MENTOR — INTENT DIVERSITY & FALLBACK VERIFICATION");
  console.log("════════════════════════════════════════════════════════════\n");

  const responses = [];

  for (const item of questionsToTest) {
    try {
      const res = await fetch('http://localhost:5000/api/mentor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: item.input, persona: 'socratic', topic: 'DATA STRUCTURES' })
      });
      const data = await res.json();
      if (!res.ok || !data.reply) {
        console.log(`❌ HTTP ${res.status}:`, data);
        continue;
      }
      responses.push({ label: item.label, input: item.input, reply: data.reply });
      console.log(`▶ ${item.label}`);
      console.log(`  User: "${item.input}"`);
      console.log(`  AI:   ${data.reply.slice(0, 140).replace(/\n/g, ' ')}...`);
      console.log('────────────────────────────────────────────────────────────');
    } catch (err) {
      console.error(`❌ ${item.label} FAILED:`, err.message);
    }
  }

  // Verify uniqueness among all 10 responses
  const uniqueReplies = new Set(responses.map(r => r.reply));
  console.log(`\nTOTAL DISTINCT AI RESPONSES GENERATED: ${uniqueReplies.size} / ${questionsToTest.length}`);

  if (uniqueReplies.size === questionsToTest.length) {
    console.log("✅ PERFECT 10/10 INTENT DIVERSITY VERIFIED! NO GENERIC REPETITION!");
  } else {
    console.warn("⚠️ SOME RESPONSES WERE DUPLICATED!");
  }
}

runIntentTests();
