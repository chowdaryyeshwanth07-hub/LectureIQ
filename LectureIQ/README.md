# 🎓 LectureIQ — AI Lecture-to-Learning Platform

**Turn lectures into summaries, flashcards, quizzes, and searchable knowledge — powered by AI.**

LectureIQ is an AI-powered learning assistant that transforms lecture recordings, audio files, PDFs, and study notes into structured, high-yield learning materials. It helps students save time, understand complex topics, and prepare for examinations more efficiently.

---

## ✨ Key Features

- 🎙️ **Lecture Transcription:** Audio playback synchronized with timestamped speaker segments (`.mp3`, `.wav`, `.m4a`, `.webm`, or live microphone recording).
- 📝 **AI Summarization:** Instant executive summaries and high-yield examination key takeaways.
- 📚 **Topic-Wise Smart Notes:** Hierarchical structured notes with mathematical formulas, core definitions, and exam review checklists.
- 🧠 **Interactive 3D Flashcards:** Flip cards with mastery tracking (`Needs Work`, `Reviewing`, `Mastered`), keyboard shortcuts (`Space` to flip, `←` `→` to navigate), and shuffle mode.
- ❓ **AI Quiz Arena:** Practice multiple-choice and short-answer questions with instant grading, score breakdown, confetti celebrations, and answer explanations.
- 💬 **Grounded Lecture Q&A:** Conversational AI tutor grounded directly in the student's lecture text with exact source citations and quote references (RAG).
- 🔎 **Global Semantic Search:** Fast vector search across all lectures with snippet previews and relevance scoring (`Ctrl+K`).
- 📊 **Learning Analytics Dashboard:** Track processed lectures, mastered flashcards, quiz attempts, and overall accuracy.
- 📄 **Multi-Format Export:** Download complete study packs in Markdown (`.md`) or structured JSON (`.json`).
- ⚡ **Dual AI Engine:** Built-in offline NLP synthesis (works 100% out of the box with zero external configuration or API keys) + support for Google Gemini, OpenAI, and Groq.

---

## 🏗️ System Architecture

