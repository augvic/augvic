# Component-Oriented TypeScript / JavaScript / Node.js Architecture

## Purpose

This document defines a frontend and Node.js architecture based on a **component-oriented mental model**.

The source tree is treated as a representation of the application's conceptual objects and their composition.

The main principles are:

- **Singular directory = one conceptual component/object/subsystem.**
- **Plural directory = a category containing related peer components.**
- A component can start as a single file.
- When a component becomes complex, it can become a directory containing its implementation.
- Categories group independent components.
- Runtime object composition should be reflected by the source tree whenever practical.
- HTML is primarily a bootstrap layer; application behavior belongs in JavaScript/TypeScript.
- In Electron applications, the UI and the Electron/Node application are separate top-level components.

This architecture is intentionally similar to a component-oriented Python architecture.

---

# 1. Core Mental Model

The application is viewed as a collection of **components**.

A component may be a class, factory, module, UI component, page, or application subsystem.

For example:

```text
UI
├── LoginPage
│   ├── Form
│   └── Button
└── HubPage
```

The source tree should make this relationship understandable.

A component can be implemented in one file:

```text
login.js
```

When it becomes sufficiently complex, it can become a package:

```text
login/
├── login.js
├── validation.js
└── ...
```

The directory represents the conceptual component; the files inside contain its implementation.

---

# 2. Singular vs. Plural Directories

## Plural noun = category

A plural directory represents a collection of related peer components.

Examples:

```text
actions/
pages/
components/
models/
services/
utils/
```

For example:

```text
pages/
├── index.js
├── login.js
└── hub.js
```

Conceptually:

```text
Pages
├── Login
└── Hub
```

`pages/` is a category, not one object.

## Singular noun = component

A singular directory represents one conceptual component or subsystem.

For example:

```text
ui/
├── ui.html
├── ui.js
├── actions/
├── pages/
└── components/
```

`ui/` represents the **UI component/subsystem**.

Its internal directories are categories:

```text
UI
├── Actions
├── Pages
└── Components
```

The distinction is therefore:

```text
ui/          → one component
pages/       → category
components/  → category
actions/     → category
```

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
├── database.js
├── logging.js
├── configuration.js
└── filesystem.js
```

`infrastructures/` is generally not appropriate for this purpose. In normal English, *infrastructure* is an uncountable noun; its plural form would usually refer to distinct infrastructure systems rather than a category of infrastructure code.

Therefore:

```text
ui/             → component
database/       → component
authentication/ → component

pages/          → category
components/     → category
actions/        → category

infrastructure/ → category
```

The rule should therefore be understood as:

> **A noun representing a singular conceptual entity usually names a component. A noun representing a collection or category usually names a category. Grammatical singular/plural form is the normal naming convention, but semantic meaning takes precedence.**

Do not force a grammatically plural name merely to satisfy the convention. Prefer the natural and idiomatic name when the language does not provide a suitable plural form.

---

# 3. The UI Component

A UI package may look like:

```text
ui/
├── ui.html
├── ui.js
├── actions/
│   ├── index.js
│   ├── create_user.js
│   └── update_user.js
├── pages/
│   ├── index.js
│   ├── login.js
│   └── hub.js
└── components/
    ├── index.js
    ├── table.js
    ├── form.js
    └── button.js
```

Conceptually:

```text
UI
├── Actions
│   ├── CreateUser
│   └── UpdateUser
├── Pages
│   ├── Login
│   └── Hub
└── Components
    ├── Table
    ├── Form
    └── Button
```

The `ui/` directory is one conceptual subsystem. The plural directories contain peer objects used by it.

---

# 4. HTML as Bootstrap Layer

The HTML file should have a minimal responsibility: provide the document and bootstrap the JavaScript application.

For example:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Application</title>
</head>
<body>
    <script type="module" src="./ui.js"></script>
</body>
</html>
```

Application behavior should live in JavaScript/TypeScript:

```text
ui.html
    ↓
ui.js
    ↓
UI
    ↓
Pages / Components / Actions
```

---

# 5. UI as an Object

The `ui.js` module represents the UI component.

For example:

```js
import { Login } from "./pages/index.js";
import { Hub } from "./pages/index.js";

class Ui {
    constructor() {
        this.login_page = new Login();
        this.hub_page = new Hub();
    }
}

new Ui();
```

Conceptually:

```text
Ui
├── LoginPage
└── HubPage
```

The `Ui` object owns its pages.

The source tree reflects that:

```text
ui/
└── pages/
    ├── login.js
    └── hub.js
```

The UI is therefore treated as a runtime object that composes other runtime objects.

---

# 6. Runtime Composition of UI Components

Components should be instantiated and composed at runtime.

For example:

```js
class Login {
    constructor() {
        this.form = new Form();

        const sendButton = new Button();

        this.form.element.appendChild(sendButton.element);
    }
}
```

Conceptually:

```text
Login
└── Form
    └── Button
```

The runtime object graph can therefore look like:

