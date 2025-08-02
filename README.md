
# ReachInbox Email Aggregator

## Overview
ReachInbox is a full-stack SaaS application that aggregates emails from multiple IMAP accounts, applies AI-powered categorization, and provides a modern dashboard for managing, searching, and replying to emails. It is designed for sales, outreach, and productivity teams who want a unified, intelligent inbox experience.

---

## Architecture

### 1. **Frontend (React + Vite + MUI)**
- **Tech Stack:** React, TypeScript, Vite, Material UI
- **Features:**
  - Modern dashboard UI with sidebar navigation
  - Email list, detail view, and filters (account, folder, category, search)
  - AI-powered category chips (Interested, Meeting Booked, Spam, etc.)
  - Suggested replies via AI (LLM/RAG)
  - Account management, settings, and profile
  - Responsive design (mobile/tablet/desktop)
  - Error handling, skeleton loaders, tooltips, and accessibility
- **API Integration:** Connects to backend via REST API (`/api/emails`, etc.) using Axios. All endpoints are dynamically configured via environment variables for easy deployment.

### 2. **Backend (Node.js + Express + Elasticsearch + AI)**
- **Tech Stack:** Node.js, Express, TypeScript, Elasticsearch, Slack API, Mailparser, AI (LLM/RAG)
- **Features:**
  - IMAP account sync (multi-account support)
  - Real-time email fetching and indexing
  - AI categorization of emails (Interested, Meeting Booked, etc.)
  - Slack/webhook notifications for key events
  - Elasticsearch-powered search and filtering
  - Suggested reply generation via AI
  - REST API endpoints for all frontend features
  - CORS and security middleware

---

## How It Works

1. **IMAP Sync:**
   - Backend connects to multiple IMAP accounts (configured via `.env`).
   - Emails are fetched, parsed, and indexed in Elasticsearch.
   - AI engine classifies each email into categories (Interested, Meeting Booked, etc.).
   - If an email is marked as "Interested", Slack/webhook notifications are triggered.

2. **Frontend Dashboard:**
   - Sidebar shows accounts, folders, and categories.
   - Main panel displays stats, filters, and email list.
   - Users can filter by account, folder, category, and search instantly.
   - Clicking an email opens detail view with full content and actions (reply, mark, delete).
   - "Suggest Reply" button uses backend AI to generate a smart response.

3. **AI Features:**
   - Categorization is powered by LLM/RAG (configurable in backend).
   - Suggested replies are generated for each email using context and product info.
   - All AI actions show spinners and error messages for smooth UX.

---

## Features

- **Authentication:** (Optional, can be enabled in backend)
- **Dashboard:** Stats, quick filters, category breakdown
- **Accounts:** Multi-account IMAP support, sync status
- **Email List:** Table/grid, filters, search, category chips
- **Email Detail:** Full content, actions, AI category
- **AI Categorization:** Chips, dropdown filter, loader
- **Suggested Replies:** AI-powered, editable, send/dismiss
- **Notifications:** Slack/webhook integration, toasts
- **Compose/Reply:** Rich text editor, templates
- **Settings:** Add/remove accounts, profile, dark mode
- **Responsiveness:** Mobile/tablet/desktop support
- **Accessibility:** Keyboard navigation, tooltips
- **Modern UI:** Material UI, custom theme, icons

---

## Getting Started

### 1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/reachinbox-email-aggregator.git
cd reachinbox-email-aggregator
```

### 2. **Setup Backend**
```bash
cd backend
cp .env.example .env # Fill in IMAP, Elasticsearch, Slack, etc.
npm install
npm run dev # or npm start for production
```
- Ensure Elasticsearch is running locally or update `.env` for remote instance.
- IMAP accounts are configured via `.env` (see example in repo).

### 3. **Setup Frontend**
```bash
cd ../frontend
npm install
npm run dev
```
- The frontend runs on `http://localhost:5173` by default.
- Update `VITE_API_URL` in `.env` if backend is on a different host/port.

### 4. **Access the App**
- Open `http://localhost:5173/dashboard` in your browser.
- Use sidebar to switch accounts, folders, and categories.
- Try searching, filtering, and using AI reply features.

---

## Demo Video

[![Watch the demo](https://img.youtube.com/vi/your-demo-video-id/0.jpg)](https://www.youtube.com/watch?v=your-demo-video-id)

---

## Folder Structure

```
reachinbox-email-aggregator/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── services/
│   │   ├── utils/
│   │   └── ...
│   ├── package.json
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── dashboard/
│   │   ├── emails/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── ...
│   ├── package.json
│   └── ...
└── README.md
```

---

## Troubleshooting
- **CORS Errors:** Ensure backend CORS allows `http://localhost:5173` and credentials.
- **IMAP Issues:** Double-check `.env` for correct credentials and host/port.
- **Elasticsearch:** Make sure it is running and accessible.
- **AI Features:** Check API keys and environment variables for LLM/RAG.
- **Frontend API:** Update `VITE_API_URL` if backend is not on default port.

---

## Contributing
- Fork the repo, create a branch, and submit a PR.
- Open issues for bugs, feature requests, or questions.

---

## License
MIT

---

## Contact
- For questions, reach out via GitHub Issues or email yourname@domain.com

---

## Credits
- Inspired by Gmail, Outlook, and modern SaaS dashboards.
- Built with ❤️ by your team.

---

## Video Demo Script (for reference)

1. **Intro:**
   - "Welcome to ReachInbox! This is a unified email dashboard powered by AI."
2. **Dashboard Overview:**
   - "Here you see all your connected accounts, folders, and categories."
   - "Stats cards show total emails, unread, interested, and meeting booked."
3. **Email List & Filters:**
   - "Filter by account, folder, category, or search instantly."
   - "Click any email to view details and actions."
4. **AI Features:**
   - "Each email is categorized by AI. Try the 'Suggest Reply' button for smart responses."
5. **Notifications:**
   - "Interested emails trigger Slack/webhook notifications."
6. **Settings & Profile:**
   - "Manage accounts, profile, and dark mode from the sidebar."
7. **Outro:**
   - "ReachInbox makes your outreach smarter and faster. Try it now!"

---

Feel free to update this README with your own branding, links, and details!
# reachinbox-email-aggregator
