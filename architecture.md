# 🧩 Component-Oriented Architecture — COA

## 🎯 Purpose

This document defines the architectural and organizational conventions used when designing and structuring software projects.

The central idea behind **Component-Oriented Architecture (COA)** is to think of software as a **real, tangible structure made of components**.

Each component is a well-defined unit with its own responsibility. Components can contain other components, and they are **wired together through explicit relationships and dependencies**.

Instead of thinking primarily in terms of files, functions, or technical layers, COA encourages us to think in terms of:

> **Components → Subcomponents → Relationships → Composition**

The filesystem should reflect this mental model. The project structure should make it possible to look at a directory tree and understand the architecture of the software.

Python is used throughout this document for examples, but COA is **language-agnostic**. The same principles can be applied to Python, JavaScript, TypeScript, C++, Java, C#, Rust, or any other language, as well as to backends, frontends, desktop applications, games, libraries, services, and other types of software.

---

# 🧱 1. Think in Components

Consider a simple project.

A conventional organization might look like this:

```text
project/
├── main.*
├── api.*
├── database.*
├── routes/
└── configuration/
```

COA encourages us to think about the project as a collection of components:

```text
project/
├── project.*
├── api/
│   ├── api.*
│   └── routes/
│       ├── route_1.*
│       └── route_2.*
├── database/
│   ├── database.*
│   └── tables/
│       ├── table_1.*
│       └── table_2.*
└── configuration/
    ├── config_1.*
    └── config_2.*
```

The difference is conceptual.

In the first structure, `api`, `database`, and `configuration` look primarily like **technical categories**.

In the second structure, they represent **components of the project**.

The `api` directory represents the **Api component**.

The `database` directory represents the **Database component**.

The `configuration` directory represents a **collection of configuration components**.

The filesystem therefore becomes a representation of the architecture.

---

# 🔌 2. Components Are Wired Together

At the code level, components are composed by creating them and connecting their dependencies.

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

This produces a hierarchy:

```text
Project
├── Database
├── Api
│   ├── Route1
│   └── Route2
└── Configuration
```

This is one of the fundamental ideas of COA:

> **A component may contain other components, and components are explicitly wired together through their dependencies.**

The code and the filesystem should communicate this hierarchy.

---

# 🧩 3. A File Represents a Component

The preferred mindset is to treat each file as a **solid unit** rather than as a miscellaneous container of unrelated functions.

Whenever the language supports classes, objects, structs, records, or similar constructs, use them to represent these units.

The exact mechanism depends on the language.

For example:

- Python → classes
- C++ → classes/structs
- Java → classes
- TypeScript → classes/interfaces/types where appropriate
- Rust → structs/enums/traits
- Go → structs/interfaces

The important part is not the specific language feature.

The important part is the mindset:

> **A source file should represent a meaningful component or part of a component.**

---

# 1️⃣ 4. One Primary Class per File

A file should normally contain **one primary class/component**.

Avoid creating a file such as:

```text
models.*
```

containing many unrelated model classes.

Instead, split them into individual components:

```text
models/
├── model_1.*
├── model_2.*
└── model_3.*
```

For example:

```text
models/
├── user.py
├── product.py
└── order.py
```

This makes each component independently identifiable.

The goal is not to impose an absolute restriction against helper types, exceptions, protocols, or small supporting declarations. Rather, the rule is:

> **Each file should have one clear primary responsibility and one primary component.**

---

# 🪓 5. Split Large Components

Components should remain understandable and cohesive.

When a class becomes excessively large, do not simply accept the growing file. Look for internal responsibilities that can become independent components.

For example, suppose we have:

```text
logic_component.*
```

containing a very large class:

```python
class LogicComponent:

    def method_1(self) -> None:
        # 100 lines

    def method_2(self) -> None:
        # 200 lines

    # More than 20 additional methods...
```

The component has become difficult to understand and maintain.

Instead, extract meaningful responsibilities:

```text
logic_component/
├── logic_component.*
└── actions/
    ├── method_1.*
    ├── method_2.*
    └── ...
```

The main component becomes an orchestrator:

```python
# logic_component.py

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

The extracted component can then contain its own internal implementation:

```python
# method_1.py

class Method1:

    def execute(self) -> None:
        self._split_method_1()
        self._split_method_2()

    def _split_method_1(self) -> None:
        ...

    def _split_method_2(self) -> None:
        ...
