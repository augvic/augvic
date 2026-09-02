---
name: fractal-component-architecture
description: Apply Fractal Component Architecture (FCA) — a way of structuring, organizing, and wiring together any software project — as a tree of components where a component's children are exactly what sits one directory level beneath it, and every component, leaf or branch, is born as a folder holding an entry point (a class, or the closest idiom the language has) that is either a pure container for its children or an active component with its own code — never a bare file that later migrates into a folder. Materialized for Python (folder-as-package with __init__.py, Protocol-based interfaces, dataclass DTOs), JavaScript/TypeScript, Java, C#, Go, Rust, C++, C, and Ruby. Use when designing or reviewing the architecture of a new project in any language, deciding where a new module/class/file should live, deciding whether a folder needs its own entry point (__init__.py or equivalent) or is just a grouping, wiring dependencies in a composition root, or translating this architecture into a specific language.
---

# 🌳 Fractal Component Architecture (FCA)

# 1. 🎯 Purpose

This document describes a way of thinking about software architecture, and a way of translating that thinking directly into a project's file layout — in any language.

The central claim is simple: **a software system is a tree of components**, and that tree should be visible, literally, in the directory structure. Not "the directories loosely reflect the architecture" — the directories *are* the architecture. Reading `ls -R` should be equivalent to reading a component diagram.

The name comes from the one property that makes this different from "component-based design" in general: the same small rule set — what a component is, how it relates to its children, when it becomes a folder, when a folder gets its own code — applies identically **at every depth**, from the whole program down to the smallest leaf. Zoom into any node of the tree and you find the same shape repeating. That self-similarity across scale is the defining property of a fractal, and it is the defining property of this architecture.

This document is deliberately **language-agnostic** in its first half: the vision, the tree, the rules for what becomes a file versus what becomes a folder, naming, dependency injection, error handling, and so on. The second half shows how to *materialize* each idea in specific languages — the concrete file layout, the native construct that plays the role of "a component," and the idioms each language already gives you for free.

## 1.1 🗿 The Underlying Philosophy: Software as a Construct

FCA is not primarily a filesystem convention with a rationale attached after the fact — the convention is a *consequence* of a specific way of thinking about what software is. Naming it explicitly makes the rest of this document easier to apply by intent rather than by rote:

> **Software is a hierarchical construct composed of components, where the filesystem provides a tangible representation of its architecture, and the source code provides the implementation of that structure.**

This is a shift away from treating software primarily as *code that executes*, and toward treating it as a *structure that exists* — one that happens to have an executable implementation. Two questions that are usually tangled together get split apart:

```text
STRUCTURE                        BEHAVIOR
"What exists?"                   "How does it work?"
folders, components,             classes, functions,
relationships                    logic
```

**Structure precedes implementation, the way a sculptor's plan precedes the carving.** The architecture is decided — the components, their names, their parent/child relationships — *before* a meaningful amount of code is written. At that point the system can already be discussed and reasoned about ("there is an API, it has routes; there is a database, it has tables; there is a SAP integration") even though nothing runs yet. Implementation then stops being the place where the shape of the system gets *discovered*, and becomes the place where a shape *already decided* gets *materialized*. This is why a good tree makes implementation feel mechanical rather than exploratory: the hard question ("what is this system?") has already been answered by the time the easier one ("how do I write this part?") comes up.

**The filesystem is the architecture language; the source code is the implementation language.** Historically a codebase's directory layout is treated as an afterthought of the code — organized *around* whatever the code turned out to need. FCA inverts that: the tree is authored first, as the architecture itself, and the code fills the shape the tree already declares. Two people who have never read a line of this project's code can still have an architectural conversation purely from `ls -R` — that is only possible because the tree is not a summary of the architecture, it *is* the architecture.

**A component's external boundary stays fixed while its internal composition grows.** This is the payoff of §3's "every component is born a folder": a leaf growing into a branch never renames or moves anything visible from outside — `api/` is still just `api/` whether it holds one entry point or an entire sub-tree of routes, serializers, and validators nested arbitrarily deep. Each folder is a boundary that can be zoomed into without ever destabilizing what sits above it, exactly like a car remains "the car" whether you're looking at it whole or looking inside its engine at the cooling subsystem. This hierarchical encapsulation — stable boundary, unlimited internal depth — is what makes the tree safe to grow for the lifetime of the project instead of needing periodic reorganization.

