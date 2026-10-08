# ⚡ Mini ATS (Applicant Tracking System)

> A modern, lightweight, AI-augmented Applicant Tracking System built to be live in the hands of a first customer immediately.

Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Supabase (PostgreSQL with Row Level Security)**.

---

## 🎯 Quick Platform Access

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@miniats.com` | `password123` | Full administrative control, account creation & "Act on Behalf of Customer" delegation |
| **Customer 1** | `sarah@techwave.io` | `password123` | TechWave AI portal: Engineering & AI Product jobs, candidates, Kanban |
| **Customer 2** | `david@acmecorp.com` | `password123` | Acme Enterprise portal: Sales & DevOps jobs, candidates, Kanban |

> 💡 **Instant 1-Click Login:** The login screen includes 1-click test buttons for both Admin and Customer roles for frictionless review.

---

## 🚀 Core Features & Implementation Mapping

### 1. Admin Capabilities
- **Create Accounts:** Admins can create new Customer or Admin accounts directly from the platform (`+ Create Account` button in the navbar or Admin Modal).
- **Act on Behalf of Customers (Delegation / Masquerade):** Admins have a **Customer Context** dropdown in the top bar. Selecting a customer activates an amber delegation banner, displaying their exact pipeline and allowing the admin to post jobs, add candidates, and move stages on their behalf.
- **Global Overview:** Admins can view all candidates and jobs across all accounts simultaneously.

### 2. Customer Capabilities
- **Authentication:** Dedicated login and registration with session persistence.
- **Post Jobs:** Create job vacancies with title, department, location, employment type, salary range, description, and key requirements. Includes 1-click sample templates (`Senior Frontend`, `Senior Backend`, `Growth Lead`).
- **Add Candidates with Profile Information:** Add candidates with full name, email, phone, **LinkedIn URL**, portfolio link, skills tags, recruiter notes, and CV / resume text.
- **Compact Kanban View:**
  - High-density recruitment pipeline organized into 6 stages:
    1. `Sourced`
    2. `Screening`
    3. `Interview`
    4. `Offer`
    5. `Hired` (triggers celebration confetti! 🎉)
    6. `Archived / Rejected`
  - **Compact Mode vs. Comfortable Mode toggle** for scanning high volumes of candidates with zero clutter.
  - Native drag-and-drop and one-click directional stage advancing.
- **Filters:**
  - Filter by Job (dropdown showing real-time applicant counts per position).
  - Filter by Candidate Name (instant real-time search matching name, email, or skill keywords).

---

## 🤖 Extra Task: AI-Based CV Assessment Feature

### Feature Implemented
Every candidate profile includes an **AI CV Screening & Evaluation Engine**:
- **0–100% Suitability Match Score**: Calculated by matching candidate skills, experience, and LinkedIn metadata against specific job requirements.
- **Executive Summary**: 2-sentence hiring recommendation.
- **Key Strengths**: Bulleted list of qualification alignments.
- **Identified Gaps / Interview Probes**: Specific areas for recruiters to drill into during interviews.
- **Recommended Stage**: Automated recommendation (e.g. recommend advancing straight to Interview or Offer) with a 1-click **Apply Recommendation** button.

### How We Would Approach This in a Production System:
1. **Multi-Modal Document Parsing**: Use OCR / PDF extraction (e.g., pdf-parse, AWS Textract) to convert uploaded resumes, CVs, and LinkedIn PDFs into structured JSON profiles.
2. **De-biasing & Blind Screening Layer**: Strip names, gender identifiers, age signals, and photos before feeding profile data to the model to enforce compliance with EEOC / fair hiring regulations.
3. **Hybrid Embedding & LLM Evaluation**:
   - Compute vector embeddings (e.g., text-embedding-3-small or Gemini Embeddings) for cosine similarity retrieval against job requirements.
   - Run a structured LLM prompt (Gemini 1.5 Flash / Claude 3.5 Sonnet) enforcing a strict Pydantic / JSON schema for consistent, deterministic scoring.
4. **Human-in-the-Loop Safeguard**: The AI serves strictly as an advisory copilot; human recruiters always retain final authority on candidate rejections and stage promotions.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Backend & Database:** Supabase (PostgreSQL), Auth, Row Level Security (RLS).
- **Dual Engine Persistence:**
  - Connects seamlessly to any live Supabase cloud project (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).
  - Includes a pre-seeded **Local Demo Engine** fallback so the system runs immediately upon opening with realistic pre-populated data without configuration bottlenecks.

---

## 📦 Getting Started (Local Setup)

```bash
# 1. Clone repository
git clone https://github.com/your-username/mini-ats.git
cd mini-ats

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
http://localhost:5173
```

### Connecting to your Supabase Project
1. Create a project at [Supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard and run the script in `supabase/schema.sql`.
3. Copy your project URL and public anon key into `.env` (see `.env.example`) or enter them directly in the in-app **Supabase Settings** modal (database icon in the navbar).

---

## 🎥 5-Minute Loom Demo Video Script

If recording or presenting a walkthrough, use this recommended flow:

1. **0:00 - 0:45 | Introduction & Problem Space:**
   - Introduce the Mini ATS: built for fast-moving startups and agencies who need zero friction.
   - Show the login screen and demonstrate 1-click login.

2. **0:45 - 1:45 | Customer Experience (Job & Candidate Workflow):**
   - Log in as Customer (`sarah@techwave.io`).
   - Post a new job using a 1-click template in 15 seconds.
   - Add a new candidate with their **LinkedIn URL** and paste sample CV text.

3. **1:45 - 2:45 | Compact Kanban & Real-Time Filtering:**
   - Show the compact Kanban view across the 6 pipeline stages.
   - Demonstrate the **Compact Mode** vs **Comfortable Mode** toggle.
   - Filter candidates by Job and by Candidate Name.
   - Advance candidate stages via drag-and-drop and show the confetti celebration upon reaching `Hired`.

4. **2:45 - 3:45 | AI Resume Screening Feature:**
   - Click on a candidate card to open the detail drawer.
   - Showcase the **AI CV Screening & Evaluation** panel (Match Score, Summary, Strengths, Gaps).
   - Demonstrate the **Apply Recommendation** button to automatically promote the candidate to Interview.
   - Explain our production architecture (blind screening, embedding similarity, LLM schema parsing).

5. **3:45 - 5:00 | Admin Powers & Delegation ("Act on Behalf"):**
   - Log in as Admin (`admin@miniats.com`).
   - Demonstrate creating a new Customer account.
   - Switch the **Customer Context** dropdown to act on behalf of `TechWave AI` or `Acme Enterprise`.
   - Show that the admin can post jobs and move candidates on their client's behalf.
   - Wrap up with Supabase backend schema and deployment readiness.

---

## 📄 License
MIT License.
