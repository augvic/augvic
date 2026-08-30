---
name: component-oriented-architecture
description: Apply Component-Oriented Architecture (COA) conventions when designing, structuring, reviewing, or refactoring software projects — deciding folder/file layout, splitting a repo into frontend/backend units, naming directories (singular vs. plural vs. category), wiring components together, doing dependency injection, or extracting a large class/method into a smaller component with an execute() interface. Use this whenever the user asks to "structure", "organize", "architect", or "refactor" a project, asks where a new module/file should live, asks if a directory should be plural or singular, or is working on ci-app-backend or any other Python/JS/TS/C++/Java/Rust project where consistent architecture matters. Also use when reviewing existing code for architecture violations (god-files, hidden dependencies, mixed dev-tooling with app code).
---

# 🧩 Component-Oriented Architecture — COA

# 1. 🎯 Purpose and Philosophy

This document defines the architectural and organizational conventions used when designing and structuring software projects.

The central idea behind **Component-Oriented Architecture (COA)** is to think of software as a real, tangible structure made of **components**.

Each component is a well-defined unit with its own responsibility. Components can contain other components, and they are wired together through explicit relationships and dependencies.

Instead of thinking primarily in terms of files, functions, or technical layers, COA encourages us to think in terms of:

> **Components → Composition → Relationships → Structure**

The filesystem should reflect this mental model. The project structure should make it possible to look at a directory tree and understand the architecture of the software.

Python is used throughout this document for examples, but COA is **language-agnostic**. The same principles can be applied to Python, JavaScript, TypeScript, C++, Java, C#, Rust, and other languages, as well as backends, frontends, desktop applications, games, libraries, and services.

---

# 2. 🏗️ Repository and Software Boundaries

COA distinguishes between the **development environment** and the **software itself**.

The repository root represents the **Development Level**.

Inside it, the source package represents the **Program Level**: the actual application, library, service, or software unit being developed.

The basic idea is:

```text
Repository
│
├── Development Level
│   ├── build scripts
│   ├── development configuration
│   ├── dependency declarations
│   ├── packaging configuration
│   └── development artifacts
│
└── Program Level
    └── the actual software
```

For example:

```text
project/                         # ← Development Level / Repository Root
├── requirements.txt
├── .gitignore
├── .gitattributes
├── pyinstaller.spec
├── build/
├── dist/
└── project/                     # ← Program Level / Application
    ├── project.py
    ├── __main__.py
    ├── api/
    ├── database/
    ├── configuration/
    └── ...
```

The two `project/` directories have different meanings.

The outer directory is the **repository and development environment**.

The inner directory is the **actual application**.

## 🛠️ Development Level

The repository root contains things required to **develop, build, test, package, or run** the software, but which are not necessarily part of the software's internal component hierarchy.

Examples include:

```text
requirements.txt
pyproject.toml
package.json
.gitignore
.gitattributes
Dockerfile
Makefile
CMakeLists.txt
pyinstaller.spec
build/
dist/
scripts/
```

These belong to the development environment.

For example:

```text
project/
├── requirements.txt
├── pyinstaller.spec
├── build/
└── dist/
```

The `build/` directory is not necessarily a component of the application. It is an artifact of the development/build process.

Likewise, `pyinstaller.spec` describes how the application is packaged, but it is not itself part of the application's runtime component hierarchy.

This distinction prevents development tooling from being mixed with application architecture.

## ▶️ Program Level

Inside the repository, the program itself has its own component hierarchy:

```text
project/
├── requirements.txt
├── pyinstaller.spec
└── project/
    ├── project.py
    ├── __main__.py
    ├── api/
    ├── database/
    ├── configuration/
    └── services/
```

Conceptually:

```text
Repository
│
├── Development Level
│
└── Project
    ├── Api
    ├── Database
    ├── Configuration
    └── Services
```

The inner `project/` directory is therefore the root component of the actual application.

---

# 3. 🎯 One Repository, One Software Unit

A fundamental COA convention is:

> **Each repository represents one distinct and coherent software unit.**

The repository should have a clear identity. It should represent one coherent piece of software rather than acting as a container for unrelated applications.

For example, instead of:

```text
project/
├── frontend/
└── backend/
```

COA prefers treating the frontend and backend as separate software units:

```text
project_frontend/
├── package.json
├── ...
└── project_frontend/
    ├── project_frontend.jsx
    ├── project_frontend.html
    └── ...

project_backend/
├── requirements.txt
├── ...
└── project_backend/
    ├── project_backend.py
    ├── api/
    ├── database/
    └── ...
```

The frontend is one software unit.

The backend is another software unit.

They may communicate with each other, but they remain independent architectural boundaries.

