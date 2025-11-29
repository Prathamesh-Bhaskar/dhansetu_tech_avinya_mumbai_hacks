
# Dhanasetu — Financial Advisor for Gig Workers

Completed:  
[████████████████████  ] 95–97% 

Dhanasetu is a privacy-first fintech prototype built to support India’s daily-earning workforce with clear, actionable financial intelligence. Built for MumbaiHacks 2025 by Team Tech Avinya, this project demonstrates how non-PII signals and simple AI logic can help gig workers (auto-rickshaw drivers, delivery partners, etc.) improve savings, avoid shortfalls, and make better financial decisions in their local language.

---

## Quick Links

- Pitch Deck (Canva / PDF): https://www.canva.com/design/DAG6BSwrLwo/j5JZ5m-jxa8s8RTI21LClw/view?utm_content=DAG6BSwrLwo&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hec5194b6b3
- Demo / Screenshots: shown below
- Built for: MumbaiHacks 2025 — Official Submission

---

## Problem (Short)

Gig workers often earn irregular daily incomes with limited access to reliable, low-cost financial guidance. Lack of financial literacy and limited, privacy-safe tools make it hard for them to plan, save, or avoid short-term cash shortfalls.

---

## Solution (Short)

Dhanasetu transforms non-PII earning and expense signals into straightforward insights and regional-language guidance. The system predicts likely shortfalls, flags risk patterns, and offers simple, personalized recommendations — all while avoiding collection of personally identifiable information.

---

## Features / Highlights

- Privacy-first: uses non-PII financial signals only
- Shortfall prediction and alerts
- Simple regional-language guidance tailored to income behavior
- Lightweight ML/heuristic engine suitable for low-bandwidth/mobile scenarios
- Modular architecture for future integrations (Account Aggregator, auto-invest SIP, etc.)

---

## Screenshots & Pitch Deck

We include the pitch deck (Canva/PDF) and inline prototype screenshots for quick viewing. Replace the placeholder images below with your actual screenshot files (recommended names shown). Once the images are committed to the repository, GitHub will render them inline.

Pitch Deck (Canva / PDF)
- View online: https://www.canva.com/design/DAG6BSwrLwo/j5JZ5m-jxa8s8RTI21LClw/view?utm_content=DAG6BSwrLwo&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hec5194b6b3

Prototype Screenshots (replace these with your actual images)
- Dashboard View  
  ![Dashboard View](./screenshots/dashboard.png)

- Financial Insights  
  ![Financial Insights](./screenshots/insights.png)

- Guidance Screen  
  ![Guidance Screen](./screenshots/guidance.png)

- Shortfall Alert  
  ![Shortfall Alert](./screenshots/shortfall_alert.png)

Notes:
- If you prefer direct links to images hosted elsewhere (Canva export or an image CDN), you can replace the ./screenshots/*.png paths with external URLs.
- To add or update images: commit them to /screenshots with the names above, or change the paths in this README to match the filenames you commit.

---

## Architecture Overview

1. Non-PII Data Ingestion
   - Collects earnings/expense patterns without user identifiers.

2. Financial Pattern Engine
   - Detects irregular income, spending rhythm, and risk signals.

3. AI Recommendation Module
   - Generates simple, personalized guidance using local-language templates.

4. Regional-Language Delivery Layer
   - Presents advice in the user’s familiar language and tone.

5. Future Integrations (modular)
   - Account Aggregator (AA) support
   - Auto-Invest SIP engine
   - Smart financial automation (rule-based transfers, nudges)

System architecture diagram: add or replace with your diagram at `/docs/system-architecture.png`.

---

## Team

Team Tech Avinya — Built for MumbaiHacks 2025

- <Member Name> — AI / ML
- <Member Name> — Mobile / Android
- <Member Name> — Cybersecurity / Backend
- <Member Name> — Business / Operations
- <Member Name> — QA / Testing

(Replace placeholders with actual names and roles.)

---

## Repository Structure

- /backend        — Backend services, APIs, ML inference
- /frontend       — Mobile or web UI code
- /ml             — Model training, notebooks, data processing
- /docs           — Design docs, diagrams, deck
- /screenshots    — Prototype visual files (images used above)

---

## Local Setup

1. Clone the repo:
```bash
git clone https://github.com/Prathamesh-Bhaskar/dhansetu_tech_avinya_mumbai_hacks.git
cd dhansetu_tech_avinya_mumbai_hacks
```

2. Python backend (example):
```bash
# optionally create a virtual environment
python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
```

3. Docker (if using containers):
```bash
docker compose up --build
```

4. Frontend:
- Follow the README in `/frontend` (install node modules, run dev server). Update instructions here when frontend details are available.

Note: Update these steps to reflect the actual stack/tooling if different (node, expo, flutter, etc.).

---

## How to Contribute

- Add issues for bugs or features
- Fork the repository and create a branch per feature
- Open pull requests describing your changes and tests
- Add screenshots and improve documentation in `/docs` and `/screenshots`

---

## Vision

Dhanasetu aims to become a trusted, privacy-first financial companion for India's gig workforce — providing clarity, stability, and long-term financial growth through simple, accessible intelligence.

---

## Contact

Team Tech Avinya  
Project lead: <insert contact>  
Repository: https://github.com/Prathamesh-Bhaskar/dhansetu_tech_avinya_mumbai_hacks
```
