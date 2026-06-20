# EcoTrack AI - Production-Grade Full-Stack Sustainability Platform

EcoTrack AI is a gamified carbon footprint calculator, habits logger, and personalized behavior-change companion. It helps users measure their current ecological impact, sync progress across devices, receive dynamic AI reduction strategies from Google Gemini, and build lasting eco-friendly streaks.

---

## Key Features

- Carbon Footprint Calculator
- What-If Lifestyle Simulator
- AI-Powered Sustainability Insights
- Daily and Weekly Eco Challenges
- Habit Tracking and Streak System
- XP, Levels, and Achievement Badges
- Firebase Authentication
- Firestore Cloud Sync
- Historical Progress Analytics
- Responsive and Accessible User Interface

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

## Carbon Estimation Methodology

EcoTrack AI uses formula-based carbon footprint estimation rather than placeholder or randomly generated values.

The platform estimates annual CO₂-equivalent emissions across five major lifestyle categories:

* Transportation
* Home Energy
* Dietary Habits
* Shopping & Consumption
* Waste & Lifestyle

Methodology:

Transportation:
Uses distance-based emission factors (kg CO₂e/km) for gasoline, diesel, hybrid, electric, public transit, and active transport.

Home Energy:
Uses monthly electricity consumption, regional grid intensity assumptions, and renewable energy offsets.

Diet:
Uses annual dietary emission baselines for heavy meat, average meat, pescatarian, vegetarian, and vegan lifestyles.

Shopping:
Uses lifecycle-based emission estimates for clothing purchases and consumer technology upgrades.

Waste:
Uses waste generation baselines with recycling and composting reductions.

The calculations are designed to provide realistic consumer-level sustainability estimates and behavior-change guidance rather than certified carbon audits.

### Data Sources & References

The emission factors and assumptions are based on publicly available environmental datasets and research, including:

* US EPA (Environmental Protection Agency)
* EPA eGRID
* DEFRA (UK Department for Environment, Food & Rural Affairs)
* IPCC climate reports
* Oxford University dietary emissions studies
* Carbon Trust lifecycle assessments
* WRAP apparel lifecycle studies

## Eco Score Methodology

EcoTrack AI converts total annual CO₂e estimates into an Eco Score ranging from 10–100.

The score is calibrated against average per-capita emission benchmarks and is intended to provide users with an easy-to-understand sustainability indicator rather than a scientific certification metric.

### 4. How the Solution Works
1. **Gateway Check**: Users landing on the dashboard must authenticate via **Google SSO** or **Email/Password** credentials (managed via Firebase Auth).
2. **Parameter Calculation**: The user sets sliders representing their weekly travel, diet type, home energy consumption, waste practices, and shopping habits. 
   - A real-time, **formula-based local carbon calculator** performs **emission-factor-driven footprint estimation**, computing metric tons of $CO_2e$/year and outputting an overall **Eco Score** (10–100).
3. **AI Recommendations**: When clicking the "AI Eco Insights" tab, the client sends the user's specific lifestyle parameters to `/api/insights`.
   - **Gemini** analyzes the inputs, explains the highest emission culprit, generates target-specific goals with calculated offsets, constructs a 7-day action checklist, and rates its own reasoning confidence. Note that **AI-generated recommendations are layered on top of the calculated footprint rather than replacing the calculation engine**.
4. **Interactive Tracking**:
   - **Habits Tracker**: Toggling daily tasks (e.g., *Commuting by bike*) updates XP progress and updates the user's active streak.
   - **Progress Graphs**: Clicking **Log Footprint Audit** commits the current month's audit to a historical list. An SVG chart plots the trend and calculates month-over-month improvements.
5. **What-If Simulator & Caching Architecture**:
   - **Lifestyle Simulations**: Users can adjust sliders representing transport distance, drive specification, diet patterns, electricity usage, renewable energy share, clothing/tech purchases, and waste methods.
   - **EPA-Compliant Local Calculations**: Employs EPA compliance emission factors to perform **instant client-side recalculation** of the simulated carbon breakdown and Eco Score, avoiding unnecessary backend AI queries.
   - **LocalStorage Scenario Caching**: The simulator checks `localStorage` cache maps using parameter-specific hashes as keys before invoking server-side AI evaluations. If a scenario is analyzed once, subsequent views retrieve the response instantly from `localStorage`.
   - **Firestore Scope Isolation**: In accordance with privacy and storage segregation policies, AI scenario analysis cache entries are stored **only** inside the client browser's `localStorage` and are never written to Firestore. Cloud Firestore continues storing user profiles, daily habits logs, active challenges progress, unlocked badges, and monthly audit history entries only.

## System Architecture

User Input
↓
Carbon Calculation Engine
↓
CO₂ Footprint & Eco Score
↓
Gemini AI Analysis
↓
Personalized Recommendations
↓
Habits, Challenges & Progress Tracking
↓
Firestore Sync / LocalStorage Fallback

EcoTrack AI follows a hybrid architecture. Carbon footprint calculations are performed locally using emission-factor-based estimation models, ensuring instant feedback and minimal latency. Gemini is then used as an intelligence layer that interprets the calculated footprint and generates personalized recommendations, sustainability action plans, and behavior-change guidance. User progress, habits, badges, streaks, and historical audits are synchronized through Firebase services while maintaining offline resilience through localStorage fallbacks.

### 5. Assumptions Made
* **Baseline Carbon Factors**: Employs global averages (e.g., Grid intensity: 0.38 kg/kWh; Gasoline travel: 0.18 kg/km; Average meat diet: 2.5 Tons/yr).
* **Rate Limits**: Assumes the configured Gemini API key is operating within its available quota limits. If quota is exceeded or the AI service is temporarily unavailable, the application displays a clear user-facing error message.
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

## Why AI Was Used

Traditional carbon calculators typically stop after displaying an emissions estimate. EcoTrack AI extends beyond measurement by using generative AI to transform footprint data into actionable sustainability guidance.

Gemini analyzes lifestyle-specific inputs and calculated emissions to identify the highest-impact emission sources, generate personalized reduction strategies, create weekly action plans, and provide contextual sustainability recommendations tailored to the user's habits.

This approach allows EcoTrack AI to focus on long-term behavior change rather than simply reporting carbon metrics.

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