The cost of this is real and explicit, not hidden: more nesting, more folders, more clicks to reach a given file, in exchange for a boundary around every component that never needs renegotiating as the system grows. §15 and §17 return to this trade-off in concrete, checkable terms; this subsection just names the reasoning underneath it.

# 2. 🌲 The Project Is a Tree of Components

Zoom all the way out: the whole program is one tree. The root is the top-level component — the composition root (§7) that everything else ultimately gets built from. Every other component is a child of exactly one parent, and a child can have children of its own, as many levels deep as the software genuinely needs.

```text
Program
├── Actions                    ← child of Program
│   └── CreateRegistration     ← child of Actions
└── Api                        ← child of Program
    └── Routes                 ← child of Api
        └── Registration       ← child of Routes
```

A component's children are exactly the things that sit **one level directly beneath it on disk** — nothing more, nothing less. `Actions` is a child of `Program`; `CreateRegistration` is a child of `Actions`, not a child of `Program` directly, even though `Program` ultimately ends up depending on it (through `Actions`, in the composition root). **Depth in the tree is depth on disk. Always.**

This one rule is what makes the architecture readable without documentation: nobody needs a diagram maintained separately from the code, because the diagram *is* the directory tree, and it can never silently drift out of date — the moment a dependency changes, the file it lives in has to move too, or the rule has been broken.

> 🌳 **A component's home on disk is its position in the tree. If you can't answer "who is this component's parent" by looking at which folder it sits in, the tree has already stopped being trustworthy.**

# 3. 🍃 The Two Node Shapes: Leaf and Branch

Every node in the tree is a **folder**, without exception, from the moment it is created — even a component with no children yet is a folder holding nothing but its own entry point. What makes a node a **leaf** versus a **branch** is never the filesystem shape (both are folders); it is only whether anything besides the entry point currently lives inside that folder.

## 3.1 Leaves

A component with **no children** is a leaf. It materializes as a folder holding exactly one file: its entry point (§4) — the smallest unit the language gives you for "one behavior, one name, one place." In most languages that unit is a class; in languages without classes, it's whatever construct plays the equivalent role (§16 shows this per language).

```text
Actions
└── CreateRegistration         ← a leaf: a folder holding one entry point
    └── (entry point)              ← one behavioral unit, and nothing else yet
```

## 3.2 Branches

A component **with children** is a branch. Its materialization is identical to a leaf's — a folder holding an entry point — the only difference is that a branch's folder also holds one or more child components beside that entry point.

```text
Api
└── Routes                 ← Api is a branch: a folder, with a child folder beside its entry point
    └── Registration       ← Routes is also a branch, for the same reason
```

> 🌱 **Every component is born a folder.** A leaf and a branch share one shape, so nothing is ever renamed, converted, or has its imports rewritten the day it earns its first child — that child simply appears as a new sibling beside an entry point that was already there. This is a deliberate departure from "start flat, promote to a folder only once a component earns real children": that promotion is exactly the moment a rename/import-rewrite has historically been needed, and paying the folder cost up front — even for a component that may never grow children — buys a tree that never needs that migration at all.

A branch further splits into two flavors, and this is the second thing the tree has to communicate honestly:

- **Container branch** — exists purely to group its children. It has no behavior of its own; its only job is "here is where you find `X`, `Y`, `Z`." Materializes as a folder whose entry point (§4) does nothing but expose its children.
- **Active branch** — is itself a component with real behavior, and *also* has children. Materializes as a folder whose entry point holds the same kind of behavioral unit a leaf would (§3.1), which in turn constructs and uses the children beside it.

```text
api/
├── (entry point)        ← class/struct Api — HAS its own code, and owns Routes
└── routes/              ← Routes, a child of Api — a pure container
    ├── (entry point)    ← nothing but re-exports of its children
    └── registration     ← Registration, a child of Routes — a leaf
```

Neither flavor is more "correct." A branch earns its own behavior exactly when it has something to decide beyond "here are my children" — `Api` decides how to assemble a server and register routes, so it is an active branch. `Routes` has nothing to decide; it is only ever a name for "the group of route handlers," so it stays a container.

> 🧭 **Every branch answers one question honestly: does this folder itself do anything, or does it only tell you where to look? The entry point is where that answer lives.**

## 3.3 Reading the Tree

