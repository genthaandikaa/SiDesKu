---
name: code-architecture
description: Inspect and define codebase architecture, module boundaries, entry points, and architectural decisions (ADRs).
---

# Skill: Code Architecture

Inspect before designing. Map current modules, entry points, dependencies, data flow, and conventions. Prefer incremental evolution over rewrites.

For a new project, propose boundaries and dependency direction for frontend, backend, data, and integrations. Record important decisions in `.agents/architecture/` and ADRs. Avoid speculative layers and premature abstractions. Review the impact radius before changing shared contracts. Keep frontend feature boundaries and backend authorization boundaries explicit.
