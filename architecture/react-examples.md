# React Examples

Concrete React mechanics for the rules in [architecture.md](architecture.md). React adds one wrinkle the plain-JS file doesn't have: a component's "state + behavior" is often idiomatically expressed as a **custom hook** rather than as a class. Treat a custom hook as an object too — it has internal state (`useState`/`useRef`) and a public surface (whatever it returns), it just happens to be a function instead of a `class`.

| Concept | React mechanic |
|---|---|
| Object folder entry point (facade) | `index.ts`/`index.tsx` re-exporting the component (and its hook/types, if public) |
| A "class, one file" | one exported component (or one exported hook) per file, `PascalCase` filename matching the component, `camelCase` `useXxx.ts` for hooks |
| Command/Action object | a plain function/class with one `execute()`, OR a custom hook if the action needs React state/lifecycle |
| Composition at construction time | done in the component body (rendering child components) or inside a custom hook (calling other hooks) |

## Category vs. object folders

```
src/
├── App.tsx                      # <- top-level object, composes pages/providers
├── components/                  # <- plural = category folder (shared, unrelated-to-each-other components)
│   ├── Button/
│   │   ├── index.ts               # <- facade: export { Button } from "./Button"
│   │   ├── Button.tsx
│   │   └── Button.module.css
│   └── Table/
│       ├── index.ts
│       └── Table.tsx
├── pages/                        # <- plural = category folder (one entry per route/screen)
│   └── OrdersPage/
│       ├── index.ts
│       ├── OrdersPage.tsx
│       ├── OrdersPage.module.css
│       ├── hooks/                  # <- plural = category folder (Command-like objects, as hooks)
│       │   └── useOrderSelection.ts
│       └── functions/               # <- plural = category folder (pure Command objects, no React state)
│           └── parsePastedGrid.ts
└── utils/                          # <- plural = category folder (framework-agnostic helpers)
```

A component simple enough for one file stays one file (`Button.tsx` alone, no folder). It only becomes an object folder — `Button/` with `index.ts` + `Button.tsx` + co-located styles/tests — once it's genuinely too large for one file, exactly like the Python/JS rule.

## The facade rule

```tsx
// components/Button/Button.tsx
export function Button({ label, variant = "secondary", onClick }: ButtonProps) {
    return <button className={`${variant}-button`} onClick={onClick}>{label}</button>;
}
```

```ts
// components/Button/index.ts — the facade
export { Button } from "./Button";
export type { ButtonProps } from "./Button";
```

```tsx
// caller code, anywhere else in the app
import { Button } from "../../components/Button";  // looks and feels like importing one module
```

## Composition pattern

A parent component composes its children in JSX — that IS "composition at construction time" for a component, since JSX is evaluated when the component renders:

```tsx
export function OrdersPage() {
    const { orders, selectedIds, toggleSelection } = useOrderSelection();

    return (
        <div className="page">
            <Toolbar onRefresh={...} />
            <Table columns={ORDER_COLUMNS} rows={orders} onRowSelect={toggleSelection} />
        </div>
    );
}
```

A custom hook composes other hooks the same way, in its own body:

```ts
function useOrderSelection() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const apiClient = useApiClient();   // <- composing another hook, same idea as composing a sub-object

    ...

    return { orders, selectedIds, toggleSelection };
}
```

## Command/Action objects

Two flavors, pick based on whether the action needs React state/lifecycle:

**No React state needed** — a plain class or function, identical in shape to the plain-JS/Python version:

```ts
// pages/OrdersPage/functions/parsePastedGrid.ts
export class ParsePastedGrid {
    execute(clipboardText: string): string[][] {
        return clipboardText.split("\n").map((line) => line.split("\t"));
    }
}
```

**Needs React state/lifecycle** — a custom hook, following the same "one clear public surface, private internals" shape:

```ts
// pages/OrdersPage/hooks/useOrderSelection.ts
export function useOrderSelection(orders: Order[]) {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    function toggleSelection(id: number) {
        setSelectedIds((current) => toggleInSet(current, id));   // private helper, not exported
    }

    return { selectedIds, toggleSelection };   // <- the hook's "public method(s)"
}

function toggleInSet(set: Set<number>, id: number): Set<number> {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
}
```

The parent component composes the hook exactly like composing a sub-object in a constructor:

```tsx
export function OrdersPage() {
    const orders = useOrders();
    const { selectedIds, toggleSelection } = useOrderSelection(orders);
    ...
}
```

## Naming note

Don't confuse a "category folder of hooks" (`hooks/`, plural, many unrelated hooks) with a hook that's itself an object folder because it got too large (`useOrderSelection/` with its own `index.ts`, `useOrderSelection.ts`, and maybe its own `functions/`). Both are valid — apply the same singular-vs-plural test to hooks as to any other object.
