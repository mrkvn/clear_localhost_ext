---
description: Update the PRD to reflect current implementation, or create it if missing
argument-hint: [output-filename]
---

# Update PRD: Sync Product Requirements Document with Implementation

## Overview

Update the existing Product Requirements Document (PRD) to reflect the current state of the codebase. If no PRD exists, create one from scratch. The goal is to keep the PRD as a living document that accurately represents the product — not just what was planned, but what was actually built.

## Output File

Write the PRD to: `$ARGUMENTS` (default: `docs/PRD.md`)

## Instructions

### 1. Read Current State

**If a PRD already exists:**
- Read the existing PRD in full
- Read the codebase to understand what's actually implemented:
  - `db/schema.ts` — database tables and columns
  - `server/routes/` — API endpoints
  - `server/services/` — business logic
  - `shared/constants.ts` — enums, roles, statuses, configuration defaults
  - `shared/types.ts` — TypeScript types
  - `shared/validations.ts` — Zod schemas
  - `client/router.tsx` — frontend routes
  - `client/pages/` — page components
  - `package.json` — dependencies and versions
- Compare the PRD against the actual implementation
- Identify divergences: features added but not in PRD, features in PRD but not yet built, scope changes, architecture changes, phase completion status

**If no PRD exists:**
- Review the conversation history and codebase
- Extract requirements from the implementation itself
- Create the PRD from scratch using the structure below

### 2. Update or Create the PRD

- Preserve sections that are still accurate — do not rewrite what hasn't changed
- Update sections that have diverged from reality
- Mark implementation phases with completion status based on what's actually built
- Update the MVP scope checkboxes to reflect what's done vs. planned
- Update the tech stack if dependencies changed
- Update API specifications if endpoints changed
- Add any new features or architectural decisions that emerged during development

### 3. Quality Checks
- ✅ All required sections present
- ✅ PRD reflects actual implementation, not just original plan
- ✅ Implementation phases show accurate completion status
- ✅ MVP scope checkboxes match reality
- ✅ Tech stack matches `package.json`
- ✅ API spec matches actual routes
- ✅ Consistent terminology throughout

## PRD Structure

Use the following sections. Adapt depth and detail based on available information:

### Required Sections

**1. Executive Summary**
- Concise product overview (2-3 paragraphs)
- Core value proposition
- MVP goal statement

**2. Mission**
- Product mission statement
- Core principles (3-5 key principles)

**3. Target Users**
- Primary user personas
- Technical comfort level
- Key user needs and pain points

**4. MVP Scope**
- **In Scope:** Core functionality for MVP (use ✅ checkboxes)
- **Out of Scope:** Features deferred to future phases (use ❌ checkboxes)
- Group by categories (Core Functionality, Technical, Integration, Deployment)

**5. User Stories**
- Primary user stories (5-8 stories) in format: "As a [user], I want to [action], so that [benefit]"
- Include concrete examples for each story
- Add technical user stories if relevant

**6. Core Architecture & Patterns**
- High-level architecture approach
- Directory structure (if applicable)
- Key design patterns and principles
- Technology-specific patterns

**7. Tools/Features**
- Detailed feature specifications
- If building an agent: Tool designs with purpose, operations, and key features
- If building an app: Core feature breakdown

**8. Technology Stack**
- Backend/Frontend technologies with versions
- Dependencies and libraries
- Optional dependencies
- Third-party integrations

**9. Security & Configuration**
- Authentication/authorization approach
- Configuration management (environment variables, settings)
- Security scope (in-scope and out-of-scope)
- Deployment considerations

**10. API Specification** (if applicable)
- Endpoint definitions
- Request/response formats
- Authentication requirements
- Example payloads

**11. Success Criteria**
- MVP success definition
- Functional requirements (use ✅ checkboxes)
- Quality indicators
- User experience goals

**12. Implementation Phases**
- Break down into 3-4 phases
- Each phase includes: Goal, Deliverables (✅ checkboxes), Validation criteria
- Mark completed phases and deliverables

**13. Future Considerations**
- Post-MVP enhancements
- Integration opportunities
- Advanced features for later phases

**14. Risks & Mitigations**
- 3-5 key risks with specific mitigation strategies

**15. Appendix** (if applicable)
- Related documents
- Key dependencies with links
- Repository/project structure

## Style Guidelines

- **Tone:** Professional, clear, action-oriented
- **Format:** Use markdown extensively (headings, lists, code blocks, tables)
- **Checkboxes:** Use ✅ for in-scope/completed items, ❌ for out-of-scope/deferred
- **Specificity:** Prefer concrete examples over abstract descriptions
- **Length:** Comprehensive but scannable

## Output Confirmation

After updating the PRD:
1. Confirm the file path where it was written
2. Summarize what changed (sections updated, added, or unchanged)
3. Highlight any discrepancies found between the PRD and implementation
4. Note any areas where the PRD needs user input to resolve ambiguity

## Notes

- If critical information is missing, ask clarifying questions before generating
- Adapt section depth based on available details
- For highly technical products, emphasize architecture and technical stack
- For user-facing products, emphasize user stories and experience
- This command contains the complete PRD template structure — no external references needed
- When updating, prioritize accuracy over preserving the original wording
