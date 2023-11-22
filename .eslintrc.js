const isProdEnvironment = process.env === "production";
const padded = ["if", "const", "let", "expression", "return", "break"];

/** @type {import("eslint")} */
module.exports = {
  extends: [
    "plugin:@next/next/recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@stylistic/ts", "@typescript-eslint"],
  root: true,
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    project: true,
    tsconfigRootDir: __dirname
  },
  settings: {
    react: {
      version: "detect"
    }
  },
  ignorePatterns: ["dist"],
  rules: {
    curly: "error",
    "@stylistic/ts/padding-line-between-statements": [
      "error",
      { blankLine: "always", prev: padded, next: "block" },
      {
        blankLine: "always",
        prev: "block",
        next: padded
      },
      { blankLine: "always", prev: padded, next: "block-like" },
      {
        blankLine: "always",
        prev: "block-like",
        next: padded
      }
    ],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        varsIgnorePattern: "^_",
        argsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_"
      }
    ],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/consistent-type-imports": "error",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "max-len": [
      "error",
      {
        code: 150,
        tabWidth: 2,
        ignoreComments: false,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true
      }
    ],
    "prettier/prettier": [
      isProdEnvironment ? "error" : "off",
      {
        // this fixes an oddity with the rvest.vs-code-prettier-eslint extension
        // maybe we can look into this another time.
        // looks like it's not interpreting this property correctly
        // from package.json prettier config..? (es5 should be default value)
        trailingComma: "es5"
      }
    ]
  },
  overrides: [
    {
      files: ["src/shared/**/*.ts"],
      rules: {
        "@typescript-eslint/no-restricted-imports": [
          "error",
          {
            // These imports can break the code on the server or frontend
            // e.g. importing prisma will immediately break on frontend
            // and using DOM APIs or React on backend will too.
            patterns: [
              {
                group: ["**/server/**", "**/frontend/**"],
                message: "Don't import non-type server or frontend code into shared",
                allowTypeImports: true
              },
              {
                group: ["@prisma*"],
                message: "Don't import non-type prisma / DB stuff into shared",
                allowTypeImports: true
              }
            ]
          }
        ]
      }
    }
  ]
};
