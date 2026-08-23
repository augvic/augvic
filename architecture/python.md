# Component-Oriented Python Architecture

## Purpose

This document defines the architectural and organizational conventions used when designing Python projects.

The central idea is to treat the source tree as a **map of the application's conceptual components**.

Code should not be organized only according to generic technical layers such as `controllers/`, `services/`, `repositories/`, etc. Instead, the structure should communicate:

- what components exist;
- which components contain other components;
- which directories are merely collections of related objects;
- which directories represent a single conceptual object/subsystem that has been split across multiple files;
- how code is composed at runtime.

The filesystem should therefore reflect the conceptual architecture of the application as closely as reasonably possible.

---

# 1. Core Mental Model

A project is viewed as a collection of **components**.

A component may be:

- a class;
- an object-oriented subsystem;
- a service;
- an API;
- a database subsystem;
- a scheduler;
- another cohesive conceptual unit.

A component can be implemented in one file when it is small:

```text
api.py
```

When it becomes sufficiently complex, it can become a package:

```text
api/
├── api.py
├── routes/
└── middleware/
```

The package represents the **component itself**, while its internal files and subdirectories contain the implementation details of that component.

Conceptually:

```text
Api
├── routes
└── middleware
```

The important distinction is therefore not simply "file versus folder".

It is:

```text
Component
    └── implementation
```

versus:

```text
Category
    ├── component
    ├── component
    └── component
```

---

# 2. Singular vs. Plural Directory Convention

The primary filesystem convention is based on the grammatical form of directory names.

## Plural noun = category / collection

A plural directory represents a **bag of related, peer components**.

Examples:

```text
models/
services/
handlers/
routes/
utils/
plugins/
```

For example:

```text
models/
├── user.py
├── product.py
└── order.py
```

This means:

> `models/` is a category containing multiple model components.

The directory itself is not intended to represent one object.

Another example:

```text
handlers/
├── authentication.py
├── payment.py
└── notification.py
```

The handlers are independent components that happen to belong to the same category.

---

## Singular noun = component/subsystem

A singular directory represents **one conceptual component**, even if that component requires several files internally.

Example:

```text
api/
├── api.py
├── routes/
└── middleware/
```

Conceptually:

```text
Api
├── routes
└── middleware
```

The directory `api/` represents the `Api` component.

The same principle applies to:

```text
database/
authentication/
configuration/
scheduler/
cache/
```

These directories represent conceptual subsystems rather than arbitrary collections.

## Grammatical Number Is a Heuristic, Not an Absolute Rule

The singular/plural convention is a useful naming heuristic, but **semantic role is authoritative**.

Some English nouns are singular or uncountable even when they represent a category or collection of related things.

For example:

```text
infrastructure/
```

is naturally named `infrastructure/`, even when it contains multiple independent infrastructure-related components:

```text
infrastructure/
├── database.py
├── logging.py
├── configuration.py
└── filesystem.py
```

`infrastructures/` is generally not appropriate for this purpose. In normal English, *infrastructure* is an uncountable noun; its plural form would usually refer to distinct infrastructure systems rather than a category of infrastructure code.

Therefore:

```text
api/             → component
database/        → component
authentication/  → component

models/          → category
services/        → category
handlers/        → category

infrastructure/ → category
```

The rule should therefore be understood as:

> **A noun representing a singular conceptual entity usually names a component. A noun representing a collection or category usually names a category. Grammatical singular/plural form is the normal naming convention, but semantic meaning takes precedence.**

Do not force a grammatically plural name merely to satisfy the convention. Prefer the natural and idiomatic name when the language does not provide a suitable plural form.

---

# 3. Component Packages

When a component becomes too large to comfortably fit in one module, split its implementation into multiple files while keeping the files inside a directory named after the component.

For example:

```text
api/
├── api.py
├── routes/
│   ├── users.py
│   ├── products.py
│   └── orders.py
└── middleware/
    ├── authentication.py
    └── logging.py
```

The important idea is:

```text
api/
```

is still **one component**.

It has merely been decomposed into smaller implementation units.

The component's public entry point should normally remain obvious:

```text
api/api.py
```

For example:

```python
from .routes import UsersRoute, ProductsRoute
from .middleware import AuthenticationMiddleware


class Api:
    def __init__(self) -> None:
        self.users = UsersRoute()
        self.products = ProductsRoute()
        self.authentication = AuthenticationMiddleware()
```

The `Api` object composes its internal components.

This gives the source tree a structure similar to the runtime composition:

```text
Api
├── UsersRoute
├── ProductsRoute
└── AuthenticationMiddleware
```

---

# 4. Categories Can Exist Inside Components

A component may contain categories of internal components.

For example:

```text
api/
├── api.py
├── routes/
│   ├── users.py
│   ├── products.py
│   └── orders.py
└── middleware/
    ├── authentication.py
    └── logging.py
```

Here:

