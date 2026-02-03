import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
    build: {
        outDir: path.resolve(__dirname, "package"),
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
