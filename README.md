🚀 Prepify AI – AI-Powered Job Preparation Platform

Prepify AI is a full-stack AI-powered career preparation platform built to simulate real-world interview and hiring workflows using Generative AI, semantic search, and Retrieval-Augmented Generation (RAG).

The platform helps users analyze resumes, identify skill gaps, generate personalized interview questions, and receive AI-driven career guidance for both technical and non-technical roles.

🌟 Overview

Prepify AI provides an intelligent job preparation ecosystem where users can:

📄 Upload and analyze resumes
🎯 Match resumes with job descriptions
📊 Detect skill gaps and missing technologies
🤖 Generate AI-powered interview questions
🧠 Receive role-specific interview preparation
📈 Get AI evaluation and performance feedback
🛣 Generate personalized learning roadmaps
📥 Generate and download ATS-optimized resumes as PDF
🔥 Key Features
🔐 Secure Authentication
JWT-based authentication
Secure cookie handling
Token blacklisting for logout security
🤖 AI-Powered Features
AI-generated technical, behavioral, and situational interview questions
Resume-based skill extraction and analysis
AI-powered skill gap detection
Personalized career roadmap generation
Role-aware interview preparation
Adaptive interview difficulty generation
Semantic search with Retrieval-Augmented Generation (RAG)
🧠 AI Engineering Features
Transformer-based embeddings using all-MiniLM-L6-v2
In-memory vector database
Cosine similarity semantic retrieval
Context-aware AI response generation
Retrieval-Augmented Generation (RAG) pipeline
Resume intelligence and role detection
📄 Resume Processing
Resume parsing & analysis
ATS optimization suggestions
Resume score generation
Dynamic PDF generation using Puppeteer
📊 Smart Insights
Match score calculation
Skill gap visualization
Strength & weakness analysis
AI-based improvement suggestions
Personalized interview roadmap generation
🛠 Tech Stack
💻 Frontend
React.js
Tailwind CSS
Axios
⚙️ Backend
Node.js
Express.js
🗄 Database
MongoDB
🔐 Authentication
JWT Authentication
Secure Cookies
Token Blacklisting
🤖 AI Stack
Groq API (LLaMA 3)
Transformer Embeddings
Semantic Search
Retrieval-Augmented Generation (RAG)
📄 PDF Generation
Puppeteer
⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/Manan03-o-o/-Job-Preparation-Web-Application.git

cd -Job-Preparation-Web-Application
2️⃣ Install Dependencies
Backend
cd Backend
npm install
Frontend
cd ../Frontend
npm install
3️⃣ Environment Variables

Create a .env file inside Backend:

PORT=3000

GROQ_API_KEY=your_groq_api_key

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:5173
4️⃣ Run the Application
Start Backend
cd Backend
npm run dev
Start Frontend
cd Frontend
npm run dev
🧠 AI Workflow
User Query / Resume
        ↓
Transformer Embedding Generation
        ↓
Semantic Vector Search
        ↓
Relevant Context Retrieval
        ↓
RAG Prompt Construction
        ↓
Groq LLM Response Generation
        ↓
AI Interview Feedback & Insights
🚀 Future Improvements
🎤 Voice-based AI interview simulation
🧍 Webcam-based confidence analysis
📈 Real-time interview performance analytics
🌐 Cloud vector database integration
📊 Advanced recruiter dashboard
🧠 Fine-tuned domain-specific AI models
📱 Mobile application support
🧠 What This Project Demonstrates
Full-stack MERN development
AI engineering workflows
Retrieval-Augmented Generation (RAG)
Transformer embeddings & semantic search
Resume intelligence systems
Secure authentication architecture
Backend API design & modular architecture
Real-world AI system integration
PDF generation & document processing
