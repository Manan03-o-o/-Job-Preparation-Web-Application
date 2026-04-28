const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// ─────────────────────────────────────────────
// 1. DOMAIN DETECTION
// ─────────────────────────────────────────────

const DOMAIN_RULES = [
    { domain: "FRONTEND",  keywords: ["react", "frontend", "front-end", "vue", "angular", "css", "ui", "ux", "tailwind", "next.js", "typescript"] },
    { domain: "BACKEND",   keywords: ["node", "backend", "back-end", "express", "api", "rest", "graphql", "microservices", "java", "spring", "django"] },
    { domain: "DATA",      keywords: ["data", "ml", "machine learning", "python", "pandas", "numpy", "sql", "analytics", "statistics", "deep learning", "tensorflow", "llm", "ai engineer"] },
    { domain: "MBA",       keywords: ["marketing", "sales", "business", "mba", "strategy", "management", "finance", "consulting", "operations", "product manager", "growth", "brand"] },
    { domain: "DEVOPS",    keywords: ["devops", "docker", "kubernetes", "ci/cd", "aws", "gcp", "azure", "terraform", "jenkins", "cloud", "infrastructure"] },
    { domain: "FULLSTACK", keywords: ["full stack", "fullstack", "mern", "mean", "full-stack"] },
];

function detectDomain(jobDescription) {
    const lower = jobDescription.toLowerCase();
    for (const rule of DOMAIN_RULES) {
        if (rule.keywords.some(k => lower.includes(k))) {
            return rule.domain;
        }
    }
    return "GENERAL";
}


// ─────────────────────────────────────────────
// 2. ROLE-SPECIFIC PROMPT INSTRUCTIONS
// ─────────────────────────────────────────────

