import typescriptEslint from "@typescript-eslint/eslint-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
    {
        ignores: ["!**/*"],
    },
    ...compat.extends("../../.eslintrc.json"),
    {
        plugins: {
            "@typescript-eslint": typescriptEslint,
        },
        languageOptions: {
            ecmaVersion: 5,
            sourceType: "script",

            parserOptions: {
                project: ["projects/igniteui-angular-i18n/tsconfig.build.json"],
            },
        },
        rules: {
            "@typescript-eslint/naming-convention": ["error", {
                trailingUnderscore: "allow",
                selector: "variable",
                modifiers: ["const"],
                format: ["PascalCase"],
            }],

            indent: "error",
            "no-empty-function": "off",
            semi: "error",

            "spaced-comment": ["error", "always", {
                markers: ["/"],
            }],
        }
    }
];
