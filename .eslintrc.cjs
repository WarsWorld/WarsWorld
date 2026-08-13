/* eslint-disable */

const padded = ["if", "const", "let", "expression", "return", "break"];

// [upstream] https://github.com/typescript-eslint/typescript-eslint/issues/7694

/** @type {import("eslint").Linter.Config} */
const eslintConfig = {
  root: true,
  /**
   * even though "dist" is already excluded through tsconfig.json, eslint will
   * lint the "dist" folder without this `ignorePatterns`.
   * i suspect that's because there's another eslint config generated at `./dist/.eslintrc.cjs`.
   * maybe there's a cleaner way by telling typescript to typecheck `./.eslintrc.js` but not transpile it to `./dist`.
   */
  ignorePatterns: ["node_modules/**", ".next/**", "dist/**", ".eslintrc.cjs"],
  reportUnusedDisableDirectives: true,
  extends: [
    "plugin:@next/next/recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",

  // @ts-ignore
  plugins: ["@stylistic/ts", "@typescript-eslint"],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    project: true,
    tsconfigRootDir: __dirname,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    curly: "error",
    "@stylistic/ts/padding-line-between-statements": [
      "error",
      { blankLine: "always", prev: padded, next: "block" },
      {
        blankLine: "always",
        prev: "block",
        next: padded,
      },
      { blankLine: "always", prev: padded, next: "block-like" },
      {
        blankLine: "always",
        prev: "block-like",
        next: padded,
      },
    ],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        varsIgnorePattern: "^_",
        argsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/consistent-type-imports": "warn",
    "@typescript-eslint/strict-boolean-expressions": "error",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",

    "max-len": [
      "error",
      {
        code: 150,
        tabWidth: 2,
        ignoreComments: false,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],
    /**
     * TODO
     * we haven't decided yet if we want to use next.js' <Image> or just
     * go with <img> yet. when a conclusion is made, one or the other
     * should be banned through linting.
     */
    "@next/next/no-img-element": "off",
  },
  overrides: [
    {
      files: ["src/shared/**/*.*"],
      rules: {
        "@typescript-eslint/no-restricted-imports": [
          "error",
          {
            // The engine is Prisma-free (see the src/shared migration map in CLAUDE.md). Map DB
            // rows to domain entities (shared/types/domain-entities) at the adapter boundary — no
            // Prisma imports at all, not even types. Exact-name `paths` (glob patterns don't match
            // the "@prisma/client" specifier reliably).
            paths: [
              {
                name: "@prisma/client",
                message:
                  "The engine is Prisma-free: map rows to shared/types/domain-entities at the adapter boundary.",
                allowTypeImports: false,
              },
            ],
            // These imports can break the code on the server or frontend, e.g. DOM APIs or React
            // on the backend.
            patterns: [
              {
                group: ["**/{server,frontend}/**"],
                message: "Don't import non-type server or frontend code into shared",
                allowTypeImports: true,
              },
              {
                // Pixi needs window/document; shared may run server-side. (Folded in here because
                // the src/** override below no longer applies to shared — see its excludedFiles.)
                group: ["**pixi**"],
                message: "Non-type Pixi.js stuff can't be imported into shared (SSR has no window)",
                allowTypeImports: true,
              },
            ],
          },
        ],
      },
    },
    {
      // src/shared has its own stricter override above. Exclude it here so ESLint's
      // "last matching override wins per rule" doesn't clobber the shared restrictions.
      files: ["src/**/*.*"],
      excludedFiles: ["src/{components/client-only,pixi}/**/*.*", "src/shared/**/*.*"],
      rules: {
        "@typescript-eslint/no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["**pixi**"],
                message:
                  "Non-type Pixi.js stuff is only allowed in react/client-only because other files might be server-side rendered (no window/document for pixi)",
                allowTypeImports: true,
              },
            ],
          },
        ],
      },
    },
  ],
};

module.exports = eslintConfig;
