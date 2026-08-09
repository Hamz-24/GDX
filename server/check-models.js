import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // There is no direct listModels in the main SDK usually, but let's try a simple request to a different endpoint if possible
    // Actually, let's just try a very basic model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const result = await model.generateContent("hi");
    console.log(result.response.text());
  } catch (err) {
    console.error(err);
  }
}
listModels();