const DOMAIN_INSTRUCTIONS = {
    FRONTEND: {
        label: "Frontend / UI Engineer",
        technical: `
- React component lifecycle, hooks (useEffect, useMemo, useCallback), and performance optimization
- Browser rendering pipeline, repaints vs reflows, Core Web Vitals
- State management (Redux, Zustand, Context API) trade-offs
- CSS layout systems (Flexbox, Grid), responsive design, accessibility (WCAG)
- JavaScript concepts: event delegation, closures, prototypal inheritance, async/await
- Code-splitting, lazy loading, bundle optimization (Webpack/Vite)
- Cross-browser compatibility and progressive enhancement
- Testing: Jest, React Testing Library, Cypress`,
        behavioral: `
- Collaborating with designers to implement pixel-perfect UI
- Handling conflicting priorities between design, performance, and deadlines
- Improving user experience on a slow or broken page
- Leading frontend architecture decisions in a team`,
        avoid: "Avoid generic backend/database questions. Focus on browser, UI, and JavaScript."
    },

    BACKEND: {
        label: "Backend / Server-Side Engineer",
        technical: `
- REST API design principles, versioning, rate limiting, pagination
- Database design: indexing strategies, query optimization, transactions (SQL and NoSQL)
- Authentication patterns: JWT, OAuth2, session management, refresh tokens
- Caching strategies: Redis, CDN, cache invalidation
- System design: load balancing, horizontal scaling, message queues (RabbitMQ, Kafka)
- Node.js event loop internals, worker threads, clustering
- Error handling patterns, graceful shutdown, circuit breakers
- Security: SQL injection, XSS, CSRF, OWASP Top 10`,
        behavioral: `
- Debugging a production incident affecting thousands of users
- Designing an API that needs to scale from 100 to 1 million requests/day
- Handling disagreement about architectural decisions with a senior engineer
- Balancing technical debt vs new feature delivery`,
        avoid: "Avoid frontend/UI questions. Focus on server logic, databases, and distributed systems."
    },

    DATA: {
        label: "Data Scientist / ML Engineer",
        technical: `
- Supervised vs unsupervised learning — use cases, algorithms, trade-offs
- Feature engineering, dimensionality reduction (PCA, t-SNE)
- Model evaluation: precision, recall, F1, ROC-AUC, confusion matrix
- Overfitting, underfitting, regularization (L1/L2), cross-validation
- SQL: window functions, CTEs, GROUP BY, JOIN optimization
- Python: pandas, numpy, scikit-learn, data pipeline design
- Deep learning: backpropagation, CNNs, RNNs, transformers
- A/B testing, hypothesis testing, statistical significance`,
        behavioral: `
- Communicating complex model results to non-technical stakeholders
- Handling a model that degraded in production (data drift)
- Deciding between a simple rule-based system vs an ML model
- Working with incomplete or biased training data`,
        avoid: "Avoid generic web development questions. Focus on statistics, ML, and data engineering."
    },

    MBA: {
        label: "Business / Management / MBA Role",
        technical: `
- Market sizing and estimation (case study format)
- Go-to-market strategy for a new product
- Financial concepts: P&L, ROI, CAC, LTV, break-even analysis
- Porter's Five Forces, SWOT, BCG matrix applied to real scenarios
- Product lifecycle management and pricing strategies
- Operations management: process optimization, supply chain trade-offs
- Metrics and KPIs for a specific business function (marketing/sales/ops)
- Stakeholder management and cross-functional alignment`,
        behavioral: `
- Leading a team through ambiguity or organizational change
- Influencing a decision without direct authority
- Prioritizing between competing strategic initiatives
- Managing a client or stakeholder relationship that went wrong`,
        avoid: "Avoid coding or engineering questions. Focus on business strategy, leadership, and case studies."
    },

    DEVOPS: {
        label: "DevOps / Cloud / Infrastructure Engineer",
        technical: `
- Docker: images, containers, multi-stage builds, networking, volumes
- Kubernetes: pods, deployments, services, ingress, HPA, namespaces
- CI/CD pipeline design: build, test, deploy stages, rollback strategies
- Cloud (AWS/GCP/Azure): compute, storage, networking, IAM, cost optimization
- Infrastructure as Code: Terraform, Ansible, CloudFormation
- Monitoring and observability: Prometheus, Grafana, ELK stack, alerting
- Security: secrets management (Vault), least privilege, network policies
- Incident response: runbooks, post-mortems, SLOs/SLAs`,
        behavioral: `
- Responding to a production outage at 3am
- Convincing developers to adopt infrastructure best practices
- Reducing cloud costs under budget pressure
- Designing a disaster recovery plan for a critical service`,
        avoid: "Avoid pure application coding questions. Focus on infrastructure, automation, and reliability."
    },

    FULLSTACK: {
        label: "Full Stack Engineer",
        technical: `
- React component design patterns and state management
- RESTful API design and Node.js/Express backend patterns
- Database design: MongoDB schema design, SQL query optimization
- Authentication: JWT, session handling, OAuth
- End-to-end feature development: from DB schema to UI rendering
- Performance optimization on both client and server sides
- Web security fundamentals (XSS, CSRF, injection)
- Deployment: Docker, CI/CD basics, environment configuration`,
        behavioral: `
- Owning a feature end-to-end from requirements to deployment
- Handling scope creep in a full-stack feature
- Debugging an issue that spans frontend, backend, and database
- Prioritizing between frontend polish and backend reliability`,
        avoid: "Balance frontend and backend questions equally."
    },

    GENERAL: {
        label: "Software Engineer (General)",
        technical: `
- Data structures: arrays, linked lists, trees, graphs, hash maps
- Algorithm complexity (Big O), sorting and searching algorithms
- Object-oriented design principles (SOLID, DRY, KISS)
- Design patterns: Singleton, Observer, Factory, Strategy
- Database basics: normalization, indexing, transactions
- Version control: Git branching strategies, merge vs rebase
- Basic system design: client-server architecture, API design
- Testing: unit tests, integration tests, TDD concepts`,
        behavioral: `
- Working effectively in a team under pressure
- Learning a new technology quickly for a project
- Handling disagreement with a team member or manager
- Managing workload when multiple priorities compete`,
        avoid: "Keep questions appropriate to the seniority level implied in the job description."
    }
};


