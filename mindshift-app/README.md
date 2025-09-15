<div align="center">

MindShift 🧠✨
An AI-Powered CBT Companion for Real-Time Thought Reframing
</div>

<br>

Traditional wellness apps are static libraries. MindShift is an active tool. It's a secure, AI-driven companion that engages you in a structured, empathetic conversation the moment you need it, helping you analyze and reframe negative thoughts based on proven Cognitive Behavioral Therapy (CBT) principles.

🎯 Core Features & Technical Implementation
<table>
<tr>
<td width="50%" valign="top">
<h3>🔐 Secure & Serverless Backend</h3>
<ul>
<li>Engineered a robust backend using <b>Google Firebase</b>.</li>
<li>Utilizes <b>Firestore (NoSQL)</b> for real-time, persistent storage of user conversations.</li>
<li>Secured with <b>Firebase Authentication</b> for user registration, login, and session management.</li>
</ul>
</td>
<td width="50%" valign="top">
<h3>🧠 Intelligent & Empathetic AI</h3>
<ul>
<li>Core conversational logic powered by the <b>Google Gemini API</b>.</li>
<li>Developed a meticulous <b>system prompt</b> that guides the AI's persona, tone, and therapeutic flow.</li>
<li>Manages asynchronous API calls and handles data transformation for seamless conversation.</li>
</ul>
</td>
</tr>
</table>

🛠️ Tech Stack & Architecture
Built on a modern, scalable, and secure serverless architecture.

Frontend
React.js Vite Tailwind CSS JavaScript (ES6+)

Backend & Database
Firebase Firestore (NoSQL) Firebase Authentication

AI / APIs
Google Gemini API

🚀 Getting Started & Project Roadmap
<details>
<summary><strong>► Click to expand for Setup Instructions</strong></summary>

<br>

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

</details>

<details>
<summary><strong>► Click to expand for Future Development Plans</strong></summary>

<br>

This is the foundational version of a larger vision. Future development includes:

[ ] Dashboard & Insights: Visualize common thought patterns and track progress.

[ ] Full Conversation History: Fully implemented sidebar to browse past sessions.

[ ] Mood Tracking: Log daily moods to find correlations with thoughts.

[ ] Native Mobile App: Develop a native iOS/Android experience.

</details>
