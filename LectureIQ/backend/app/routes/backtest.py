from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.backtest_service import backtest_service

router = APIRouter(prefix="/backtest", tags=["AI Backtesting & Evaluation"])

@router.get("/run")
def run_backtest_suite(db: Session = Depends(get_db)):
    """Executes full automated backtesting suite: Precision@K, Recall@K, Latency, and Exam simulation."""
    return backtest_service.run_full_suite(db)

@router.get("/retrieval")
def run_retrieval_test(db: Session = Depends(get_db)):
    """Runs retrieval Precision@K and MRR benchmark."""
    return backtest_service.run_retrieval_benchmark(db)

@router.get("/latency")
def run_latency_benchmark():
    """Runs latency and throughput profiler."""
    return backtest_service.run_latency_profile()

@router.get("/exam-simulation")
def run_exam_simulation(db: Session = Depends(get_db)):
    """Runs predictive student knowledge backtest."""
    return backtest_service.run_student_exam_simulation(db)