// ─────────────────────────────────────────────
// 3. FALLBACK DATA
// ─────────────────────────────────────────────

const FALLBACK_REPORT = {
    title: "Software Developer",
    matchScore: 75,
    technicalQuestions: [
        { question: "Explain closures in JavaScript with a real-world example.", intention: "Tests JS fundamentals", answer: "A closure retains access to its outer scope after the outer function returns." },
        { question: "What is the difference between SQL and NoSQL databases?", intention: "Tests database decision-making", answer: "SQL is relational, ACID-compliant. NoSQL is flexible-schema, horizontally scalable." },
        { question: "Explain REST API principles.", intention: "Tests API design knowledge", answer: "REST APIs are stateless, use standard HTTP methods, have resource-based URLs." },
        { question: "How does JWT authentication work end-to-end?", intention: "Tests security knowledge", answer: "Server signs a JWT on login. Client sends it in Authorization header on each request." },
        { question: "What is event-driven architecture and why is it useful?", intention: "Tests system design knowledge", answer: "Components communicate via events enabling loose coupling and async processing." },
        { question: "Explain the concept of middleware in Express.js.", intention: "Tests Node.js knowledge", answer: "Middleware functions execute during request-response cycle, used for auth, logging, parsing." },
        { question: "What is the difference between synchronous and asynchronous programming?", intention: "Tests async understanding", answer: "Sync blocks execution, async allows other code to run while waiting for operations." },
        { question: "How would you optimize a slow database query?", intention: "Tests performance thinking", answer: "Add indexes, avoid SELECT *, use query analysis tools, consider caching." }
    ],
    behavioralQuestions: [
        { question: "Describe a time you had to learn a new technology quickly.", intention: "Assess learning agility", answer: "Use STAR format. Emphasize identifying core concepts first." },
        { question: "Tell me about a project where something went wrong.", intention: "Assess accountability", answer: "Focus on ownership, debugging, and lessons learned." },
        { question: "How do you handle disagreement with a teammate?", intention: "Assess collaboration", answer: "Listen, present data, commit to team decision." },
        { question: "Describe your most challenging project.", intention: "Assess problem solving", answer: "Focus on complexity, your role, and the outcome." },
        { question: "How do you prioritize tasks when everything is urgent?", intention: "Assess time management", answer: "Use impact vs effort matrix, communicate with stakeholders." }
    ],
    skillGaps: [
        { skill: "System Design", severity: "high" },
        { skill: "Cloud Services", severity: "medium" },
        { skill: "Testing and TDD", severity: "low" }
    ],
    preparationPlan: [
        { day: 1, focus: "Core Language Fundamentals", tasks: ["Review key concepts", "Solve 3 coding problems"] },
        { day: 2, focus: "System Design Basics", tasks: ["Study client-server architecture", "Design a URL shortener"] },
        { day: 3, focus: "Database Deep Dive", tasks: ["Practice SQL joins", "Review MongoDB aggregations"] },
        { day: 4, focus: "API and Security", tasks: ["Build a small REST API", "Implement JWT auth"] },
        { day: 5, focus: "Behavioral Preparation", tasks: ["Prepare 5 STAR stories", "Practice with a peer"] },
        { day: 6, focus: "Mock Interview", tasks: ["Full 45-minute mock", "Review weak areas"] },
        { day: 7, focus: "Review and Confidence", tasks: ["Revisit top 3 weak areas", "Research the company"] }
    ]
};


// ─────────────────────────────────────────────
// 4. JSON EXTRACTION
// ─────────────────────────────────────────────

