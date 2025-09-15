<em>MindShift 🧠✨</em>


<p align="center">
<em>An AI-Powered CBT Companion for Real-Time Thought Reframing</em>
</p>

💡 The Vision: An Active Partner, Not a Passive Library
Traditional wellness apps are static. They give you articles to read when you're feeling down. MindShift is an active tool. It's a secure, AI-driven companion that engages you in a structured, empathetic conversation the moment you need it, helping you analyze and reframe negative thoughts.

🎯 Core Features & Implementation
🔐 Secure User Authentication & Sessions

Full user registration and login system built with Firebase Authentication.

Ensures all user data and conversations are private and session persistence is handled securely.

🧠 Dynamic & Empathetic AI Dialogue

The core chat experience is powered by the Google Gemini API.

The AI's persona and therapeutic flow are meticulously controlled by an engineered system prompt, ensuring safe and effective interactions.

💾 Real-Time & Persistent Data

Conversations are saved in real-time to a Firestore (NoSQL) database.

The application is architected to be real-time by default, loading and updating chat history instantly.

⚛️ Reactive & Modern Frontend

A responsive and beautiful UI built with React.js and styled with Tailwind CSS.

Application state is managed efficiently with React Hooks for a smooth, intuitive user experience.

🛠️ Tech Stack & Architecture
Built on a modern, scalable, and secure serverless architecture.

Category

Technology

Frontend

React.js (Vite), Tailwind CSS

Backend

Google Firebase (Serverless)

Database

Firestore (NoSQL, Real-time)

Auth

Firebase Authentication

AI / APIs

Google Gemini API

Language

JavaScript (ES6+)

🚀 Getting Started
To get a local copy up and running, follow these steps.

Clone & Install:

git clone [https://github.com/your-username/mindshift-app.git](https://github.com/your-username/mindshift-app.git)
cd mindshift-app
npm install

Setup Environment:

Create a .env file in the project root.

Add your Firebase and Gemini API keys:

VITE_FIREBASE_CONFIG=[Your Firebase Config Object]
VITE_GEMINI_API_KEY=[Your Gemini API Key]

Run the App:

npm run dev

🗺️ Project Roadmap
This is the foundational version of a larger vision. Future development includes:

[ ] Dashboard & Insights: Visualize common thought patterns and track progress.

[ ] Full Conversation History: Fully implemented sidebar to browse past sessions.

[ ] Mood Tracking: Log daily moods to find correlations with thoughts.

[ ] Native Mobile App: Develop a native iOS/Android experience.
