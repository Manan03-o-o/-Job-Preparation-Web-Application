/**
 * ─────────────────────────────────────────────────────────────
 * RAG PIPELINE — Retrieval-Augmented Generation Engine
 * ─────────────────────────────────────────────────────────────
 * 1. Takes user query
 * 2. Retrieves relevant chunks via semantic search
 * 3. Injects retrieved context into Groq LLM prompt
 * 4. Returns intelligent, context-aware AI responses
 * ─────────────────────────────────────────────────────────────
 */

const Groq = require("groq-sdk");
const { semanticSearch, searchByTopic, isReady } = require("./vectorStore");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─────────────────────────────────────────────────────────────
// GROQ HELPER — Reusable LLM call
// ─────────────────────────────────────────────────────────────

/**
 * Call Groq API with system + user messages.
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {number} [maxTokens=4096]
 * @param {number} [temperature=0.7]
 * @returns {Promise<string>}
 */
async function callGroqWithContext(systemPrompt, userPrompt, maxTokens = 4096, temperature = 0.7) {
    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        temperature,
        max_tokens: maxTokens
    });
    return response.choices[0]?.message?.content || "";
}

// ─────────────────────────────────────────────────────────────
// 1. RAG ASK — Answer questions using retrieved context
// ─────────────────────────────────────────────────────────────

/**
 * Answer an interview question using RAG.
 * Retrieves relevant knowledge chunks, then generates an answer.
 * @param {string} question - The user's question
 * @param {string} [topic] - Optional topic filter
 * @returns {Promise<object>}
 */
async function ragAsk(question, topic = null) {
    if (!question || question.trim().length === 0) {
        throw new Error("Question is required");
    }

    // Step 1: Retrieve relevant chunks
    let retrievedChunks = [];
    if (topic) {
        retrievedChunks = await searchByTopic(question, topic, 5);
    } else {
        retrievedChunks = await semanticSearch(question, 5, 0.25);
    }

    const contextText = retrievedChunks.length > 0
        ? retrievedChunks.map((c, i) => `[Source ${i + 1} — Relevance: ${(c.score * 100).toFixed(1)}%]\n${c.text}`).join("\n\n")
        : "No specific context found in knowledge base. Use your general knowledge.";

    // Step 2: Build RAG-enhanced prompt
    const systemPrompt = `You are an expert technical interview coach and mentor.
You have access to a curated knowledge base of interview questions and answers.
Use the RETRIEVED CONTEXT below to provide accurate, detailed, and well-structured answers.
If the context is relevant, base your answer primarily on it and expand with your expertise.
If the context is not directly relevant, use your general knowledge but mention that.
Always provide practical examples and interview tips.
Format your response in clear sections with markdown.`;

    const userPrompt = `RETRIEVED CONTEXT FROM KNOWLEDGE BASE:
${contextText}

USER QUESTION:
${question}

Provide a comprehensive, interview-ready answer. Include:
1. A clear, concise explanation
2. A practical example or code snippet if applicable
3. Common follow-up questions the interviewer might ask
4. Tips for answering this in an actual interview`;

    // Step 3: Generate response
    const answer = await callGroqWithContext(systemPrompt, userPrompt);

    return {
        question,
        answer,
        sourcesUsed: retrievedChunks.length,
        sources: retrievedChunks.map(c => ({
            topic: c.topic,
            relevanceScore: parseFloat((c.score * 100).toFixed(1)),
            preview: c.text.substring(0, 150) + "..."
        })),
        ragEnabled: isReady(),
        model: "llama-3.3-70b-versatile"
    };
}

// ─────────────────────────────────────────────────────────────
// 2. RAG EVALUATE — Score user answers with AI
// ─────────────────────────────────────────────────────────────

/**
 * Evaluate a user's answer to an interview question.
 * Uses RAG context to compare against ideal answers.
 * @param {string} question
 * @param {string} userAnswer
 * @returns {Promise<object>}
 */