```text
┌─────────────────────┐
│   project_frontend  │
│                     │
│   Frontend Software │
└──────────┬──────────┘
           │
           │ API / IPC / Network
           │
┌──────────▼──────────┐
│   project_backend   │
│                     │
│   Backend Software  │
└─────────────────────┘
```

They can therefore have:

- independent dependencies;
- independent build systems;
- independent deployment processes;
- independent versioning;
- independent tests;
- independent development environments;
- independent architectures.

The fact that two applications work together does not necessarily mean they belong in the same repository.

> 🧠 **One repository should have one clear software identity.**

---

# 4. 🧩 The Component Model

Once inside the Program Level, the software is composed of **components**.

A component is a meaningful, identifiable unit of the software.

For example:

```text
Project
├── Api
├── Database
└── Configuration
```

The `Project` component contains other components.

The `Api` component may contain:

```text
Api
├── Routes
└── Middleware
```

And a route may itself contain smaller components.

This creates a hierarchy:

```text
Project
├── Database
├── Api
│   ├── Route1
│   └── Route2
└── Configuration
```

The fundamental idea is:

> **A component may contain other components, and components are explicitly wired together through their dependencies.**

## 🧱 Components as Solid Units

A component should be treated as a **solid thing** rather than as a loose collection of unrelated functions.

Whenever the language provides a suitable construct, use it to represent the component:

- Python → classes
- C++ → classes/structs
- Java → classes
- TypeScript → classes/interfaces/types where appropriate
- Rust → structs/enums/traits
- Go → structs/interfaces

The exact mechanism depends on the language.

The important part is the mindset:

> **A source unit should represent a meaningful component or part of a component.**

---

# 5. 🌳 The Filesystem as an Architectural Map

The project tree should reflect the conceptual component tree.

Consider:

```text
project/
├── project.py
├── api/
│   ├── api.py
│   └── routes/
│       ├── route_1.py
│       └── route_2.py
├── database/
│   ├── database.py
│   └── tables/
│       ├── table_1.py
│       └── table_2.py
└── configuration/
    ├── config_1.py
    └── config_2.py
```

This can be read conceptually as:

```text
Project
├── Api
│   └── Routes
│       ├── Route1
│       └── Route2
├── Database
│   └── Tables
│       ├── Table1
│       └── Table2
└── Configuration
    ├── Config1
    └── Config2
```

You should be able to mentally translate the directory tree into the component hierarchy.

> 🗺️ **The filesystem is not merely where the code is stored. It is a map of the architecture.**

---

# 6. 🔤 Singular, Plural, and Category Directories

Directory names should communicate whether a directory represents **one component** or **a collection/category of components**.

However, **singular vs. plural is not a strict grammatical rule**.

It is a semantic convention.

The important question is not:

> "Is this word singular or plural?"

The important question is:

> **"Does this directory represent one component, or a collection/category of components?"**

## 🧩 Singular Name = Usually One Component

A singular directory normally represents a **single component that has been expanded into multiple files**.

For example:

```text
api/
├── api.py
├── routes/
└── middleware/
```

Conceptually:

```text
Api
├── Routes
└── Middleware
```

The directory `api/` means:

> **"Here is the Api component."**

Other examples include:

```text
database/
authentication/
application/
project/
```

These normally represent singular conceptual components.

## 📦 Plural Name = Usually a Collection

A plural directory normally represents a **collection of related peer components**.

For example:

```text
models/
├── user.py
├── product.py
└── order.py
```

Conceptually:

```text
Models
├── User
├── Product
└── Order
```

The `models/` directory means:

> **"Here are the models."**

Other examples include:

```text
models/
services/
handlers/
routes/
controllers/
repositories/
```

These normally represent collections of peer components.

## ⚠️ Every Collection Directory Must Read as Plural

Grammatical number in a directory name is a **signal**: seeing a plural folder tells you "this is a bag of peer components" before you open a single file. That signal only works if it is applied consistently. So, unlike a purely descriptive convention, COA treats this as a rule with no silent exceptions:

> **If a directory is a collection or category of components, its name must read as plural — even when the natural word for that category has no plural form.**

Some concepts naturally have a plural form, and those are trivial:

```text
model     → models
service   → services
handler   → handlers
route     → routes
```

Other concepts are naturally **uncountable nouns, category names, technical terms, or acronyms** with no convenient plural — `infrastructure`, `middleware`, `security`, `ipc`, `configuration`. That is not a reason to leave the folder looking singular. Instead, **compose** the name with a plural head noun so it still reads unmistakably as a collection:

```text
infrastructure  →  infra_components/
middleware      →  middleware_components/
ipc             →  ipc_components/
security        →  security_components/
```

For example, instead of:

```text
infrastructure/
├── database.py
├── messaging.py
└── storage.py
```

