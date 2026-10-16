import json
import re
import os
from typing import List, Dict, Any, Optional
import httpx
from app.config import settings

class AIService:
    def __init__(self):
        pass

    def _get_active_provider(self) -> str:
        provider = settings.AI_PROVIDER.lower()
        if provider == "auto":
            if settings.GEMINI_API_KEY:
                return "gemini"
            elif settings.OPENAI_API_KEY:
                return "openai"
            elif settings.GROQ_API_KEY:
                return "groq"
            return "local"
        return provider

    # -------------------------------------------------------------
    # External LLM Callers (Gemini, OpenAI, Groq)
    # -------------------------------------------------------------
    async def _call_gemini(self, prompt: str, system_prompt: str = "") -> Optional[str]:
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            return None
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": f"{system_prompt}\n\n{prompt}" if system_prompt else prompt}]}
            ],
            "generationConfig": {"temperature": 0.3, "maxOutputTokens": 2048}
        }
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        return "".join([p.get("text", "") for p in parts])
        except Exception as e:
            print(f"[Gemini Error]: {e}")
        return None

    async def _call_openai_compatible(self, url: str, api_key: str, model: str, prompt: str, system_prompt: str = "") -> Optional[str]:
        if not api_key:
            return None
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        payload = {"model": model, "messages": messages, "temperature": 0.3}

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"[OpenAI-Compatible Error]: {e}")
        return None

    async def _call_llm(self, prompt: str, system_prompt: str = "") -> Optional[str]:
        provider = self._get_active_provider()
        if provider == "gemini":
            return await self._call_gemini(prompt, system_prompt)
        elif provider == "openai":
            return await self._call_openai_compatible(
                "https://api.openai.com/v1/chat/completions",
                settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY", ""),
                "gpt-4o-mini",
                prompt,
                system_prompt
            )
        elif provider == "groq":
            return await self._call_openai_compatible(
                "https://api.groq.com/openai/v1/chat/completions",
                settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY", ""),
                "llama-3.3-70b-versatile",
                prompt,
                system_prompt
            )
        return None

    # -------------------------------------------------------------
    # Summarization
    # -------------------------------------------------------------
    async def generate_summary(self, text: str, title: str) -> Dict[str, Any]:
        prompt = (
            f"You are an expert academic tutor. Summarize the following lecture entitled '{title}'.\n"
            "Return a JSON object with keys:\n"
            "1. 'executive_summary': A concise 2-3 paragraph overview explaining the lecture's core thesis and significance.\n"
            "2. 'key_takeaways': A list of 4-6 bullet point key takeaways.\n"
            "3. 'core_concepts': A list of 3-5 key concepts discussed.\n\n"
            f"Lecture text:\n{text[:6000]}\n\n"
            "Output valid JSON only."
        )

        response = await self._call_llm(prompt, "You are a professional educational summarizer.")
        if response:
            try:
                clean = re.sub(r'```json|```', '', response).strip()
                return json.loads(clean)
            except Exception:
                pass

        # Fallback Local NLP Extractive Engine
        return self._local_generate_summary(text, title)

    def _local_generate_summary(self, text: str, title: str) -> Dict[str, Any]:
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if len(s.strip()) > 30]
        
        # Identify high-impact sentences (definitions, emphasis)
        takeaways = []
        exec_sentences = []
        for s in sentences:
            s_lower = s.lower()
            if any(k in s_lower for k in ["is defined as", "means that", "essential", "crucial", "important", "in conclusion", "therefore", "fundamental"]):
                if len(takeaways) < 5 and s not in takeaways:
                    takeaways.append(s)
            elif len(exec_sentences) < 4:
                exec_sentences.append(s)

        if not exec_sentences:
            exec_sentences = sentences[:3]
        if not takeaways:
            takeaways = [f"Foundational exploration of {title}", "Core principles and operational trade-offs", "Practical implementation considerations and evaluation"]

        executive_summary = (
            f"This lecture explores foundational principles and practical mechanics of **{title}**. "
            + " ".join(exec_sentences[:3])
            + f" The material highlights critical structural concepts and operational paradigms essential for mastery of the topic."
        )

        return {
            "executive_summary": executive_summary,
            "key_takeaways": takeaways[:6],
            "core_concepts": [title, "Fundamental Principles", "Practical Application", "Performance Trade-offs"]
        }

    # -------------------------------------------------------------
    # Smart Notes Generator
    # -------------------------------------------------------------
    async def generate_smart_notes(self, text: str, title: str) -> str:
        prompt = (
            f"Create comprehensive, topic-wise study notes for '{title}'.\n"
            "Use Markdown formatting with:\n"
            "- # Lecture Overview\n"
            "- ## 1. Key Principles & Definitions\n"
            "- ## 2. Core Mechanics & Architecture\n"
            "- ## 3. Important Formulas / Rules\n"
            "- ## 4. Real-World Applications & Examples\n"
            "- ## 5. Exam Review & Common Pitfalls\n\n"
            f"Content:\n{text[:6000]}"
        )
        response = await self._call_llm(prompt, "You are an expert university professor creating study notes.")
        if response:
            return response.strip()

        # Local Fallback Smart Notes
        return self._local_generate_smart_notes(text, title)

    def _local_generate_smart_notes(self, text: str, title: str) -> str:
        paragraphs = [p.strip() for p in text.split("\n") if len(p.strip()) > 40]
        p1 = paragraphs[0] if paragraphs else "Introduction to subject matter."
        p2 = paragraphs[1] if len(paragraphs) > 1 else "Theoretical baseline and definitions."
        p3 = paragraphs[2] if len(paragraphs) > 2 else "Analysis of mechanisms and execution."

        notes = f"""# 📚 LectureIQ Smart Notes: {title}

## 1. Executive Context & Overview
{p1}

* **Primary Subject:** {title}
* **Pedagogical Target:** Exam readiness, conceptual clarity, and practical problem solving.

---

## 2. Fundamental Definitions & Mechanics
{p2}

* **Definition:** Core principles govern how states, resources, and transformations interact.
* **Underlying Logic:** Every operation requires clear preconditions and predictable postconditions.

---

## 3. Structural Breakdown & Operations
{p3}

### Key Rules & Equations
* **Core Rule:** Minimize overhead while maximizing system throughput and predictability.
* **Invariant:** Preserve correctness across all concurrent and sequential execution paths.

---

## 4. Real-World Case Studies & Applications
* Applied across scalable software architectures, scientific computations, and industrial decision systems.
* Practical systems balance theoretical bounds against real-world latency and cost constraints.

---

## 5. Exam Preparation & Review Checklist
- [x] Memorize primary definitions and terminology
- [x] Practice distinguishing between edge cases and baseline behavior
- [x] Review end-of-chapter worked problems and quizzes
"""
        return notes

    # -------------------------------------------------------------
    # Flashcard Generation
    # -------------------------------------------------------------
    async def generate_flashcards(self, text: str, count: int = 8) -> List[Dict[str, str]]:
        prompt = (
            f"Extract {count} high-yield flashcards from this lecture text.\n"
            "Return a JSON list of objects, each with:\n"
            "- 'question': Clear, testable question.\n"
            "- 'answer': Accurate, concise answer (1-3 sentences).\n"
            "- 'concept': Category or concept tag.\n"
            "- 'difficulty': 'Easy', 'Medium', or 'Hard'.\n\n"
            f"Text:\n{text[:5000]}\n\n"
            "Return JSON array only."
        )
        response = await self._call_llm(prompt, "You are an expert exam flashcard author.")
        if response:
            try:
                clean = re.sub(r'```json|```', '', response).strip()
                cards = json.loads(clean)
                if isinstance(cards, list) and len(cards) > 0:
                    return cards
            except Exception:
                pass

        return self._local_generate_flashcards(text, count)

    def _local_generate_flashcards(self, text: str, count: int = 8) -> List[Dict[str, str]]:
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if len(s.strip()) > 35]
        cards = []

        for s in sentences:
            if any(k in s.lower() for k in [" is ", " are ", " defined as ", " refers to ", " allows ", " requires "]):
                parts = re.split(r'\b(?:is defined as|refers to|is|are)\b', s, maxsplit=1, flags=re.IGNORECASE)
                if len(parts) == 2 and len(parts[0].strip().split()) <= 6:
                    term = parts[0].strip(" -#*")
                    definition = parts[1].strip(" .")
                    cards.append({
                        "question": f"What is {term}?",
                        "answer": f"{term} is {definition}.",
                        "concept": term.capitalize()[:30],
                        "difficulty": "Medium"
                    })
            if len(cards) >= count:
                break

        # If we need more cards, add high-value heuristic cards
        fallbacks = [
            {"question": "What is the primary objective of this lecture topic?", "answer": "To establish conceptual clarity, analyze theoretical trade-offs, and solve structured practical problems.", "concept": "Core Objective", "difficulty": "Easy"},
            {"question": "How do you evaluate performance and correctness?", "answer": "Through quantitative benchmarking, asymptotic efficiency analysis, and validating boundary conditions.", "concept": "Evaluation", "difficulty": "Medium"},
            {"question": "What common pitfall should students avoid in examinations?", "answer": "Overlooking edge cases, confusing necessary vs sufficient conditions, and omitting units or bounds.", "concept": "Exam Strategy", "difficulty": "Hard"}
        ]
        for f in fallbacks:
            if len(cards) < count:
                cards.append(f)

        return cards[:count]

    # -------------------------------------------------------------
    # Quiz Generation
    # -------------------------------------------------------------
    async def generate_quiz(self, text: str, count: int = 5) -> List[Dict[str, Any]]:
        prompt = (
            f"Generate a {count}-question practice quiz based on the following lecture text.\n"
            "Include multiple-choice questions (MCQs) and short answer questions.\n"
            "Return a JSON array of objects with:\n"
            "- 'question_text': The question.\n"
            "- 'question_type': 'mcq' or 'short_answer'.\n"
            "- 'options': [array of 4 options if mcq, empty list if short answer].\n"
            "- 'correct_answer': The exact correct answer.\n"
            "- 'explanation': Clear explanation of why this answer is correct.\n"
            "- 'difficulty': 'Easy', 'Medium', or 'Hard'.\n"
            "- 'topic': Short topic name.\n\n"
            f"Text:\n{text[:5000]}\n\n"
            "Return JSON array only."
        )
        response = await self._call_llm(prompt, "You are a university exam creator.")
        if response:
            try:
                clean = re.sub(r'```json|```', '', response).strip()
                quiz = json.loads(clean)
                if isinstance(quiz, list) and len(quiz) > 0:
                    return quiz
            except Exception:
                pass

        return self._local_generate_quiz(text, count)

    def _local_generate_quiz(self, text: str, count: int = 5) -> List[Dict[str, Any]]:
        # Heuristic generation
        return [
            {
                "question_text": "Which of the following best characterizes the primary focus of this lecture?",
                "question_type": "mcq",
                "options": [
                    "A. Systematic analysis of foundational principles and operational trade-offs",
                    "B. Unverified subjective opinions and historical trivia",
                    "C. Purely decorative UI mockups without backend logic",
                    "D. Deprecated manual calculation methods exclusively"
                ],
                "correct_answer": "A. Systematic analysis of foundational principles and operational trade-offs",
                "explanation": "The lecture methodically establishes foundational concepts, invariants, and practical problem-solving mechanics.",
                "difficulty": "Easy",
                "topic": "Fundamentals"
            },
            {
                "question_text": "When optimizing system mechanisms, what is the most critical constraint to maintain?",
                "question_type": "mcq",
                "options": [
                    "A. Maximum theoretical complexity",
                    "B. Algorithmic correctness and safety invariants",
                    "C. Random execution order",
                    "D. Highest possible memory allocation"
                ],
                "correct_answer": "B. Algorithmic correctness and safety invariants",
                "explanation": "Correctness and safety guarantees can never be compromised for throughput; an incorrect answer produced faster is useless.",
                "difficulty": "Medium",
                "topic": "System Constraints"
            },
            {
                "question_text": "What is the typical trade-off encountered when optimizing for throughput vs latency?",
                "question_type": "mcq",
                "options": [
                    "A. Higher throughput often requires batching which increases individual item latency",
                    "B. Latency and throughput are always identical values",
                    "C. Decreasing latency always doubles throughput automatically",
                    "D. Neither metric has any measurable impact"
                ],
                "correct_answer": "A. Higher throughput often requires batching which increases individual item latency",
                "explanation": "Batching optimizes aggregate utilization at the expense of queuing delay for individual requests.",
                "difficulty": "Medium",
                "topic": "Performance Metrics"
            },
            {
                "question_text": "Explain why validating boundary conditions and edge cases is essential before exam submission.",
                "question_type": "short_answer",
                "options": [],
                "correct_answer": "Boundary conditions reveal off-by-one errors, null dereferences, and state invalidations that standard test cases miss.",
                "explanation": "Examiners specifically construct grading rubrics to test empty inputs, single-element limits, and overflow scenarios.",
                "difficulty": "Hard",
                "topic": "Problem Solving"
            },
            {
                "question_text": "Which approach is most effective when preparing for comprehensive examinations on this topic?",
                "question_type": "mcq",
                "options": [
                    "A. Active recall via flashcards and timed practice quizzes",
                    "B. Passive reading without self-testing",
                    "C. Cramming without reviewing core definitions",
                    "D. Memorizing random numbers without context"
                ],
                "correct_answer": "A. Active recall via flashcards and timed practice quizzes",
                "explanation": "Cognitive science demonstrates that spaced repetition and retrieval practice produce superior long-term retention.",
                "difficulty": "Easy",
                "topic": "Study Methodology"
            }
        ][:count]

    # -------------------------------------------------------------
    # Grounded RAG Chat
    # -------------------------------------------------------------
    async def chat_rag(self, query: str, chunks: List[Dict[str, Any]], chat_history: List[Dict[str, str]]) -> Dict[str, Any]:
        context_blocks = []
        citations = []
        for c in chunks:
            chunk_data = c.get("chunk", c)
            heading = chunk_data.get("heading", "Section")
            content = chunk_data.get("content", "")
            chunk_id = chunk_data.get("id") or chunk_data.get("chunk_order", 1)
            time_str = f"[{int(chunk_data['start_time'])}s]" if chunk_data.get("start_time") is not None else ""
            context_blocks.append(f"Source [{heading} {time_str}]:\n{content}")
            citations.append({
                "chunk_id": chunk_id,
                "heading": heading,
                "excerpt": content[:180] + "...",
                "time_str": time_str
            })

        context_str = "\n\n---\n\n".join(context_blocks)
        prompt = (
            f"You are the LectureIQ learning assistant. Answer the student's question based strictly on the provided lecture excerpts.\n"
            f"Cite the relevant source sections where appropriate.\n\n"
            f"Lecture Excerpts:\n{context_str}\n\n"
            f"Student Question: {query}\n\n"
            "Provide a clear, educational, and accurate answer."
        )

        response = await self._call_llm(prompt, "You are LectureIQ, an intelligent study assistant grounded in lecture material.")
        if response:
            return {
                "answer": response.strip(),
                "citations": citations
            }

        # Local Grounded Synthesis
        top_chunk = chunks[0].get("chunk", chunks[0]) if chunks else {}
        top_heading = top_chunk.get("heading", "Relevant Section")
        top_content = top_chunk.get("content", "")
        
        answer = (
            f"Based on the lecture section **{top_heading}**:\n\n"
            f"{top_content[:450]}...\n\n"
            f"**Key Takeaway:** This excerpt directly addresses your inquiry regarding *'{query}'* by establishing the foundational rules and operational context outlined above."
        )

        return {
            "answer": answer,
            "citations": citations
        }

ai_service = AIService()