```text
                 ┌─────────────────────┐
                 │       Student       │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  React Web Client   │
                 │  (Vite + Tailwind)  │
                 └──────────┬──────────┘
                            │ HTTP / REST
                            ▼
                 ┌─────────────────────┐
                 │   FastAPI Backend   │
                 └──────────┬──────────┘
                            │
               ┌────────────┼─────────────┐
               ▼            ▼             ▼
        ┌────────────┐ ┌────────────┐ ┌────────────┐
        │ Transcriber│ │ PDF / Text │ │ SQLite DB  │
        │   Engine   │ │  Processor │ │(SQLAlchemy)│
        └─────┬──────┘ └─────┬──────┘ └────────────┘
              │              │
              └──────┬───────┘
                     ▼
           ┌────────────────────┐
           │  Content Chunking  │
           │  & Vector Search   │
           └─────────┬──────────┘
                     ▼
           ┌────────────────────┐
           │  Dual AI Engine    │
           │ (Gemini/OpenAI/Groq│
           │  or Local Offline) │
           └─────────┬──────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │ Summaries│ │Flashcards│ │ Quizzes  │
   └──────────┘ └──────────┘ └──────────┘
                     │
                     ▼
           ┌────────────────────┐
           │ Grounded Q&A Chat  │
           │ & Semantic Search  │
           └────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Canvas Confetti |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2 |
| **Database** | SQLite, SQLAlchemy ORM |
| **Document Processing** | PyPDF (`pypdf`), Regex-based semantic chunker |
| **Search & Retrieval** | TF-IDF Cosine Similarity Vector Search with Heading Boost |
| **AI Generation** | Multi-provider architecture (Google Gemini, OpenAI, Groq, and Local Built-in NLP) |
| **Export Engine** | Markdown & JSON serialization |
| **Testing** | Pytest, FastAPI TestClient |

---

## 📂 Project Structure

```text
LectureIQ/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                # Navigation, search shortcut & sample loader
│   │   │   ├── LectureCard.jsx           # Lecture overview card with badges
│   │   │   ├── AudioPlayer.jsx           # Timeline scrubber & playback speed
│   │   │   ├── TranscriptViewer.jsx      # Timestamped segments & search
│   │   │   ├── SummaryTab.jsx            # Executive summary & takeaways
│   │   │   ├── SmartNotesTab.jsx         # Structured topic notes & markdown export
│   │   │   ├── FlashcardDeck.jsx         # 3D interactive flip deck with ratings
│   │   │   ├── QuizArena.jsx             # MCQ & short answer test runner
│   │   │   ├── ChatBot.jsx               # Grounded RAG conversational assistant
│   │   │   ├── SemanticSearchModal.jsx   # Global search dialog (Ctrl+K)
│   │   │   ├── SettingsModal.jsx         # AI provider & API key settings
│   │   │   └── UploadModal.jsx           # Audio, PDF, and notes uploader
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx         # Analytics, progress metrics & recent items
│   │   │   ├── LecturesPage.jsx          # Filterable library with format tabs
│   │   │   └── LectureDetailPage.jsx     # Full learning suite hub
│   │   ├── services/
│   │   │   └── api.js                    # Axios API client
│   │   ├── App.jsx                       # Main application router
│   │   ├── main.jsx                      # React DOM root
│   │   └── index.css                     # Tailwind CSS & 3D card transforms
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── app/
│   │   ├── main.py                       # FastAPI application & router mounting
│   │   ├── config.py                     # App configuration & settings
│   │   ├── database.py                   # SQLite connection & sessionmaker
│   │   ├── models/                       # SQLAlchemy database models
│   │   ├── routes/                       # REST endpoints
│   │   ├── services/                     # Ingestion, RAG, AI & Export engines
│   │   └── utils/                        # Pre-seeded demo lectures dataset
│   ├── requirements.txt
│   └── .env.example
│
├── tests/
│   ├── test_backend.py                   # API routes & database tests
│   └── test_ai_pipeline.py               # AI, chunking, and search tests
├── docs/
│   └── architecture.md                   # System design & component breakdown
├── .gitignore
├── LICENSE
└── README.md
```

---

## ⚡ Quickstart & Installation

### Prerequisites
- **Python 3.10+** (Tested on Python 3.13)
- **Node.js 18+** and **npm**

---

### 1. Set Up and Start Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start backend server
python -m uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **API URL:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`

---

### 2. Set Up and Start Frontend

In a second terminal window:

```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Pre-loaded Sample Lectures (1-Click Test)

When you first open the app, it automatically seeds 3 comprehensive academic lectures:

1. **Introduction to Machine Learning & Neural Networks** (AI & Data Science)
2. **Operating Systems: Concurrency, Deadlocks & Synchronization** (Computer Systems)
3. **Microeconomics: Supply, Demand & Market Equilibrium** (Economics & Business)

Each lecture includes:
- Synchronized timestamped transcripts
- Executive summaries and key takeaways
- Formatted topic notes with LaTeX formulas
- 3D interactive flashcard decks
- Practice quizzes with self-grading and explanations
- Grounded RAG Q&A chatbot with citation references

---

## ⚙️ Running Automated Tests

Run the full pytest suite from the `backend/` folder:

```bash
python -m pytest ../tests/test_backend.py ../tests/test_ai_pipeline.py -v
```

All 10 unit and integration tests will execute and validate the ingestion, vector search, database, and API layers.

---

## 🔐 Environment Variables

Create a `.env` file in `backend/` (optional):

```env
# Optional external AI providers (platform runs offline without keys!)
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here
GROQ_API_KEY=your_groq_key_here

# Provider setting: auto, gemini, openai, groq, or local
AI_PROVIDER=auto

DATABASE_URL=sqlite:///./lectures.db
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
