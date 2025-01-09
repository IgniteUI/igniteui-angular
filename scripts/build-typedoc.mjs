import path from "path";
import { fileURLToPath } from "url";
import { Application } from "typedoc";
import getArgs from "./get-args.mjs";

const product = "ignite-ui-angular";
const { localize, jsonExport, jsonImport } = getArgs();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEST = path.join.bind(
    null,
    path.resolve(__dirname, "../dist/igniteui-angular/docs"),
);

/*
 * Determines the entry points for the documentation generation.
 */
function entryPoints() {
    if (localize === "jp") {
        return path.resolve(
            __dirname,
            "../i18nRepo/typedoc/ja/igniteui-angular.json",
        );
    }

    if (jsonImport) {
        return path.resolve(
            __dirname,
            "../dist/igniteui-angular/docs/typescript-exported/igniteui-angular.json",
        );
    }

    return path.resolve(
        __dirname,
        "../projects/igniteui-angular/src/public_api.ts",
    );
}

/*
 * The output directory for the static site or json generation.
 */
const OUT_DIR = jsonExport
    ? DEST("/typescript-exported/igniteui-angular.json")
    : DEST("/typescript");

/*
 * The Typedoc configuration object.
 * [Schema](https://typedoc.org/schema.json)
 */
const CONFIG = {
    entryPoints: entryPoints(),
    entryPointStrategy: jsonImport || localize === "jp" ? "merge" : "resolve",
    plugin: [
        path.resolve(
            __dirname,
            "../node_modules/typedoc-plugin-localization/dist/index.js",
        ),
        path.resolve(__dirname, "../node_modules/ig-typedoc-theme/dist/index.js"),
    ],
    theme: "igtheme",
    excludePrivate: true,
    excludeProtected: true,
    name: "Ignite UI for Angular",
    readme: "none",
    out: OUT_DIR,
    tsconfig: path.resolve(__dirname, "../tsconfig.typedoc.json"),
};

async function main() {
    const app = await Application.bootstrapWithPlugins(CONFIG);

    app.options.setValue("localize", localize ?? "en");
    app.options.setValue("product", product);
    app.options.setValue('versioning', true);

    if (localize === "jp") {
        const jpTemplateStrings = path.resolve(
            __dirname,
            "../extras/template/strings/shell-strings.json",
        );
        app.options.setValue("templateStrings", jpTemplateStrings);
    }

    const project = await app.convert();

    if (project) {
        const outputDir = app.options.getValue("out");

        if (jsonExport) {
            await app.generateJson(project, outputDir);
        } else {
            await app.generateDocs(project, outputDir);
        }
    }
}

main();
