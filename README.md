# EcoTrack AI - Production-Grade Full-Stack Sustainability Platform

EcoTrack AI is a gamified carbon footprint calculator, habits logger, and personalized behavior-change companion. It helps users measure their current ecological impact, sync progress across devices, receive dynamic AI reduction strategies from Google Gemini, and build lasting eco-friendly streaks.

---

## 🏛️ PromptWars Submission Details

### 1. Problem Statement
* **The Challenge**: While many people want to live sustainably, they struggle to understand how their specific daily choices (like commute types, diet, and tech upgrades) translate to carbon emissions.
* **The Gap**: Existing carbon calculators are static; they output numbers but fail to provide personalized guidance, actionable steps, long-term engagement, or behavioral habit-formation mechanisms.
* **The Solution**: EcoTrack AI bridges this gap. It pairs a real-time carbon calculator with AI-powered personalized insights, gamified daily habits logs, monthly footprint audits, XP progression systems, active streaks, and unlocks achievements/badges to drive long-term user engagement and behavior change.

### 2. Chosen Vertical
* **Vertical**: **Sustainability & Climate Action**
* **Target Objective**: Build an AI-driven personal sustainability advisor that drives habit formation through context-aware recommendations, robust sync architectures, and gamified progress tracking.

### 3. Approach and Logic
* **Hybrid Architecture**: Combines instant client-side estimations (using standardized CO2 emission factors) with server-side AI evaluation (Gemini 2.5) for qualitative, lifestyle-specific carbon reduction checklists.
* **Resilient Offline Fallback**: State is managed in a dual-sync wrapper. When authenticated, it syncs instantly to **Cloud Firestore**. When offline or unauthenticated, it seamlessly degrades to local memory caching (`localStorage`).
* **Secure API Gateway**: Rather than calling Gemini from the frontend (which exposes keys), the client contacts a secure server-side API Route (`/api/insights`) that keeps the `GEMINI_API_KEY` hidden.
* **Strict Schema Enforcement**: The API route forces Gemini to return a validated JSON schema. The client validates the output structure (fields, arrays, and types) to prevent crashes on malformed AI outputs.

### 4. How the Solution Works
1. **Gateway Check**: Users landing on the dashboard must authenticate via **Google SSO** or **Email/Password** credentials (managed via Firebase Auth).
2. **Parameter Calculation**: The user sets sliders representing their weekly travel, diet type, home energy consumption, waste practices, and shopping habits. 
   - A real-time calculator computes metric tons of $CO_2e$/year and outputs an overall **Eco Score** (10–100).
3. **AI Recommendations**: When clicking the "AI Eco Insights" tab, the client sends the user's specific lifestyle parameters to `/api/insights`.
   - **Gemini** analyzes the inputs, explains the highest emission culprit, generates target-specific goals with calculated offsets, constructs a 7-day action checklist, and rates its own reasoning confidence.
4. **Interactive Tracking**:
   - **Habits Tracker**: Toggling daily tasks (e.g., *Commuting by bike*) updates XP progress and updates the user's active streak.
   - **Progress Graphs**: Clicking **Log Footprint Audit** commits the current month's audit to a historical list. An SVG chart plots the trend and calculates month-over-month improvements.

### 5. Assumptions Made
* **Baseline Carbon Factors**: Employs global averages (e.g., Grid intensity: 0.38 kg/kWh; Gasoline travel: 0.18 kg/km; Average meat diet: 2.5 Tons/yr).
* **Rate Limits**: Assumes the API key uses the free-tier quota (20 RPD for GCP keys or 1500 RPD for AI Studio developer keys) and gracefully displays a clear "AI insights are temporarily unavailable" message if exceeded.
* **Session Persistence**: Assumes standard browser cookies/IndexedDB support to manage session persistency via Firebase.

---

## 🛠️ Platform & Infrastructure

* **Next.js**: Framework used for server-side API routes (`/api/insights`) and client-side page rendering.
* **TypeScript**: Type-safe language used across the codebase to ensure interface contract safety (`CalculatorData`, `Habit`, `Challenge`).
* **Firebase Authentication**: Provides secure, persistency-managed Email/Password login and Google Single Sign-On (SSO).
* **Cloud Firestore**: Real-time NoSQL database used to sync profiles, calculator inputs, habit completions, streaking logs, and audit logs.
* **GitHub**: Source code hosting provider managing version control and maintaining branch tracking via the `main` branch.

---

## 🤖 AI Tools Used

* **Google Gemini API (`gemini-2.5-flash`)**: Used server-side to generate context-aware sustainability recommendations, weekly actionable carbon plans, emission culprit analysis, and confidence assessments.
* **Antigravity**: Agentic coding AI assistant used for codebase upgrades, database architecture design, type troubleshooting, and accessibility enhancements.

---

## ⚙️ Setup & Installation

### 1. Prerequisites
Ensure you have **Node.js** installed.

### 2. Configure Environment Variables
> [!IMPORTANT]  
> The `.env.local` file containing API keys is ignored by `.gitignore` and **is NOT included in this repository**. You must create your own `.env.local` file in the root directory. No real credentials or API keys are stored in version control. All values below are placeholders/examples.

Create a `.env.local` file in the root directory and supply your own keys:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_placeholder
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

GEMINI_API_KEY=your_gemini_api_key_placeholder
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Build for Production
```bash
npm run build
```