```

The result is a deeper but more meaningful structure:

```text
LogicComponent
├── Method1
└── Method2
```

And:

```text
Method1
├── split_method_1()
└── split_method_2()
```

The important distinction is that the extracted objects should represent **meaningful responsibilities**, rather than merely moving arbitrary pieces of code into separate files.

> ⚠️ **Do not split code merely to make files smaller. Split it when the resulting component has a meaningful responsibility or boundary.**

---

# 🌳 6. The Filesystem Should Reflect the Component Hierarchy

One of the most important COA principles is:

> **The project tree should reflect the conceptual component tree.**

For example:

```text
Project
├── Api
│   ├── Routes
│   │   ├── Route1
│   │   └── Route2
│   └── Middleware
├── Database
│   ├── Tables
│   │   ├── Table1
│   │   └── Table2
│   └── Connection
└── Configuration
    ├── DatabaseConfig
    └── ApplicationConfig
```

The filesystem can then express almost the same structure:

```text
project/
├── project.py
├── api/
│   ├── api.py
│   ├── routes/
│   │   ├── route_1.py
│   │   └── route_2.py
│   └── middleware/
├── database/
│   ├── database.py
│   ├── tables/
│   │   ├── table_1.py
│   │   └── table_2.py
│   └── connection.py
└── configuration/
    ├── database_config.py
    └── application_config.py
```

You should be able to mentally translate the directory tree into the component hierarchy.

---

# 🔤 7. Singular vs. Plural Directory Convention

Directory names should communicate whether the directory represents **one component** or **a collection of components**.

However, **singular vs. plural is not a strict naming rule**. It is a semantic convention that helps communicate the architectural role of a directory.

The important question is not:

> "Is this word singular or plural?"

The important question is:

> **"Does this directory represent one component, or a collection/category of components?"**

---

## 🧩 Singular noun = component

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

The same principle applies to components such as:

```text
database/
authentication/
application/
project/
configuration/
```

These directories represent a singular conceptual component.

---

## 📦 Plural noun = collection

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

It represents a collection rather than a single `Models` component.

Other examples include:

```text
models/
services/
handlers/
routes/
controllers/
repositories/
```

These directories represent collections of peer components.

---

## ⚠️ Not Every Collection Has a Plural Form

The singular/plural distinction is **semantic, not grammatical**.

Some concepts naturally have a plural form:

```text
model  → models
service → services
handler → handlers
route → routes
```

However, some concepts are naturally used as **uncountable nouns, category names, technical terms, acronyms, or concepts without a useful plural form**.

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

This directory represents a collection of infrastructure components.

Likewise:

```text
middleware/
├── authentication.py
├── logging.py
└── compression.py
```

`middleware/` is still a collection of components, despite not being a plural noun.

The same applies to technical acronyms:

```text
ipc/
├── shared_memory.py
├── pipe.py
└── socket.py
```

`ipc/` represents a category containing multiple components related to **Inter-Process Communication**, rather than a single IPC component.

Therefore, the convention should be understood as:

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

The **meaning of the directory takes precedence over its grammatical form**.

> 🧠 **Do not force a word into a plural form just to satisfy the convention.**
>
> If a concept naturally functions as a category, technical domain, acronym, or uncountable noun, its natural name should be preserved.

For example, this is perfectly valid:

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

The architectural interpretation is:

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

So the actual COA principle is not:

> **"Plural directories are collections."**

It is:

> **"Directories representing collections or categories should be named according to the natural terminology of the domain. Pluralization is only one way of expressing that meaning."**

This distinction is important because **architecture should follow meaning, not grammar**. 🧠🏗️

---

# 🧠 8. The Singular/Plural Rule in Practice

Consider:

```text
project/
├── project.py
├── models/
│   ├── user.py
│   ├── product.py
│   └── order.py
├── services/
│   ├── email.py
│   └── payment.py
├── api/
│   ├── api.py
│   ├── routes/
│   │   ├── users.py
│   │   └── products.py
│   └── middleware/
└── database/
    ├── database.py
    ├── connection.py
    └── migrations/
```

This can be read conceptually as:

```text
Project
├── Models
│   ├── User
│   ├── Product
│   └── Order
│
├── Services
│   ├── Email
│   └── Payment
│
├── Api
│   ├── Routes
│   │   ├── Users
│   │   └── Products
│   └── Middleware
│
└── Database
    ├── Connection
    └── Migrations
```

Notice the difference:

```text
models/
```

means:

> **"Here are the models."**

While:

```text
api/
```

means:

> **"Here is the Api."**

This gives the filesystem a semantic meaning instead of treating directories as arbitrary organizational buckets.

---

# 📈 9. Components Should Grow Hierarchically

COA does not require every component to start with a directory.

Components can start as a single file and become directories only when they need to grow.

For example, a project may initially contain:

```text
api.py
```

When the component becomes more complex:

```text
api/
└── api.py
```

Later:

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

This allows the architecture to evolve naturally.

The component itself remains stable while its internal implementation becomes more structured.

You can literally read the tree as a hierarchy of components:

```text
Api
├── Routes
│   ├── Users
│   ├── Products
│   └── Authentication
└── Middleware
```

This is one of the strongest benefits of COA:

> **Complexity is represented spatially.**

As a component becomes more complex, its structure becomes deeper rather than forcing one enormous file to contain everything.

---

# 🔌 10. Dependency Injection and Explicit Wiring

Components should preferably depend on **abstractions or explicitly provided dependencies**, rather than secretly constructing everything they need internally.

Avoid:

```python
class Database:

    def __init__(self) -> None:
        self.engine = "sqlite"
        self.table_1 = Table1()
