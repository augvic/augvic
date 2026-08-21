# Code Architecture & Style Guide

This document describes how I organize Python projects and structure code. Use this as a reference for understanding my conventions when helping me write or review code.

## Core Philosophy

I see code as **solid, self-contained components** — objects that behave like physical building blocks. I want to know exactly what exists "in RAM" at any point: which objects, which instances, how they compose. Files and folders should reflect this mental model directly, not just be an arbitrary place to dump code.

The two governing questions when I create a folder are:
1. Is this folder **one thing** (an object, possibly split across files because it got too big)?
2. Or is this folder **a bag of related things** (a category/collection of independent objects)?

Everything below follows from answering that question consistently.

## 1. Category Folders vs. Object Folders

I distinguish folders using **grammatical number**:

- **Plural folder name** → category folder. A collection of independent, unrelated-to-each-other items grouped by type (e.g. `dtos/`, `routes/`, `services/`).
- **Singular folder name matching a class** → object folder. The folder represents ONE object/class whose implementation was too large for a single file, so it was split internally. From the outside, it still behaves like a single unit.

```
project/
├── __main__.py
├── __init__.py
├── project.py       # <- Project class itself (singular file, one object)
├── dtos/            # <- plural = category folder (many unrelated DTOs)
├── api/             # <- singular = object folder (the Api class, split into files)
│   ├── __init__.py  # <- exposes `Api` as the public interface
│   └── ...
├── routes/          # <- plural = category folder (many unrelated routes)
└── api.py           # NOTE: if api/ exists, there is no separate api.py at this level
```

### The facade rule
Whenever a class is split into an object folder, `__init__.py` re-exports the class so callers never need to know it's a package internally:

```python
# api/__init__.py
from .core import Api
```

```python
# caller code
from project.api import Api  # looks and feels like a single module/class
```

## 2. Composition Pattern (Object assembling sub-objects)

An object composes its sub-components in `__init__`, rather than encapsulating logic loosely:

```python
from .routes import Route1, Route2

class Api:
    def __init__(self) -> None:
        self.route_1 = Route1()
        self.route_2 = Route2()
```

This keeps the object's dependencies explicit and inspectable — I always know what instances exist inside a given object.

## 3. Command/Action Objects for Large or Numerous Methods

When a component has too many methods, or a single method gets too large/complex, I extract it into its own **Command object**:

- Lives in a plural category folder (e.g. `functions/`, could also be named `commands/`, `actions/`, or `use_cases/`)
- One file per action, one class per file
- The class exposes exactly **one public method** (`execute`), and everything else is broken into private helper methods to keep the logic clean and testable
- The parent object composes these Command objects privately and exposes a clean public method that matches the original API

```
object/
├── functions/              # <- category folder, ~300 files, one action each
│   ├── create_registration.py
│   └── ...
└── object.py               # <- the component itself, exposes clean public methods
```

```python
from .functions import *
from ..dtos import Registration

class Object:
    def __init__(self) -> None:
        self._create_registration = CreateRegistration()

    def create_registration(self) -> Registration:
        return self._create_registration.execute()
```

Naming note: this is architecturally the **Command pattern** (also known as Use Cases / Interactors in Clean Architecture, or Service Objects in Rails). `functions/` is my current name for this folder; `commands/`, `actions/`, or `use_cases/` are equally valid and arguably more self-documenting to developers unfamiliar with this convention.

## 4. Summary of Naming Rules

| Convention | Meaning |
|---|---|
| Plural folder name | Category folder — bag of independent, related-by-type items |
| Singular folder name (matches class) | Object folder — one class, split into files, re-exported via `__init__.py` |
| `__init__.py` re-export | Facade — hides internal file split, folder behaves like one module/class |
| One class, one public `execute()` method | Command/Action object — extracted logic for a single operation |
| Private helper methods inside a Command object | Internal breakdown of one action's logic, not exposed |
| Composition in `__init__` | Parent object explicitly owns/instantiates its sub-components |

## 5. Why This Matters to Me

The underlying goal is **encapsulation applied at the filesystem level, not just the class level**. I want file/folder structure to communicate object boundaries the same way class design does — so that opening the project tree tells you as much about the runtime shape of the program as reading the code itself.