import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["app"] == "LectureIQ"

def test_sample_seed_and_listing():
    # Trigger sample seed
    seed_res = client.post("/api/lectures/sample-seed")
    assert seed_res.status_code == 200
    
    # Check lectures list
    list_res = client.get("/api/lectures/")
    assert list_res.status_code == 200
    lectures = list_res.json()
    assert len(lectures) >= 3

    # Check first lecture
    first_id = lectures[0]["id"]
    detail_res = client.get(f"/api/lectures/{first_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert "title" in detail
    assert "executive_summary" in detail
    assert len(detail["flashcards"]) > 0
    assert len(detail["quizzes"]) > 0

def test_dashboard_metrics():
    dash_res = client.get("/api/lectures/dashboard")
    assert dash_res.status_code == 200
    stats = dash_res.json()
    assert "total_lectures" in stats
    assert stats["total_lectures"] >= 3
    assert "total_flashcards" in stats
    assert "total_quizzes" in stats

def test_global_search():
    res = client.get("/api/search?query=neural")
    assert res.status_code == 200
    data = res.json()
    assert "results" in data

def test_settings_api():
    get_res = client.get("/api/settings/")
    assert get_res.status_code == 200
    settings_data = get_res.json()
    assert "ai_provider" in settings_data

def test_backtest_endpoints():
    res = client.get("/api/backtest/run")
    assert res.status_code == 200
    data = res.json()
    assert "retrieval_benchmark" in data
    assert "latency_profile" in data
    assert "exam_simulation" in data
    assert data["retrieval_benchmark"]["precision_at_3_pct"] > 0
    assert data["latency_profile"]["vector_retrieval_ms"] >= 0
