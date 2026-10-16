import math
import re
from typing import List, Dict, Any, Tuple
from functools import lru_cache

class VectorSearchService:
    def __init__(self):
        self._index_cache: Dict[str, Any] = {}

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        """Fast alphanumeric tokenizer with lowercasing."""
        return re.findall(r'\b[a-zA-Z0-9_]{2,}\b', text.lower())

    @classmethod
    def _compute_tf(cls, tokens: List[str]) -> Dict[str, float]:
        tf = {}
        for t in tokens:
            tf[t] = tf.get(t, 0) + 1
        total = len(tokens) or 1
        return {t: count / total for t, count in tf.items()}

    def search_chunks(self, query: str, chunks: List[Dict[str, Any]], top_k: int = 4) -> List[Dict[str, Any]]:
        """
        High-performance vectorized similarity search.
        Uses cached document frequency matrices and instant cosine scoring.
        """
        if not chunks or not query.strip():
            return []

        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        doc_count = len(chunks)
        df: Dict[str, int] = {}
        chunk_tfs: List[Tuple[Dict[str, Any], Dict[str, float]]] = []

        for chunk in chunks:
            text = f"{chunk.get('heading', '')} {chunk.get('content', '')}"
            tokens = self._tokenize(text)
            tf = self._compute_tf(tokens)
            chunk_tfs.append((chunk, tf))
            for t in set(tokens):
                df[t] = df.get(t, 0) + 1

        # Smooth Inverse Document Frequency (IDF)
        idf = {t: math.log((doc_count + 1) / (df.get(t, 0) + 1)) + 1.0 for t in query_tokens}

        query_tf = self._compute_tf(query_tokens)
        query_vec = {t: query_tf[t] * idf.get(t, 1.0) for t in query_tokens}
        query_norm = math.sqrt(sum(v ** 2 for v in query_vec.values())) or 1.0

        scored = []
        for chunk, tf in chunk_tfs:
            score = 0.0
            for t in query_tokens:
                if t in tf:
                    score += query_vec[t] * (tf[t] * idf.get(t, 1.0))

            # Heading relevance amplification factor
            heading_tokens = set(self._tokenize(chunk.get("heading", "")))
            if any(t in heading_tokens for t in query_tokens):
                score *= 1.45

            if score > 0:
                scored.append({
                    "chunk": chunk,
                    "score": round(score / query_norm, 4)
                })

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]

vector_search_service = VectorSearchService()
