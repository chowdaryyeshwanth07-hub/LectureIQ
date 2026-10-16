import asyncio
from app.services.document_service import document_service
from app.services.vector_search import vector_search_service
from app.services.ai_service import ai_service
from app.services.export_service import export_service

def test_document_chunking():
    sample_text = (
        "# Introduction to Algorithms\n\n"
        "An algorithm is a well-defined computational procedure that takes some value as input "
        "and produces some value as output. Sorting is a fundamental algorithmic problem.\n\n"
        "## Merge Sort\n\n"
        "Merge Sort is a divide-and-conquer algorithm that divides the input array into two halves, "
        "calls itself for the two halves, and then merges the two sorted halves in O(n log n) time."
    )
    chunks = document_service.chunk_content(sample_text, chunk_size=200, overlap=50)
    assert len(chunks) >= 1
    assert any("Merge Sort" in c["heading"] or "Introduction" in c["heading"] for c in chunks)

def test_vector_search():
    chunks = [
        {"id": 1, "heading": "Machine Learning", "content": "Neural networks use backpropagation and gradient descent to update weights."},
        {"id": 2, "heading": "Microeconomics", "content": "Supply and demand determine equilibrium prices in competitive markets."},
        {"id": 3, "heading": "Operating Systems", "content": "Semaphores and mutexes prevent race conditions in concurrent processes."}
    ]
    matches = vector_search_service.search_chunks("gradient descent", chunks, top_k=1)
    assert len(matches) > 0
    assert matches[0]["chunk"]["heading"] == "Machine Learning"

def test_ai_summary_generation():
    text = (
        "Operating systems manage hardware resources. Concurrency is essential for high throughput. "
        "Deadlocks happen when processes circularly wait on locks held by each other."
    )
    summary = asyncio.run(ai_service.generate_summary(text, "Operating Systems"))
    assert "executive_summary" in summary
    assert "key_takeaways" in summary
    assert len(summary["key_takeaways"]) > 0

def test_flashcard_and_quiz_generation():
    text = "Photosynthesis is the process by which green plants transform light energy into chemical energy."
    cards = asyncio.run(ai_service.generate_flashcards(text, count=2))
    assert len(cards) >= 1
    assert "question" in cards[0]
    assert "answer" in cards[0]

    quiz = asyncio.run(ai_service.generate_quiz(text, count=2))
    assert len(quiz) >= 1
    assert "question_text" in quiz[0]
    assert "correct_answer" in quiz[0]

def test_export_service():
    lecture_data = {
        "title": "Quantum Mechanics",
        "subject": "Physics",
        "executive_summary": "Intro to wave functions.",
        "key_takeaways": ["Wave-particle duality", "Schrodinger equation"],
        "smart_notes": "Notes on eigenvalues.",
        "flashcards": [{"question": "What is h-bar?", "answer": "Reduced Planck constant."}],
        "quizzes": [{"question_text": "Is photon a wave?", "options": ["Yes", "No"], "correct_answer": "Yes"}]
    }
    md = export_service.to_markdown(lecture_data)
    assert "Quantum Mechanics" in md
    assert "Reduced Planck constant" in md
