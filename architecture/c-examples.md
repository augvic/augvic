# C Examples

Concrete C mechanics for the rules in [architecture.md](architecture.md). C has no classes, but the same "solid, self-contained component" idea maps cleanly onto **a struct plus a set of functions that operate on it**, with the header file (`.h`) as the facade and the source file(s) (`.c`) as the hidden implementation — this is the direct C equivalent of `__init__.py` re-exporting a class.

| Concept | C mechanic |
|---|---|
| Object folder entry point (facade) | the public `.h` header — it declares the (often opaque) struct and its function prototypes; nothing outside the header is part of the public API |
| A "class, one file" | a `thing.h` / `thing.c` pair; the struct is `Thing`, every public function is prefixed `thing_` (e.g. `thing_create`, `thing_execute`) |
| Command/Action object | a struct with exactly one meaningful public function, conventionally named `..._execute` |
| Composition at construction time | done inside a `..._create()`/`..._init()` function, which allocates/wires up the sub-objects it depends on |

## Category vs. object folders

```
project/
├── main.c
├── project.h / project.c        # <- Project object itself (one pair of files)
├── dtos/                        # <- plural = category folder (many unrelated small structs)
│   ├── registration.h / .c
│   └── order.h / .c
├── api/                         # <- singular = object folder (the Api object, split across multiple .c files)
│   ├── api.h                    # <- the facade: the ONLY header callers outside api/ ever include
│   ├── api.c                    # <- struct Api definition (kept out of api.h if it should be opaque) + api_create/api_destroy
│   ├── api_routes.c             # <- internal split, not its own public header
│   └── functions/               # <- plural = category folder (Command objects)
│       ├── create_registration.h / .c
│       └── ...
└── routes/                      # <- plural = category folder, if routes don't belong to one specific object
```

Everything inside `api/` other than `api.h` is an implementation detail: `api_routes.c` can declare its functions in a private, non-installed header (or just `static` functions used only within `api.c`/`api_routes.c` via a shared internal header) — the point is that code *outside* `api/` never includes anything except `api.h`, exactly like outside code only ever imports `project.api` in the Python example, never `project.api.core`.

## The facade rule

```c
/* api/api.h — the facade: the only header the rest of the project includes */
typedef struct Api Api;

Api *api_create(Database *database);
void  api_destroy(Api *api);
void  api_run(Api *api);
```

```c
/* api/api.c — the hidden implementation */
struct Api {
    Database *database;
    ConnectionManager *conn_mgr;
};

Api *api_create(Database *database) {
    Api *api = malloc(sizeof(Api));
    api->database = database;
    api->conn_mgr = connection_manager_create();   /* composition, see below */
    return api;
}
```

```c
/* caller code, anywhere else in the project */
#include "api/api.h"

Api *api = api_create(database);   /* looks and feels like using one opaque type */
api_run(api);
```

Keeping `struct Api` fully defined only in `api.c` (an *opaque pointer* in `api.h`) is what makes the header a true facade — callers cannot reach into its fields, only call the functions the header declares.

## Composition pattern

Composition happens inside the `..._create()` function — sub-objects are allocated and stored as struct fields, not left as free-floating globals:

```c
struct Api {
    Database *database;
    ConnectionManager *conn_mgr;
    Processor *processor;
};

Api *api_create(Database *database) {
    Api *api = malloc(sizeof(Api));
    api->database  = database;
    api->conn_mgr  = connection_manager_create();
    api->processor = processor_create(database, api->conn_mgr);
    return api;
}
```

## Command/Action objects

```c
/* api/functions/create_registration.h */
typedef struct CreateRegistration CreateRegistration;

CreateRegistration *create_registration_create(Database *database);
Registration        *create_registration_execute(CreateRegistration *self, RegistrationInput input);
```

```c
/* api/functions/create_registration.c */
struct CreateRegistration {
    Database *database;
};

CreateRegistration *create_registration_create(Database *database) {
    CreateRegistration *self = malloc(sizeof(CreateRegistration));
    self->database = database;
    return self;
}

Registration *create_registration_execute(CreateRegistration *self, RegistrationInput input) {
    Registration *registration = build_registration(input);       /* private helper, `static` */
    return persist_registration(self->database, registration);    /* private helper, `static` */
}

static Registration *build_registration(RegistrationInput input) { ... }
static Registration *persist_registration(Database *db, Registration *r) { ... }
```

`static` is what makes `build_registration`/`persist_registration` "private helper methods" in C — they have file scope only and never appear in the header, exactly like a Python method prefixed `_`.

## Pragmatic note

Real-world C often skips the function-pointer-as-vtable style of emulating OOP (`self->execute(self)`) in favor of plain prefixed functions (`thing_execute(thing)`), which is what's shown above — it's simpler, just as clear about ownership, and still gives every action its own file, its own struct, and one obvious entry point. Reach for actual function-pointer vtables only if you genuinely need runtime polymorphism (multiple interchangeable implementations behind the same interface); don't add that machinery just to imitate another language's class syntax.
