# ⚡ Mini ATS (Applicant Tracking System)

> A modern, lightweight, AI-augmented Applicant Tracking System built to be live in the hands of a first customer immediately.

Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Supabase (PostgreSQL with Row Level Security)**.

---

## 🎯 Local Demo Access

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@miniats.com` | Demo only | Local simulated role with account management and delegation |
| **Customer 1** | `sarah@techwave.io` | Demo only | Local simulated TechWave AI workspace |
| **Customer 2** | `david@acmecorp.com` | Demo only | Local simulated Acme Enterprise workspace |

> These are browser-local demo identities, not authenticated accounts. The local demo is enabled only by the Vite development server; never use it for production or real candidate data. Cloud mode requires Supabase Auth and the tenant-scoped policies in `supabase/schema.sql`.

---

## 🚀 Core Features & Implementation Mapping

### 1. Admin Capabilities
- **Create Accounts:** Admins can create Customer or Admin accounts through an authenticated Supabase Edge Function (`+ Create Account`). The function validates the caller's Supabase session and admin profile before using the server-side Auth Admin API.
- **Edit Accounts:** Admins can update a user's name, company, and role from the account list. Name/company changes sync to Supabase Auth metadata and `public.profiles`; role remains authoritative only in `public.profiles`. Login email and password are not changed by this form; an admin cannot demote themself or the last admin.
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

CV extraction and assessments currently use browser-local heuristics. Direct Gemini calls are disabled because a client-side API key would be exposed in the browser; re-enable a hosted LLM only through a trusted server-side integration with appropriate candidate-data disclosures.

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
- **Persistence:** Connects directly to Supabase using the public anon key and Supabase Auth. Local demo data is for development only and is not an authentication system.

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
3. Copy your project URL and public anon key into `.env` (see `.env.example`). The anon key is public; database authorization must be enforced by RLS. Never put a service-role key in the client app.
4. Create the first admin as a trusted operator: create the user in Supabase Auth, then promote only that verified user's matching profile through the Supabase SQL Editor or Table Editor. For example, after replacing the email with the intended admin address:
    ```sql
    UPDATE public.profiles AS p
    SET role = 'admin'
    FROM auth.users AS u
    WHERE p.id = u.id
       AND lower(u.email) = lower('admin@your-company.example');
    ```
    Do not grant admin based on client-provided signup metadata.
5. Link the Supabase CLI to the project and deploy `supabase functions deploy admin-create-account`. Set the `ALLOWED_ORIGINS` function secret to the exact app origins (for example, local development and the production HTTPS origin). Verify `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are available in the Edge Function environment. The service-role key must never be placed in a `VITE_` variable or frontend configuration.

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