The payoff: understanding a project built this way never requires more than the directory tree and the willingness to look one level at a time.

```text
Program                        ← root component (composition root, §7)
├── Actions                    ← child: a container (§3.2)
│   └── CreateRegistration     ← leaf: one use case (§9)
└── Api                        ← child: active branch (has its own code) AND has children
    └── Routes                     ← grandchild: a container
        └── Registration              ← great-grandchild: leaf, one route handler
```

Every box is a real behavioral unit or a real package/namespace/module. Every line is a real parent/child relationship, exactly one filesystem level deep. Nothing requires reading past the tree itself to know where a given piece of behavior lives — that is the whole point of building it this way.

# 4. 📦 What Goes in a Branch's Entry Point

Almost every language with a package/module system gives folders some notion of an **entry point** — a file (or declaration) that represents the folder itself, as opposed to any one thing inside it: Python's `__init__.py`, JavaScript/TypeScript's `index.js`/`index.ts`, Rust's `mod.rs` (or the sibling-file form), Ruby's namespace-defining file. Some languages (Go, Java) don't need a dedicated entry-point file because their package system already treats the folder itself as the namespace — §16 covers each case precisely.

Wherever the language provides one, the entry point is where §3.2's two flavors become code:

**Container branch** — the entry point only imports/requires each child and re-exposes it. Nothing else lives there.

```text
routes (entry point)
    exposes: Registration, Session, ...
    (no code of its own)
```

**Active branch** — the entry point *is* the branch's own leaf-equivalent unit (a class, a struct, whatever §3.1 would put in a leaf file), and that unit constructs/uses the children living beside the entry point.

```text
api (entry point)
    defines: class/struct Api
    Api owns and uses: Routes
```

A component does not migrate from a bare file into a folder the day it earns children — it was already a folder, from the moment it was created (§3.1). Growing from zero children to one or more never touches the entry point: the file doesn't move, doesn't get renamed, and nothing that imports it needs to change. The new child simply appears as a new sibling beside the entry point that was already there. There is no `api/api.*` sitting redundantly beside `api/`'s own entry point — the entry point *is* `Api`, on the day it's created and on the day it grows its hundredth child alike.

# 5. 🧱 Every Leaf Is a Behavioral Unit

A leaf is a class, or whatever the language's closest equivalent is — never a bag of loose, unrelated functions floating at module scope. If a piece of logic does something and can reasonably be given a name, it gets a behavioral unit: a constructor/initializer that can receive dependencies, a name another component can depend on through an abstract contract (§8), a natural home for a test to construct and call in isolation, and room to grow into more than one operation later without a disruptive rewrite.

```text
❌  a bare function pretending not to be a component
✅  the same behavior, wrapped as the leaf it actually is —
    one constructor, one clearly named operation
```

This holds even for something "just" used in one place. Wrapping it costs almost nothing and buys everything the rest of this document assumes is available.

## 5.1 The One Exception: Pure Containers

The exception is exactly §3.2's container branch — an entry point whose only job is re-exposing its children has no behavioral unit of its own, because the folder itself is not a component; it is a category **containing** components, each of which is still a proper leaf or active branch.

Do not confuse this exception with "this leaf only has one small operation, so it doesn't need to be a unit." The exception applies only to the container entry point itself, never to the things it collects.

## 5.2 Constants Are Data, Not Components

A file of pure constant/lookup values — enum-like data, a list of allowed strings, default configuration values — is data, not a component with behavior. Nothing about "every leaf is a behavioral unit" implies wrapping a plain constant in a class for its own sake; the naming convention in §6 already treats constants files as the one exception to "file name = unit name."

# 6. 🔤 Naming: The Folder Is the Unit, the Unit Is the Folder

A component's folder name is the natural casing conversion of the one behavioral unit its entry point defines, and nothing else of consequence lives in that entry point besides what the unit needs (a small supporting type, a couple of constants used only inside that file).

```text
create_registration   →  CreateRegistration
api_client             →  ApiClient
```

This is what lets a directory listing communicate the architecture on its own. Combined with §3.1's "every component is born a folder," it is also what makes the leaf → branch transition in §4 a complete non-event: a unit's name — and its folder, and its entry point's file path — never has to change just because it grew children.

# 7. 🏛️ The Composition Root and Explicit Dependency Injection

