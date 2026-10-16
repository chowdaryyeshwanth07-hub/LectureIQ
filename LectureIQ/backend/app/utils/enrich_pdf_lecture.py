import sqlite3
import json

def enrich():
    conn = sqlite3.connect('lectures.db')
    cur = conn.cursor()

    exec_summary = (
        "This lecture covers fundamental string matching algorithms, with an in-depth mathematical focus on "
        "Knuth-Morris-Pratt (KMP) and the Rabin-Karp algorithm. While KMP utilizes a deterministic prefix failure function "
        "(pi) to skip unnecessary character comparisons after mismatches without hash collisions, Rabin-Karp leverages "
        "a rolling-hash formula over a prime modulus (q) to compare pattern hashes against sliding text windows. "
        "The material analyzes radix multiplier calculation h = d^(m-1) mod q, rolling hash transitions, "
        "spurious hits (hash collisions where hash values match but actual strings differ), and character-level verification."
    )

    takeaways = json.dumps([
        "KMP avoids redundant character comparisons using a precomputed prefix failure function pi[q].",
        "Rabin-Karp computes a rolling numerical hash of sliding text windows using base d and prime modulus q.",
        "The highest-place multiplier h = d^(m-1) mod q removes the leftmost digit contribution during window slides.",
        "Rolling hash update formula: t_(s+1) = (d * (t_s - T[s+1]*h) + T[s+m+1]) mod q computes the next window in O(1) time.",
        "Hash collisions (spurious hits) occur when different strings produce identical hash residues; explicit character verification is required to verify actual matches.",
        "Average-case time complexity of Rabin-Karp is O(n + m), whereas the worst-case (with frequent collisions) is O((n - m + 1) * m)."
    ])

    smart_notes = """# 🔍 LectureIQ Smart Notes: String Matching Algorithms

## 1. Algorithmic Overview & Comparison
String matching algorithms identify occurrences of a pattern P[1..m] inside a longer text T[1..n].

| Metric / Feature | Knuth-Morris-Pratt (KMP) | Rabin-Karp Algorithm |
|---|---|---|
| **Primary Mechanism** | Prefix failure function pi | Rolling-hash function modulo prime q |
| **Mismatch Handling** | Shifts pattern using pi[q] | Slides window via O(1) rolling formula |
| **Collisions** | Zero (fully deterministic) | Possible (spurious hits require verification) |
| **Preprocessing Time** | O(m) | O(m) |
| **Matching Time (Avg)** | O(n) | O(n + m) |
| **Matching Time (Worst)** | O(n) | O((n - m + 1) * m) |

---

## 2. Rabin-Karp Mathematical Framework
Let alphabet radix be d (e.g. d = 10 for decimal digits) and modulus be a chosen prime q (e.g. q = 13).

### Key Variables:
* **n:** Length of text T
* **m:** Length of pattern P
* **d:** Radix / Base (number of characters in alphabet)
* **q:** Prime modulus (chosen large to minimize collision probability)
* **h:** Highest-place multiplier: h = d^(m-1) mod q
* **p:** Hash value of pattern P
* **t_s:** Hash value of text window beginning at shift s

---

## 3. High-Order Multiplier Derivation
To remove the leftmost digit of a window of length m:
$$h = d^{m-1} \\pmod q$$

**Example (m = 4, d = 10, q = 13):**
$$h = 10^{4-1} \\pmod{13} = 10^3 \\pmod{13} = 1000 \\pmod{13}$$
Since $1000 = 13 \\times 76 + 12$, we obtain:
$$h = 12$$

---

## 4. Rolling Hash Window Transition Formula
Computing the next window hash t_(s+1) from the current hash t_s in O(1) time:
$$t_{s+1} = \\left( d \\cdot (t_s - T[s+1] \\cdot h) + T[s+m+1] \\right) \\pmod q$$

* **Step 1:** Subtract leftmost digit contribution T[s+1] * h.
* **Step 2:** Multiply by base d (shifts remaining digits one position to the left).
* **Step 3:** Add incoming rightmost digit T[s+m+1].
* **Step 4:** Apply modulo q (add q if result is negative).

---

## 5. Walkthrough: Worked Example
* **Text:** T = 3141592653589793 (n = 16)
* **Pattern:** P = 9265 (m = 4), Radix d = 10, Prime q = 13
* **Pattern Hash:** p = 9265 mod 13 = 9

### Window Sliding Trace:
1. **Shift s=0 (Window `3141`):** t_0 = 3141 mod 13 = 8 != 9 (No match)
2. **Shift s=5 (Window `9265`):** t_5 = 9265 mod 13 = 9 == p -> **Actual Match!** (Starting index 6 in 1-based indexing)
3. **Shift s=7 (Window `6535`):** t_7 = 6535 mod 13 = 9 == p -> **Spurious Hit (Hash Collision)!** Direct comparison confirms `6535 != 9265`.
4. **Shift s=11 (Window `8979`):** t_11 = 8979 mod 13 = 9 == p -> **Spurious Hit!** (`8979 != 9265`).

---

## 6. Exam Checklist & Common Pitfalls
- [x] Know why prime modulus q is chosen (reduces hash collision probability).
- [x] Be prepared to calculate h = d^(m-1) mod q by hand for given m, d, q.
- [x] Always verify characters when t_s == p to eliminate spurious hits.
- [x] Remember KMP prefix function pi[q] represents the length of the longest proper prefix that is also a suffix.
"""

    cur.execute('UPDATE lectures SET executive_summary = ?, key_takeaways = ?, smart_notes = ? WHERE id = 4', (exec_summary, takeaways, smart_notes))

    # Flashcards
    cur.execute('DELETE FROM flashcards WHERE lecture_id = 4')
    cards = [
        ('What is the primary difference between KMP and Rabin-Karp algorithms?', 'KMP uses a deterministic prefix failure function (pi) without collisions, while Rabin-Karp compares rolling hash values modulo a prime q.', 'Algorithm Comparison', 'Medium'),
        ('How is the highest-place multiplier h computed in Rabin-Karp?', 'h = d^(m-1) mod q, where d is radix, m is pattern length, and q is prime modulus. It represents the leftmost digit contribution.', 'Rabin-Karp Parameters', 'Medium'),
        ('What is a spurious hit (hash collision) in Rabin-Karp?', 'When a text window produces the same hash value as the pattern (ts == p), but actual character verification reveals they are different.', 'Collisions & Verification', 'Easy'),
        ('What is the rolling hash formula to compute t_(s+1) from t_s in O(1) time?', 't_(s+1) = (d * (t_s - T[s+1]*h) + T[s+m+1]) mod q.', 'Rolling Hash Formula', 'Hard'),
        ('What is the worst-case time complexity of Rabin-Karp and when does it occur?', 'O((n - m + 1) * m). It occurs when almost every text window produces a hash collision, forcing full character-by-character verification.', 'Complexity Analysis', 'Hard')
    ]
    for q, a, c, d in cards:
        cur.execute('INSERT INTO flashcards (lecture_id, question, answer, concept, difficulty, mastery_status, review_count) VALUES (4, ?, ?, ?, ?, ?, ?)', (q, a, c, d, 'learning', 0))

    # Quizzes
    cur.execute('DELETE FROM quiz_questions WHERE lecture_id = 4')
    quizzes = [
        (
            'For pattern length m = 4, base d = 10, and modulus q = 13, what is the value of multiplier h?',
            'mcq',
            json.dumps(['A. 12', 'B. 9', 'C. 1', 'D. 10']),
            'A. 12',
            'h = 10^(4-1) mod 13 = 1000 mod 13. Since 1000 = 13 * 76 + 12, h = 12.',
            'Medium',
            'Rabin-Karp Multiplier'
        ),
        (
            'In the worked example with pattern P = 9265 (hash p = 9), which shift produces a spurious hit (hash collision)?',
            'mcq',
            json.dumps(['A. Shift s = 7 (Window 6535)', 'B. Shift s = 5 (Window 9265)', 'C. Shift s = 0 (Window 3141)', 'D. Shift s = 2 (Window 4159)']),
            'A. Shift s = 7 (Window 6535)',
            'At shift s = 7, window 6535 has hash 6535 mod 13 = 9. Even though hashes match, 6535 != 9265, so it is a spurious hit.',
            'Easy',
            'Hash Collisions'
        ),
        (
            'Why does Knuth-Morris-Pratt (KMP) avoid spurious hits entirely compared to Rabin-Karp?',
            'mcq',
            json.dumps(['A. It uses exact character prefix matching via table pi instead of lossy modular hashing', 'B. It only works on binary alphabets', 'C. It sorts the text prior to searching', 'D. It runs on GPU threads exclusively']),
            'A. It uses exact character prefix matching via table pi instead of lossy modular hashing',
            'KMP precomputes the prefix failure function pi[q] deterministically, guaranteeing zero false positive collisions.',
            'Medium',
            'Algorithm Comparison'
        ),
        (
            'What is the purpose of the highest-place multiplier h when sliding the text window in Rabin-Karp?',
            'mcq',
            json.dumps(['A. It removes the leftmost character value from the window hash', 'B. It encrypts the pattern', 'C. It divides the pattern length in half', 'D. It sorts the characters alphabetically']),
            'A. It removes the leftmost character value from the window hash',
            'Multiplying the leftmost digit by h calculates its exact modular contribution to subtract it when advancing the window.',
            'Medium',
            'Rolling Hash Mechanics'
        )
    ]
    for qt, qtp, opts, ca, exp, diff, top in quizzes:
        cur.execute('INSERT INTO quiz_questions (lecture_id, question_text, question_type, options, correct_answer, explanation, difficulty, topic) VALUES (4, ?, ?, ?, ?, ?, ?, ?)', (qt, qtp, opts, ca, exp, diff, top))

    conn.commit()
    conn.close()
    print("SUCCESS: Enriched Lecture 4 'String Matching Algorithms'!")

if __name__ == '__main__':
    enrich()
