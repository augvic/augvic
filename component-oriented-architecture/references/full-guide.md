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
├── main.py
├── build/
├── dist/
└── project/                     # ← Program Level / Application
    ├── project.py
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
├── main.py
└── project/
    ├── project.py
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

## ⚠️ Not Every Collection Has a Plural Form

The singular/plural distinction is **semantic, not grammatical**.

Some concepts naturally have a plural form:

```text
model     → models
service   → services
handler   → handlers
route     → routes
```

However, some concepts are naturally used as **uncountable nouns, category names, technical terms, or acronyms without a useful plural form**.

For example:

```text
infrastructure/
middleware/
ipc/
security/
configuration/
```

These may represent **collections or categories of components**, even though their names are not grammatically plural.

For example:

```text
infrastructure/
├── database.py
├── messaging.py
└── storage.py
```

This is a collection of infrastructure components.

Likewise:

```text
middleware/
├── authentication.py
├── logging.py
└── compression.py
```

`middleware/` is a collection/category of components even though it is not a plural noun.

The same applies to technical acronyms:

```text
ipc/
├── shared_memory.py
├── pipe.py
└── socket.py
```

`ipc/` represents a category containing multiple components related to Inter-Process Communication.

Therefore:

```text
Singular name
    ↓
Usually represents one conceptual component

Plural name
    ↓
Usually represents a collection of peer components

Non-plural category name
    ↓
May also represent a collection of components
```

> 🧠 **Do not force a word into a plural form just to satisfy the convention.**

If a concept naturally functions as a category, technical domain, acronym, or uncountable noun, its natural name should be preserved.

For example:

```text
project/
├── api/
├── database/
├── models/
├── services/
├── infrastructure/
├── middleware/
└── ipc/
```

can be interpreted as:

```text
Project
├── Api              ← component
├── Database         ← component
├── Models           ← collection
├── Services         ← collection
├── Infrastructure   ← collection/category
├── Middleware       ← collection/category
└── IPC              ← collection/category
```

The architectural meaning takes precedence over grammatical number.

> **Architecture should follow meaning, not grammar.**

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

# 14. 💬 Self-Documenting Code — Avoid Comments

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

# 15. 📦 Use Language Features for Component Exports

When the language provides a standard mechanism for exposing components from a package or directory, use it.

For example, Python:

```text
models/
├── __init__.py
├── model_1.py
├── model_2.py
├── model_3.py
└── model_4.py
```

JavaScript:

```text
models/
├── init.js
├── model_1.js
├── model_2.js
├── model_3.js
└── model_4.js
```

The purpose is to provide a clean public boundary for the collection.

For example:

```python
from .model_1 import Model1
from .model_2 import Model2
```

The internal filesystem can remain detailed while the external interface remains simple.

---

# 16. 🌐 Web UI Applications

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

# 17. 🎨 Themes and Styling

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

# 18. 📈 Components Should Grow Hierarchically

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

# 19. 🧭 COA Design Checklist

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

# 20. 🧠 The Complete COA Mental Model

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

# 🏁 21. Final Principles

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