The root of the tree (§2) is the **composition root**: the one place where every other component is constructed and wired together. A component never decides for itself how to build its own dependencies — it receives them, already built, through its constructor/initializer.

```text
Program
    build Configuration
    build Database(Configuration)
    build HttpClient(Configuration)
    build Actions(Database, HttpClient)
    build Api(Actions)
    run Api
```

Splitting construction into ordered, clearly named groups (configuration → infrastructure → domain logic → the outward-facing adapter) is what keeps a long wiring list navigable as the tree grows. The order documents the dependency layering — a later group may depend on anything built by an earlier one, never the reverse.

A component that constructs its own dependencies internally (reaching for a global, a singleton, an environment variable read from deep inside unrelated code) has broken the tree's honesty: its real dependency is invisible from the composition root, so the tree on disk no longer matches the tree of actual relationships.

> 🔌 **If a dependency isn't visible in the constructor, it isn't visible in the architecture.**

# 8. 🔌 Abstract Dependencies

A component that talks to something outside the current process — a network call, a database, a filesystem, another subsystem — gets an **abstract counterpart**: a description of exactly the operations a caller needs, with nothing about how they're implemented. Every language gives you *some* version of this (an interface, a trait, a protocol, a typed function signature, an abstract base class) — §16 shows the idiomatic form per language.

The concrete implementation lives in the infrastructure layer and satisfies the abstract contract; the consumer — typically an Action (§9) — depends on the **contract**, never on the concrete class directly.

```text
interface Auth
    login(username, password) -> user
    getSessionToken() -> token | null
    logout()

class HttpAuth implements Auth      ← real implementation, talks to the network
class Login
    constructor(auth: Auth, ...)    ← depends on the CONTRACT, not HttpAuth
```

This buys two things. First, the type system (where the language has one) enforces that business logic in `Login` cannot reach for a network-specific detail outside what the contract exposes. Second, testing an Action never needs the real infrastructure: any object honoring the contract's shape is valid in its place, so a lightweight stand-in is a legitimate substitute with no framework involved.

## 8.1 Never Let a Local Decision Trust Unverified External Data

An abstract dependency describes *shape*, not *trust*. If a component's authorization decision — which capability unlocks, which action is allowed — is decided from data an external implementation returned, verify that data is genuinely trustworthy before acting on it. Satisfying the contract's shape is not the same as being safe to believe. When data crosses a real trust boundary (a network response, a locally editable configuration value, anything not produced by this same process), verify it — a cryptographic check against a key you actually control, not just a shape check — before it is allowed to grant anything.

# 9. ⚙️ Actions: One Use Case, One Entry Point

Every discrete business operation is its own leaf. The constructor/initializer receives its dependencies (typed against the abstract contracts of §8); the public surface is a single, clearly named operation — `execute`, `run`, `call`, whatever reads most naturally in the language — that does exactly one thing.

An Action never depends on how it might be invoked — an HTTP framework, a CLI parser, a queue consumer — which is precisely what makes it callable from all of those without modification.

When a use case naturally decomposes into sub-steps, its leaf grows into an active branch with its own container of sub-actions beside it (§4), exactly the same pattern one level deeper.

# 10. 📇 Data Carriers

Data that crosses a boundary — into or out of an Action, over a network call, into a background job's queue — is a plain data-carrying structure: whatever the language's lightest-weight construct for "a named bag of typed fields" is (a dataclass, a record, a struct, a plain interface/type in TypeScript), with no behavior beyond what that construct gives for free. It is not a database model with persistence logic, and not an abstract contract (§8). If a value needs validation, that validation is a separate component that produces or checks the data carrier — it does not live on the carrier itself.

# 11. 🚨 Errors: Public vs. Everything Else

Every raised error a caller might need to distinguish falls into exactly one of two buckets, and the boundary that matters is two-way:

- **Safe to show verbatim** — a validation failure, a business rule the caller violated (a small, named error type per case).
- **Everything else** — an unexpected failure, a library exception, an infrastructure hiccup. Never shown verbatim; logged, and replaced with a generic message before it reaches whoever is on the other side of the boundary.

```text
try:
    result = action.execute(...)
    respond success(result)
except SafeError as error:
    respond failure(error.message)          ← safe, shown as-is
except AnyOtherError as error:
    log(error)
    respond failure("Internal error.")       ← never shown as-is
```

