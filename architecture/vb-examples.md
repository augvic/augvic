# VB.NET Examples

Concrete VB.NET mechanics for the rules in [architecture.md](architecture.md). Unlike VBA (see [vba-examples.md](vba-examples.md)), VB.NET is a normal compiled .NET language with a real project/folder structure — folders, classes, and constructors work essentially like the C#/Java world, just with VB syntax. If you already know the Python or Go version of this guide, this one is the most direct translation of the two.

| Concept | VB.NET mechanic |
|---|---|
| Object folder entry point (facade) | the one `Public Class` in the folder with a matching name; every other class in that folder is `Friend` (assembly-internal) so it can't leak outside as part of the public API |
| A "class, one file" | one `Public Class` per `.vb` file, PascalCase filename matching the class (e.g. `Api.vb`) |
| Category folder equivalent | a folder of independent, unrelated `Public Class` files, OR a `Module` holding several unrelated shared procedures |
| Command/Action object | a class with exactly one public `Execute()` method |
| Composition at construction time | done in `Sub New` |

Visual Studio's default behavior of mirroring folder paths as `Namespace` blocks reinforces this naturally: a folder already reads as a logical grouping before you even open a file.

## Category vs. object folders

```
Project/
├── Program.vb
├── Project.vb          ' <- Project class itself (singular file, one object)
├── Dtos/                ' <- plural = category folder (many unrelated DTOs)
│   ├── Registration.vb
│   └── Order.vb
├── Api/                 ' <- singular = object folder (the Api class, split into files)
│   ├── Api.vb           ' <- Public Class Api — the facade
│   ├── ApiRoutes.vb     ' <- Friend Class ApiRoutes — internal detail, not part of the public API
│   └── Functions/       ' <- plural = category folder (Command objects)
│       └── CreateRegistration.vb
└── Routes/               ' <- plural = category folder, if routes don't belong to one specific object
```

## The facade rule

Only the class matching the folder's name is `Public`; everything else that folder needs internally is `Friend`, so it's invisible outside the assembly even though it lives in a normal, unrestricted folder:

```vb
' Api/Api.vb
Namespace Project.Api

    Public Class Api
        Private ReadOnly _routes As ApiRoutes

        Public Sub New(database As Database)
            _routes = New ApiRoutes(database)   ' composition, see below
        End Sub

        Public Sub Run()
            _routes.RegisterAll()
        End Sub
    End Class

End Namespace
```

```vb
' Api/ApiRoutes.vb — internal detail, not part of the public API
Namespace Project.Api

    Friend Class ApiRoutes
        Private ReadOnly _database As Database

        Public Sub New(database As Database)
            _database = database
        End Sub

        Public Sub RegisterAll()
            ...
        End Sub
    End Class

End Namespace
```

```vb
' caller code, anywhere else in the project
Dim api As New Api(database)   ' looks and feels like using one self-contained class
api.Run()
```

## Composition pattern

An object composes its sub-components in `Sub New`, rather than reaching for shared/static state at call time:

```vb
Public Class Api

    Private ReadOnly _database As Database
    Private ReadOnly _connectionManager As ConnectionManager
    Private ReadOnly _processor As Processor

    Public Sub New(database As Database)
        _database = database
        _connectionManager = New ConnectionManager()
        _processor = New Processor(database, _connectionManager)
    End Sub

End Class
```

## Command/Action objects

```
Api/Functions/
├── CreateRegistration.vb    ' <- one action, one file, one class
└── ...
```

```vb
' Api/Functions/CreateRegistration.vb
Public Class CreateRegistration

    Private ReadOnly _database As Database

    Public Sub New(database As Database)
        _database = database
    End Sub

    Public Function Execute(input As RegistrationInput) As Registration
        Dim registration = BuildRegistration(input)
        Return Persist(registration)
    End Function

    Private Function BuildRegistration(input As RegistrationInput) As Registration
        ...  ' private helper, not part of the public API
    End Function

    Private Function Persist(registration As Registration) As Registration
        ...
    End Function

End Class
```

The parent object composes it privately and exposes a clean public method that matches the rest of this guide's shape:

```vb
Public Class ObjectClass

    Private ReadOnly _createRegistration As CreateRegistration

    Public Sub New(database As Database)
        _createRegistration = New CreateRegistration(database)
    End Sub

    Public Function CreateRegistration(input As RegistrationInput) As Registration
        Return _createRegistration.Execute(input)
    End Function

End Class
```

## `Module` as the category-folder equivalent

VB.NET's `Module` (shared, non-instantiable, no state of its own beyond `Shared` fields) is the direct sibling of VBA's Standard Module and of a plain "category folder of independent functions" in other languages — use it only for a bag of unrelated, stateless helpers, never as a stand-in for an object with real instance state:

```vb
' Utils/FormatHelpers.vb
Module FormatHelpers

    Public Function FormatDate(value As DateTime) As String
        ...
    End Function

    Public Function ParseNumber(value As String) As Integer?
        ...
    End Function

End Module
```

If a "helper" starts needing its own private state across calls, that's the signal it has become an *object*, not a category of loose functions — promote it to a real `Class` with `Sub New` and drop it into an object folder instead.
