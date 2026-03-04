---
description: Create modular project rules in .claude/rules/ from codebase analysis
---

# Create Project Rules

Generate focused, topic-specific rule files in `.claude/rules/` by analyzing the codebase.

---

## Objective

Create project-specific rules that give Claude context about:

- What this project is
- Technologies used
- How the code is organized
- Patterns and conventions to follow
- How to build, test, and validate

Rules live in `.claude/rules/*.md` and are automatically loaded with the same priority as `.claude/CLAUDE.md`.

---

## Phase 1: DISCOVER

### Identify Project Type

First, determine what kind of project this is:

| Type                 | Indicators                                    |
| -------------------- | --------------------------------------------- |
| Web App (Full-stack) | Separate client/server dirs, API routes       |
| Web App (Frontend)   | React/Vue/Svelte, no server code              |
| API/Backend          | Express/Fastify/etc, no frontend              |
| Library/Package      | `main`/`exports` in package.json, publishable |
| CLI Tool             | `bin` in package.json, command-line interface |
| Monorepo             | Multiple packages, workspaces config          |
| Script/Automation    | Standalone scripts, task-focused              |

### Analyze Configuration

Look at root configuration files:

```
package.json       → dependencies, scripts, type
tsconfig.json      → TypeScript settings
vite.config.*      → Build tool
*.config.js/ts     → Various tool configs
```

### Map Directory Structure

Explore the codebase to understand organization:

- Where does source code live?
- Where are tests?
- Any shared code?
- Configuration locations?

---

## Phase 2: ANALYZE

### Extract Tech Stack

From package.json and config files, identify:

- Runtime/Language (Node, Bun, Deno, browser)
- Framework(s)
- Database (if any)
- Testing tools
- Build tools
- Linting/formatting

### Identify Patterns

Study existing code for:

- **Naming**: How are files, functions, classes named?
- **Structure**: How is code organized within files?
- **Errors**: How are errors created and handled?
- **Types**: How are types/interfaces defined?
- **Tests**: How are tests structured?

### Find Key Files

Identify files that are important to understand:

- Entry points
- Configuration
- Core business logic
- Shared utilities
- Type definitions

---

## Phase 3: GENERATE

### Create `.claude/rules/` Files

**Output directory**: `.claude/rules/`

Generate focused, topic-specific files. Adapt to the project — remove sections that don't apply, add sections specific to this project type.

**Standard file structure:**

```
.claude/rules/
├── project-overview.md       # Project Overview + Architecture
├── tech-stack.md             # Tech Stack table + Commands
├── project-structure.md      # Directory tree
├── code-patterns.md          # Naming, file org, error handling, API response format
├── database.md               # Database conventions
├── frontend.md               # Frontend patterns
├── testing.md                # Testing conventions + validation checklist
└── notes.md                  # Key files, on-demand context, project notes
```

**Path-scoped rules:** Use YAML frontmatter to scope rules to specific paths. This ensures rules only load when working in relevant directories:

```yaml
---
paths:
  - "client/**"
---
```

**Subdirectory organization:** For larger projects, organize rules into subdirectories:

```
.claude/rules/
├── backend/
│   ├── api-patterns.md
│   └── database.md
├── frontend/
│   ├── components.md
│   └── state-management.md
└── shared/
    └── conventions.md
```

**Guidelines for each file:**

- Keep files focused and scannable
- Don't duplicate information across files (link instead)
- Focus on patterns and conventions, not exhaustive documentation
- Use path scoping for domain-specific rules (database, frontend, etc.)
- Include code examples from the actual codebase where helpful

---

## Phase 4: OUTPUT

```markdown
## Project Rules Created

**Directory**: `.claude/rules/`

### Files Generated

{List of files created with brief descriptions}

### Project Type

{Detected project type}

### Tech Stack Summary

{Key technologies detected}

### Path-Scoped Rules

{List any rules with path frontmatter and their scopes}

### Next Steps

1. Review the generated files in `.claude/rules/`
2. Add any project-specific notes
3. Remove any files or sections that don't apply
4. Consider adding path-scoped frontmatter for domain-specific rules
5. Update `.claude/CLAUDE.md` References section to point to `.claude/rules/`
```

---

## Tips

- Keep each file focused on a single topic
- Use YAML frontmatter `paths` to scope rules to relevant directories
- Don't duplicate information that's in other docs (link instead)
- Focus on patterns and conventions, not exhaustive documentation
- Update rules as the project evolves
- Symlinks are supported for sharing rules across projects