function extractJson(raw) {
    if (!raw) return null;

    // Try direct parse first
    try { return JSON.parse(raw); } catch (_) {}

    // Try extracting from code fences
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
        try { return JSON.parse(fenceMatch[1].trim()); } catch (_) {}
    }

    // Try extracting bare JSON object
    const objectMatch = raw.match(/\{[\s\S]*\}/);
    if (objectMatch) {
        try { return JSON.parse(objectMatch[0]); } catch (_) {}
    }

    return null;
}


// ─────────────────────────────────────────────
// 5. VALIDATION
// ─────────────────────────────────────────────

function validateAndFill(parsed) {
    const report = { ...FALLBACK_REPORT, ...parsed };

    if (!Array.isArray(report.technicalQuestions))  report.technicalQuestions  = FALLBACK_REPORT.technicalQuestions;
    if (!Array.isArray(report.behavioralQuestions)) report.behavioralQuestions = FALLBACK_REPORT.behavioralQuestions;
    if (!Array.isArray(report.skillGaps))           report.skillGaps           = FALLBACK_REPORT.skillGaps;
    if (!Array.isArray(report.preparationPlan))     report.preparationPlan     = FALLBACK_REPORT.preparationPlan;

    if (report.technicalQuestions.length < 5) {
        const needed = 5 - report.technicalQuestions.length;
        report.technicalQuestions = [...report.technicalQuestions, ...FALLBACK_REPORT.technicalQuestions.slice(0, needed)];
    }

    if (report.behavioralQuestions.length < 3) {
        const needed = 3 - report.behavioralQuestions.length;
        report.behavioralQuestions = [...report.behavioralQuestions, ...FALLBACK_REPORT.behavioralQuestions.slice(0, needed)];
    }

    if (typeof report.matchScore !== "number" || isNaN(report.matchScore)) report.matchScore = 75;
    if (!report.title || typeof report.title !== "string") report.title = "Software Developer";

    return report;
}


// ─────────────────────────────────────────────
// 6. GROQ API HELPER
// ─────────────────────────────────────────────

async function callGroq(prompt) {
    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                role: "system",
                content: "You are an expert assistant. Always return only raw valid JSON with no markdown, no code fences, and no explanation."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 0.7,
        max_tokens: 4096,
    });

    return response.choices[0]?.message?.content || "";
}


// ─────────────────────────────────────────────
// 7. GENERATE INTERVIEW REPORT
// ─────────────────────────────────────────────

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    try {
        if (!resume || resume.trim().length < 20) {
            console.warn("Resume text too short — using fallback report.");
            return FALLBACK_REPORT;
        }

        const domain = detectDomain(jobDescription);
        const domainConfig = DOMAIN_INSTRUCTIONS[domain];
        console.log(`Detected domain: ${domain} — ${domainConfig.label}`);

        const prompt = `
You are a senior ${domainConfig.label} interviewer at a top-tier company.
Generate a HIGHLY SPECIFIC, ROLE-TAILORED interview preparation report.

DETECTED ROLE DOMAIN: ${domain} — ${domainConfig.label}

CRITICAL RULES:
1. Return ONLY raw JSON — no markdown, no code fences, no explanation
2. ${domainConfig.avoid}
3. Every question must be directly relevant to the job description
4. Questions must be scenario-based and specific, not generic textbook questions
5. Personalize questions using the candidate's resume and self-description

TECHNICAL FOCUS AREAS FOR ${domain}:
${domainConfig.technical}

BEHAVIORAL THEMES FOR ${domain}:
${domainConfig.behavioral}

OUTPUT JSON FORMAT:
{
  "title": "Exact job title from job description",
  "matchScore": <0-100>,
  "technicalQuestions": [
    { "question": "...", "intention": "...", "answer": "..." }
  ],
  "behavioralQuestions": [
    { "question": "...", "intention": "...", "answer": "..." }
  ],
  "skillGaps": [
    { "skill": "...", "severity": "low" | "medium" | "high" }
  ],
  "preparationPlan": [
    { "day": 1, "focus": "...", "tasks": ["...", "..."] }
  ]
}

MINIMUMS: 8 technicalQuestions, 5 behavioralQuestions, 3 skillGaps, 7-day preparationPlan

CANDIDATE RESUME:
${resume.slice(0, 2000)}

CANDIDATE SELF DESCRIPTION:
${selfDescription.slice(0, 500)}

JOB DESCRIPTION:
${jobDescription.slice(0, 1000)}

Return ONLY the JSON object. Nothing before or after it.
`;

        console.log("Calling Groq API for interview report...");
        const raw = await callGroq(prompt);
        console.log("RAW Groq Response (first 600 chars):", raw?.slice(0, 600));

        const parsed = extractJson(raw);

        if (!parsed) {
            console.error("Could not extract valid JSON — using fallback");
            return FALLBACK_REPORT;
        }

        console.log(`Parsed — technicalQuestions: ${parsed.technicalQuestions?.length}, behavioralQuestions: ${parsed.behavioralQuestions?.length}`);

        return validateAndFill(parsed);

    } catch (err) {
        console.error("AI ERROR:", err?.message || err);
        return FALLBACK_REPORT;
    }
}


