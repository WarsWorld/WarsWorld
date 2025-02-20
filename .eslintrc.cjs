/* eslint-env node */

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
  ignorePatterns: "/dist",
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
    // "prettier/prettier": "off",
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
            // These imports can break the code on the server or frontend
            // e.g. importing prisma will immediately break on frontend
            // and using DOM APIs or React on backend will too.
            patterns: [
              {
                group: ["**/{server,frontend}/**"],
                message: "Don't import non-type server or frontend code into shared",
                allowTypeImports: true,
              },
              {
                group: ["@prisma*"],
                message: "Don't import non-type prisma / DB stuff into shared",
                allowTypeImports: true,
              },
            ],
          },
        ],
      },
    },
    {
      files: ["src/**/*.*"],
      excludedFiles: "src/{components/client-only,pixi}/**/*.*",
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
