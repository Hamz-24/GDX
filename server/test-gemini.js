import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `You are a strict, senior software engineering mentor. The user's ultimate goal is: "Learn C++".
    Generate exactly 9 chronological, highly technical, and deeply specific learning milestones.
    Do NOT use generic terms like "Intro to", "Basics", "Intermediate Concepts". Use precise terminology (e.g. "Memory Management & Pointers", "Virtual DOM Reconciliation", "Borrow Checker semantics").
    
    Output ONLY this exact pure JSON array structure:
    [
      { "stepId": "unique-slug-1", "phase": "beginner", "name": "Highly Technical Milestone 1" },
      { "stepId": "unique-slug-2", "phase": "beginner", "name": "Highly Technical Milestone 2" },
      { "stepId": "unique-slug-9", "phase": "advanced", "name": "Expert Level Architecture" }
    ]`;

    const result = await model.generateContent(prompt);
    console.log("SUCCESS:");
    console.log(result.response.text());
  } catch (err) {
    console.log("ERROR:");
    console.error(err);
  }
}
test();
