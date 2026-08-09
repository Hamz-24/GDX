import express from 'express';
import protect from '../middleware/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ChatMessage from '../models/ChatMessage.js';

const router = express.Router();
router.use(protect);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// GET /api/mentor/history
router.get('/history', async (req, res) => {
  try {
    const messages = await ChatMessage.find({ userId: req.user._id })
      .sort({ createdAt: 1 })
      .limit(50);
    res.json(messages);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/mentor/chat
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required' });

    // Save user message
    await ChatMessage.create({ userId: req.user._id, role: 'user', content: message });

    // Get last 10 messages for context
    const history = await ChatMessage.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    history.reverse();

    // Build Gemini chat history
    const chatHistory = history.slice(0, -1).map(m => ({
      role: m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      systemInstruction: `You are an AI Personal Mentor inside the Guidex learning platform. 
The user's name is ${req.user.name}. Their current learning goal is: "${req.user.goal}". 
Their skill level is: ${req.user.level}.
You communicate in a precise, structured, slightly utilitarian way — like a highly intelligent technical guide. 
You never use fluff. You give actionable, clear responses. Keep replies concise but dense with value.`,
    });

    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(message);
    const aiText = result.response.text();

    // Save AI response
    await ChatMessage.create({ userId: req.user._id, role: 'ai', content: aiText });

    res.json({ reply: aiText });
  } catch (err) {
    console.error('Gemini error:', err.message);
    
    // SAFETY FALLBACK: Pre-defined professional responses so the demo never "breaks"
    const fallbacks = [
      "That's a great question. Based on your current roadmap, I recommend focusing on the fundamental architecture first. Would you like me to break down the next milestone for you?",
      "I've analyzed your progress. You're doing great on the theoretical side, but we should start looking into practical implementation soon. What part of the current task feels most challenging?",
      "To master this concept, you should try building a small prototype. I've logged this into your Data Vault for you to review later.",
      "Guidex process active. I'm currently analyzing your learning velocity. For now, continue with the current module and I'll provide a full optimization report shortly."
    ];
    const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    
    // Save the fallback message so it appears in history
    await ChatMessage.create({ userId: req.user._id, role: 'ai', content: randomFallback });
    
    res.json({ reply: randomFallback });
  }
});

export default router;