```

when the database engine is actually an external configuration or dependency.

Prefer:

```python
class Database:

    def __init__(self, engine: str) -> None:
        self.engine = engine
        self.table_1 = Table1()
```

Now the component does not need to know where `engine` came from.

Another component can provide it:

```text
Project
├── Database
└── DbConfig
```

For example:

```python
# db_config.py

class DbConfig:

    def __init__(self) -> None:
        self.engine = "sqlite"
```

```python
# database.py

class Database:

    def __init__(self, engine: str) -> None:
        self.engine = engine
```

And:

```python
# project.py

from .configuration import DbConfig
from .database import Database


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

> 🔌 **Components should be wired together explicitly rather than relying on hidden global state or implicit dependencies.**

---

# 🚫 11. Avoid Unstructured Module-Level State

COA prefers meaningful state and behavior to belong to components.

Avoid arbitrary module-level state and functions such as:

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

Instead, place the state and behavior inside the appropriate component:

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

The component now has a clear boundary.

It owns its internal state while receiving external dependencies from outside.

---

# 🧩 12. Components Should Know as Little as Possible

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

This produces clear boundaries between components.

The goal is:

> **Expose what a component needs to be used, while hiding how it works internally.**

This is what allows components to evolve independently.

---

# 🔤 13. Follow the Language's Native Conventions

COA is an architectural mindset, not a replacement for language conventions.

Always follow the idioms of the language being used.

If a language convention uses:

- `PascalCase` → use `PascalCase`
- `camelCase` → use `camelCase`
- `snake_case` → use `snake_case`
- `kebab-case` → use `kebab-case` where appropriate

The architecture should adapt to the language, not fight against it.

For example, Python naturally uses:

```text
model_1.py
database_config.py
logic_component.py
```

while a JavaScript/TypeScript project may use a different naming convention.

The component-oriented mindset remains the same.

---

# 📦 14. Use Language Features for Component Exports

When the language provides a standard mechanism for exposing components from a package or directory, use it.

For example, Python may use:

```text
models/
├── __init__.py
├── model_1.py
├── model_2.py
├── model_3.py
└── model_4.py
```

And JavaScript may use:

```text
models/
├── index.js
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

# 🌐 15. Web UI Applications

Web UI applications require a small adaptation of the COA mindset.

Unlike applications written primarily in one programming language, a traditional web application is often composed of multiple technologies:

- 🟨 JavaScript / TypeScript — behavior and logic
- 🟧 HTML — structure and markup
- 🟦 CSS — presentation and styling

Therefore, the concept of **"one component per source file"** should not be interpreted as requiring HTML, CSS, and JavaScript to be completely separated from the component they belong to.

Instead, the **component itself remains the primary unit of organization**, and its different technical representations are kept together when they belong to that component.

The important question remains:

> **"What is the component?"**

Once the component is identified, its HTML, JavaScript, CSS, and other resources can be organized around it.

---

## 🖥️ Single-Page Applications (SPA)

For a SPA, the application can be organized around a root application component:

```text id="3m9s0k"
project/
├── project.js
├── project.html
├── pages/
├── components/
└── themes/
```

Conceptually:

```text id="6x8h2d"
Project
├── Pages
├── Components
└── Themes
```

The root `project.js` can act as the main composition component:

```javascript id="6m6y9f"
class Project {

    constructor() {
        this.page1 = new Page1();
        this.page2 = new Page2();
    }
}
```

A page can then compose smaller components:

```javascript id="4q9g8f"
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

This produces a component hierarchy such as:

```text id="w7q3t2"
Project
├── Page1
│   ├── Form
│   └── Button
└── Page2
```

The DOM itself can therefore be considered part of the component's internal structure.

For example:

```text id="v1t7za"
Page1
└── Form
    └── Button
```

And the JavaScript components are responsible for composing and wiring those elements together.

---

## 🧩 Components Can Span Multiple Technologies

A Web UI component does not necessarily need to be represented by a single file.

For example, a component could have:

```text id="5j1n3d"
button/
├── button.js
├── button.html
└── button.css
```

Conceptually:

```text id="t8h4pm"
Button
├── behavior
├── structure
└── presentation
```

The three files are not three independent architectural components.

