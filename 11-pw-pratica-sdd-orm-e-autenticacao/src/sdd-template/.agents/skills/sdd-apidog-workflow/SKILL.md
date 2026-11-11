---
name: sdd-apidog-workflow
description: >-
  Guides the agent through the 4 phases of Spec-Driven Development (Constitution, Specify, Plan, Tasks & Implement)
  and P2 Contract Auditing using an Apidog/OpenAPI contract file, STYLEGUIDE.md, SPEC.md, and PLAN.md, integrating
  SQLAlchemy 2.0 ORM and JWT/RBAC Authentication.
---

# Spec-Driven Development (SDD) with Apidog, SQLAlchemy ORM & JWT Auth Workflow

Follow this strict engineering workflow whenever operating on this project:

## Phase 0: P2 Apidog Contract Audit (`[Spec Auditor]`)
When invoked as `[Spec Auditor]`:
1. Inspect the `.Apidog.json` or OpenAPI file in the workspace.
2. Verify all 5 P2 criteria:
   - API overview/README & team members (2–4 students).
   - At least 2 domain entities with full CRUD routes (`GET`, `POST`, `GET/{id}`, `PUT/PATCH/{id}`, `DELETE/{id}`).
   - Reused `Data Schemas` (`$ref`) instead of inline schemas inside endpoints.
   - Attribute richness: `description`, `format` (`uuid`, `date-time`, etc.), constraints (`minLength`, `maxLength`, `minimum`, `maximum`), `required`, `enum`, `example`, and `mock` rules.
3. Produce a structured diagnostic report with an estimated score (0–10) and actionable fixes.

## Phase 1: Constitution Check
1. Read `STYLEGUIDE.md` and `AGENTS.md` at the root of the workspace.
2. Identify the active persona requested by the user (`[Spec Auditor]`, `[Tech Lead]`, `[Backend Coder]`, or `[QA Engineer]`).

## Phase 2: Specification & Contract Inspection
1. Read `SPEC.md` and inspect the formal API contract in `TakFlow API.Apidog.json`.
2. Ensure all data models, field names (`camelCase`), validation constraints, ORM relationships (`1:N` with `selectinload`), and JWT/RBAC rules (`401 Unauthorized` and `403 Forbidden`) match `SPEC.md`.
3. Enforce **RFC 9457 (Problem Details)** (`type`, `title`, `status`, `detail`, `instance`, `invalidParams`) on all error responses (`400`, `401`, `403`, `404`, `422`).

## Phase 3: Architectural Planning (`[Tech Lead]`)
1. When acting as `[Tech Lead]`, generate or update `PLAN.md` with a sequential, dependency-ordered checklist.
2. **Never** write or modify application source code (`src/**/*.py`) during the planning phase. Stop and request human review of `PLAN.md`.

## Phase 4: Granular Implementation & Verification (`[Backend Coder]` & `[QA Engineer]`)
1. When acting as `[Backend Coder]`, implement **only** the specific steps from `PLAN.md` authorized by the user in the current turn.
2. Mark completed steps as `[x]` in `PLAN.md` and pause for human diff review.
3. When acting as `[QA Engineer]`, write contract, ORM, and RBAC tests in `src/api/tests/` using an isolated SQLite database fixture, and run `pytest -v` to verify 100% pass rate before marking test tasks complete.
