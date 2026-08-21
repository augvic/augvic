# VBA Examples

Concrete VBA (Visual Basic for Applications — Excel/Access/Office macros) mechanics for the rules in [architecture.md](architecture.md). Not to be confused with VB.NET, which has a normal project/folder structure — see [vb-examples.md](vb-examples.md) for that one. VBA is the one language here without a real filesystem inside the editor — a project (`.xlsm`, `.accdb`, `.docm`, …) holds a flat list of modules in the VBA Project Explorer, not folders. The category/object distinction survives anyway: it just moves from **folder naming** to **module type + naming convention**.

| Concept | VBA mechanic |
|---|---|
| Object folder entry point (facade) | there is no folder to face — a **Class Module** (`.cls`) itself *is* both the object and its own facade: only its `Public` members are the API, everything `Private` is hidden |
| A "class, one file" | one Class Module per object, PascalCase name matching the concept it represents (e.g. `StagingGrid`, `CreateRegistration`) |
| Category folder equivalent | a **Standard Module** (`.bas`) holding several independent, related-by-type procedures (e.g. `ModFormatUtils` with unrelated formatting helpers) — the plural-folder idea, expressed as one module of many small unrelated `Function`s instead of many small files |
| Command/Action object | a Class Module exposing exactly one meaningful `Public Sub`/`Public Function`, conventionally named `Execute` |
| Composition at construction time | done in `Class_Initialize`, or in an explicit `Init`/`Configure` method called immediately after `New` if the sub-objects need constructor arguments (VBA's `New` takes no parameters) |

## Class Module vs. Standard Module

- **Class Module (`.cls`)** → an *object*: has private state (`Private` fields) plus behavior (`Public` methods) operating on that state. This is VBA's only real equivalent of "one object, one file."
- **Standard Module (`.bas`)** → a *category*: a bag of independent procedures with no shared instance state, grouped only because they're related by type or theme (string helpers, math helpers, …). Never put unrelated helpers in a Class Module just to "have a class" — if there's no instance state, it's a Standard Module.

```
' VBA Project Explorer (flat, no real folders):
StagingGrid.cls           ' <- object: an object, private state + public methods
CreateRegistration.cls    ' <- Command object: one Public Execute method
ModFormatUtils.bas        ' <- category: unrelated formatting helper functions
ModErpValidation.bas      ' <- category: unrelated validation helper functions
```

## The facade rule, VBA-style

Because there's no folder to hide behind, the facade rule becomes: **only expose what the caller needs, keep everything else `Private`.**

```vb
' Class Module: CreateRegistration.cls
Option Explicit

Private database As Database

Public Sub Init(db As Database)
    Set database = db
End Sub

Public Function Execute(input As RegistrationInput) As Registration
    Dim registration As Registration
    Set registration = BuildRegistration(input)     ' private helper, not exposed
    Set Execute = Persist(registration)              ' private helper, not exposed
End Function

Private Function BuildRegistration(input As RegistrationInput) As Registration
    ...
End Function

Private Function Persist(registration As Registration) As Registration
    ...
End Function
```

```vb
' caller code, anywhere else in the project
Dim creator As New CreateRegistration
creator.Init database
Dim result As Registration
Set result = creator.Execute(input)   ' looks and feels like using one self-contained object
```

## Composition pattern

Since `New` can't take constructor arguments in VBA, composition happens in an explicit `Init` (or `Class_Initialize` for parameterless sub-objects), mirroring `__init__`/a constructor function in the other languages:

```vb
' Class Module: Api.cls
Private database As Database
Private connMgr As ConnectionManager
Private processor As Processor

Public Sub Init(db As Database)
    Set database = db
    Set connMgr = New ConnectionManager        ' composition: owns its sub-objects explicitly
    Set processor = New Processor
    processor.Init database, connMgr
End Sub
```

## Command/Action objects

Same shape as everywhere else in this document: one Class Module, one `Execute`, private helpers underneath:

```vb
' Class Module: ParsePastedGrid.cls
Option Explicit

Public Function Execute(clipboardText As String) As Collection
    Dim result As New Collection
    Dim lineArr() As String
    lineArr = Split(clipboardText, vbNewLine)

    Dim i As Long
    For i = LBound(lineArr) To UBound(lineArr)
        result.Add SplitLine(lineArr(i))    ' private helper, not exposed
    Next i

    Set Execute = result
End Function

Private Function SplitLine(line As String) As Variant
    SplitLine = Split(line, vbTab)
End Function
```

The parent object composes it privately, same pattern as every other language:

```vb
' Class Module: StagingGrid.cls
Private parsePastedGrid As ParsePastedGrid

Private Sub Class_Initialize()
    Set parsePastedGrid = New ParsePastedGrid   ' no constructor args needed here, so Class_Initialize is enough
End Sub

Public Sub HandlePaste(clipboardText As String)
    Dim rows As Collection
    Set rows = parsePastedGrid.Execute(clipboardText)
    ...
End Sub
```

## If you export modules to source control

Tools like Rubberduck or `git`-based VBA workflows export each module to a real file (`.cls`/`.bas`) on disk, which CAN then be organized into real folders (e.g. `src/functions/CreateRegistration.cls`, `src/ModFormatUtils.bas`). When that's the case, apply the plural/singular folder convention from the main guide to that exported tree exactly as in any other language — the VBA IDE staying flat doesn't stop the on-disk mirror from being organized properly.
