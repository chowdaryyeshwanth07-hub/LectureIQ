import json
from typing import List, Dict, Any

DEMO_LECTURES: List[Dict[str, Any]] = [
    {
        "title": "Introduction to Machine Learning & Neural Networks",
        "subject": "Artificial Intelligence & Data Science",
        "source_type": "audio",
        "duration_seconds": 1820.0,
        "page_count": 24,
        "executive_summary": (
            "This foundational lecture introduces the mathematical paradigms of machine learning, contrasting "
            "supervised, unsupervised, and reinforcement learning frameworks. It explores gradient descent optimization, "
            "loss surface dynamics, and the biological intuition behind multi-layer perceptrons (MLPs). The session "
            "demonstrates how activation functions introduce non-linearity, enabling deep neural networks to approximate "
            "arbitrary continuous functions (Universal Approximation Theorem), while analyzing regularization strategies "
            "like Dropout and L2 weight decay to combat overfitting."
        ),
        "key_takeaways": json.dumps([
            "Supervised learning optimizes a mapping function f: X -> Y using labeled ground truth datasets.",
            "Gradient descent iteratively updates model weights theta := theta - alpha * grad(J(theta)) along the steepest negative gradient.",
            "Non-linear activation functions (ReLU, GELU, Sigmoid) are mathematically essential for multi-layer representation power.",
            "Overfitting occurs when model capacity exceeds sample diversity; mitigate via Dropout, data augmentation, and L2 regularization.",
            "The bias-variance tradeoff is fundamental: high bias leads to underfitting, while high variance leads to overfitting."
        ]),
        "smart_notes": """# 🧠 LectureIQ Smart Notes: Machine Learning & Neural Networks

## 1. Learning Paradigms & Problem Formulations
* **Supervised Learning:** Feature vectors $X \in \mathbb{R}^d$ mapped to labels $Y$. Includes Linear Regression, Logistic Classification, and Deep MLPs.
* **Unsupervised Learning:** Discover hidden latent distributions without labels (K-Means, PCA, Autoencoders).
* **Reinforcement Learning:** Agents maximize cumulative reward signals through environment exploration ($Q$-learning, Policy Gradients).

---

## 2. Mathematical Optimization: Gradient Descent
The empirical risk minimization objective is expressed as:
$$J(\theta) = \frac{1}{N} \sum_{i=1}^N \mathcal{L}(f(x_i; \theta), y_i)$$

Weight update rule with learning rate $\alpha$:
$$\theta_{t+1} = \theta_t - \alpha \nabla_\theta J(\theta_t)$$

* **Stochastic Gradient Descent (SGD):** High variance updates on mini-batches, escaping local saddles.
* **Adaptive Optimizers (Adam, RMSProp):** Compute first and second moment running averages to scale parameter-specific steps.

---

## 3. Neural Network Architectures & Non-Linearity
* **Forward Propagation:** $z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}$, followed by $a^{[l]} = \sigma(z^{[l]})$.
* **Rectified Linear Unit (ReLU):** $\text{ReLU}(z) = \max(0, z)$. Resolves vanishing gradient problems prevalent in Sigmoid/Tanh.
* **Backpropagation:** Recursive chain-rule evaluation calculating $\frac{\partial \mathcal{L}}{\partial W^{[l]}}$.

---

## 4. Regularization & Generalization
1. **L2 Weight Decay:** Adds penalty $\frac{\lambda}{2} \|\theta\|_2^2$ to discourage large weights.
2. **Dropout:** Randomly deactivates neurons during training with probability $p$, forcing distributed representations.
3. **Early Stopping:** Monitors validation error and checkpoints weights when validation loss starts ascending.

---

## 5. Exam Review Questions & Key Invariants
- [x] Prove why stacking linear layers without activations collapses into a single linear matrix transformation.
- [x] Contrast L1 (Lasso) sparsity inducements with L2 (Ridge) shrinkage.
- [x] Calculate output dimensions of convolutional layers: $\lfloor \frac{W - K + 2P}{S} \rfloor + 1$.
""",
        "segments": [
            {"start_time": 0.0, "end_time": 60.0, "speaker": "Prof. Turing", "text": "Good morning class. Today we demystify how machine learning algorithms learn representations from empirical data."},
            {"start_time": 60.0, "end_time": 180.0, "speaker": "Prof. Turing", "text": "At its heart, supervised learning searches for a hypothesis function that minimizes empirical loss across our training samples."},
            {"start_time": 180.0, "end_time": 320.0, "speaker": "Prof. Turing", "text": "Let us examine gradient descent. Imagine standing on a misty mountain slope; you take steps in the direction of steepest descent."},
            {"start_time": 320.0, "end_time": 480.0, "speaker": "Prof. Turing", "text": "Why do neural networks need activation functions? Because composing linear operations always yields another linear operation, regardless of network depth."},
            {"start_time": 480.0, "end_time": 660.0, "speaker": "Prof. Turing", "text": "ReLU became the standard because its derivative is constant for positive inputs, preventing gradients from vanishing into numerical zero."},
            {"start_time": 660.0, "end_time": 820.0, "speaker": "Prof. Turing", "text": "Finally, remember the bias-variance tradeoff. Complex architectures risk memorizing noise unless controlled by Dropout or weight penalties."}
        ],
        "chunks": [
            {"chunk_order": 0, "heading": "Supervised Learning Fundamentals", "content": "Supervised learning algorithms infer a mapping function from input features X to targets Y using labeled examples. Loss functions such as Mean Squared Error (MSE) for regression and Cross-Entropy for classification quantify discrepancy between predictions and reality.", "start_time": 0.0, "end_time": 180.0},
            {"chunk_order": 1, "heading": "Gradient Descent and Backpropagation", "content": "Gradient descent computes the gradient of the loss function with respect to every weight parameter. Backpropagation utilizes the differential chain rule to propagate error gradients from the output layer back toward the input layer.", "start_time": 180.0, "end_time": 400.0},
            {"chunk_order": 2, "heading": "Activation Functions and Non-Linearity", "content": "Without non-linear activations like ReLU, Leaky ReLU, or GELU, a multi-layer deep neural network simplifies algebraically to a single affine transformation, eliminating its ability to model complex curves or manifold topologies.", "start_time": 400.0, "end_time": 600.0},
            {"chunk_order": 3, "heading": "Regularization and Overfitting", "content": "Overfitting happens when a model fits training noise instead of generalized underlying patterns. Standard remedies include L2 regularization (weight decay), Dropout layers, early stopping, and dataset expansion.", "start_time": 600.0, "end_time": 820.0}
        ],
        "flashcards": [
            {"question": "What is the primary role of an activation function in a neural network?", "answer": "It introduces non-linearity, enabling the network to learn and approximate complex non-linear functions.", "concept": "Activation Functions", "difficulty": "Easy", "mastery_status": "mastered"},
            {"question": "How does Gradient Descent update model parameters?", "answer": "It updates parameters in the direction of the negative gradient of the loss function: theta := theta - alpha * grad(J).", "concept": "Optimization", "difficulty": "Medium", "mastery_status": "reviewing"},
            {"question": "What mathematical problem does the ReLU activation solve compared to Sigmoid?", "answer": "It prevents the vanishing gradient problem for positive activations because its derivative is constant (1.0).", "concept": "Backpropagation", "difficulty": "Medium", "mastery_status": "learning"},
            {"question": "Explain the difference between L1 and L2 regularization.", "answer": "L1 (Lasso) penalizes absolute weights and induces sparsity; L2 (Ridge) penalizes squared weights and shrinks them smoothly toward zero.", "concept": "Regularization", "difficulty": "Hard", "mastery_status": "learning"},
            {"question": "What is the Bias-Variance tradeoff?", "answer": "High bias leads to systematic underfitting; high variance leads to sensitive overfitting. Optimal models minimize their sum.", "concept": "Model Evaluation", "difficulty": "Medium", "mastery_status": "mastered"}
        ],
        "quizzes": [
            {
                "question_text": "What happens if a 10-layer neural network uses only linear activation functions?",
                "question_type": "mcq",
                "options": json.dumps([
                    "A. It collapses mathematically into a single linear regression model",
                    "B. It becomes immune to overfitting",
                    "C. It computes polynomial approximations",
                    "D. Its training speed approaches infinity"
                ]),
                "correct_answer": "A. It collapses mathematically into a single linear regression model",
                "explanation": "Matrix multiplication is associative; composing ten linear mappings W_10 * ... * W_1 * X is mathematically identical to a single weight matrix W_eff * X.",
                "difficulty": "Medium",
                "topic": "Neural Network Theory"
            },
            {
                "question_text": "Which regularization technique deactivates a random subset of neurons during forward propagation?",
                "question_type": "mcq",
                "options": json.dumps([
                    "A. Batch Normalization",
                    "B. Dropout",
                    "C. Gradient Clipping",
                    "D. Data Imputation"
                ]),
                "correct_answer": "B. Dropout",
                "explanation": "Dropout randomly sets activations to zero during training with probability p, preventing co-adaptation of features.",
                "difficulty": "Easy",
                "topic": "Regularization"
            },
            {
                "question_text": "Which optimization algorithm maintains both exponential moving averages of gradients and squared gradients?",
                "question_type": "mcq",
                "options": json.dumps([
                    "A. Stochastic Gradient Descent without momentum",
                    "B. Adam (Adaptive Moment Estimation)",
                    "C. Genetic Annealing",
                    "D. Newton-Raphson Method"
                ]),
                "correct_answer": "B. Adam (Adaptive Moment Estimation)",
                "explanation": "Adam computes running estimates of both the first moment (mean) and second raw moment (uncentered variance) of the gradients.",
                "difficulty": "Hard",
                "topic": "Optimization"
            }
        ]
    },
    {
        "title": "Operating Systems: Concurrency, Deadlocks & Synchronization",
        "subject": "Computer Systems & Architecture",
        "source_type": "pdf",
        "duration_seconds": 1600.0,
        "page_count": 32,
        "executive_summary": (
            "This lecture covers the fundamental mechanics of operating system concurrency, thread synchronization, "
            "and race conditions. It details critical section management using hardware primitives (Test-and-Set, Compare-and-Swap) "
            "and software abstractions like Mutexes, Counting Semaphores, and Condition Variables. Furthermore, the session analyzes "
            "the four Coffman conditions necessary for deadlock formation and examines Dijkstra's Banker's Algorithm for deadlock avoidance."
        ),
        "key_takeaways": json.dumps([
            "Race conditions occur when unsynchronized threads concurrently access shared mutable memory with at least one write.",
            "A correct critical section solution must guarantee Mutual Exclusion, Progress, and Bounded Waiting.",
            "Deadlocks require all 4 Coffman conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.",
            "Dijkstra's Banker's Algorithm ensures the system never enters an unsafe state where deadlock could become inevitable.",
            "Atomic instructions (Compare-and-Swap) provide lock-free synchronization primitives in modern multi-core processors."
        ]),
        "smart_notes": """# 🖥️ LectureIQ Smart Notes: Concurrency & Synchronization

## 1. Concurrency vs Parallelism
* **Concurrency:** Managing multiple tasks simultaneously through interleaving execution contexts.
* **Parallelism:** Physically executing distinct instructions on multiple CPU cores at the exact same physical clock cycle.

---

## 2. The Critical Section Problem
To preserve state consistency, critical sections must satisfy three criteria:
1. **Mutual Exclusion:** If process $P_i$ is executing in its critical section, no other processes can be in theirs.
2. **Progress:** If no process is executing and some wish to enter, selection cannot be postponed indefinitely.
3. **Bounded Waiting:** A bound exists on how many times others can enter before a requesting process is granted access.

---

## 3. Synchronization Primitives
* **Mutex (Mutual Exclusion Lock):** Binary state lock (`acquire()` / `release()`).
* **Counting Semaphore:** Integer counter $S$. `wait(S)` decrements; `signal(S)` increments.
* **Condition Variables:** Allow threads to sleep (`wait()`) until signaled (`signal()` / `broadcast()`) when a condition predicate holds true.

---

## 4. The Four Coffman Deadlock Conditions
A deadlock can occur if and only if **all four** conditions hold simultaneously:
1. **Mutual Exclusion:** Resources cannot be shared simultaneously.
2. **Hold and Wait:** Processes currently holding allocated resources can request additional ones.
3. **No Preemption:** Resources can only be released voluntarily by the holding thread.
4. **Circular Wait:** A closed chain of threads $\{P_0, P_1, \dots, P_n\}$ exists where $P_0$ waits for $P_1$, and $P_n$ waits for $P_0$.

*Remedy:* Break any one condition (e.g. enforce total global lock acquisition ordering to eliminate Circular Wait).
""",
        "segments": [],
        "chunks": [
            {"chunk_order": 0, "heading": "Race Conditions and Critical Sections", "content": "A race condition arises when multiple threads manipulate shared data concurrently and the outcome depends on the non-deterministic scheduling order. The critical section is the code segment accessing this shared state.", "start_time": 0.0, "end_time": 300.0},
            {"chunk_order": 1, "heading": "Semaphores and Mutex Primitives", "content": "Dijkstra introduced Semaphores with atomic P and V operations (now wait and signal). A mutex is essentially a binary semaphore with strict thread ownership requirements.", "start_time": 300.0, "end_time": 600.0},
            {"chunk_order": 2, "heading": "Coffman Conditions and Deadlocks", "content": "Deadlock is a state where every process in a set is waiting for an event that can only be caused by another process in that same set. The 4 Coffman conditions are Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait.", "start_time": 600.0, "end_time": 900.0}
        ],
        "flashcards": [
            {"question": "What three criteria define a valid critical section solution?", "answer": "Mutual Exclusion, Progress, and Bounded Waiting.", "concept": "Critical Section", "difficulty": "Medium", "mastery_status": "mastered"},
            {"question": "List the four Coffman conditions required for deadlock.", "answer": "1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait.", "concept": "Deadlocks", "difficulty": "Hard", "mastery_status": "reviewing"},
            {"question": "How can Circular Wait be prevented in practice?", "answer": "By imposing a strict linear ordering on all resource acquisitions and requiring processes to request resources in ascending order.", "concept": "Deadlock Prevention", "difficulty": "Medium", "mastery_status": "learning"}
        ],
        "quizzes": [
            {
                "question_text": "Which of the following breaks the Circular Wait condition for deadlock prevention?",
                "question_type": "mcq",
                "options": json.dumps([
                    "A. Enforcing a global total ordering on all lock acquisition IDs",
                    "B. Increasing thread stack size to 8MB",
                    "C. Running all threads on a single core CPU",
                    "D. Disabling interrupts permanently"
                ]),
                "correct_answer": "A. Enforcing a global total ordering on all lock acquisition IDs",
                "explanation": "If resources are numbered 1..N and processes must request them in strictly increasing order, circular dependencies become impossible.",
                "difficulty": "Medium",
                "topic": "Deadlock Prevention"
            }
        ]
    },
    {
        "title": "Microeconomics: Supply, Demand & Market Equilibrium",
        "subject": "Economics & Business Strategy",
        "source_type": "text",
        "duration_seconds": 1400.0,
        "page_count": 18,
        "executive_summary": (
            "This lecture unpacks the foundational principles of competitive markets, exploring the law of demand, "
            "the law of supply, and how price discovery resolves excess demand (shortages) and excess supply (surpluses). "
            "It rigorously examines price elasticity of demand (PED), cross-price elasticity, consumer and producer surplus, "
            "and the deadweight loss consequences of government interventions such as price ceilings, price floors, and excise taxes."
        ),
        "key_takeaways": json.dumps([
            "Market equilibrium occurs where quantity demanded equals quantity supplied (Q_d = Q_s), determining clearing price P*.",
            "Price Elasticity of Demand (PED) measures consumer price sensitivity: % change in Q_d divided by % change in Price.",
            "Inelastic goods (|PED| < 1) yield higher total revenue when price increases; elastic goods (|PED| > 1) yield lower revenue.",
            "Deadweight loss represents the net societal loss of total economic surplus caused by market distortions.",
            "Price ceilings below equilibrium cause chronic shortages, non-price rationing, and black markets."
        ]),
        "smart_notes": """# 📊 LectureIQ Smart Notes: Supply, Demand & Elasticity

## 1. The Marshallian Scissors: Supply & Demand
* **Law of Demand:** Ceteris paribus, as price increases, quantity demanded decreases ($\frac{\partial Q_d}{\partial P} < 0$).
* **Law of Supply:** Ceteris paribus, higher prices incentivize producers to supply greater quantities ($\frac{\partial Q_s}{\partial P} > 0$).
* **Equilibrium:** Market clears at $P^*$ where $Q_d(P^*) = Q_s(P^*)$.

---

## 2. Price Elasticity of Demand (PED)
Midpoint formula for arc elasticity:
$$\text{PED} = \frac{(Q_2 - Q_1) / \frac{Q_1 + Q_2}{2}}{(P_2 - P_1) / \frac{P_1 + P_2}{2}}$$

* **$|\text{PED}| > 1$ (Elastic):** Quantity responds disproportionately to price changes.
* **$|\text{PED}| < 1$ (Inelastic):** Necessities with few substitutes; revenue increases when price rises.
* **$|\text{PED}| = 1$ (Unit Elastic):** Total revenue is maximized at this point.

---

## 3. Welfare Economics: Surplus & Deadweight Loss
* **Consumer Surplus (CS):** Area below the demand curve and above market price $P^*$.
* **Producer Surplus (PS):** Area above the marginal cost / supply curve and below $P^*$.
* **Deadweight Loss (DWL):** Lost gains from trade when output deviates from the Pareto efficient competitive quantity $Q^*$.
""",
        "segments": [],
        "chunks": [
            {"chunk_order": 0, "heading": "Market Equilibrium and Clearing Price", "content": "Market equilibrium is the state in which market supply and demand balance each other, and as a result prices become stable. When quantity demanded exceeds quantity supplied, upward price pressure eliminates shortages.", "start_time": 0.0, "end_time": 250.0},
            {"chunk_order": 1, "heading": "Price Elasticity of Demand", "content": "Price elasticity of demand measures responsiveness of quantity demanded to price adjustments. If demand is inelastic, firms can increase prices to boost total revenue.", "start_time": 250.0, "end_time": 500.0}
        ],
        "flashcards": [
            {"question": "How does price change affect total revenue when demand is inelastic (|PED| < 1)?", "answer": "Total revenue moves in the same direction as price: increasing price increases total revenue.", "concept": "Elasticity & Revenue", "difficulty": "Medium", "mastery_status": "mastered"},
            {"question": "What is Deadweight Loss (DWL)?", "answer": "The loss of total economic surplus (consumer + producer surplus) caused by inefficient allocation of resources.", "concept": "Welfare Economics", "difficulty": "Medium", "mastery_status": "reviewing"}
        ],
        "quizzes": [
            {
                "question_text": "If a government imposes an effective price ceiling below equilibrium price, what is the immediate market outcome?",
                "question_type": "mcq",
                "options": json.dumps([
                    "A. Chronic persistent shortage (Quantity demanded > Quantity supplied)",
                    "B. Excessive surplus goods accumulating in warehouses",
                    "C. Unconditional Pareto efficiency",
                    "D. Producer surplus expands dramatically"
                ]),
                "correct_answer": "A. Chronic persistent shortage (Quantity demanded > Quantity supplied)",
                "explanation": "At a legally mandated below-equilibrium price, consumers demand more than suppliers are willing to produce, producing an artificial shortage.",
                "difficulty": "Easy",
                "topic": "Market Controls"
            }
        ]
    }
]
