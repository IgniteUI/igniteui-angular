import angularPlugin from "@angular-eslint/eslint-plugin";
import angularTemplatePlugin from "@angular-eslint/eslint-plugin-template";
import angularTemplateParser from "@angular-eslint/template-parser";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [{
    ignores: [
        "**/dist/",
        "projects/igniteui-angular/migrations/",
        "projects/igniteui-angular/schematics/",
        "projects/igniteui-angular/cypress/",
        "**/cypress/",
        "**/cypress.config.ts",
    ],
}, {
    files: ["**/*.ts"],

    languageOptions: {
        parser: tsParser,
    },

    plugins: {
        "@angular-eslint": angularPlugin,
        "@typescript-eslint": typescriptEslint,
    },

    rules: {
        // @angular-eslint recommended
        "@angular-eslint/contextual-lifecycle": "error",
        "@angular-eslint/no-empty-lifecycle-method": "error",
        "@angular-eslint/no-inputs-metadata-property": "error",
        "@angular-eslint/no-output-native": "error",
        "@angular-eslint/no-output-on-prefix": "error",
        "@angular-eslint/no-output-rename": "error",
        "@angular-eslint/no-outputs-metadata-property": "error",
        "@angular-eslint/prefer-on-push-component-change-detection": "warn",
        "@angular-eslint/prefer-standalone": "warn",
        "@angular-eslint/use-pipe-transform-interface": "error",
        "@angular-eslint/no-input-rename": "off",
        "@angular-eslint/prefer-inject": "warn",

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

        "@typescript-eslint/no-unused-vars": ["error", {
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

        "brace-style": ["error", "1tbs"],
        "id-blacklist": "off",
        "id-match": "off",
        "no-underscore-dangle": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-restricted-types": "warn",
    },
}, {
    files: ["**/*.html"],

    languageOptions: {
        parser: angularTemplateParser,
    },

    plugins: {
        "@angular-eslint/template": angularTemplatePlugin,
    },

    rules: {
        "@angular-eslint/template/banana-in-box": "error",
        "@angular-eslint/template/eqeqeq": "error",
        "@angular-eslint/template/no-negated-async": "error",
        "@angular-eslint/template/prefer-control-flow": "error",
    },
}];
