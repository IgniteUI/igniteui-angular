import * as sass from "sass-embedded";
import postcss from "postcss";
import autoprefixer from "autoprefixer";
import { globby } from "globby";
import path from "path";
import { mkdirSync as makeDir } from "fs";
import fsExtra from "fs-extra";
import { fileURLToPath } from "url";
import { writeFile } from "fs/promises";

const report = {
    success: (s) => console.log("\x1b[32m%s\x1b[0m", s),
    warn: (s) => console.warn("\x1b[33m%s\x1b[0m", s),
    error: (s) => console.error("\x1b[31m%s\x1b[0m", s),
};

const STYLES = {
    SRC: "projects/igniteui-angular/src/lib/core/styles/themes/presets",
    DIST: "../dist/igniteui-angular/styles",
    THEMING: {
        SRC: "projects/igniteui-angular/src/lib/core/styles/",
        DIST: "dist/igniteui-angular/lib/core/styles/",
    },
    CONFIG: {
        style: "compressed",
        loadPaths: ["node_modules"],
        sourceMap: true,
        sourceMapEmbed: true,
    },
};

const { copySync } = fsExtra;
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
                const fileName = path
                    .replace(/\.scss$/, ".css")
                    .replace(STYLES.SRC, "");
                const sourceMapComment = `/*# sourceMappingURL=maps${fileName}.map */`;

                let outCss = postProcessor.process(result.css).css;

                if (outCss.charCodeAt(0) === 0xfeff) {
                    outCss = outCss.substring(1);
                }

                outCss = outCss + "\n".repeat(2) + sourceMapComment;

                await createFile(fileName, outCss);
                await createFile(
                    `maps/${fileName}.map`,
                    JSON.stringify(result.sourceMap),
                );
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

    // Move theming files
    copySync(STYLES.THEMING.SRC, STYLES.THEMING.DIST, { recursive: true });

    // Build theme presets
    console.info("Building themes...");
    await buildThemes();
    report.success(
        `Themes generated in ${Math.round((Date.now() - startTime) / 1000)}s`,
    );
})();