// ─────────────────────────────────────────────
// 8. FALLBACK HTML BUILDER
// Used when AI doesn't return parseable HTML
// ─────────────────────────────────────────────

function buildFallbackHtml(resume, selfDescription, domain) {
    const domainLabel = DOMAIN_INSTRUCTIONS[domain]?.label || "Software Engineer";

    const escapedResume = (resume || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br/>");

    const escapedSummary = (selfDescription || "Experienced professional seeking new opportunities.")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Professional Resume</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333333;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
        }
        h1 {
            font-size: 26px;
            color: #1a1a2e;
            border-bottom: 3px solid #4a90e2;
            padding-bottom: 8px;
            margin-bottom: 8px;
        }
        h2 {
            font-size: 16px;
            color: #4a90e2;
            margin: 24px 0 8px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 4px;
        }
        .domain-badge {
            display: inline-block;
            background: #4a90e2;
            color: white;
            padding: 3px 12px;
            border-radius: 12px;
            font-size: 11px;
            margin-bottom: 24px;
        }
        .summary-box {
            background: #f8f9fa;
            padding: 14px 16px;
            border-left: 4px solid #4a90e2;
            margin-bottom: 8px;
            font-size: 13px;
            color: #444;
        }
        .resume-content {
            font-size: 13px;
            color: #333;
            white-space: pre-wrap;
            word-break: break-word;
        }
        .footer {
            margin-top: 40px;
            font-size: 11px;
            color: #999;
            text-align: center;
            border-top: 1px solid #eee;
            padding-top: 12px;
        }
    </style>
</head>
<body>
    <h1>Professional Resume</h1>
    <span class="domain-badge">${domainLabel}</span>

    <h2>Professional Summary</h2>
    <div class="summary-box">${escapedSummary}</div>

    <h2>Experience &amp; Skills</h2>
    <div class="resume-content">${escapedResume}</div>

    <div class="footer">Generated by JobPrep AI</div>
</body>
</html>`;
}


// ─────────────────────────────────────────────
// 9. GENERATE RESUME PDF
// ─────────────────────────────────────────────

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    try {
        // ── Input validation ───────────────────────────────────────
        if (!resume || resume.trim().length < 10) {
            throw new Error("Resume content is empty or too short to generate PDF");
        }
        if (!jobDescription || jobDescription.trim().length < 10) {
            throw new Error("Job description is required to generate PDF");
        }

        const domain = detectDomain(jobDescription);
        console.log(`Generating resume PDF for domain: ${domain}`);

        const prompt = `
You are an expert resume writer for ${DOMAIN_INSTRUCTIONS[domain].label} roles.
Create a professional ATS-optimized resume as a complete HTML document.

CRITICAL: Return ONLY this exact JSON structure, nothing else:
{"html": "FULL_HTML_DOCUMENT_HERE"}

HTML Requirements:
- Use inline CSS only (no external stylesheets or Google Fonts links)
- Include these sections: Professional Summary, Work Experience, Skills, Education
- Use clean sans-serif fonts (Arial or Helvetica)
- Professional color scheme (dark headings, subtle accents)
- ATS-friendly: no columns, no tables for layout, no images
- Naturally incorporate keywords from the job description
- Format work experience with company, title, dates, and bullet points

CANDIDATE RESUME:
${resume.slice(0, 1500)}

SELF DESCRIPTION:
${selfDescription ? selfDescription.slice(0, 500) : "Experienced professional"}

JOB DESCRIPTION:
${jobDescription.slice(0, 800)}
`;

        console.log("Calling Groq for resume HTML...");
        const raw = await callGroq(prompt);
        console.log("RAW Groq response (first 400 chars):", raw?.slice(0, 400));

        // ── Try to extract HTML from AI response ──────────────────
        let htmlContent = null;

        // Attempt 1: Parse as JSON and get html field
        const parsed = extractJson(raw);
        if (parsed?.html && typeof parsed.html === "string" && parsed.html.length > 50) {
            htmlContent = parsed.html;
            console.log("✅ Extracted HTML from JSON response");
        }

        // Attempt 2: Raw response is already an HTML document
        if (!htmlContent && raw?.trim().toLowerCase().startsWith("<!doctype")) {
            htmlContent = raw.trim();
            console.log("✅ Using raw HTML document response");
        }

        // Attempt 3: Find <html>...</html> block anywhere in response
        if (!htmlContent) {
            const htmlMatch = raw?.match(/<html[\s\S]*?<\/html>/i);
            if (htmlMatch) {
                htmlContent = htmlMatch[0];
                console.log("✅ Extracted HTML via <html> tag regex");
            }
        }

        // Attempt 4: Find any substantial HTML block
        if (!htmlContent) {
            const divMatch = raw?.match(/<body[\s\S]*?<\/body>/i);
            if (divMatch) {
                htmlContent = `<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;padding:40px;color:#333;}</style></head>${divMatch[0]}</html>`;
                console.log("✅ Extracted HTML via <body> tag regex");
            }
        }

        // Attempt 5: Build fallback HTML from raw resume text
        if (!htmlContent) {
            console.warn("⚠️ AI did not return usable HTML — using built-in fallback template");
            htmlContent = buildFallbackHtml(resume, selfDescription, domain);
        }

        // ── Launch Puppeteer and generate PDF ─────────────────────
        console.log("Launching Puppeteer...");
        let puppeteer;
        try {
            puppeteer = require("puppeteer");
        } catch (e) {
            throw new Error("Puppeteer is not installed. Run: npm install puppeteer");
        }

        const browser = await puppeteer.launch({
            headless: "new",
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--disable-gpu",
                "--window-size=1280,720"
            ]
        });

        let pdfBuffer;
        try {
            const page = await browser.newPage();

            await page.setViewport({ width: 1280, height: 720 });

            await page.setContent(htmlContent, {
                waitUntil: "networkidle0",
                timeout: 30000
            });

            pdfBuffer = await page.pdf({
                format: "A4",
                printBackground: true,
                margin: {
                    top: "20mm",
                    bottom: "20mm",
                    left: "15mm",
                    right: "15mm"
                }
            });

            console.log(`✅ PDF generated successfully — ${pdfBuffer.length} bytes`);
        } finally {
            // Always close browser even if PDF generation fails
            await browser.close();
        }

        return pdfBuffer;

    } catch (err) {
        // Log the REAL full error so you can debug it
        console.error("❌ PDF Generation FAILED");
        console.error("Error name    :", err?.name);
        console.error("Error message :", err?.message);
        console.error("Error stack   :", err?.stack);
        // Rethrow the real error (not a generic wrapper)
        throw err;
    }
}


// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

module.exports = { generateInterviewReport, generateResumePdf };