```text
Ui instance
├── Login instance
│   └── Form instance
│       └── Button instance
└── Hub instance
```

The source tree identifies the component types and their ownership; runtime composition identifies the actual instances.

---

# 7. Components Should Encapsulate Their DOM

A UI component should preferably own its DOM representation.

For example:

```js
class Button {
    constructor() {
        this.element = document.createElement("button");
    }
}
```

Other components interact with the component rather than manually constructing its internal DOM:

```js
const button = new Button();

this.form.element.appendChild(button.element);
```

This gives the component a clear boundary:

```text
Button
├── state
├── behavior
└── DOM element
```

The parent knows the component's public interface without needing to know how its DOM is constructed.

---

# 8. UI Categories

## `pages/`

Contains page-level components.

```text
pages/
├── login.js
├── hub.js
└── settings.js
```

A page represents a larger UI screen or application state and may compose lower-level components.

## `components/`

Contains reusable UI building blocks.

```text
components/
├── button.js
├── form.js
├── table.js
└── modal.js
```

These components should generally be reusable by multiple pages or other UI components.

## `actions/`

Contains operations or user/application actions.

```text
actions/
├── create_user.js
├── update_user.js
├── delete_user.js
└── login.js
```

An action represents an operation rather than a visual component.

---

# 9. `index.js` as the Package Entry Point

`index.js` serves as the entry point and public surface of a JavaScript/TypeScript package.

For example:

```text
actions/
├── index.js
├── create_user.js
└── update_user.js
```

```js
export { createUser } from "./create_user.js";
export { updateUser } from "./update_user.js";
```

Callers can then use:

```js
import { createUser, updateUser } from "./actions/index.js";
```

This is conceptually similar to Python's `__init__.py`.

An `index.js` should be used when it provides a useful public API or aggregation point. It should not exist merely because a directory exists.

---

# 10. Growing a Component

Do not split a component prematurely.

Start with:

```text
ui.js
```

If the UI becomes complex:

```text
ui/
└── ui.js
```

Then:

```text
ui/
├── ui.js
├── pages/
└── components/
```

Then perhaps:

```text
ui/
├── ui.js
├── pages/
├── components/
├── actions/
└── state/
```

The architecture should grow with conceptual complexity.

---

# 11. Electron Architecture

An Electron application consists of at least two major conceptual components:

```text
project_root/
├── ui/
└── app/
```

Conceptually:

```text
Application
├── UI
└── Electron App
```

The UI and Electron/Node application should be separate architectural boundaries.

A typical structure is:

```text
project_root/
├── ui/
│   ├── ui.html
│   ├── ui.js
│   ├── pages/
│   ├── components/
│   └── actions/
│
└── app/
    ├── app.js
    ├── preload.js
    └── ...
```

---

# 12. Electron Main Process

The `app/` directory represents the Electron/Node side of the application.

For example:

```text
app/
├── app.js
├── preload.js
├── windows/
├── ipc/
└── services/
```

`app.js` is the application entry point.

The Electron side may contain its own components and categories:

```text
app/
├── app.js
├── windows/
│   ├── main_window.js
│   └── settings_window.js
├── ipc/
│   ├── filesystem.js
│   └── authentication.js
└── services/
    ├── database.js
    └── updater.js
```

Here:

```text
app/       → component/subsystem
windows/   → category
ipc/       → category
services/  → category
```

---

# 13. Preload as a Boundary

`preload.js` represents the controlled boundary between the renderer/UI environment and privileged Electron APIs.

Conceptually:

```text
Renderer / UI
      │
      │ controlled API
      ↓
  preload.js
      │
      ↓
Electron / Node
```

The preload layer should expose a deliberately small API rather than exposing arbitrary Node functionality.

For example:

```js
contextBridge.exposeInMainWorld("api", {
    createUser,
    updateUser
});
```

The UI then communicates through this explicit interface.

---

# 14. UI and App Should Not Be Accidentally Coupled

The UI should not directly import arbitrary Electron/Node implementation files.

Avoid:

```js
// UI
import { Database } from "../app/database.js";
```

Prefer an explicit boundary:

```text
UI
 ↓
Actions
 ↓
Preload API
 ↓
IPC
 ↓
App
 ↓
Services / Database / Filesystem
```

This keeps the renderer independent from the implementation of the Node/Electron side.

---

# 15. Full Electron Example

A larger application could look like:

```text
project/
│
├── ui/
│   ├── ui.html
│   ├── ui.js
│   │
│   ├── pages/
│   │   ├── index.js
│   │   ├── login.js
│   │   └── hub.js
│   │
│   ├── components/
│   │   ├── index.js
│   │   ├── button.js
│   │   ├── form.js
│   │   └── table.js
│   │
│   └── actions/
│       ├── index.js
│       ├── create_user.js
│       └── update_user.js
│
└── app/
    ├── app.js
    ├── preload.js
    │
    ├── windows/
    │   ├── main_window.js
    │   └── settings_window.js
    │
    ├── ipc/
    │   ├── users.js
    │   └── filesystem.js
    │
    └── database/
        ├── database.js
        └── migrations/
```

