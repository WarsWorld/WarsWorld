CRUSH Playbook for WarsWorld

Build, run, lint, test
- Install: npm install (Node ^21 required). Env: copy .env.example to .env and set NEXTAUTH_SECRET and DB vars. DB: npm run db:up && npm run prisma:push && npm run prisma:seed.
- Dev (Next + WS server): npm run dev (runs prisma:push, dev:next, dev:wss).
- Build: npm run build (runs build:next and build:server). Start prod: npm run start (starts Next and prod server) after npm run prisma:push.
- Lint: npm run lint (prettier check + eslint). Auto-fix: npm run lint:fix.
- Redundant code detector: npm run redundant-code.
- Prisma: push/studio/reset/seed: see npm scripts prisma:*.
- Tests: repo uses tsx + custom scripts; no jest/vitest configured. For logic checks, run tsx files directly (e.g., tsx src/tests/calculate-damage-test.ts). To run a single test file, execute tsx <path>.

Formatting and style
- Prettier: double quotes preferred (singleQuote: false), printWidth 100, endOfLine auto.
- ESLint extends: @next/next, @typescript-eslint (recommended + stylistic, type-checked), react, react-hooks, prettier. Key rules:
  - Always use curly braces; max line length ~150 (eslint rule) though Prettier wraps at 100.
  - No any (@typescript-eslint/no-explicit-any: error). Prefer type aliases over interfaces. Use consistent type imports.
  - Strict boolean expressions: avoid truthy/falsy; compare explicitly.
  - Unused vars allowed if prefixed with _.
  - React: no prop-types, no need to import React in JSX, Next.js no-img rule disabled.

Imports and module boundaries
- Type-only imports preferred where possible (@typescript-eslint/consistent-type-imports: warn).
- Shared code restrictions:
  - In src/shared/**: don’t import server or frontend non-type code; prisma packages disallowed except type-only imports.
  - In src/** (except src/components/client-only and src/pixi): disallow non-type Pixi.js imports. Put Pixi runtime code in src/components/client-only/** or src/pixi/**.
- Use module type: "type": "module". Keep import paths ESM-compliant; build uses resolve-tspaths/tsc-alias and fix-esm-import-path on dist.

Naming, types, and errors
- Use explicit types for public exports and function params/returns in shared code; allow inference for locals.
- PascalCase for React components/types; camelCase for vars/functions; UPPER_SNAKE_CASE for constants.
- Never throw raw strings; throw Error or custom Error (see src/shared/DispatchedError.ts). Preserve original error cause when applicable.
- Avoid null; prefer undefined. Use zod schemas in src/shared/schemas for validation.

Misc
- UI: Next 14 app with pages router; Tailwind + SCSS used. Prefer Headless UI components when available.
- Env/Secrets: never log secrets; .env.production exists. Use cross-env in scripts.
- No Cursor/Copilot rules present at time of writing. If added later (.cursor/rules or .github/copilot-instructions.md), mirror them here.