async function ragEvaluate(question, userAnswer) {
    if (!question || !userAnswer) {
        throw new Error("Both question and userAnswer are required");
    }

    // Retrieve ideal answer context
    const retrievedChunks = await semanticSearch(question, 3, 0.25);
    const contextText = retrievedChunks.length > 0
        ? retrievedChunks.map(c => c.text).join("\n\n")
        : "No reference answer found. Evaluate based on general knowledge.";

    const systemPrompt = `You are a senior technical interviewer evaluating a candidate's answer.
You have reference answers from a knowledge base to compare against.
Return ONLY valid JSON — no markdown fences, no extra text.`;

    const userPrompt = `REFERENCE ANSWERS FROM KNOWLEDGE BASE:
${contextText}

INTERVIEW QUESTION:
${question}

CANDIDATE'S ANSWER:
${userAnswer}

Evaluate the candidate's answer and return this exact JSON structure:
{
  "overallScore": <0-100>,
  "technicalAccuracy": {
    "score": <0-100>,
    "feedback": "Specific feedback on correctness and depth"
  },
  "communication": {
    "score": <0-100>,
    "feedback": "Feedback on clarity and structure of explanation"
  },
  "confidence": {
    "score": <0-100>,
    "feedback": "Assessment of how confidently the answer was conveyed"
  },
  "clarity": {
    "score": <0-100>,
    "feedback": "Feedback on how easy to understand the answer was"
  },
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "idealAnswer": "A concise ideal answer for comparison",
  "followUpQuestions": ["follow-up question the interviewer might ask"]
}`;

    const raw = await callGroqWithContext(systemPrompt, userPrompt, 2048, 0.5);

    // Parse JSON from response
    let evaluation;
    try {
        evaluation = JSON.parse(raw);
    } catch (_) {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try { evaluation = JSON.parse(jsonMatch[0]); } catch (_e) { /* fallthrough */ }
        }
    }

    if (!evaluation) {
        evaluation = {
            overallScore: 50,
            technicalAccuracy: { score: 50, feedback: "Could not parse AI evaluation. Please try again." },
            communication: { score: 50, feedback: "Evaluation unavailable." },
            confidence: { score: 50, feedback: "Evaluation unavailable." },
            clarity: { score: 50, feedback: "Evaluation unavailable." },
            strengths: ["Answer was provided"],
            improvements: ["Try again for detailed evaluation"],
            idealAnswer: "Please retry for ideal answer.",
            followUpQuestions: []
        };
    }

    return {
        question,
        userAnswer,
        evaluation,
        sourcesUsed: retrievedChunks.length,
        model: "llama-3.3-70b-versatile"
    };
}

// ─────────────────────────────────────────────────────────────
// 3. RAG RESUME ANALYSIS — Analyze resume with AI
// ─────────────────────────────────────────────────────────────

/**
 * Analyze a resume: extract skills, generate personalized questions,
 * and provide improvement suggestions.
 * @param {string} resumeText - Extracted text from PDF
 * @returns {Promise<object>}
 */
async function ragResumeAnalysis(resumeText) {
    if (!resumeText || resumeText.trim().length < 20) {
        throw new Error("Resume text is too short or empty");
    }

    // Retrieve relevant interview context based on resume content
    const retrievedChunks = await semanticSearch(resumeText.substring(0, 500), 5, 0.2);
    const contextText = retrievedChunks.length > 0
        ? retrievedChunks.map(c => c.text).join("\n\n")
        : "";

    const systemPrompt = `You are an expert career coach and technical interviewer.
Analyze the candidate's resume and provide comprehensive feedback.
Use the knowledge base context to generate relevant interview questions.
Return ONLY valid JSON — no markdown fences, no extra text.`;

    const userPrompt = `KNOWLEDGE BASE CONTEXT:
${contextText}

CANDIDATE RESUME:
${resumeText.substring(0, 3000)}

Analyze this resume and return this exact JSON structure:
{
  "extractedSkills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "tools": ["tool1", "tool2"]
  },
  "experienceLevel": "junior|mid|senior",
  "profileSummary": "2-3 sentence summary of the candidate's profile",
  "personalizedQuestions": [
    {
      "question": "Personalized interview question based on their resume",
      "category": "technical|behavioral|situational",
      "difficulty": "easy|medium|hard",
      "whyAsked": "Why an interviewer would ask this based on their resume"
    }
  ],
  "improvements": [
    {
      "area": "Area needing improvement",
      "suggestion": "Specific actionable suggestion",
      "priority": "high|medium|low"
    }
  ],
  "resumeScore": <0-100>,
  "missingSkills": ["skill that would strengthen the resume"],
  "atsOptimization": ["tip to improve ATS compatibility"]
}

Generate at least 8 personalized questions and 5 improvement suggestions.`;

    const raw = await callGroqWithContext(systemPrompt, userPrompt, 4096, 0.6);

    let analysis;
    try {
        analysis = JSON.parse(raw);
    } catch (_) {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try { analysis = JSON.parse(jsonMatch[0]); } catch (_e) { /* fallthrough */ }
        }
    }

    if (!analysis) {
        analysis = {
            extractedSkills: { technical: [], soft: [], tools: [] },
            experienceLevel: "mid",
            profileSummary: "Could not analyze resume. Please try again.",
            personalizedQuestions: [],
            improvements: [],
            resumeScore: 50,
            missingSkills: [],
            atsOptimization: []
        };
    }

    return {
        analysis,
        sourcesUsed: retrievedChunks.length,
        ragEnabled: isReady(),
        model: "llama-3.3-70b-versatile"
    };
}

module.exports = {
    ragAsk,
    ragEvaluate,
    ragResumeAnalysis,
    callGroqWithContext
};