```text
api/
```

is a component.

But:

```text
routes/
middleware/
```

are categories.

Therefore the hierarchy is:

```text
Api                         ← component
│
├── routes/                 ← category
│   ├── UsersRoute          ← component
│   ├── ProductsRoute       ← component
│   └── OrdersRoute         ← component
│
└── middleware/             ← category
    ├── Authentication      ← component
    └── Logging             ← component
```

This distinction should be preserved when designing new directories.

---

# 5. A Component May Contain Another Component

Components can be composed hierarchically.

For example:

```text
application/
├── application.py
├── api/
│   ├── api.py
│   └── routes/
├── database/
│   ├── database.py
│   └── migrations/
└── authentication/
    ├── authentication.py
    └── strategies/
```

Conceptually:

```text
Application
├── Api
│   └── Routes
├── Database
│   └── Migrations
└── Authentication
    └── Strategies
```

This is preferable to flattening every implementation detail into global technical categories.

---

# 6. Avoid Premature Directories

Do not create a directory merely because a class exists.

If a component is small, keep it as a module:

```text
api.py
database.py
scheduler.py
```

Only promote a module into a component package when it has enough internal complexity to justify decomposition.

For example, start with:

```text
api.py
```

Then, if it grows:

```text
api/
└── api.py
```

Then, if it grows further:

```text
api/
├── api.py
├── routes/
└── middleware/
```

The architecture should grow with the complexity of the component.

Avoid structures such as:

```text
users/
├── user/
│   └── user.py
├── user_repository/
│   └── user_repository.py
└── user_dto/
    └── user_dto.py
```

when the components are small.

Prefer:

```text
users/
├── user.py
├── repository.py
└── dto.py
```

A directory should have architectural meaning, not merely exist to hold one tiny file.

---

# 7. Runtime Composition Is Important

The architecture should reflect how components are composed.

For example:

```python
class Api:
    def __init__(self) -> None:
        self.route_1 = Route1()
        self.route_2 = Route2()
```

This should correspond conceptually to:

```text
api/
├── api.py
└── routes/
    ├── route_1.py
    └── route_2.py
```

The source tree communicates:

```text
Api
└── Routes
    ├── Route1
    └── Route2
```

The code communicates:

```text
Api
├── Route1 instance
└── Route2 instance
```

The architecture should make these two views agree as much as possible.

---

# 8. Think in Terms of Ownership and Containment

When deciding where a component belongs, ask:

> "Who owns this component?"

For example:

```text
api/
└── routes/
    └── users.py
```

means that the user route is part of the API component.

Likewise:

```text
authentication/
└── strategies/
    └── jwt.py
```

means that JWT authentication is an implementation detail of the authentication component.

Avoid putting components in a global category merely because their technical type is similar if they are conceptually owned by another component.

For example, if a route exists exclusively for the API, prefer:

```text
api/
└── routes/
    └── users.py
```

over:

```text
routes/
└── users.py
```

unless the route category is genuinely shared across the application.

---

# 9. Categories Should Contain Peers

A category directory should generally contain components at the same conceptual level.

Good:

```text
models/
├── user.py
├── product.py
└── order.py
```

Good:

```text
handlers/
├── authentication.py
├── payment.py
└── notification.py
```

Avoid mixing unrelated architectural levels:

```text
components/
├── api/
├── user.py
├── database/
├── logging.py
└── authentication/
```

If the entries do not belong to the same conceptual category, the directory is probably too generic.

---

# 10. Do Not Organize Only by Technical Layer

Avoid automatically creating structures such as:

```text
controllers/
services/
repositories/
models/
dtos/
utils/
```

for the entire application if this causes components to become scattered across the project.

For example, instead of:

```text
controllers/
    user.py

services/
    user.py

repositories/
    user.py

dtos/
    user.py
```

consider a component-oriented structure:

```text
users/
├── user.py
├── repository.py
├── service.py
└── dto.py
```

The latter keeps the implementation of the `Users` component together.

Technical categories such as `models/`, `services/`, and `handlers/` are still valid when they genuinely represent collections of peer components.

The architecture should prioritize **conceptual cohesion and ownership**.

---

# 11. Public API vs. Internal Implementation

A component package should make its public interface clear.

Example:

```text
api/
├── __init__.py
├── api.py
├── routes/
└── middleware/
```

External code should ideally interact with the component through its public interface rather than reaching deeply into implementation details.

For example:

```python
from project.api import Api
```

is preferable to requiring callers to know:

```python
from project.api.routes.users.internal_router import InternalRouter
```

Internal structure may change without forcing unrelated parts of the application to change.

---

# 12. Naming Rules

Use normal Python naming conventions.

Directories should normally use lowercase `snake_case`:

```text
api/
database/
authentication/
models/
request_handlers/
```

The singular/plural distinction provides the architectural signal.

Class names should use normal Python `PascalCase`:

