import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**"] },
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["next", "next/*", "**/apps/showcase/**"],
              message: "The published UI package cannot depend on Next.js or the showcase.",
            },
          ],
        },
      ],
    },
  },
);
