---
name: sdd-apidog-workflow
description: >-
  Guides the agent through the 4 phases of Spec-Driven Development (Constitution, Specify, Plan, Tasks & Implement)
  using an Apidog/OpenAPI contract file (TakFlow API.Apidog.json), STYLEGUIDE.md, SPEC.md, and PLAN.md.
  Use this skill when the user asks to plan, implement, or verify API endpoints following the SDD methodology.
---

# Spec-Driven Development (SDD) with Apidog Workflow

Follow this strict 4-phase engineering workflow whenever operating on this project:

## Phase 1: Constitution Check
1. Read `STYLEGUIDE.md` and `AGENTS.md` at the root of the workspace.
2. Identify the active persona requested by the user (`[Tech Lead]`, `[Backend Coder]`, or `[QA Engineer]`).

## Phase 2: Specification & Contract Inspection
1. Read `SPEC.md` and inspect the formal API contract in `TakFlow API.Apidog.json`.
2. Ensure all data models, field names (`camelCase`), validation constraints (`minLength`, `maxLength`, `pattern`, `enum`), and HTTP status codes match the Apidog specification.
3. Enforce **RFC 9457 (Problem Details)** (`type`, `title`, `status`, `detail`, `instance`, `invalidParams`) on all error responses.

## Phase 3: Architectural Planning (`[Tech Lead]`)
1. When acting as `[Tech Lead]`, generate or update `PLAN.md` with a sequential, dependency-ordered checklist.
2. **Never** write or modify application source code (`src/**/*.py`) during the planning phase. Stop and request human review of `PLAN.md`.

## Phase 4: Granular Implementation & Verification (`[Backend Coder]` & `[QA Engineer]`)
1. When acting as `[Backend Coder]`, implement **only** the specific steps from `PLAN.md` authorized by the user in the current turn.
2. Mark completed steps as `[x]` in `PLAN.md` and pause for human diff review.
3. When acting as `[QA Engineer]`, write contract tests in `src/api/tests/` and run `pytest -v` to verify 100% pass rate before marking test tasks complete.
