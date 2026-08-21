# Python Examples

Concrete Python mechanics for the rules in [architecture.md](architecture.md).

| Concept | Python mechanic |
|---|---|
| Object folder entry point (facade) | `__init__.py` re-exporting the class |
| A "class, one file" | `snake_case.py` file containing a single `PascalCase` class matching the filename |
| Command/Action object | a class with exactly one public `execute()` method |
| Composition at construction time | done in `__init__` |

## Category vs. object folders

```
project/
├── __main__.py
├── __init__.py
├── project.py       # <- Project class itself (singular file, one object)
├── dtos/            # <- plural = category folder (many unrelated DTOs)
├── api/             # <- singular = object folder (the Api class, split into files)
│   ├── __init__.py  # <- exposes `Api` as the public interface
│   └── ...
├── routes/          # <- plural = category folder (many unrelated routes)
└── api.py           # NOTE: if api/ exists, there is no separate api.py at this level
```

## The facade rule

```python
# api/__init__.py
from .core import Api
```

```python
# caller code
from project.api import Api  # looks and feels like a single module/class
```

## Composition pattern

An object composes its sub-components in `__init__`, rather than encapsulating logic loosely or reaching for module-level globals:

```python
from .routes import Route1, Route2

class Api:
    def __init__(self) -> None:
        self.route_1 = Route1()
        self.route_2 = Route2()
```

## Command/Action objects

```
object/
├── functions/              # <- category folder, ~300 files, one action each
│   ├── create_registration.py
│   └── ...
└── object.py               # <- the component itself, exposes clean public methods
```

```python
from .functions import *
from ..dtos import Registration

class Object:
    def __init__(self) -> None:
        self._create_registration = CreateRegistration()

    def create_registration(self) -> Registration:
        return self._create_registration.execute()
```

```python
# functions/create_registration.py
class CreateRegistration:

    def execute(self) -> Registration:
        registration = self._build_registration()
        return self._persist(registration)

    def _build_registration(self) -> Registration:
        ...  # private helper, not part of the public API

    def _persist(self, registration: Registration) -> Registration:
        ...
```
