# 🏗️ LectureIQ Architecture & Technical Deep Dive

LectureIQ is an AI-powered lecture-to-learning platform that transforms unstructured educational audio recordings, PDFs, and notes into structured, high-yield learning materials.

---

## 1. High-Level System Architecture

```text
                 ┌─────────────────────────────┐
                 │    Student / Web Client     │
                 │   (React + Vite + Tailwind) │
                 └──────────────┬──────────────┘
                                │ HTTP / REST JSON
                                ▼
                 ┌─────────────────────────────┐
                 │       FastAPI Gateway       │
                 │ (CORS, Validation, Routers) │
                 └──────────────┬──────────────┘
                                │
        ┌───────────────────────┼──────────────────────┐
        ▼                       ▼                      ▼
┌────────────────┐      ┌────────────────┐     ┌────────────────┐
│ Document & STT │      │ AI Processing  │     │ Storage Engine │
│    Services    │      │    Pipeline    │     │  (SQLite DB)   │
└───────┬────────┘      └───────┬────────┘     └───────┬────────┘
        │                       │                      │
        ▼                       ▼                      ▼
┌────────────────┐      ┌────────────────┐     ┌────────────────┐
│  pypdf Engine  │      │ Dual AI Engine │     │ Lectures,      │
│  Audio Parser  │      │(Gemini/OpenAI/ │     │ Flashcards,    │
│Semantic Chunker│      │  Local NLP)    │     │ Quizzes, Chat  │
└───────┬────────┘      └───────┬────────┘     └────────────────┘
        │                       │
        └───────────────┬───────┘
                        ▼
             ┌─────────────────────┐
             │ Vector Indexer & RAG│
             │ (TF-IDF Cosine Sim) │
             └─────────────────────┘
```

---

## 2. Ingestion & Preprocessing Subsystem

1. **Audio Transcription (`TranscriptionService`):**
   - Supports `.mp3`, `.wav`, `.m4a`, `.webm`, and `.ogg`.
   - Parses duration, slices speech segments into speaker-attributed intervals with precise `[start_time, end_time]` tags.
   - Fallback synthesis for browser recorded microphone inputs.

2. **Document Extraction (`DocumentService`):**
   - Powered by `pypdf` to extract text from multi-page documents while tracking page indices.
   - Cleans formatting, normalizes whitespace, and extracts section headings (`# Heading`, `Chapter`, `Topic`).

3. **Semantic Chunking:**
   - Splits lectures into 300–500 word semantically coherent blocks with contextual overlap (200 characters) to ensure no boundary concepts are fragmented.

---

## 3. Retrieval-Augmented Generation (RAG) & Semantic Search

- **Vector Search Engine (`VectorSearchService`):**
  - Tokenizes queries and lecture passages.
  - Generates Term Frequency-Inverse Document Frequency (TF-IDF) weighted vectors across all indexed chunks.
  - Computes Cosine similarity metrics with title/heading boosting factors.
- **Grounded Q&A Chat:**
  - Retrieves the top-$K$ most relevant lecture sections.
  - Formulates a grounded context window for the AI engine.
  - Automatically tags each answer with precise source citations (section name, excerpt, and timestamp).

---

## 4. Multi-Provider AI Engine (`AIService`)

LectureIQ implements a pluggable AI architecture:

| Provider | Model / Engine | Characteristics |
|---|---|---|
| **Google Gemini** | `gemini-2.5-flash` | High speed, generous free quota, structured JSON extraction |
| **OpenAI** | `gpt-4o-mini` | High reasoning accuracy |
| **Groq** | `llama-3.3-70b-versatile` | Ultra-low latency open-weights |
| **Local Built-in NLP** | Extractive Synthesizer | **100% offline, zero-configuration fallback** |

---

## 5. Learning & Self-Assessment Workflow

1. **Executive Summary & Key Takeaways:** Distilled 3-paragraph thesis and 5-6 high-yield examination bullet points.
2. **Topic-Wise Smart Notes:** Hierarchical markdown document with definitions, formulas, real-world case studies, and exam review checklists.
3. **Interactive Flashcards:** 3D flip card deck with mastery ratings (`learning`, `reviewing`, `mastered`) and keyboard navigation (`←`, `→`, `Space`).
4. **AI Quiz Arena:** Generates MCQs and short-answer prompts, grades student responses instantly, records attempt history, and offers comprehensive explanations.
5. **Multi-Format Export:** Downloads structured study packages in Markdown (`.md`) or JSON (`.json`).
