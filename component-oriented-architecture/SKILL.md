---
name: component-oriented-architecture
description: Apply Augusto's Component-Oriented Architecture (COA) conventions when designing, structuring, reviewing, or refactoring software projects — deciding folder/file layout, splitting a repo into frontend/backend units, naming directories (singular vs. plural vs. category), wiring components together, doing dependency injection, or extracting a large class/method into a smaller component with an execute() interface. Use this whenever the user asks to "structure", "organize", "architect", or "refactor" a project, asks where a new module/file should live, asks if a directory should be plural or singular, or is working on ci-app-backend or any other Python/JS/TS/C++/Java/Rust project where consistent architecture matters. Also use when reviewing existing code for architecture violations (god-files, hidden dependencies, mixed dev-tooling with app code).
---

# Component-Oriented Architecture (COA)

COA is Augusto's personal convention for how software projects should be structured. The central idea: think of software as a **hierarchy of components**, not a pile of files/functions/layers. The filesystem should be a readable map of that hierarchy.

> Components → Composition → Relationships → Structure

Language-agnostic — applies to Python, JS/TS, C++, Java, C#, Rust, etc., and to backends, frontends, desktop apps, games, libraries.

For the full document with all worked examples (frontend/backend split, API/DB/Config trees, DOM-as-component-tree for web UI, multi-page apps, themes, etc.), read `references/full-guide.md`. This SKILL.md gives the condensed rules needed for day-to-day decisions; consult the reference file when you need a concrete precedent or a longer example to show the user.

## Core rules

**1. Repository vs. Program (Development Level vs. Program Level)**
The repo root is the *Development Level*: build scripts, dependency files, packaging config, `.gitignore`, generated artifacts (`build/`, `dist/`) — things needed to build/test/package/run the software but not part of its component hierarchy. The inner source package is the *Program Level*: the actual application. Never mix dev tooling into the component tree.

**2. One repository, one software unit**
A repo should have one clear identity. Don't put frontend and backend in the same repo — split into `project_frontend/` and `project_backend/` as independent units with independent deps, builds, versioning, tests.

**3. Components are the building blocks**
A component is a well-defined unit with its own responsibility, possibly containing other components. Represent a component with the language's natural construct (Python → class, Rust → struct/trait, etc.). A source file should represent a meaningful component, not a loose bag of functions.

**4. The filesystem is the architecture map**
Directory tree should be readable as the component hierarchy. If you can't mentally translate the tree into a component diagram, the structure needs work.

**5. Singular vs. plural vs. category naming — semantic, not grammatical**
Ask "does this represent ONE component, or a COLLECTION of peer components?" — not "is this word grammatically plural?"
- Singular (`api/`, `database/`, `authentication/`) → usually one expanded component.
- Plural (`models/`, `services/`, `routes/`) → usually a collection of peer components.
- Non-plural category/technical/uncountable names (`middleware/`, `infrastructure/`, `ipc/`, `configuration/`) can still represent a collection even without a plural form. Never force an awkward plural just to satisfy the convention — architecture follows meaning, not grammar.

**6. Explicit wiring, no hidden relationships**
Parent components construct and connect their children explicitly (typically in `__init__`/constructor). Example pattern:
```python
class Project:
    def __init__(self) -> None:
        self.database = Database()
        self.api = Api(self.database)
        self.configuration = Configuration()
```
Dependencies flow visibly through the tree — no globals, no hidden singletons, no reaching across the tree implicitly.

**7. Dependency injection over hidden construction**
A component should receive what it needs from its owner rather than constructing/knowing about it internally. Prefer `Database(engine: str)` over `Database()` that hardcodes `"sqlite"` internally. This keeps components replaceable, testable, reusable.

**8. Encapsulation — expose *what*, hide *how***
A component should know what a sibling/child provides, not how it works internally. Keep public interfaces smaller than internal implementation.

**9. One primary component per file**
Avoid `models.py` holding many unrelated model classes — prefer `models/user.py`, `models/product.py`, `models/order.py`. Helper types, exceptions, and small supporting declarations in the same file are fine; the point is one clear primary responsibility per file.

**10. Decompose large components — the Command/execute() pattern**
When a class/component grows too large (many long methods), extract each meaningful method/responsibility into its own object with an `execute()` method, and turn the original into a thin orchestrator:
```python
# logic_component/logic_component.py
from .actions import Method1, Method2

class LogicComponent:
    def __init__(self) -> None:
        self._method_1 = Method1()
        self._method_2 = Method2()

    def method_1(self) -> None:
        self._method_1.execute()

    def method_2(self) -> None:
        self._method_2.execute()
```
Each extracted object (`Method1`, `Method2`, ...) can have its own private helper methods internally. This is the standard move whenever a "god method" or "god class" needs to be broken up.

**11. Grow hierarchically, not all at once**
A component can start as a single file (`api.py`) and only become a directory (`api/` with `routes/`, `middleware/`) once it actually needs to. Don't over-engineer structure prematurely, but restructure as soon as complexity demands it.

## Design checklist (use when structuring or reviewing a project)

- What is the component? (identify the actual conceptual object/responsibility)
- What does it contain? (represent containment in the directory tree)
- What does it depend on? (make dependencies explicit / injected)
- What does it expose? (public interface smaller than internal implementation)
- Is it becoming too large? (extract subcomponents, use the Command/execute() pattern)
- Does the filesystem represent the architecture? (tree ≈ component hierarchy)
- Does naming follow meaning over grammar? (singular/plural/category per rule 5)
- Is dev tooling separated from the program? (rule 1)
- Does the repository have one clear identity? (rule 2)

## When applying this skill

- When proposing a new project structure or reviewing an existing one, walk through the checklist above and structure the answer as a directory tree plus a short rationale per top-level entry.
- When asked to extract a large method/class, apply rule 10 (Command pattern with `execute()`) by default, matching Augusto's established convention for `ci-app-backend`.
- When unsure whether a directory should be singular or plural, apply rule 5's semantic test rather than defaulting to grammar.
- Pull a concrete worked example from `references/full-guide.md` when the condensed rule here isn't enough to resolve an edge case (e.g. DOM-as-component-tree for web frontends, multi-page app layout, theme file placement).
