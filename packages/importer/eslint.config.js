export default [
    {
        ignores: ["dist", "node_modules"],
    },
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: await import("@typescript-eslint/parser"),
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
    },
];