name it:

```text
infra_components/
├── database.py
├── messaging.py
└── storage.py
```

which reads unambiguously as:

```text
InfraComponents
├── Database
├── Messaging
└── Storage
```

The same applies to a technical acronym:

```text
ipc_components/
├── shared_memory.py
├── pipe.py
└── socket.py
```

`ipc_components/` still represents a category of components related to Inter-Process Communication — but now the folder name itself, read on its own, says "collection" instead of leaving that to be inferred from context.

Any consistent plural-forming composition works (`_components`, `_modules`, `_items`, `_kit`, or whatever suffix fits the codebase's voice) — what matters is that the result reads as plural. Never settle for a bare singular or uncountable word on a folder that holds multiple peer components.

## ⚠️ Words That Sound Plural But Name One Component

The same problem happens in reverse: some words *look* plural but actually describe a single component with internal structure, not a collection of peers. The clearest example is `settings` — a `Settings` object usually holds one bag of related fields belonging to *one* configurable thing, not many independent peer components:

```text
settings/            ⚠️ reads like a collection, but is really ONE component
├── settings.py
├── validation.py
└── persistence.py
```

Read literally, `settings/` implies "here are the settings" — a collection. But the folder is actually the `Settings` component split across files; `validation.py` and `persistence.py` are its internal helpers, not peer components. This must be fixed the same way as the previous case, just in the opposite direction:

**1. Use a naturally singular synonym**, if one fits the domain:

```text
configuration/
├── configuration.py
├── validation.py
└── persistence.py
```

**2. Compose the name with a singular head noun**, if the word `settings` itself should be kept:

```text
settings_component/
├── settings_component.py
├── validation.py
└── persistence.py
```

Either way, the folder name must not read as plural when it is really one component.

## 🧭 The Full Rule

Apply the same test in both directions — ask "one component, or a collection of peers?" — and then make the **name itself** say so unambiguously, composing a name if the natural word points the wrong way:

```text
One component
    ↓
Name MUST read as singular
(compose if the natural word sounds plural, e.g. settings_component/)

Collection of peer components
    ↓
Name MUST read as plural
(compose if the natural word has no plural, e.g. infra_components/)
```

> 🧠 **Grammatical number in a directory name is not decoration — it is a contract.** A reader (human or AI) should be able to trust it without opening a single file. Never leave that contract ambiguous just because the natural word doesn't have a convenient plural or singular form; compose a name that does.

For example:

```text
project/
├── api/
├── database/
├── models/
├── services/
├── infra_components/
├── middleware_components/
└── ipc_components/
```

can be interpreted as:

```text
Project
├── Api                     ← component
├── Database                ← component
├── Models                  ← collection
├── Services                ← collection
├── InfraComponents         ← collection
├── MiddlewareComponents    ← collection
└── IpcComponents           ← collection
```

The architectural meaning still takes precedence over the dictionary — but now grammar itself is made to follow that meaning, through composition when necessary, instead of being allowed to diverge from it.

> **Architecture should follow meaning — and folder names should be composed, when necessary, so that grammar always follows meaning too.**

---

# 7. 🔌 Component Composition and Wiring

Components are composed by creating them and connecting their dependencies.

For example:

```python
# project.py

from .api import Api
from .database import Database
from .configuration import Configuration


class Project:

    def __init__(self) -> None:
        self.database = Database()
        self.api = Api(self.database)
        self.configuration = Configuration()
```

The `Project` component owns three components:

```text
Project
├── Database
├── Api
└── Configuration
```

The `Api` component can then contain its own components:

```python
# api.py

from .routes import Route1, Route2
from ..database import Database


class Api:

    def __init__(self, database: Database) -> None:
        self.route_1 = Route1(database)
        self.route_2 = Route2(database)
```

The dependency hierarchy is explicit:

```text
Project
│
├── Database
│
└── Api
    ├── Route1 ──→ Database
    └── Route2 ──→ Database
```

This is one of the fundamental ideas of COA:

> 🔌 **Components are wired together explicitly rather than relying on hidden relationships.**

---

# 8. 💉 Dependency Injection and Explicit Dependencies

Components should preferably receive external dependencies rather than secretly constructing everything they need.

Avoid:

```python
class Database:

    def __init__(self) -> None:
        self.engine = "sqlite"
```

when the database engine is actually an external configuration or dependency.

Prefer:

```python
class Database:

    def __init__(self, engine: str) -> None:
        self.engine = engine
```

Now `Database` does not need to know where the engine came from.

Another component can provide it:

```python
class DbConfig:

    def __init__(self) -> None:
        self.engine = "sqlite"
```

And the parent component can wire them together:

```python
class Project:

    def __init__(self) -> None:
        self.db_config = DbConfig()
        self.database = Database(self.db_config.engine)
```

The dependency flow is explicit:

```text
Project
│
├── DbConfig
│      │
│      └── engine
│
└── Database
       │
       └── receives engine
```

This makes components easier to replace, test, reuse, and understand.

> 🔌 **Components should be wired together by their owners, while their internal implementations remain encapsulated.**

---

# 9. 🚪 Component Boundaries and Encapsulation

A component should not need to understand the internal implementation of another component.

For example:

```text
Project
├── Database
└── Configuration
```

`Project` should not need to know how `Database` stores data internally.

Likewise, `Database` should not need to know how configuration files are loaded.

Instead:

```text
Project
│
├── creates Configuration
│
└── provides the required values to Database
```

The goal is:

> **Expose what a component needs to be used, while hiding how it works internally.**

This allows components to evolve independently.

A component should know **what another component provides**, not necessarily **how it provides it**.

---

# 10. 📄 One Primary Component per File

A file should normally contain **one primary class/component**.

Avoid:

```text
models.*
```

containing many unrelated model classes.

Instead:

```text
models/
├── user.*
├── product.*
└── order.*
```

The goal is not to prohibit helper types, exceptions, protocols, or small supporting declarations.

The principle is:

> **Each file should have one clear primary responsibility and one primary component.**

This makes components independently identifiable and keeps the architecture visible in the filesystem.

---

# 11. 🪓 Component Decomposition

Components should remain understandable and cohesive.

When a component becomes excessively large, do not simply accept the growing file. Look for internal responsibilities that can become independent components.

For example:

```text
logic_component.*
```

might contain:

```python
class LogicComponent:

    def method_1(self) -> None:
        # 100 lines

    def method_2(self) -> None:
        # 200 lines

    # More than 20 additional methods...
```

The component has become difficult to understand.

Instead, extract meaningful responsibilities:

```text
logic_component/
├── logic_component.py
└── actions/
    ├── method_1.py
    ├── method_2.py
    └── ...
```

The main component becomes an orchestrator:

```python
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

The extracted component can have its own internal implementation:

```python
class Method1:

    def execute(self) -> None:
        self._split_method_1()
        self._split_method_2()

    def _split_method_1(self) -> None:
        ...

    def _split_method_2(self) -> None:
        ...
```

The result is:

```text
LogicComponent
├── Method1
└── Method2
```

The important distinction is:

> ⚠️ **Do not split code merely to make files smaller. Split it when the resulting component represents a meaningful responsibility or boundary.**

---

# 12. 🚫 Avoid Unstructured Module-Level State

COA prefers meaningful state and behavior to belong to components.

Avoid arbitrary module-level state and functions:

```python
from .tables import Table1

DATABASE_ENGINE = "..."

func1()


class Database:

    def __init__(self) -> None:
        self.table_1 = Table1()


def func1() -> None:
    ...
```

Instead, place state and behavior inside the appropriate component:

```python
from .tables import Table1


class Database:

    def __init__(self) -> None:
        self.database_engine = "..."
        self.table_1 = Table1()
        self.func1()

    def func1(self) -> None:
        ...
```

Even better, if the value is an external dependency, inject it:

```python
from .tables import Table1


class Database:

    def __init__(self, database_engine: str) -> None:
        self.database_engine = database_engine
        self.table_1 = Table1()
```

The component now has a clear boundary: it owns its internal state while receiving external dependencies from outside.

This does not mean that module-level constants, type declarations, imports, or language-required constructs are forbidden. The principle is to avoid using modules as arbitrary containers for unrelated global behavior and state.

---

# 13. 🔤 Follow the Language's Native Conventions

COA is an architectural mindset, not a replacement for language conventions.

Always follow the idioms of the language being used.

If a language convention uses:

- `PascalCase` → use `PascalCase`
- `camelCase` → use `camelCase`
- `snake_case` → use `snake_case`
- another established convention → follow it

The architecture should adapt to the language, not fight against it.

For example, Python naturally uses:

```text
model_1.py
database_config.py
logic_component.py
```

while JavaScript or TypeScript may use another naming convention.

The component-oriented mindset remains the same.

---

# 14. 🔒 Strict Type Checking

COA strongly prefers **strict type checking**.

Whenever the language and its tooling provide a type checker, the project should use the **strictest practical type-checking mode** available.

This applies regardless of the programming language:

- 🐍 Python — strict static type checking
- 🟨 TypeScript — strict compiler options
- ☕ Java — strict compiler and static-analysis settings
- 🟦 C# — nullable reference types and strict analysis where applicable
- 🦀 Rust — use the compiler's type system and linting capabilities rigorously
- ⚙️ C++ — use strong compiler diagnostics and static-analysis tools
- and other languages with type-checking or static-analysis capabilities.

The principle is:

> **If the language can detect a class of error before runtime, make the tooling detect it as early and strictly as practical.**

## 🧠 Types Are Part of the Architecture

Types should not be treated merely as annotations added to satisfy a tool.

They are part of the component's interface.

For example:

```python
class Database:

    def __init__(self, database_engine: str) -> None:
        self.database_engine = database_engine
```

The type information communicates that `Database` expects a `str` and that its constructor does not return a value.

Likewise:

```python
class Api:

    def __init__(self, database: Database) -> None:
        self.database = database
```

communicates the relationship between `Api` and `Database`.

The type system therefore helps make the component boundaries explicit.

> 🔌 **Types are part of the contract between components.**

## 🚫 Do Not Weaken the Type Checker to Make Code Pass

Avoid disabling strict checks simply because they make development more difficult.

For example, do not routinely:

- disable type-checking rules;
- suppress type errors without a valid reason;
- use broad escape types such as `Any` when a precise type is possible;
- omit types from important public interfaces;
- weaken compiler settings to accommodate poorly typed code.

Instead, improve the code or the component boundary.

For example, avoid:

```python
def process(value: Any):
    ...
```

when the component actually requires a specific type:

```python
def process(value: PaymentRequest) -> PaymentResult:
    ...
```

The more precise version communicates the component's contract directly.

## 🧩 Strict Typing and Component Boundaries

Strict type checking becomes especially valuable in COA because components communicate through explicit interfaces.

Consider:

```text
Project
│
├── Configuration
├── Database
└── Api
    ├── Route1
    └── Route2
```

The types of the dependencies make those relationships explicit:

```python
class Project:

    def __init__(
        self,
        database: Database,
        api: Api,
        configuration: Configuration,
    ) -> None:
        self.database = database
        self.api = api
        self.configuration = configuration
```

A type checker can then verify that the components are actually being wired together correctly.

This makes the type system another layer of architectural validation:

```text
Filesystem
    ↓
Component hierarchy

Types
    ↓
Component contracts

Type checker
    ↓
Dependency correctness
```

## ⚠️ Strict Does Not Mean Blindly Rigid

"Strict" does not mean that every possible warning must be eliminated at any cost.

Some situations genuinely require an escape hatch, such as:

- interaction with an untyped external library;
- dynamically generated values;
- legacy APIs;
- language limitations;
- interoperability with another system.

When this happens, the exception should be **localized and intentional**.

Prefer:

```python
def load_legacy_value() -> LegacyValue:
    ...
```

over allowing an untyped boundary to spread throughout the entire application.

The goal is to keep the untyped or dynamically typed portion of the system as small as possible.

> **Contain uncertainty at the boundary; do not let it spread through the architecture.**

## 🛠️ Type Checking Is Part of Development

Type checking should be integrated into the normal development workflow.

It should ideally run:

- during local development;
- in the editor/IDE;
- as part of automated validation;
- in CI/CD pipelines.

A project should not depend solely on developers manually remembering to run the type checker.

The development level of the repository should therefore include the necessary configuration for strict type checking.

The exact configuration depends on the language and tooling.

## 🧠 The COA Principle

COA therefore follows this rule:

> 🔒 **Always use the strict type-checking mode that is practical for the language and project.**

The objective is not merely to have types in the code.

The objective is to make the type system actively protect the architecture.

```text
Explicit Components
        ↓
Explicit Interfaces
        ↓
Explicit Types
        ↓
Strict Type Checking
        ↓
Earlier Error Detection
```

> 💡 **If the compiler or type checker can prove that something is wrong, let it do so before the program reaches runtime.**

---

# 15. 💬 Self-Documenting Code — Avoid Comments

COA strongly prefers **self-explanatory code over comments**.

The architecture, component hierarchy, naming, and organization should make the purpose and relationships of the code understandable without requiring comments to explain what the code is doing.

The fundamental idea is:

> **The code should explain itself.**

When components are properly separated and named, the filesystem already communicates the architecture:

```text
project/
├── api/
│   ├── api.py
│   └── routes/
├── database/
│   ├── database.py
│   └── tables/
├── configuration/
└── services/
```

The code then communicates the behavior:

```python
class Project:

    def __init__(self) -> None:
        self.database = Database()
        self.api = Api(self.database)
        self.configuration = Configuration()
```

There should be no need to write comments such as:

```python
# Create the database
self.database = Database()

# Create the API and give it the database
self.api = Api(self.database)

# Create the configuration
self.configuration = Configuration()
```

The code is already clear.

The architecture and the code structure should carry the explanation.

## 🧠 Comments Should Not Compensate for Poor Structure

If a piece of code requires a comment to explain what it does, first ask whether the code itself could be improved.

For example, avoid:

```python
# Check if the user is allowed to access the resource
if user.role == "admin" or user.role == "manager":
    ...
```

Prefer:

```python
if self.authorization.can_access(user, resource):
    ...
```

The name and component boundary communicate the intent directly.

## 🧩 Architecture as Documentation

In COA, the architecture itself acts as documentation.

For example:

```text
api/
├── routes/
├── middleware/
└── authentication/
```

already communicates that the API contains routes, middleware, and authentication.

The component hierarchy therefore becomes a form of **structural documentation**.

> 🌳 **A well-organized project should explain its architecture through its structure.**

## ✨ Prefer Better Names Over Comments

When a comment is being used to explain *what* something does, prefer improving the name.

Instead of:

```python
# Get the active users
users = get_users()
```

prefer:

```python
active_users = get_active_users()
```

Instead of:

```python
# Calculate the total price including taxes
value = calculate()
```

prefer:

```python
total_price_with_tax = calculate_total_price_with_tax()
```

The code becomes its own explanation.

## 🚫 Avoid Comments That Repeat the Code

Comments should not simply translate the code into natural language.

Avoid:

```python
# Increment counter
counter += 1

# Create user
user = User()

# Save user
repository.save(user)
```

These comments provide no additional information.

The code is already explicit.

## ⚠️ Comments May Still Be Necessary

The principle is not that comments are forbidden under every circumstance.

A comment can be appropriate when it explains something that **cannot be expressed clearly through the code itself**.

For example:

- an external system limitation;
- a non-obvious workaround;
- a protocol or specification requirement;
- a temporary compatibility measure;
- a security or operational constraint;
- a reason why an unusual implementation is necessary.

For example:

```python
# This workaround is required because the legacy API rejects
# requests containing an empty Content-Type header.
request.headers.pop("Content-Type", None)
```

The comment explains **why** the unusual code exists, rather than simply explaining **what** the code does.

This leads to a useful rule:

> **Do not comment what the code already says. Comment only what the code cannot say.**

## 🧠 The COA Principle

COA therefore prefers the following hierarchy:

```text
Architecture
    ↓
Component boundaries
    ↓
Meaningful names
    ↓
Clear code
    ↓
Comments only when necessary
```

The objective is to make the codebase understandable by reading:

1. the repository structure;
2. the component hierarchy;
3. the component names;
4. the dependencies between components;
5. the implementation itself.

Comments should be the **exception**, not the primary mechanism for explaining the software.

> 💡 **If the code needs a comment to explain what it does, first ask whether the code should be changed so that it explains itself.**

---

# 16. 📦 Direct Imports Over Export Aggregation

COA does not require or encourage creating an additional export layer merely to re-export components from a directory.

Some languages provide mechanisms for defining a directory's public exports, such as Python's `__init__.py` or JavaScript's `index.js`. These mechanisms can be useful in some architectures, but COA does not make them part of the architectural pattern.

The preferred approach is to **import the component directly from the file that defines it**.

## 🔄 Avoid Double Work

Consider a Python package:

```text
models/
├── __init__.py
├── user.py
├── product.py
└── order.py
```

An export-oriented approach might require maintaining `__init__.py`:

```python
from .user import User
from .product import Product
from .order import Order
```

Then other components import from the package:

```python
from .models import (
    User,
    Product,
    Order,
)
```

This creates two places that need to be maintained:

```text
user.py
    ↓
__init__.py
    ↓
consumer
```

When a component is added, renamed, or removed, the export file may also need to be updated.

COA instead prefers importing the component directly:

```python
from .models.user import User
from .models.product import Product
from .models.order import Order
```

The dependency is now explicit:

```text
consumer
   │
   ├──→ models/user.py
   ├──→ models/product.py
   └──→ models/order.py
```

There is no intermediate export layer to maintain.

## 🧭 The Import Should Show Where the Component Lives

A direct import communicates both the component and its location:

```python
from .models.user import User
```

This tells the reader immediately:

> `User` is defined in `models/user`.

Likewise:

```python
from .api.routes.authentication.login import Login
```

makes the component's architectural location explicit.

This is consistent with the COA principle that the filesystem is an architectural map.

> 🌳 **If the filesystem communicates the architecture, imports should not hide that structure unnecessarily.**

## 🚫 Do Not Create an Export Layer Just for Convenience

Avoid creating:

```text
models/
├── __init__.py
├── user.py
├── product.py
└── order.py
```

solely so consumers can write:

```python
from .models import User, Product, Order
```

when the same dependency can be expressed directly:

```python
from .models.user import User
from .models.product import Product
from .models.order import Order
```

The shorter import is not necessarily the clearer import.

COA favors **explicitness over indirection**.

## 🌐 Language-Agnostic Principle

Not every programming language provides an export mechanism like Python's `__init__.py` or JavaScript's `index.js`.

Therefore, COA should not depend on such a feature.

The architectural principle is language-independent:

> **Import or reference the component directly from its source location whenever the language supports doing so naturally.**

If a language provides only direct file/module imports, use them directly.

If another language provides an export mechanism, it does not need to be introduced merely to satisfy COA.

The architecture should remain valid even when the language has no equivalent feature.

## 🧩 Exports Are an Implementation Feature, Not an Architectural Requirement

A package export mechanism is a **language/module-system feature**, not a requirement of component-oriented architecture.

COA cares about:

```text
Component
    ↓
Location
    ↓
Dependency
```

It does not require:

```text
Component
    ↓
Export file
    ↓
Package
    ↓
Dependency
```

unless there is a genuine architectural reason for that additional boundary.

This keeps the component dependency graph straightforward:

```text
Project
│
├──→ Api
├──→ Database
└──→ Configuration
```

rather than introducing unnecessary indirection:

```text
Project
│
└──→ Package Export
       │
       ├──→ Api
       ├──→ Database
       └──→ Configuration
```

## 🧠 The COA Principle

The rule is therefore:

> 📦 **Do not create an export/re-export layer merely to shorten imports. Prefer direct imports from the file that defines the component.**

This reduces duplicated declarations, avoids unnecessary indirection, and keeps the relationship between the code and the filesystem explicit.

```text
Direct:

consumer
   │
   └──→ component file


Avoid unnecessary indirection:

consumer
   │
   └──→ export file
           │
           └──→ component file
```

> 💡 **One component, one source of truth, one direct dependency.**

---

# 17. 🌐 Web UI Applications

Web UI applications require a small adaptation of the COA mindset.

Unlike applications written primarily in one language, a Web UI is often composed of multiple technologies:

- 🟨 JavaScript / TypeScript — behavior and logic
- 🟧 HTML — structure and markup
- 🟦 CSS — presentation and styling

Therefore, the concept of **"one component per source file"** should not mean that HTML, CSS, and JavaScript must always be architecturally separated.

Instead:

> **The component is the architectural unit; HTML, CSS, JavaScript, and other resources are implementations of that component.**

A component may therefore span multiple files:

```text
button/
├── button.js
├── button.html
└── button.css
```

Conceptually:

```text
Button
├── behavior
├── structure
└── presentation
```

The three files are not necessarily three architectural components. They are different representations of the same component.

---

## 🖥️ Single-Page Applications

A SPA can be organized around a root application component:

```text
project/
├── project.js
├── project.html
├── pages/
├── components/
└── themes/
```

Conceptually:

```text
Project
├── Pages
├── Components
└── Themes
```

The root component can compose pages:

```javascript
class Project {

    constructor() {
        this.page1 = new Page1();
        this.page2 = new Page2();
    }
}
```

A page can compose smaller components:

```javascript
class Page1 {

    constructor() {
        this.form = new Form();
        this.button = new Button();

        this.form.element.appendChild(
            this.button.element
        );
    }
}
```

This produces:

```text
Project
├── Page1
│   ├── Form
│   └── Button
└── Page2
```

The DOM can therefore be considered part of the component's internal structure.

---

## 📄 Multi-Page Applications

For a traditional multi-page application, each page can be treated as a component:

```text
project/
├── pages/
│   ├── login/
│   │   ├── login.html
│   │   ├── login.js
│   │   └── private_theme.css
│   └── hub/
│       ├── hub.html
│       └── hub.js
└── themes/
```

Conceptually:

```text
Project
├── Pages
│   ├── Login
│   │   ├── HTML
│   │   ├── JavaScript
│   │   └── private theme
│   │
│   └── Hub
│       ├── HTML
│       └── JavaScript
│
└── Themes
```

Here, `login/` is a singular component directory representing the `Login` page.

The files inside it are implementation parts of that component.

---

# 18. 🎨 Themes and Styling

Shared themes should normally be represented as a collection:

```text
themes/
├── light.css
├── dark.css
└── corporate.css
```

Conceptually:

```text
Themes
├── Light
├── Dark
└── Corporate
```

When a style belongs exclusively to one component, it can remain inside that component:

```text
pages/
└── login/
    ├── login.html
    ├── login.js
    └── private_theme.css
```

This communicates:

> `private_theme.css` belongs to `Login`.

Whereas:

```text
themes/
└── dark.css
```

communicates:

> `dark.css` belongs to the application's shared theme collection.

---

# 19. 📈 Components Should Grow Hierarchically

COA does not require every component to start as a directory.

A component can start as a single file and become a directory only when it needs to grow.

For example:

```text
api.py
```

can become:

```text
api/
└── api.py
```

and later:

```text
api/
├── api.py
├── routes/
└── middleware/
```

Later still:

```text
api/
├── api.py
├── routes/
│   ├── users.py
│   ├── products.py
│   └── authentication/
│       ├── authentication.py
│       └── ...
└── middleware/
```

Conceptually:

```text
Api
├── Routes
│   ├── Users
│   ├── Products
│   └── Authentication
└── Middleware
```

This allows architecture to evolve naturally.

> 📈 **As a component becomes more complex, its structure should become more explicit rather than forcing everything into one enormous file.**

---

# 20. 🧭 COA Design Checklist

When designing a project or a new component, ask:

### 🧩 What is the component?

Identify the actual conceptual object, subsystem, or responsibility.

### 📦 What does it contain?

If the component contains other components, represent that relationship in the directory tree.

### 🔌 What does it depend on?

Dependencies should be explicit whenever practical.

### 🚪 What does it expose?

Keep the public interface smaller than the internal implementation whenever possible.

### 🪓 Is it becoming too large?

If a component is difficult to understand, identify meaningful internal components and extract them.

### 🌳 Does the filesystem represent the architecture?

Someone should be able to inspect the directory tree and understand the component hierarchy.

### 🔤 Does the naming follow the language and domain?

Use natural terminology. Do not force pluralization or naming patterns when they do not make semantic sense.

### 🏗️ Is development tooling separated from the program?

Build scripts, packaging configuration, generated artifacts, and similar development concerns should not be confused with runtime components.

### 🎯 Does the repository have one clear identity?

A repository should represent one coherent software unit.

---

# 21. 🧠 The Complete COA Mental Model

The complete architecture can be understood as a hierarchy of boundaries:

```text
Repository
│
├── Development Level
│   ├── Tooling
│   ├── Build
│   ├── Test
│   ├── Packaging
│   ├── Scripts
│   └── Development Artifacts
│
└── Program Level
    │
    └── Root Component
        │
        ├── Component
        │   ├── Subcomponent
        │   └── Subcomponent
        │
        ├── Component
        │
        └── Collection
            ├── Component
            └── Component
```

This can be summarized as:

```text
Repository
    ↓
Development Environment
    ↓
Program / Software Unit
    ↓
Root Component
    ↓
Components
    ↓
Subcomponents / Collections
    ↓
Implementation
```

Each level answers a different question:

**Repository**

> "What software unit am I developing?"

**Development Level**

> "How do I develop, build, test, package, and run it?"

**Program Level**

> "What is the actual software?"

**Component Level**

> "What is the software made of?"

**Component Hierarchy**

> "What does each component contain?"

**Wiring**

> "How do the components communicate and depend on each other?"

**Implementation**

> "How does each component actually work?"

---

# 🏁 22. Final Principles

Component-Oriented Architecture is fundamentally a **way of thinking about software**.

Instead of viewing a project as a collection of files:

```text
files
├── functions
├── classes
└── miscellaneous code
```

think of it as a composition of components:

```text
Project
├── Api
│   ├── Routes
│   └── Middleware
├── Database
│   ├── Tables
│   └── Connection
├── Configuration
└── Services
    ├── Email
    └── Payment
```

The filesystem mirrors that structure.

The code wires those components together.

The repository provides the development boundary around the software.

The core principles are:

- 🏗️ **A repository represents one coherent software unit.**
- 🛠️ **The repository root is the Development Level.**
- 💻 **The inner program is the Program Level.**
- 🧩 **Components are the architectural building blocks.**
- 🌳 **The filesystem represents the component hierarchy.**
- 🔤 **Singular/plural naming is a semantic convention, not a grammatical rule.**
- 📦 **Plural and non-plural category names can both represent collections.**
- 🔌 **Components are explicitly wired through their dependencies.**
- 💉 **External dependencies should be injected when appropriate.**
- 🚪 **Components should hide their internal implementation.**
- 🪓 **Large components should be decomposed into meaningful subcomponents.**
- 📄 **Each file should normally have one primary component.**
- 🔤 **Language conventions should always be respected.**
- 🌐 **Web UI components may span HTML, CSS, and JavaScript/TypeScript.**
- 📈 **The architecture should grow hierarchically as complexity grows.**
- 🗺️ **The project tree should make the architecture visible.**

Ultimately:

> **The repository is the development boundary.**
>
> **The program is the software boundary.**
>
> **Components are the architectural building blocks.**
>
> **Dependencies wire the components together.**
>
> **The filesystem represents their hierarchy.**
>
> **Technology is implementation; the component is architecture.**
>
> **You should be able to look at the project tree and see the software itself.** 🧩🌳
