Apply these guidelines as a high-level technical standard for all code generation. Prioritize maintainability, scalability, and clarity.

### 1. Architectural Integrity & Extensibility

- **SOLID Principles:** Strictly adhere to Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.
- **Decoupling:** Use interfaces, abstractions, or dependency injection to ensure modules are loosely coupled.
- **Extensible Design:** Write code that is "Open for Extension, Closed for Modification." Use patterns like Strategy, Factory, or Middleware to allow new features to be added with minimal changes to existing core logic.
- **Modularization:** Structure code into logical modules and directories (e.g., `/services`, `/models`, `/utils`). Avoid monolithic files.
- **Separation of Concerns:** Keep business logic, data persistence, and UI/API layers strictly isolated.

### 2. Logic & Flow Control (Anti-Spaghetti)

- **Flat Logic:** Avoid deep nesting and complex `if-else` chains. Use **Guard Clauses** and **Early Returns** to keep the execution path linear and readable.
- **Focused Functions:** Every function must do exactly one thing. Keep functions short and concise.
- **Pragmatic DRY:** Eliminate logic duplication by encapsulating shared behavior. Prioritize readability; minimal repetition is acceptable if it prevents over-abstraction or unnecessary coupling.
- **State Management:** Minimize global state. Prefer immutable data structures and pure functions where possible.

### 3. Accessibility (a11y)

- **Semantic HTML:** Use native HTML elements (e.g., `<main>`, `<nav>`, `<button>`, `<header>`) according to their purpose. Avoid using `<div>` or `<span>` for interactive or structural elements.
- **Keyboard Navigation:** Ensure all interactive elements are focusable and operable using only a keyboard (proper `tabindex`, focus states, and key event listeners).
- **ARIA Standards:** Use ARIA roles, labels, and states (`aria-label`, `aria-expanded`, etc.) to describe complex or dynamic components to assistive technologies.
- **Visual & Media Inclusion:** Provide descriptive `alt` text for images. Ensure high color contrast ratios and support for scalable text. Provide captions or transcripts for all multimedia content.
- **Form Accessibility:** Always associate `<label>` elements with their respective inputs and provide clear error instructions that are screen-reader accessible.

### 4. Robustness & Defensive Programming

- **Fail Fast:** Validate all inputs, types, and prerequisites at the entry point of every function.
- **Explicit Error Handling:** Use comprehensive try-catch blocks. Never "swallow" an exception; provide meaningful error context, logging, or custom exception types.
- **Boundary Checking:** Explicitly handle null, undefined, or empty values. Ensure the application remains stable under unexpected or malformed input.
- **No Magic Values:** Replace all hardcoded strings and numbers with named constants or configuration objects to prevent fragile logic.

### 5. Meaningful Testing & Quality Assurance

- **Logic over Metrics:** Prioritize testing complex logic and critical business paths over achieving arbitrary coverage percentages. 100% coverage is not the goal; functional correctness and regression safety are.
- **Regression Prevention:** Design tests to act as a safety net, ensuring that future changes or feature additions do not break existing core functionality.
- **Testable Design:** Write code that is easy to test by using Dependency Injection and avoiding hard-coded external dependencies (DBs, APIs).
- **Edge Case Coverage:** Focus on boundary conditions and failure points (e.g., maximum limits, timeouts) rather than testing trivial getters or setters.
- **Mocking:** Use standard testing libraries to mock external services, ensuring tests remain fast, deterministic, and isolated.

### 6. Code Readability & Conventions

- **Intent-Based Naming:** Use descriptive names for variables, functions, and classes that explain _why_ they exist, not just _what_ they are.
- **Comment the "Why":** Avoid commenting on obvious code. Use comments only to explain complex business logic, non-standard algorithms, or the reasoning behind specific technical decisions.
- **Standardized Formatting:** Follow the standard style guide for the specific language (e.g., PEP8 for Python, Airbnb for JS, Google Java Style).

### 7. Execution Requirements

- **Plan Before Syntax:** Outline the architectural approach and logic flow before providing the final code.
- **Complete Implementation:** Provide full, production-ready code. Do not use placeholders such as `// ... logic here` or `// implement later`.
- **Internal Review:** Before outputting, verify the code for common pitfalls like race conditions, memory leaks, or security vulnerabilities (e.g., SQL injection).

## Meta Instructions

- ALWAYS use `/execute` command when implementing `/docs/feature_plans/`

## Git Related

- ALWAYS use `/commit` command for git commits
- NEVER commit to main branch. if currently in the main branch, create a new branch and commit there.
- when asked to `git push`, ALWAYS create a PR