More specific error types exist for callers that genuinely need to branch on failure *kind*, not just on "is this safe to show."

# 12. 🔁 Long-Running Components

A use case that needs to repeat itself in the background — polling, a retry loop, a scheduled cycle — is a thin **runner** wrapping the Action it repeats. The runner owns the lifecycle (start/stop/status); it contains no business logic of its own, only the loop and the decision of when to stop.

The next cycle begins as soon as the previous one finishes — no fixed delay baked in unless the use case genuinely needs one.

# 13. 🌐 The Adapter Layer Is Thin

Whatever faces the outside world — HTTP routes, a CLI's command handlers, a message-queue consumer — translates one inbound request into exactly one Action call and one outbound response. No business rule, no validation beyond what the transport itself requires, lives in the adapter. Every response follows one consistent shape, so a caller never has to guess whether it's looking at a success or a failure.

The top-level adapter component owns *registration* as its one job — the full list of "this path/command/message maps to this handler," visible in one place, rather than scattered across decorators or configuration spread through the codebase.

# 14. ⚙️ Configuration Components

Configuration is not read ad hoc from the environment wherever a value happens to be needed. Each cohesive group of settings is its own small component, computed once, and handed to whatever needs it through the composition root (§7) — never re-read independently by two different components that might disagree.

A value that must never be attacker- or user-editable at runtime (an endpoint an untrusted local actor could otherwise redirect, a secret) is a **constant in this component**, derived from something outside the user's control (a build/packaging flag, a compiled-in default) — never a field read back out of user-writable storage.

# 15. ✅ Language-Agnostic Checklist

- **Does the tree read as parent → child, one level at a time?** Nothing should depend two levels down without going through the level in between.
- **Is every component — leaf or branch — a folder holding its entry point**, never a bare file sitting beside its siblings, even when it has no children yet?
- **Is every leaf one behavioral unit**, not a loose function standing in for a component?
- **Does every branch's entry point say honestly whether it's a container or active**, and does the code match that?
- **Does the file/unit name match, in both directions**, the naming convention in §6?
- **Does every external-facing leaf have an abstract contract**, and does its consumer depend on the contract, not the concrete class?
- **Is an authorization/trust decision based on verified data**, not just data that merely satisfies a contract's shape?
- **Is every business operation a single-entry-point Action**, callable the same way regardless of what triggers it?
- **Is data crossing a boundary a plain carrier**, not a loosely-typed bag passed around by convention?
- **Does every error either belong to the safe-to-show bucket, or get caught, logged, and replaced?**
- **Is a repeating use case a thin runner around an Action**, with no business logic of its own?
- **Is the adapter layer thin**, with one consistent response shape?
- **Is configuration a small, injected component**, never read ad hoc from inside unrelated code?
- **Is the composition root the only place that constructs and wires everything**, in explicit, dependency-ordered steps?

---

# 16. 🌍 Materializing FCA by Language

The vision above is the same regardless of language. What changes is which native construct plays each role — the closest thing to "a class," whether the module system already treats a folder as a namespace, and whether the language gives you a dedicated entry-point file at all. This section is a map, not a full guide — it tells you where each FCA concept lands, with enough of a worked example to start from.

## 16.1 🐍 Python

- **Leaf** → one class, its name the `PascalCase` form of the folder's `snake_case` name, defined in that folder's `__init__.py` (`login/__init__.py` → `class Login`) — never a bare `login.py` sitting beside its siblings. Every component is a folder from birth (§3.1), so nothing has to be renamed or re-`import`ed the day it grows children.
- **Package/folder** → every folder is a package, and every package has an `__init__.py` — no bare grouping directories.
- **Entry point** → `__init__.py`, the construct `index.ts` and `mod.rs` (§16.2, §16.6) are themselves modeled after in this document. A container branch's `__init__.py` only re-exports:

  ```python
  # routes/__init__.py — container, no class here
  from .registration import Registration
  from .session import Session

  __all__ = ["Registration", "Session"]
  ```

  An active branch's `__init__.py` holds the class itself, directly — no redundant `api/api.py` repeating the folder's own name:

  ```python
  # api/__init__.py — active branch
  from .routes import Routes

  class Api:
      def __init__(self, routes: Routes) -> None:
          self.routes = routes
  ```

