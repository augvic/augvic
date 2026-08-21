# Go Examples

Concrete Go mechanics for the rules in [architecture.md](architecture.md). Go's package system already enforces most of this: a directory *is* a package, and a package's exported (capitalized) identifiers already are its public surface. The facade rule and the object/category distinction map onto that directly.

| Concept | Go mechanic |
|---|---|
| Object folder entry point (facade) | the package itself — its exported types/functions are the facade; callers only ever write `import "project/api"` regardless of how many files back it |
| A "class, one file" | one exported `struct` (plus its methods) per file, `snake_case.go` filename matching the type |
| Command/Action object | a small `struct` with exactly one exported `Execute()` method |
| Composition at construction time | done in a `New()` constructor function, not in a bare struct literal scattered around the codebase |

## Category vs. object folders

```
project/
├── main.go
├── project.go              # <- Project type itself (singular file, one object)
├── dtos/                   # <- plural = category folder (many unrelated DTOs)
│   ├── registration.go
│   └── order.go
├── api/                    # <- singular = object folder (the Api type, split across files, all `package api`)
│   ├── api.go              # <- type Api struct{...}; func New(...) *Api
│   ├── routes.go
│   └── functions/          # <- plural = category folder (Command objects)
│       └── create_registration.go
└── routes/                 # <- plural = category folder, if routes don't belong to one specific object
```

Because every file in `api/` declares `package api`, there is no separate facade file to write — the package boundary already *is* the facade. What matters is that only `api.go` (or whichever file defines the constructor) exposes the exported `New()`/`Api` surface; everything else in the package can stay unexported (`lowercase`) if it's a private implementation detail.

## The facade rule

```go
// api/api.go
package api

type Api struct {
    database *database.Database
    routes   []Route
}

func New(db *database.Database) *Api {
    return &Api{
        database: db,
        routes:   buildRoutes(db),
    }
}
```

```go
// caller code, anywhere else in the project
import "project/api"

a := api.New(db)   // looks and feels like using one type, regardless of how many files back the package
```

## Composition pattern

Composition happens inside the constructor function, exactly like Python's `__init__` or a JS class constructor — sub-objects become named fields on the struct, not package-level globals:

```go
type Api struct {
    database *database.Database
    connMgr  *ConnectionManager
    processor *Processor
}

func New(db *database.Database) *Api {
    connMgr := NewConnectionManager()
    return &Api{
        database:  db,
        connMgr:   connMgr,
        processor: NewProcessor(db, connMgr),
    }
}
```

## Command/Action objects

```go
// api/functions/create_registration.go
package functions

type CreateRegistration struct {
    database *database.Database
}

func NewCreateRegistration(db *database.Database) *CreateRegistration {
    return &CreateRegistration{database: db}
}

func (c *CreateRegistration) Execute(input RegistrationInput) (*dtos.Registration, error) {
    registration, err := c.build(input)
    if err != nil {
        return nil, err
    }
    return c.persist(registration)
}

func (c *CreateRegistration) build(input RegistrationInput) (*dtos.Registration, error) {
    ...  // unexported helper, not part of the public API
}

func (c *CreateRegistration) persist(registration *dtos.Registration) (*dtos.Registration, error) {
    ...
}
```

The parent object composes it privately and exposes a clean method, same as every other language here:

```go
type Object struct {
    createRegistration *functions.CreateRegistration
}

func (o *Object) CreateRegistration(input functions.RegistrationInput) (*dtos.Registration, error) {
    return o.createRegistration.Execute(input)
}
```

## Naming note

Go convention already discourages stutter like `api.Api` in some styles — if that clashes with house style, name the constructor type descriptively (e.g. `Server`) while keeping the folder/package name (`api/`) as the category/object marker. The important part isn't the exact type name, it's that the package boundary + a single constructor function still play the same "facade + composition" role as `__init__.py` does in Python.
