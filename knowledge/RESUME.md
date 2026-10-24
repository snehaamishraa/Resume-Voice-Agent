# RESUME.md
## Text of Sneha Mishra's resume

> Note: This is the text of my resume with two corrections: the Poco AI internship ended in September 2026 (it is not current), and Berrika did not use Nhost. My Research Analyst internship at Dream IT Consulting Services (September 2026 – 23 October 2026) is not on this resume; it is documented in BIOGRAPHY.md.

---

# Sneha Mishra
**Full Stack Software Engineer | React · Next.js · TypeScript · Node.js · PostgreSQL**

Gurgaon, Haryana, India | +91 9153034049 | sneha.mishra1144@gmail.com  
linkedin.com/in/snehamishraa | github.com/snehaamishraa | leetcode.com/u/snehamishraa

## Professional Summary

Full stack engineer who ships to production. Across three SDE internships, built and launched three live products end to end (a diet-planning platform, a legal-help platform, and a 39-category B2B marketplace) and owned production fixes for performance, payments, and authentication on a live client application. Works across the stack with React, Next.js, and TypeScript; Node.js and Go REST and GraphQL APIs; and PostgreSQL, plus hands-on LLM integration and AI voice-agent design. Final-year B.Tech Computer Science student.

## Technical Skills

- **Languages:** TypeScript, JavaScript (ES6+), Go (Golang), Python, SQL
- **Frontend:** React.js, Next.js (App Router, Server Actions), React Hooks, Tailwind CSS, shadcn/ui, Apollo Client, Vite, HTML5, CSS3
- **Backend:** Node.js, Express.js, Next.js API routes, Go Fiber, REST APIs, GraphQL, JWT, OAuth 2.0, OTP auth, middleware, payment gateways
- **Databases:** PostgreSQL, Hasura, Nhost, GORM, database schema design, query optimization
- **DevOps and Tools:** Docker (multi-stage builds), CI/CD, Vercel, Git, GitHub, Postman
- **AI and LLM:** LLM integration (OpenRouter), prompt engineering, AI voice agents, multi-model fallback, context-window management

## Work Experience

### Software Development Engineer Intern — Poco AI | berrika.in
**June 2026 – September 2026 · Remote**
- Shipped Berrika, a live family diet-planning platform, end to end: frontend architecture, data layer, and production deployment.
- Built the responsive Next.js (App Router), React, and Tailwind CSS app, using image optimization and static prerendering for fast loads.
- Designed the PostgreSQL data layer and served it to the frontend as GraphQL APIs through Hasura.
- Built the onboarding and macro-tracking flows on the GraphQL layer, wiring form state, validation, and error handling end to end.
- Designed the conversation flow and bilingual Hindi and English prompts for an AI voice-calling agent that runs automated user follow-ups.

### Software Development Engineer Intern — Subspace | sbjagrotech.com
**March 2026 – June 2026 · Hybrid**
- Owned production bugs on SBJ Agrotech, a live client ERP, from user report to root-cause analysis, fix, testing, and deployment.
- Made slow pages render almost instantly by tracing backend bottlenecks, optimizing database queries, and trimming API payloads.
- Fixed recurring failed customer payments by debugging transaction handling and payment-gateway callback failures in the checkout flow.
- Eliminated unexpected mid-session logouts by correcting token expiry and refresh handling in the authentication layer.
- Automated manual data collection with Python (Requests) scrapers handling pagination, parsing, deduplication, and CSV/Excel export.

### Software Development Engineer Intern — VocalLabs AI
**December 2025 – March 2026 · Hybrid**
- Legal Bharat (Live): shipped a legal-help platform linking citizens to verified advocates, 11 routes in Next.js 16, React 19, TypeScript.
- Engineered a transparent weighted matching engine ranking advocates on practice area, jurisdiction, and language, publishing all weights.
- Built a keyword classifier that turns a plain-language problem into a structured legal brief routed to the right practice area, surfacing matched terms so users can fix a wrong reading in one click.
- Built case-registration forms on Next.js Server Actions with field-level validation, with no separate API routes needed.
- Bharat Exchange: shipped a B2B marketplace (39 categories, 348 products) with dynamic category, group, and product routes in Next.js.
- Built phone OTP auth and a lead-capture API writing to PostgreSQL via Hasura GraphQL, keeping admin secrets server-side.
- Containerized the marketplace with a multi-stage Docker build on a distroless non-root image, with a CI/CD pipeline to production.
- Designed conversation flows and system prompts for 10 AI voice agents across calling use cases, refined against real call transcripts.

## Projects

### TaskFlow: Full-Stack Task Management Platform
*Next.js, React, TypeScript, shadcn/ui, Go Fiber, GORM, PostgreSQL, JWT, Google OAuth 2.0, Docker*
- Built a layered Go Fiber REST API (routes, handlers, services, repositories) on PostgreSQL for task CRUD, search, filtering, and stats.
- Secured it with bcrypt, JWT middleware on protected routes, and Google OAuth 2.0, normalizing emails to block duplicate accounts.
- Built the Next.js and TypeScript UI with custom React hooks for task state and debounced search, skeleton loading, and error toasts.

### YouTube Summarizer AI
*React, TypeScript, Vite, Apollo Client, Node.js, Express, Nhost, Hasura, GraphQL, PostgreSQL, OpenRouter API*
- Deployed an AI app turning any YouTube video into a structured summary (overview, 5 key points, takeaway), with saved history.
- Split the pipeline into two Hasura Actions on Node.js/Express serverless functions so each step fits the platform's 10-second limit.
- Integrated OpenRouter with a 6-model fallback chain that races the two fastest free models in parallel, then falls back in order, at zero inference cost, truncating transcripts at 45,000 characters to prevent context overflow.

## Education

### DPG Institute of Technology and Management
**B.Tech in Computer Science Engineering · August 2023 – Present**  
Coursework: Data Structures and Algorithms, Operating Systems, DBMS, Computer Networks, Object-Oriented Programming

## Achievements
- Cleared the internal round of Smart India Hackathon (SIH) 2025 with a team project.
