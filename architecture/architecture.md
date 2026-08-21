# Code Architecture & Style Guide

This document describes how I organize projects and structure code. Use this as a reference for understanding my conventions when helping me write or review code.

**This applies to any kind of code, in any layer, in any programming language** — backend or frontend, Python, JavaScript/TypeScript, React, Go, C, VBA, whatever. The rules here are about how folders, files, and objects relate to each other — not about any one language's tooling or syntax. This file stays entirely language-agnostic on purpose; concrete, language-specific code lives in the sibling files listed under "Language Examples" at the end. Backend and frontend code in the *same* project should follow the *same* rules, so the two sides read as one consistent system rather than two codebases glued together.

## Core Philosophy

I see code as **solid, self-contained components** — objects that behave like physical building blocks. I want to know exactly what exists "in memory" at any point: which objects, which instances, how they compose. Files and folders should reflect this mental model directly, not just be an arbitrary place to dump code.

The two governing questions when I create a folder are:
1. Is this folder **one thing** (an object, possibly split across files because it got too big)?
2. Or is this folder **a bag of related things** (a category/collection of independent objects)?

Everything below follows from answering that question consistently.

## 1. Category Folders vs. Object Folders

I distinguish folders using **grammatical number**:

- **Plural folder name** → category folder. A collection of independent, unrelated-to-each-other items grouped by type (e.g. a folder of DTOs, a folder of routes, a folder of services).
- **Singular folder name matching an object/class** → object folder. The folder represents ONE object whose implementation was too large for a single file, so it was split internally. From the outside, it still behaves like a single unit.

```
project/
├── entry-point files          # <- however the language/toolchain starts the program
├── project-object             # <- the top-level object itself (singular, one file if it fits)
├── dtos/                      # <- plural = category folder (many unrelated DTOs)
├── api/                       # <- singular = object folder (the Api object, split into files)
│   ├── facade                 # <- exposes Api as the public interface
│   └── ...
└── routes/                    # <- plural = category folder (many unrelated routes)
```

### The facade rule
Whenever an object is split into an object folder, the folder's entry point re-exports it so callers never need to know it's a package/folder internally. What "the folder's entry point" means is language-specific (an index/barrel file, a package's public API, a facade file with a matching name, …) — see the per-language files for the concrete mechanics.

Once that facade exists, calling code always looks like it's importing one single module or class, never like it's reaching into a subfolder's internals.

## 2. Composition Pattern (Object Assembling Sub-Objects)

An object composes its sub-components at construction time, rather than encapsulating logic loosely or reaching for globals/singletons at call time:

- The parent object explicitly creates/owns instances of the objects it depends on, at the point where it itself is constructed.
- Those sub-objects become named fields/properties on the parent, not hidden module-level state.

This keeps the object's dependencies explicit and inspectable — I always know what instances exist inside a given object, and nothing is wired together by accident or global side effect.

## 3. Command/Action Objects for Large or Numerous Methods

When a component has too many methods, or a single method gets too large/complex, I extract it into its own **Command object**:

- Lives in a plural category folder (commonly named `functions/`, `commands/`, `actions/`, or `use_cases/` — all equally valid, pick one and stay consistent)
- One file per action, one object per file
- The object exposes exactly **one public method** (commonly named `execute` or `run`), and everything else is broken into private helper methods to keep the logic clean and testable
- The parent object composes these Command objects privately (see rule 2) and exposes a clean public method that matches the original API

```
object/
├── functions/              # <- category folder, one file per action
│   ├── do-one-thing
│   └── do-another-thing
└── object-file             # <- the component itself, exposes clean public methods
```

Naming note: this is architecturally the **Command pattern** (also known as Use Cases / Interactors in Clean Architecture, or Service Objects in Rails). The folder name (`functions/`, `commands/`, `actions/`, `use_cases/`) is a matter of house style, not a fixed rule — what matters is: one action, one file, one object, one public entry method.

## 4. Summary of Naming Rules

| Convention | Meaning |
|---|---|
| Plural folder name | Category folder — bag of independent, related-by-type items |
| Singular folder name (matches the object) | Object folder — one object, split into files, re-exported via a facade |
| Entry-point re-export (facade) | Hides internal file split, folder behaves like one module/class |
| One object, one public `execute`/`run` method | Command/Action object — extracted logic for a single operation |
| Private helper methods inside a Command object | Internal breakdown of one action's logic, not exposed |
| Composition at construction time | Parent object explicitly owns/instantiates its sub-components |

## 5. Why This Matters to Me

The underlying goal is **encapsulation applied at the filesystem level, not just the class level**. I want file/folder structure to communicate object boundaries the same way object design does — so that opening the project tree tells you as much about the runtime shape of the program as reading the code itself. A reviewer (human or AI) should be able to predict what's inside a folder from its name and number alone, before opening a single file.

## Language Examples

The rules above are deliberately abstract. Each file below shows the same rules translated into one specific language/ecosystem's concrete mechanics (what a "facade" is, what a "class, one file" looks like, how Command objects are idiomatically expressed there):

- [python-examples.md](python-examples.md)
- [js_ts-examples.md](js_ts-examples.md)
- [react-examples.md](react-examples.md)
- [go-examples.md](go-examples.md)
- [c-examples.md](c-examples.md)
- [vb-examples.md](vb-examples.md)
- [vba-examples.md](vba-examples.md)

When working in a language not listed here, apply the same reasoning: find that language's equivalent of "a folder's public entry point" for the facade rule, and its equivalent of "an object with one public method" for Command objects, then follow the same category/object folder distinction.
