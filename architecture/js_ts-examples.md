# JavaScript / TypeScript Examples

Concrete JS/TS mechanics for the rules in [architecture.md](architecture.md). This covers plain JS/TS — no framework, either with native ES modules (no bundler) or with a bundler. See [react-examples.md](react-examples.md) for React specifically.

| Concept | No bundler (native ES modules) | With a bundler |
|---|---|---|
| Object folder entry point (facade) | `index.js` re-exporting the class | `index.ts` barrel file |
| A "class, one file" | `.js`/`.ts` file, one exported class | same |
| Command/Action object | class with one public `execute()`/`run()` method | same |
| Composition at construction time | done in the constructor | same |

The one real difference: without a bundler, the browser resolves every `import` path literally, so every path must be exact and every facade file must physically exist (no auto-resolution of `folder/` to `folder/index.js` the way Node/webpack do it). With a bundler, that resolution is automatic, but the file layout and reasoning are identical.

## Category vs. object folders, using native ES modules

A frontend object folder for a UI component that grew too large for one file:

```
staging_grid/                        # <- singular = object folder (the StagingGrid class)
├── index.js                         # <- facade: export { StagingGrid } from "./staging_grid.js"
├── staging_grid.js                  # <- the StagingGrid class itself
└── functions/                       # <- plural = category folder (Command objects)
    └── parse_pasted_grid.js         # <- class ParsePastedGrid, one public execute()
```

```js
// staging_grid/functions/parse_pasted_grid.js
export class ParsePastedGrid {
    execute(clipboardText) {
        return clipboardText.split("\n").map((line) => line.split("\t"));
    }
}
```

```js
// staging_grid/staging_grid.js
import { ParsePastedGrid } from "./functions/parse_pasted_grid.js";

export class StagingGrid {
    constructor() {
        this._parsePastedGrid = new ParsePastedGrid();   // <- composition in the constructor
    }
}
```

```js
// staging_grid/index.js — the facade
export { StagingGrid } from "./staging_grid.js";
```

```js
// caller code, anywhere else in the app
import { StagingGrid } from "./staging_grid/index.js";  // looks and feels like importing one module/class
```

The same reasoning applies to a top-level app object composing its sub-components — an `App`/`MainPage` class composing an `ApiClient`, a `WebSocketClient`, a `Tabs` controller, etc., exactly like a backend `Api` class composing a `Database`, a `Processor`, and its routes. Same mental model, same folder rules, just different file extensions.
