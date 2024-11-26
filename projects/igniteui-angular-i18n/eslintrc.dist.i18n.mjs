import tsParser from "@typescript-eslint/parser";

export default [{
    files: ["**/*.d.ts"],
    languageOptions: {
        parser: tsParser,
    },
    rules: {
        "no-restricted-imports": [
            "error", {
                paths: [{
                    name: "igniteui-angular",
                    message: "Validate produced dist doesn't rely on product imports",
                }],
            }
        ]
    }
}];