```python
class Api:
    ...

class User:
    ...

class AuthenticationService:
    ...
```

Module names should normally use lowercase `snake_case`:

```text
api.py
user.py
authentication.py
request_handler.py
```

---

# 13. A Complete Example

A project following this architecture might look like:

```text
project/
├── __init__.py
├── __main__.py
├── project.py
│
├── models/
│   ├── user.py
│   ├── product.py
│   └── order.py
│
├── handlers/
│   ├── authentication.py
│   ├── payment.py
│   └── notification.py
│
├── api/
│   ├── __init__.py
│   ├── api.py
│   │
│   ├── routes/
│   │   ├── users.py
│   │   ├── products.py
│   │   └── orders.py
│   │
│   └── middleware/
│       ├── authentication.py
│       └── logging.py
│
├── database/
│   ├── __init__.py
│   ├── database.py
│   ├── connection.py
│   └── migrations/
│       ├── initial.py
│       └── add_users.py
│
├── authentication/
│   ├── __init__.py
│   ├── authentication.py
│   └── strategies/
│       ├── jwt.py
│       ├── session.py
│       └── oauth.py
│
└── configuration/
    ├── __init__.py
    ├── configuration.py
    └── loaders/
        ├── environment.py
        └── file.py
```

The conceptual structure is:

```text
Project
│
├── Models                  ← category
│   ├── User
│   ├── Product
│   └── Order
│
├── Handlers                ← category
│   ├── AuthenticationHandler
│   ├── PaymentHandler
│   └── NotificationHandler
│
├── Api                     ← component
│   ├── Routes              ← category
│   │   ├── UsersRoute
│   │   ├── ProductsRoute
│   │   └── OrdersRoute
│   └── Middleware          ← category
│       ├── AuthenticationMiddleware
│       └── LoggingMiddleware
│
├── Database                ← component
│   ├── Connection
│   └── Migrations          ← category
│
├── Authentication          ← component
│   └── Strategies           ← category
│       ├── JWT
│       ├── Session
│       └── OAuth
│
└── Configuration           ← component
    └── Loaders              ← category
```

---

# 14. Rules for an AI Coding Agent

When creating or modifying code in a project using this architecture, the agent should follow these rules.

## Rule 1 — Identify the conceptual component first

Before creating a file or directory, determine what conceptual component the code belongs to.

Do not immediately classify code as "service", "handler", "utility", etc.

Ask:

> "What thing in the application does this code belong to?"

---

## Rule 2 — Determine whether the directory is a component or category

Use the following heuristic:

```text
Plural noun → category containing peer components
Singular noun → one conceptual component/subsystem
```

Examples:

```text
models/        → category
services/      → category
handlers/      → category
routes/        → category

api/           → component
database/      → component
authentication/→ component
configuration/ → component
```

---

## Rule 3 — Keep a component together

If several files implement the same conceptual component, keep them inside that component's directory.

Prefer:

```text
authentication/
├── authentication.py
├── token.py
└── strategies/
```

over scattering them across:

```text
services/
handlers/
utils/
strategies/
```

---

## Rule 4 — Use categories for peer components

If multiple independent components share a conceptual category, use a plural directory.

Example:

```text
models/
├── user.py
├── product.py
└── order.py
```

---

## Rule 5 — Do not create directories prematurely

A directory should exist because it represents a meaningful architectural boundary.

Do not create a directory solely because it contains one small file.

---

## Rule 6 — Preserve ownership

Place implementation details under the component that owns them.

If something only exists to support `Api`, prefer:

```text
api/
└── ...
```

rather than placing it in a global miscellaneous directory.

---

## Rule 7 — Keep the public interface obvious

A component should expose a clear entry point.

For a component named `Api`, a natural structure is:

```text
api/
└── api.py
```

with:

```python
class Api:
    ...
```

As complexity grows, additional implementation files may be added without changing the conceptual identity of the component.

---

## Rule 8 — Do not over-engineer the tree

The directory hierarchy should communicate architecture, not maximize decomposition.

Prefer a simple:

```text
users/
├── user.py
├── repository.py
└── dto.py
```

over excessive nesting when the component is small.

---

# 15. Guiding Principle

The most important principle is:

> **The source tree should be a readable map of the application's conceptual composition.**

A developer should be able to look at the project tree and understand:

- what the major components are;
- which directories are categories;
- which components own other components;
- where a component's implementation lives;
- how large components are decomposed;
- where independent peer components are grouped.

The architecture should make the codebase feel like a collection of **well-defined, composable objects**, rather than a collection of arbitrary files grouped by technical terminology.

In short:

```text
Singular → "This is a thing."

Plural   → "These are things of this kind."
```

And when a thing becomes complex:

```text
Thing
└── thing/
    ├── thing.py
    ├── internal components
    └── categories of internal components
```

The filesystem is therefore treated as an architectural representation of the application's components and their relationships.
