import * as sass from "sass-embedded";
import postcss from "postcss";
import autoprefixer from "autoprefixer";
import { globby } from "globby";
import path from "path";
import { mkdirSync as makeDir } from "fs";
import { fileURLToPath } from "url";
import { writeFile } from "fs/promises";

const report = {
    success: (s) => console.log("\x1b[32m%s\x1b[0m", s),
    warn: (s) => console.warn("\x1b[33m%s\x1b[0m", s),
    error: (s) => console.error("\x1b[31m%s\x1b[0m", s),
};

const STYLES = {
    SRC: "projects/igniteui-angular-elements/src/themes",
    DIST: "../dist/igniteui-angular-elements/browser/themes",
    CONFIG: {
        style: "compressed",
        loadPaths: ["node_modules"],
        sourceMap: false,
        sourceMapEmbed: false,
    },
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEST_DIR = path.join.bind(null, path.resolve(__dirname, STYLES.DIST));

const stripComments = () => {
    return {
        postcssPlugin: "postcss-strip-comments",
        OnceExit(root) {
            root.walkComments((node) => node.remove());
        },
    };
};

stripComments.postcss = true;

const postProcessor = postcss([
    autoprefixer({
        cascade: false,
        grid: true,
    }),
    stripComments,
]);

async function createFile(fileName, content) {
    const outputFile = DEST_DIR(fileName);

    makeDir(path.dirname(outputFile), { recursive: true });
    await writeFile(outputFile, content, "utf-8");
}

async function buildThemes() {
    const paths = await globby(`${STYLES.SRC}/**/*.scss`);
    const compiler = await sass.initAsyncCompiler();

    try {
        await Promise.all(
            paths.map(async (path) => {
                const result = await compiler.compileAsync(path, STYLES.CONFIG);
                const fileName = path.replace(/\.scss$/, ".css").replace(STYLES.SRC, "");

                let outCss = postProcessor.process(result.css).css;

                if (outCss.charCodeAt(0) === 0xfeff) {
                    outCss = outCss.substring(1);
                }

                outCss = outCss + "\n";

                await createFile(fileName, outCss);
            }),
        );
    } catch (err) {
        await compiler.dispose();
        report.error(err);
        process.exit(1);
    }

    await compiler.dispose();
}

(async () => {
    const startTime = new Date();

    // Build theme presets
    console.info("Building Elements themes...");
    await buildThemes();
    report.success(
        `Themes generated in ${Math.round((Date.now() - startTime) / 1000)}s`,
    );
})();