- **Abstract dependency** → `typing.Protocol`, satisfied structurally with no explicit inheritance — closest in spirit to Go's implicit interfaces (§16.5).
- **Data carrier** → a `@dataclass`.
- **Composition root** → the top-level package's own `__init__.py`, constructing every branch through ordered, explicit steps and injecting dependencies through constructors.

## 16.2 🟨 JavaScript / TypeScript

- **Leaf** → one class, defined in a same-named folder's `index.js`/`index.ts` (`login/index.ts` → `class Login`), never a bare `login.ts` sitting beside its siblings — every component is a folder from birth (§3.1). TypeScript especially benefits (a class gives you the constructor for dependency injection and, combined with `interface`, a real abstract-contract mechanism); plain JavaScript can use a class the same way, with the contract in §8 enforced by convention/JSDoc rather than the compiler.
- **Entry point** → `index.js` / `index.ts`, the closest exact parallel to Python's `__init__.py` that exists in any mainstream language. A container branch's `index.ts` only re-exports:

  ```typescript
  // routes/index.ts — container, no class here
  export { Registration } from './registration';
  export { Session } from './session';
  ```

  An active branch's `index.ts` holds the class itself:

  ```typescript
  // api/index.ts — active branch
  import { Routes } from './routes';

  export class Api {
    constructor(private routes: Routes) {}
  }
  ```

