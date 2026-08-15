import express from 'express';
import protect from '../middleware/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ChatMessage from '../models/ChatMessage.js';
import RoadmapStep from '../models/RoadmapStep.js';
import Task from '../models/Task.js';
import VaultItem from '../models/VaultItem.js';

const router = express.Router();
router.use(protect);

// GET /api/mentor/history — Fetch chat history
router.get('/history', async (req, res) => {
  try {
    const messages = await ChatMessage.find({ userId: req.user._id })
      .sort({ createdAt: 1 })
      .limit(50);
    res.json(messages);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/mentor/history — Clear chat history for authenticated user only
router.delete('/history', async (req, res) => {
  try {
    if (!req.user._jwtOnly) {
      await ChatMessage.deleteMany({ userId: req.user._id });
    }
    res.json({ message: 'Chat history cleared successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Normalization helper (lowercase, remove noise, fix glued typos like "explaindata types")
const normalizeInput = (msg) => {
  if (!msg) return '';
  let str = msg.toLowerCase().trim();
  str = str.replace(/explaindata\s*types/g, 'explain data types');
  str = str.replace(/explaindatatype/g, 'explain data type');
  str = str.replace(/explaindatatypes/g, 'explain data types');
  str = str.replace(/whatis/g, 'what is');
  str = str.replace(/stackvsqueue/g, 'stack vs queue');
  str = str.replace(/explainstack/g, 'explain stack');
  str = str.replace(/explainarray/g, 'explain array');
  return str.replace(/\s+/g, ' ').trim();
};

// Casual greeting detector
const isCasualGreeting = (msg) => {
  const clean = (msg || '').trim().toLowerCase().replace(/[^\w\s]/g, '');
  return [
    'hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon',
    'good evening', 'who are you', 'sup', 'yo', 'hi there', 'hello mentor',
    'hey there', 'whats up', 'howdy'
  ].includes(clean);
};

// Extract explicit educational concept from raw or normalized text using robust regex
const extractConceptFromText = (rawText) => {
  if (!rawText) return null;
  const text = rawText.toLowerCase();

  if (/data\s*type|datatype|data_type/i.test(text)) return 'Data Types';
  if (/stack\s*vs\s*queue|queue\s*vs\s*stack/i.test(text)) return 'Stack vs Queue';
  if (/\bstack\b/i.test(text)) return 'Stack';
  if (/\bqueue\b/i.test(text)) return 'Queue';
  if (/\barray\b|\barrays\b/i.test(text)) return 'Arrays';
  if (/linked\s*list/i.test(text)) return 'Linked List';
  if (/\btree\b|\btrees\b|\bbinary tree\b/i.test(text)) return 'Trees';
  if (/\bgraph\b|\bgraphs\b/i.test(text)) return 'Graphs';
  if (/recursion|recursive/i.test(text)) return 'Recursion';
  if (/sort|sorting/i.test(text)) return 'Sorting Algorithms';
  if (/search|searching|binary search/i.test(text)) return 'Searching Algorithms';
  if (/hash|map|dictionary/i.test(text)) return 'Hash Tables';
  if (/big\s*o|complexity/i.test(text)) return 'Big-O Notation';
  return null;
};

// Intent classifier
const classifyIntent = (normalizedMsg, isGreeting) => {
  if (isGreeting) return 'CASUAL_GREETING';
  if (normalizedMsg.includes('vs') || normalizedMsg.includes('compare') || normalizedMsg.includes('difference')) return 'COMPARISON';
  if (normalizedMsg.includes('quiz') || normalizedMsg.includes('test me')) return 'QUIZ';
  if (normalizedMsg.includes('interviewer') || normalizedMsg.includes('faang') || normalizedMsg.includes('evaluate')) return 'INTERVIEW_PREP';
  if (normalizedMsg.includes('python') || normalizedMsg.includes('code') || normalizedMsg.includes('snippet') || normalizedMsg.includes('implementation')) return 'CODE_REQUEST';
  if (normalizedMsg.includes('example') || normalizedMsg.includes('instance')) return 'EXAMPLE_REQUEST';
  if (normalizedMsg.includes('simpler') || normalizedMsg.includes('dont understand') || normalizedMsg.includes("don't understand") || normalizedMsg.includes('stuck') || normalizedMsg.includes('confused')) return 'SIMPLIFY';
  if (normalizedMsg.includes('today') || normalizedMsg.includes('roadmap') || normalizedMsg.includes('what am i learning') || normalizedMsg.includes('current topic')) return 'ROADMAP_REQUEST';
  if (normalizedMsg.includes('explain') || normalizedMsg.includes('what is') || normalizedMsg.includes('tell me about') || normalizedMsg.endsWith('?')) return 'EXPLAIN_CONCEPT';
  return 'GENERAL_QUERY';
};

// Educational response generator for fallbacks & validation
const generateConceptAnswer = ({ concept, intent, persona, level, userName, userGoal, currentDay }) => {
  const isBeginner = (level || '').toLowerCase().includes('basic') || (level || '').toLowerCase().includes('beginner');

  // Handle Stack vs Queue Comparison
  if (concept === 'Stack vs Queue' || intent === 'COMPARISON') {
    return `### ⚖️ Stack vs Queue Comparison

| Feature | Stack | Queue |
| :--- | :--- | :--- |
| **Principle** | **LIFO** (Last In, First Out) | **FIFO** (First In, First Out) |
| **Analogy** | Stack of plates / Cafeteria trays | Line of customers at a checkout |
| **Primary Ops** | \`push()\` and \`pop()\` from top | \`enqueue()\` at rear, \`dequeue()\` from front |
| **Time Complexity** | $\\mathcal{O}(1)$ push/pop | $\\mathcal{O}(1)$ enqueue/dequeue |
| **Applications** | Function call stack, Undo history | Print spooling, OS task scheduling |

*Key takeaway:* Stacks process the **most recent** element first, while Queues process the **oldest** element first!`;
  }

  // Handle Data Types
  if (concept === 'Data Types') {
    if (intent === 'CODE_REQUEST') {
      return `\`\`\`python
# Python Data Types Demonstration
age = 25             # int (Integer)
price = 19.99        # float (Floating Point)
name = "${userName}"    # str (String)
is_active = True     # bool (Boolean)

# Print types
print(type(age))      # <class 'int'>
print(type(price))    # <class 'float'>
print(type(name))     # <class 'str'>
print(type(is_active)) # <class 'bool'>
\`\`\`\n\nData types specify what kind of value a variable stores and how memory is allocated for it.`;
    }

    if (intent === 'QUIZ') {
      return `### 📝 Interactive Practice Quiz: Data Types\n\n**Question 1/3:** Which data type would you use to store a user's account balance (e.g. \`105.75\`)?\n\n- **A:** \`int\` (Integer)\n- **B:** \`float\` (Floating point)\n- **C:** \`bool\` (Boolean)\n\n*Reply with your answer (A, B, or C)!*`;
    }

    return `### 💡 Understanding Data Types (${isBeginner ? 'Beginner Guide' : 'Core Concept'})

**Data Types** define what kind of value a variable can hold and how a computer stores it in memory.

Think of a variable as a labeled box:
- **Integer (\`int\`):** Whole numbers like \`25\` or \`-10\`.
- **Float (\`float\`):** Decimal numbers like \`3.14\` or \`99.9\`.
- **String (\`str\`):** Text characters enclosed in quotes like \`"Hello"\`.
- **Boolean (\`bool\`):** Logic flags that are either \`True\` or \`False\`.

\`\`\`python
# Python Examples
user_age = 20        # int
account_gpa = 3.8    # float
user_name = "Hamza"  # str
is_logged_in = True  # bool
\`\`\`

*Quick check: What data type would you use to store a student's final grade percentage?*`;
  }

  // Handle Stack
  if (concept === 'Stack') {
    if (intent === 'CODE_REQUEST') {
      return `\`\`\`python
# Python Stack Implementation using List
class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)
        
    def pop(self):
        return self.items.pop() if not self.is_empty() else None
        
    def peek(self):
        return self.items[-1] if not self.is_empty() else None
        
    def is_empty(self):
        return len(self.items) == 0

# Usage
s = Stack()
s.push("Page 1")
s.push("Page 2")
print(s.pop()) # Outputs: "Page 2" (LIFO)
\`\`\``;
    }

    return `### 📚 What is a Stack?

A **Stack** is a linear data structure that follows the **LIFO (Last In, First Out)** principle. The last item added to the stack is always the first one to be removed.

**Core Operations:**
- **Push:** Add an element to the top — $\\mathcal{O}(1)$
- **Pop:** Remove the top element — $\\mathcal{O}(1)$
- **Peek / Top:** View the top element without removing it — $\\mathcal{O}(1)$

**Real-world Analogy:** Browser back-button history or a stack of cafeteria dinner plates!`;
  }

  // Handle Queue
  if (concept === 'Queue') {
    if (intent === 'CODE_REQUEST') {
      return `\`\`\`python
from collections import deque

# Python Queue Implementation using deque
queue = deque()
queue.append("Customer 1")  # Enqueue
queue.append("Customer 2")  # Enqueue

first_in_line = queue.popleft() # Dequeue -> "Customer 1" (FIFO)
print(first_in_line)
\`\`\``;
    }

    return `### 🚶 What is a Queue?

A **Queue** is a linear data structure that follows the **FIFO (First In, First Out)** principle. The first item added is the first one removed.

**Core Operations:**
- **Enqueue:** Add an element to the rear — $\\mathcal{O}(1)$
- **Dequeue:** Remove an element from the front — $\\mathcal{O}(1)$

**Real-world Analogy:** A line of customers at a movie theater ticket counter!`;
  }

  // Handle Arrays
  if (concept === 'Arrays') {
    return `### 🔢 What is an Array?

An **Array** is a linear data structure that stores elements of the same data type in **contiguous (sequential) memory locations**.

**Key Characteristics:**
- **Fast Lookup:** Direct index access (\`arr[0]\`, \`arr[3]\`) takes $\\mathcal{O}(1)$ time.
- **Fixed / Dynamic Sizing:** Indexes start at \`0\`.
- **Search:** Unsorted linear search takes $\\mathcal{O}(n)$ time.`;
  }

  // Handle Linked List
  if (concept === 'Linked List') {
    if (intent === 'CODE_REQUEST') {
      return `\`\`\`python
# Simple Singly Linked List Node in Python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

# Creating nodes
head = Node(10)
head.next = Node(20)
head.next.next = Node(30)

# Traversal
current = head
while current:
    print(current.data, end=" -> ")
    current = current.next
print("None")
\`\`\``;
    }

    return `### 🔗 What is a Linked List?

A **Linked List** is a linear data structure where elements (called **Nodes**) are NOT stored in contiguous memory. Each node contains a **Data field** and a **Next pointer** referencing the next node in memory.

**Key Advantages:**
- Dynamic memory allocation (no fixed initial size needed).
- Head insertion and deletion take constant $\\mathcal{O}(1)$ time.`;
  }

  // Clean Default Response (NO RIGID METADATA TEMPLATE!)
  return `### 📖 Explaining ${concept || userGoal} (${level} level)

When learning **${concept || userGoal}**, the focus is on understanding core mechanics, practical implementation, and real-world usage.

**Key Steps:**
1. **Core Concept:** Break the idea down into small, digestible parts.
2. **Implementation:** Practice with simple, clean code snippets.
3. **Efficiency:** Consider time $\\mathcal{O}(n)$ and space complexity.

*What specific code example or question would you like to explore regarding ${concept || userGoal}?*`;
};

// POST /api/mentor/chat — Intelligent Conversational Engine
router.post('/chat', async (req, res) => {
  try {
    const { message, persona, topic } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ message: 'Message required' });

    const isJwtOnly = req.user._jwtOnly === true;
    const cleanMsg = message.trim();
    const normalizedMsg = normalizeInput(cleanMsg);
    const userGoal = req.user.goal || 'DATA STRUCTURES';
    const userName = req.user.name || 'Developer';
    const userLevel = req.user.level || 'Beginner';
    const currentDay = req.user.currentRoadmapDay || 1;

    // 1. Fast-path for casual greetings
    const greetingCheck = isCasualGreeting(normalizedMsg);
    if (greetingCheck) {
      const greetingReply = `Hey ${userName}! 👋 I'm your GuideX Personal AI Mentor.\n\nYou're currently working on **${userGoal}** (${userLevel} level, Day ${currentDay}).\n\nWhat concept, question, or problem would you like to explore today?`;
      if (!isJwtOnly) {
        try {
          await ChatMessage.create({ userId: req.user._id, role: 'user', content: cleanMsg });
          await ChatMessage.create({ userId: req.user._id, role: 'ai', content: greetingReply });
        } catch { /* skip */ }
      }
      return res.json({ reply: greetingReply, responseType: 'conversation', topic: userGoal, persona: persona || 'socratic' });
    }

    // Save user message
    if (!isJwtOnly) {
      try { await ChatMessage.create({ userId: req.user._id, role: 'user', content: cleanMsg }); } catch { /* skip */ }
    }

    // 2. Fetch Chat History for Topic Resolution & Memory Context
    let chatHistory = [];
    let previousTopicInChat = null;

    if (!isJwtOnly) {
      try {
        const history = await ChatMessage.find({ userId: req.user._id })
          .sort({ createdAt: -1 }).limit(10).lean();
        history.reverse();

        for (let i = history.length - 1; i >= 0; i--) {
          const pastMsg = history[i].content.toLowerCase();
          const pastConcept = extractConceptFromText(pastMsg);
          if (pastConcept) {
            previousTopicInChat = pastConcept;
            break;
          }
        }

        chatHistory = history.slice(0, -1).map(m => ({
          role: m.role === 'ai' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));
      } catch { /* skip */ }
    }

    // 3. Resolve Intent and Primary Educational Topic
    const explicitConceptInMessage = extractConceptFromText(cleanMsg) || extractConceptFromText(normalizedMsg);
    const classifiedIntent = classifyIntent(normalizedMsg, greetingCheck);

    // Topic Resolution Priority:
    // 1. Explicit concept in user message ("explain stack", "explain data types", "what is an array")
    // 2. Previous concept in conversation history for short messages ("example", "code")
    // 3. Current active roadmap topic
    const activeRoadmapTopic = (topic || userGoal).replace(/^Practice:\s*/i, '').replace(/^Day\s*\d+:?\s*/i, '').replace(/^DATA STRUCTURES - SEC_\d+:?\s*/i, '').trim();
    const resolvedTopic = explicitConceptInMessage || previousTopicInChat || (activeRoadmapTopic.length > 0 ? activeRoadmapTopic : userGoal);

    // 4. Build Persona Guidance
    const selectedPersona = persona || 'socratic';
    let personaGuidance = '';
    if (selectedPersona === 'architect') {
      personaGuidance = 'ROLE: Tech Architect. Focus on system boundaries, memory efficiency, scalability trade-offs, and Big-O complexity.';
    } else if (selectedPersona === 'critic') {
      personaGuidance = 'ROLE: Code Critic. Focus on code correctness, edge cases, null pointers, and boundary bugs.';
    } else if (selectedPersona === 'strategist') {
      personaGuidance = 'ROLE: Interview Coach. Prepare the user for technical interview rounds. Provide structured evaluation criteria.';
    } else {
      personaGuidance = 'ROLE: Socratic Guide. Guide thinking with step-by-step reasoning. Provide direct explanations clearly.';
    }

    // 5. System Instruction for AI Provider
    const systemInstruction = `You are GuideX AI Mentor, a personal learning companion.
USER CONTEXT:
- Name: ${userName}
- Target Goal: ${userGoal}
- Level: ${userLevel}
- Current Day: Day ${currentDay}
${personaGuidance}

CRITICAL RULES:
1. THE USER'S LATEST QUESTION IS: "${cleanMsg}"
2. THE EDUCATIONAL TOPIC TO EXPLAIN IS: "${resolvedTopic}"
3. DIRECTLY ANSWER THE USER'S QUESTION ABOUT "${resolvedTopic}".
4. DO NOT output rigid template strings like "Regarding your question... The primary focus for DATA STRUCTURES - SEC_8 is...".
5. Use beginner-friendly tone for Basic / Beginner level (simple analogies, clear code examples, short definitions).
6. Format response cleanly in GitHub Markdown.`;

    // 6. Try Gemini AI Provider with model fallback list
    let aiText = '';
    const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-pro'];

    if (process.env.GEMINI_API_KEY) {
      for (const modelName of modelsToTry) {
        try {
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
          const chat = model.startChat({ history: chatHistory });
          const result = await chat.sendMessage(cleanMsg);
          aiText = result.response.text();
          if (aiText && !aiText.includes('The primary focus for DATA STRUCTURES - SEC_8')) break;
        } catch { /* try next model */ }
      }
    }

    // 7. Intent-Aware Fallback Engine (Runs if AI API key unavailable or returned template error)
    if (!aiText || aiText.includes('The primary focus for DATA STRUCTURES - SEC_8')) {
      console.warn(`⚠️ AI Mentor Fallback Engine activated for concept: "${resolvedTopic}", intent: "${classifiedIntent}"`);

      if (classifiedIntent === 'QUIZ') {
        aiText = `### 📝 Practice Quiz on ${resolvedTopic}\n\n**Question 1/3:** Which statement best describes **${resolvedTopic}**?\n\n- **A:** Stores data linearly following LIFO order\n- **B:** Stores data in memory with direct indexing\n- **C:** Defines how values and memory layout are handled\n\n*Reply with your answer (A, B, or C)!*`;
      } else if (classifiedIntent === 'INTERVIEW_PREP' || normalizedMsg.includes('interviewer') || normalizedMsg.includes('faang')) {
        aiText = `### 🎯 FAANG Interview Evaluation for ${resolvedTopic}\n\nWhen evaluating candidates on **${resolvedTopic}**, senior tech interviewers grade on:\n\n1. **Data Structure Selection & Trade-offs (35%):** Explaining time vs space complexity.\n2. **Algorithmic Correctness & Edge Cases (35%):** Handling boundary conditions.\n3. **Code Quality & Communication (30%):** Writing clean, modular code.\n\n*Would you like to run a mock interview question on ${resolvedTopic}?*`;
      } else {
        aiText = generateConceptAnswer({
          concept: resolvedTopic,
          intent: classifiedIntent,
          persona: selectedPersona,
          level: userLevel,
          userName,
          userGoal,
          currentDay
        });
      }
    }

    // Save AI response
    if (!isJwtOnly) {
      try { await ChatMessage.create({ userId: req.user._id, role: 'ai', content: aiText }); } catch { /* skip */ }
    }

    return res.json({ reply: aiText, responseType: 'ai_response', topic: resolvedTopic, persona: selectedPersona });
  } catch (err) {
    res.status(500).json({ message: 'Error processing chat message.' });
  }
});

export default router;
