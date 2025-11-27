import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "node:path";
import { fileURLToPath } from "node:url";
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
        rules: {
            "@angular-eslint/component-selector": ["error", {
                type: "element",
                prefix: ["igx", "igc", "test"],
                style: "kebab-case",
            }],

            // Separate configs for element (kebab-case) and attribute (camelCase) selectors.
            // 'ig' prefix only used for attribute selectors (e.g., [igSize]).
            // 'excel', 'csv', 'pdf' prefixes used for toolbar export directives.
            "@angular-eslint/directive-selector": ["error", [
                {
                    type: "element",
                    prefix: ["igx", "igc", "excel", "csv", "pdf"],
                    style: "kebab-case",
                },
                {
                    type: "attribute",
                    prefix: ["igx", "igc", "ig", "excel", "csv", "pdf"],
                    style: "camelCase",
                }
            ]],

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
        },
    },
    // Override for files with compound selectors (element[attribute]) that confuse the selector rule
    {
        files: [
            "**/columns/validators.directive.ts",
            "**/form-control/form-control.directive.ts",
        ],
        rules: {
            "@angular-eslint/directive-selector": "off",
        },
    },
    // Override for test files with non-standard selectors
    {
        files: ["**/*.spec.ts"],
        rules: {
            "@angular-eslint/component-selector": "off",
            "@angular-eslint/directive-selector": "off",
        },
    },
    ...compat.extends(
        "plugin:@angular-eslint/template/recommended",
    ).map(config => ({
        ...config,
        files: ["**/*.html"],
    }))
];
