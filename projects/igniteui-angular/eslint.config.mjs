import rootConfig from "../../eslint.config.mjs";

export default [
    ...rootConfig,
    {
        files: ["**/*.ts"],
        rules: {
            "@angular-eslint/component-selector": ["error", {
                type: "element",
                prefix: ["igx", "test"],
                style: "kebab-case",
            }],

            "@angular-eslint/directive-selector": ["error", {
                type: ["attribute", "element"],
                prefix: ["igx", "ig"],
                style: "camelCase",
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
        },
    },
];
