///////////////
/// IMPORTS ///
///////////////

import { defineConfig } from "vite";
import path from "path";

/////////////////
/// PACKAGING ///
/////////////////

export default defineConfig({
    build: {
        outDir: path.resolve(__dirname, "dist"),
        emptyOutDir: true,
        minify: false,
        lib: {
            entry: path.resolve(__dirname, "main.ts"),
            name: "",
            fileName: () => "bundle.js",
            formats: ["es"]
        }
    },
});