- **Abstract dependency** → TypeScript `interface`; plain JavaScript relies on structural/duck typing without compiler enforcement.
- **Data carrier** → a TypeScript `interface`/`type`, or a class with only public readonly fields.
- **Composition root** → the top-level `index.ts` (or the app's designated entry file), constructing every branch and injecting dependencies through constructors, exactly like Python's top-level `__init__.py`.

## 16.3 ☕ Java

- **Leaf** → a package folder — even for a single class, even before it has any children — holding one `public class` file named for the folder's own role (`login/Login.java` → `class Login`), never a bare `Login.java` sitting directly beside its siblings in the parent package. The language already *enforces* file name = class name; FCA's addition is that this file always lives in its own same-named folder from birth (§3.1), so nothing has to move package when the component later grows children.
- **Package** → a folder; Java's package system is directory-based and mandatory, an exact native match for "every component = folder."
- **Entry point** → Java has no `__init__`-equivalent file. A container branch is simply a package folder holding only its children's folders — nothing extra is needed, since `import com.example.api.routes.registration.Registration;` already reaches a child directly with no aggregator in the way. An active branch is a package that also contains one class named for the package's own role (`api/Api.java` defining `class Api`, alongside `api/routes/` for its children) — the class *is* the entry point, there's just no dedicated file name reserved for that role the way `__init__.py` is.
- **Abstract dependency** → a Java `interface`, implemented explicitly (`implements`).
- **Data carrier** → a `record` (Java 16+) is the natural fit; a plain immutable class with a constructor otherwise.
- **Composition root** → the `main` class or a dedicated bootstrap class, typically at the top package, constructing the tree via constructor injection (with or without a DI framework — the manual/explicit version is what FCA asks for by default).

## 16.4 🟦 C# / .NET

Nearly identical to Java's mapping, with .NET's own idioms:

- **Leaf** → a folder — even for a single class, even before it has any children — holding one file, name matching the class (`Login/Login.cs` → `class Login`), never a bare `Login.cs` sitting directly beside its siblings. Modern .NET analyzers and convention already push toward file name = class name; FCA's addition is that this file always lives in its own same-named folder from birth (§3.1).
- **Namespace/folder** → folder-per-namespace is standard .NET convention (and enforced by default in newer project templates via "file-scoped namespaces matching folder structure").
- **Entry point** → same situation as Java: no dedicated file plays `__init__.py`'s role. An active branch is a folder containing a class named after the folder's role, alongside its children's folders.
- **Abstract dependency** → a C# `interface` (`IAuth`, by convention), implemented explicitly.
- **Data carrier** → a `record` (C# 9+) — built exactly for this purpose.
- **Composition root** → `Program.cs`/`Startup.cs`, or, in frameworks with a built-in DI container, the service-registration section — still one explicit place declaring the whole tree.

## 16.5 🐹 Go

- **Leaf** → a folder — a one-file Go package, even before it has any children — holding a struct with its methods (receiver functions), plus an `interface` where an abstract dependency (§8) is needed. Go has no classes, but a struct + its methods fills the same role. This is the one language here where §3.1's rule cuts most against the grain of local convention: idiomatic Go tends to group several small leaves as sibling files in one shared package folder rather than give each its own single-file package. FCA still asks for the one-component-per-folder shape for the same reason as every other language — no rename when a leaf later grows children — but expect this to read as unusually fine-grained to a Go developer, and weigh that against the migration cost it avoids before applying it wholesale.
- **Package = folder** → Go's package system is *natively* folder-based more strongly than any other language here: every file in a directory shares one `package` declaration, and any capitalized identifier defined in *any* file of that folder is automatically part of the package's public surface — there is no separate "entry point file" needed for the re-export role at all. A container branch is simply a folder of sibling packages with no aggregation step required; the language already refuses to make you write one.
- **Active branch** → convention is a file matching the folder's purpose (`api/api.go` defining `type Api struct {...}`), sitting beside the folder's children packages, mirroring the naming discipline in §6 even though Go doesn't require it.
- **Abstract dependency** → a Go `interface` — satisfied *implicitly* (no `implements` keyword; any type with matching methods satisfies it automatically), which makes structural typing even more central to Go than to TypeScript.
- **Data carrier** → a plain struct with exported fields.
- **Composition root** → typically `main.go` or a `cmd/`-rooted bootstrap package, constructing every dependency explicitly and passing it down through struct fields/constructors (`NewApi(routes)`-style constructor functions, since Go has no real constructors).

## 16.6 🦀 Rust

- **Leaf** → a `struct` with its `impl` block, plus a `trait` where an abstract dependency is needed, living in its own module — even before it has any children (§3.1). Of the two folder-mapping conventions below, the classic `login/mod.rs` form is the one that actually delivers this: the folder exists from the moment the module does, empty children-wise until it earns some. The modern sibling-file form (`login.rs` next to `login/`) doesn't force a folder to exist for a childless leaf at all — pick it only where the team already prefers that style over strict adherence to §3.1's "always a folder."
- **Module = folder** → Rust's module system maps to folders almost exactly like Python's, and for the same reason: the *classic* convention is a `mod.rs` file living directly inside the folder — a literal, direct parallel to `__init__.py`. Modern Rust (2018 edition onward) prefers a sibling `foldername.rs` next to `foldername/` instead of `foldername/mod.rs`, but the role is identical either way: this is where the branch's own code lives, and/or where `pub mod` / `pub use` declarations expose its children.

  ```rust
  // api.rs (or api/mod.rs) — active branch
  mod routes;
  pub use routes::Routes;

  pub struct Api {
      routes: Routes,
  }
  ```

  ```rust
  // routes.rs (or routes/mod.rs) — container branch, no struct of its own
  mod registration;
  pub use registration::Registration;
  ```

- **Abstract dependency** → a Rust `trait`, implemented with `impl Trait for Type`; can be consumed statically (generics + trait bounds) or dynamically (`dyn Trait`) depending on whether runtime polymorphism is actually needed.
- **Data carrier** → a plain `struct` (often `#[derive(Debug, Clone)]`), or an `enum` when the data is naturally one-of-several shapes.
- **Composition root** → `main.rs`, constructing every struct explicitly and passing dependencies through constructor functions (`Api::new(routes)`).

## 16.7 🔷 C++

- **Leaf** → a folder — even before it has any children — holding one header/source pair (`api_client/api_client.hpp` / `api_client/api_client.cpp`), the closest analogue to "file name = class name" that a two-file-per-unit language allows, applied to a same-named folder from birth (§3.1) rather than sitting bare beside its siblings.
- **Namespace/folder** → folder-per-namespace by convention (not enforced by the compiler); a build system (CMake target, module) is what actually groups files into a component in practice.
- **Entry point** → no compiler-enforced equivalent to `__init__.py`, but an umbrella header (`api.hpp`, including/declaring its children) can play the container-branch role, and a free class in that same header/its `.cpp` can play the active-branch role — the same two shapes, expressed through convention rather than language guarantee. C++20 modules (`export module api;`, with `export import routes;` to re-export children) are the more modern, closer equivalent to a real entry-point file where the toolchain supports them.
- **Abstract dependency** → an abstract base class with pure virtual methods (classic), or a `concept` (C++20) for structural/compile-time-checked contracts without inheritance.
- **Data carrier** → a plain `struct` with public members and no invariants to maintain.
- **Composition root** → `main.cpp`, or a dedicated `App`/`Bootstrap` class, constructing the tree explicitly (often via `std::unique_ptr` ownership to make the parent/child relationship visible in the type system too).

## 16.8 🅲 C

- **Leaf** → a folder — even before it has any children — holding a `.c`/`.h` pair implementing one cohesive piece of behavior, modeled as an opaque struct plus a set of functions taking that struct as their first argument (`sap_gui/sap_gui.c`/`.h`, `SapGui`, `sap_gui_create()`, `sap_gui_connect(SapGui*, ...)`) — the closest C gets to "a class." Where runtime polymorphism (an abstract dependency, §8) is genuinely needed, a struct of function pointers plays the role of an interface/vtable.
- **Folder** → C has no native package system at all; a folder is purely a build-system/organizational convention (a static library target, or just a directory the build tooling knows to compile). This is the one language here where FCA's tree needs the *most* manual discipline to hold, since nothing in the language itself enforces it.
- **Entry point** → an umbrella header (`api.h`, declaring/including its children's headers) can play the container-branch role by convention; an active branch's umbrella header additionally declares the branch's own struct and functions. There's no compiler distinction between the two shapes — only the header's actual contents communicate which one you're looking at, so comments/naming discipline matter more here than anywhere else in this document.
- **Data carrier** → a plain `struct` with public fields, no behavior.
- **Composition root** → `main.c`, constructing every struct explicitly and threading dependencies through function parameters (no language-level constructor to lean on).

## 16.9 💎 Ruby

- **Leaf** → one class per file, exactly like Python's shape — the strict §3.1 version wraps it in a same-named folder anyway (`app/services/login/login.rb` defining `Login`), but this is unusual under Zeitwerk (see below): the framework's own idiom already gives a childless leaf the "no rename on growth" property without a wrapping folder, so many Ruby codebases reasonably keep leaves flat and only fold into a directory once real children arrive.
- **Namespace = folder** → with Zeitwerk-style autoloading (the modern Ruby/Rails default), a file's path *automatically* determines its constant name — `app/services/api/routes/registration.rb` defines `Api::Routes::Registration` with no explicit `require` needed at all. This is arguably the most automatic, drift-proof version of "the tree on disk is the tree in code" of any language covered here — the framework will refuse to load a misplaced file under the name it expects.
- **Entry point** → no dedicated file is required for the container-branch role, since autoloading derives everything from the path; where a branch needs to be active, the convention is a file beside the folder, matching its name — `api.rb` defining `class Api`, alongside `api/` for its children, mirroring Go and Rust's sibling-file pattern (and sharing the same trade-off noted there: strict §3.1 compliance means committing to the folder before it holds any children).
- **Abstract dependency** → Ruby is dynamically typed, so an abstract contract is usually enforced by convention/duck typing rather than the language; where stricter enforcement matters, a `Module` with method stubs that raise `NotImplementedError`, or a static-typing layer (Sorbet, RBS), can play the role §8 describes.
- **Data carrier** → a `Struct.new(...)` or a small plain class with `attr_reader`s and no behavior beyond that.
- **Composition root** → a dedicated bootstrap/`Application` class (or, in Rails, an initializer), constructing the tree explicitly and injecting dependencies through `initialize`.

# 17. 🏁 Final Principles

- 🌲 **A software system is a tree of components.** The directory structure is not a loose approximation of the architecture — it *is* the architecture.
- 📏 **Depth on disk is depth in the dependency graph.** A component's children are exactly what sits one level beneath it, never more.
- 🍃 **Leaves and branches share one shape: a folder holding an entry point.** What differs is only whether other components sit beside it yet, and whether that entry point acts or only contains.
- 🔁 **The same rule applies at every scale.** The program, a mid-level component, and a three-line leaf are all built from the identical shape — that repetition across depth is what makes this *fractal*.
- 💉 **Dependencies are received, never self-constructed**, wired explicitly from one composition root.
- 🔌 **External-facing components are consumed through abstract contracts**, never through their concrete implementation.
- 🌍 **The vision doesn't change per language. Only the materialization does** — the same tree, expressed through whatever native construct each language already gives you for classes, modules, and packages.

> **You should be able to look at the project tree, in any language, and see the software itself.** 🌳
