import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';

async function testGemini() {
  console.log("Testing Gemini API with key:", process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING");
  const modelsToTest = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-pro', 'gemini-2.5-flash'];
  
  for (const modelName of modelsToTest) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: modelName });
      const res = await model.generateContent("Say hello in one word");
      console.log(`✅ Model ${modelName} SUCCESS:`, res.response.text().trim());
      break;
    } catch (err) {
      console.log(`❌ Model ${modelName} FAILED:`, err.message);
    }
  }
}

testGemini();