Conceptually:

```text
Electron Application
│
├── UI
│   ├── Pages
│   │   ├── Login
│   │   └── Hub
│   ├── Components
│   │   ├── Button
│   │   ├── Form
│   │   └── Table
│   └── Actions
│       ├── CreateUser
│       └── UpdateUser
│
└── App
    ├── Windows
    │   ├── MainWindow
    │   └── SettingsWindow
    ├── IPC
    │   ├── Users
    │   └── Filesystem
    └── Database
        └── Migrations
```

---

# 16. TypeScript

The same architecture applies to TypeScript.

For example:

```text
ui/
├── ui.html
├── ui.ts
├── pages/
│   ├── index.ts
│   ├── login.ts
│   └── hub.ts
├── components/
│   ├── index.ts
│   ├── button.ts
│   ├── form.ts
│   └── table.ts
└── actions/
    ├── index.ts
    ├── create_user.ts
    └── update_user.ts
```

With JSX/TSX:

```text
components/
├── index.ts
├── Button.tsx
├── Form.tsx
└── Table.tsx
```

The language syntax changes; the architectural principles do not.

---

# 17. Classes Are Not Mandatory

The component-oriented architecture does not require every component to be implemented as a class.

A component may be implemented using:

- a class;
- a function;
- a factory;
- a module;
- a closure;
- a framework-specific component.

For example:

```js
export function createButton() {
    const element = document.createElement("button");

    return {
        element
    };
}
```

is still a component.

The architecture is about **conceptual ownership and composition**, not enforcing object-oriented syntax everywhere.

---

# 18. Avoid Generic Dumping Grounds

A directory such as:

```text
utils/
```

is acceptable when it genuinely contains generic utilities.

It should not become a dumping ground:

```text
utils/
├── user.js
├── api.js
├── database.js
├── authentication.js
└── random_business_logic.js
```

If code belongs to a specific component, keep it with that component.

Prefer:

```text
authentication/
├── authentication.js
└── token.js
```

over:

```text
utils/
└── token.js
```

when token logic is specifically owned by authentication.

---

# 19. Ownership Is More Important Than Technical Classification

When deciding where code belongs, ask:

> "Which component owns this behavior?"

Do not classify code only by technical labels such as "service", "utility", or "handler".

For example, a user-update operation could be placed under:

```text
ui/
└── actions/
    └── update_user.js
```

if it is a UI-level action.

A backend user operation may instead belong under:

```text
users/
└── update.js
```

The goal is to keep behavior close to the component that conceptually owns it.

---

# 20. Rules for an AI Coding Agent

When modifying or creating a project using this architecture:

## Rule 1 — Identify the conceptual component first

Before creating a file or directory, determine what conceptual object or subsystem the code belongs to.

Do not automatically create a new technical category.

## Rule 2 — Singular means component

If a directory represents one conceptual object/subsystem, use a singular noun.

Examples:

```text
ui/
api/
database/
authentication/
configuration/
```

## Rule 3 — Plural means category

If a directory groups independent peer components, use a plural noun.

Examples:

```text
pages/
components/
actions/
routes/
handlers/
services/
models/
```

## Rule 4 — Architectural markers

The singular/plural convention do the distinction.

## Rule 5 — Keep components cohesive

If multiple files implement the same conceptual component, keep them together under that component's directory.

## Rule 6 — Preserve ownership

Put implementation details close to the component that owns them.

## Rule 7 — Use index modules as public entry points when useful

Use `index.js` or `index.ts` to define a package's intended public surface when that improves the API.

## Rule 8 — Keep HTML bootstrap minimal

HTML should primarily define the document and bootstrap the JavaScript/TypeScript application.

## Rule 9 — Preserve Electron boundaries

In Electron applications, `ui/` and `app/` are separate architectural components. The UI should communicate with privileged Electron functionality through preload/IPC rather than directly importing Node/Electron implementation code.

## Rule 10 — Do not over-engineer

Do not create directories for every class. Decompose a component only when its complexity warrants it.

---

# 21. Guiding Principle

The most important principle is:

> **The source tree should be a map of the application's conceptual components and their runtime relationships.**

The tree should communicate:

- what is a component;
- what is merely a category;
- who owns what;
- what is public;
- what is internal;
- which components compose other components;
- where the renderer ends and the Electron application begins.

The fundamental grammar is:

```text
Singular noun
    ↓
"This is one thing."

Plural noun
    ↓
"These are things of this kind."
```

When a component becomes complex:

```text
Component
└── component/
    ├── component.js
    ├── internal implementation
    └── categories of internal components
```

For Electron:

```text
Application
├── UI
│   ├── Pages
│   ├── Components
│   └── Actions
│
└── Electron App
    ├── Windows
    ├── IPC
    ├── Services
    └── ...
```

The filesystem is therefore treated as an architectural model, not merely as a place to store files.