They are **three representations of the same component**.

This is an important distinction.

COA is concerned with the **architectural identity of the component**, not with forcing every technology involved in that component into a separate architectural hierarchy.

---

# 📄 16. Multi-Page Applications (MPA)

For a traditional multi-page application, each page can be treated as a component.

For example:

```text id="1q3x7m"
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

```text id="s8w4qa"
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

Here, `login/` is a **singular component directory** representing the `Login` page.

Likewise, `hub/` represents the `Hub` page.

The files inside the directory are implementation parts of that component:

```text id="a6r9zc"
login/
├── login.html
├── login.js
└── private_theme.css
```

This can be understood as:

```text id="n0z8ue"
Login
├── HTML
├── JavaScript
└── private theme
```

The directory therefore acts as the boundary of the page component.

---

# 🎨 17. Themes and Styling

Themes should follow the same semantic distinction used throughout COA.

A shared collection of themes can be represented by a plural directory:

```text id="2f8h0q"
themes/
├── light.css
├── dark.css
└── corporate.css
```

Conceptually:

```text id="w2g7na"
Themes
├── Light
├── Dark
└── Corporate
```

However, when a style belongs exclusively to one component, it can remain inside that component:

```text id="5w2x1c"
pages/
└── login/
    ├── login.html
    ├── login.js
    └── private_theme.css
```

This communicates:

> `private_theme.css` belongs to `Login`.

Whereas:

```text id="q8k1sd"
themes/
└── dark.css
```

communicates:

> `dark.css` is part of the application's shared theme collection.

---

# 🧠 18. The Same COA Principles Still Apply

Although Web UI applications use several technologies simultaneously, the underlying architectural principles do not change.

The application should still be viewed as a hierarchy of components:

```text id="c9v4na"
Application
├── Pages
│   ├── Login
│   └── Hub
├── Components
│   ├── Button
│   ├── Form
│   └── Modal
└── Themes
    ├── Light
    └── Dark
```

The filesystem should represent that hierarchy:

```text id="q2m6wr"
project/
├── project.js
├── project.html
├── pages/
│   ├── login/
│   └── hub/
├── components/
│   ├── button/
│   ├── form/
│   └── modal/
└── themes/
    ├── light.css
    └── dark.css
```

And the JavaScript should wire the components together:

```javascript id="p7w3kd"
class Project {

    constructor() {
        this.page1 = new Page1();
        this.page2 = new Page2();
    }
}
```

The fact that the application uses `.html`, `.css`, and `.js` does not change the fundamental model.

> 🌐 **The technology is implementation. The component is architecture.**

The same component-oriented thinking can therefore be applied to:

- 🟨 JavaScript
- 🟦 TypeScript
- 🟧 HTML
- 🎨 CSS
- 🧩 Web Components
- ⚛️ React
- 🟢 Vue
- 🔺 Angular
- and other Web UI technologies.

The framework may change the implementation details, but the architectural question remains the same:

> **What are the components, what do they contain, and how are they wired together?**

---

# 🧭 19. COA Mental Model

When designing a project, ask the following questions:

### 🧩 What is the component?

Identify the actual conceptual object or subsystem.

### 📦 What does it contain?

If the component contains other components, represent that relationship in the directory tree.

### 🔌 What does it depend on?

Dependencies should be explicit whenever practical.

### 🚪 What does it expose?

Keep the public interface smaller than the internal implementation.

### 🪓 Is it becoming too large?

If a component is becoming difficult to understand, identify meaningful internal components and extract them.

### 🌳 Does the filesystem represent the architecture?

Someone should be able to inspect the directory tree and understand the component hierarchy.

### 🔤 Does the naming follow the language?

Architecture should coexist with the language's established conventions.

---

# 🏁 20. Summary

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

The filesystem mirrors this structure:

```text
project/
├── project.py
├── api/
├── database/
├── configuration/
└── services/
```

And the code wires the components together:

```python
class Project:

    def __init__(self) -> None:
        self.configuration = Configuration()
        self.database = Database(
            self.configuration.database_engine
        )
        self.api = Api(self.database)
```

The result is an architecture where:

- 🧩 **Components have clear identities.**
- 🌳 **The filesystem represents the component hierarchy.**
- 📦 **Directories distinguish components from collections.**
- 🔌 **Dependencies are explicitly wired together.**
- 🪓 **Large components can be decomposed into meaningful subcomponents.**
- 🚪 **Implementation details remain behind component boundaries.**
- 🔤 **Language-specific conventions are preserved.**
- 📈 **The architecture can grow naturally as the software grows.**

The ultimate goal is simple:

> **You should be able to look at the project tree and see the software itself.**

The filesystem is not merely where the code is stored.

**It is a map of the architecture.** 🗺️🧩