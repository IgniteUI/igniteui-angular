import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import localRules from "./rules/index.mjs";
import rootConfig from "../../eslint.config.mjs";
// import tseslint from "typescript-eslint";
// import angular from "angular-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
    ...rootConfig,
    {
        files: ["**/*.ts"],
        plugins: {
            'igniteui-angular-local': localRules,
        },
        rules: {
            "@angular-eslint/component-selector": ["error", {
                type: "element",
                prefix: ["igx", "igc", "test"],
                style: "kebab-case",
            }],

            "@angular-eslint/directive-selector": ["error", {
                type: ["attribute", "element"],
                prefix: ["igx", "igc"],
            }],

            "@angular-eslint/no-input-rename": "off",
            "@typescript-eslint/consistent-type-definitions": "error",
            "@typescript-eslint/dot-notation": "off",
            "brace-style": ["error", "1tbs"],
            "id-blacklist": "off",
            "id-match": "off",
            "no-underscore-dangle": "off",

            "no-restricted-syntax": ["error", {
                selector: "Decorator[expression.callee.name=HostBinding] Literal[value='attr.class']",
                message: "Do not use `attr.class` HostBinding in public-facing components",
            }],

            "no-console": ["error", {
                allow: ["warn", "error"],
            }],

            "no-debugger": "error",
            "igniteui-angular-local/boolean-input-transform": ["error"],
        },
    },
    ...compat.extends(
        "plugin:@angular-eslint/template/recommended",
    ).map(config => ({
        ...config,
        files: ["**/*.html"],
    }))
];
