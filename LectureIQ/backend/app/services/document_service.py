import re
from typing import List, Dict, Any
from pathlib import Path
from pypdf import PdfReader

class DocumentService:
    @staticmethod
    def extract_text_from_pdf(file_path: Path) -> Dict[str, Any]:
        """Extracts text and page-wise segments from a PDF file."""
        reader = PdfReader(str(file_path))
        page_count = len(reader.pages)
        full_text = []
        pages_content = []

        for idx, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            text = text.strip()
            if text:
                pages_content.append({"page": idx + 1, "text": text})
                full_text.append(f"[Page {idx + 1}]\n{text}")

        joined_text = "\n\n".join(full_text)
        return {
            "text": joined_text,
            "page_count": page_count,
            "pages": pages_content
        }

    @staticmethod
    def extract_text_from_txt(file_path: Path) -> Dict[str, Any]:
        """Extracts text from a plain text or markdown file."""
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
        return {
            "text": text,
            "page_count": max(1, len(text) // 2500),
            "pages": [{"page": 1, "text": text}]
        }

    @staticmethod
    def chunk_content(text: str, chunk_size: int = 1200, overlap: int = 200) -> List[Dict[str, Any]]:
        """
        Intelligently divides text into semantically coherent chunks based on
        sections, headers, or token bounds with overlap.
        """
        # Split by potential headings or double newlines
        paragraphs = re.split(r'\n{2,}', text)
        chunks = []
        current_chunk = []
        current_len = 0
        chunk_order = 0
        current_heading = "Introduction"

        for p in paragraphs:
            p = p.strip()
            if not p:
                continue

            # Detect heading lines (e.g. # Header, Topic 1:, Section 2)
            if re.match(r'^(#{1,4}\s|Topic\s|Chapter\s|Section\s|[0-9]+\.\s|[A-Z\s]{4,}:)', p):
                heading_cand = p.split('\n')[0].replace('#', '').strip()[:80]
                if heading_cand:
                    current_heading = heading_cand

            p_len = len(p)
            if current_len + p_len > chunk_size and current_chunk:
                chunk_text = "\n\n".join(current_chunk)
                chunks.append({
                    "chunk_order": chunk_order,
                    "heading": current_heading,
                    "content": chunk_text
                })
                chunk_order += 1
                # Keep some overlap
                current_chunk = [current_chunk[-1], p] if len(current_chunk) > 1 else [p]
                current_len = sum(len(x) for x in current_chunk)
            else:
                current_chunk.append(p)
                current_len += p_len

        if current_chunk:
            chunks.append({
                "chunk_order": chunk_order,
                "heading": current_heading,
                "content": "\n\n".join(current_chunk)
            })

        return chunks

document_service = DocumentService()
