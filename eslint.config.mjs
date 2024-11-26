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

export default [{
    ignores: [
        "**/dist/",
        "projects/igniteui-angular/migrations/",
        "projects/igniteui-angular/schematics/",
        "projects/igniteui-angular/cypress/",
        "**/cypress/",
        "**/cypress.config.ts",
    ],
}, ...compat.extends(
    "plugin:@angular-eslint/recommended",
    "plugin:@angular-eslint/template/process-inline-templates",
).map(config => ({
    ...config,
    files: ["**/*.ts"],
})), {
    files: ["**/*.ts"],

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        ecmaVersion: 5,
        sourceType: "script",

        parserOptions: {
            project: ["tsconfig.json"],
            createDefaultProgram: true,
        },
    },

    rules: {
        "no-shadow": "off",
        "no-prototype-builtins": "off",
        "no-case-declarations": "warn",
        "prefer-spread": "warn",
        "no-async-promise-executor": "warn",
        "prefer-const": "warn",
        "no-useless-escape": "warn",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/no-shadow": "error",
        "no-unused-vars": "off",

        "@typescript-eslint/no-unused-vars": ["warn", {
            args: "all",
            argsIgnorePattern: "^_",
            caughtErrors: "all",
            caughtErrorsIgnorePattern: "^_",
            destructuredArrayIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            ignoreRestSiblings: true,
        }],

        "@typescript-eslint/consistent-type-definitions": "error",
        "@typescript-eslint/dot-notation": "off",

        "@typescript-eslint/explicit-member-accessibility": ["error", {
            accessibility: "explicit",

            overrides: {
                constructors: "no-public",
            },
        }],

        "@typescript-eslint/naming-convention": ["error", {
            selector: "enumMember",
            format: ["PascalCase"],
        }],

        "@angular-eslint/no-input-rename": "off",

        "brace-style": ["error", "1tbs"],
        "id-blacklist": "off",
        "id-match": "off",
        "no-underscore-dangle": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-restricted-types": "warn",
    },
}, ...compat.extends("plugin:@angular-eslint/template/recommended").map(config => ({
    ...config,
    files: ["**/*.html"],
})), {
    files: ["**/*.html"],
    rules: {},
}];
