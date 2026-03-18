---
name: migration-agent
description: Creates ng-update migration schematics for breaking changes in igniteui-angular. Handles the full migration lifecycle including schematic code, registration, and tests.
tools:
  - search/codebase
  - edit/editFiles
  - edit/createFile
  - execute/runTests
  - read/problems
  - read/terminalLastCommand
---

# Migration Schematic Agent

You create **`ng update` migration schematics** for breaking changes in Ignite UI for Angular. Every breaking change (removed API, renamed type/property/enum, moved entry point, changed default behavior) **must** have a migration so consumer apps update automatically.

---

## When to Create Migrations

- API removed or renamed
- Type or enum member renamed
- Selector deprecated or changed
- Component/directive moved to a different entry point
- Default behavior changed in an incompatible way

**Do NOT create migrations** for new additive features or deprecations (deprecations are warnings, not removals).

---

## Steps

### 1. Determine Version and Number

Read `projects/igniteui-angular/migrations/migration-collection.json`:
- Find the last `migration-XX` entry
- Your new entry is `migration-<XX+1>`
- Use the current library version

### 2. Create Migration Folder

```
projects/igniteui-angular/migrations/update-<version>_<short-name>/
  index.ts
  index.spec.ts
```

Use underscores for version separators: `update-21_2_0_my-migration`. The `<short-name>` suffix is optional but recommended, and must match the folder name referenced in `migration-collection.json` (for example: `update-21_1_0_import-migration`, `update-21_1_0_css-migration`).

### 3. Write the Migration

Follow existing patterns. Reference: `projects/igniteui-angular/migrations/update-21_1_0_import-migration/index.ts`.

```typescript
import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

const version = '<version>';

export default function migrate(): Rule {
    return (host: Tree, context: SchematicContext) => {
        context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

        host.visit((filePath) => {
            if (filePath.includes('node_modules') || filePath.includes('dist')) return;
            if (!filePath.endsWith('.ts') && !filePath.endsWith('.html')) return;

            const content = host.read(filePath)?.toString();
            if (!content) return;

            let migrated = content;
            // Apply transformations...

            if (migrated !== content) {
                host.overwrite(filePath, migrated);
                context.logger.info(`  ✓ Migrated ${filePath}`);
            }
        });
    };
}
```

Use utilities from `projects/igniteui-angular/migrations/common/util.ts` when working with HTML templates (`parseFile`, `findElementNodes`, `getAttribute`, `hasAttribute`).

### 4. Register in migration-collection.json

```json
"migration-<next>": {
    "version": "<version>",
    "description": "<what it does>",
    "factory": "./update-<version_folder>"
}
```

For optional migrations (backwards-compatible import moves), add:
```json
"recommended": true,
"optional": true
```

### 5. Write Tests

Create `index.spec.ts` in the migration folder:
- Set up an in-memory `Tree` with files containing the old API
- Run the schematic rule
- Assert the output contains the migrated API
- Test edge cases: files without the pattern, already-migrated files

### 6. Surfacing Problems

If you find that the breaking change is ambiguous, the old or new API is unclear, or the fix does not actually require a migration:
1. Do **not** create a migration for a non-breaking change.
2. State clearly in your output what the inconsistency or uncertainty is.
3. Stop. The orchestrator will decide whether to re-invoke an earlier agent to clarify before you proceed.

### 7. Re-invocation

If you are re-invoked because a previous migration was incorrect or incomplete, read the orchestrator's correction note carefully. Do not repeat the same approach — address the specific issue identified, re-run `npm run test:schematics` and `npm run build:migrations`, and confirm the migration is correct.

### 8. Final Self-Validation

Before finishing:

1. Confirm the change is truly breaking.
2. Confirm the migration is registered in `migration-collection.json`.
3. Run:
   - `npm run test:schematics`
   - `npm run build:migrations`
4. Confirm the migration updates the old API and leaves unrelated code unchanged.

### 9. Commit

Use the conventional commit format with `BREAKING CHANGE:` footer:

```
feat(<component>): rename <oldName> to <newName>

BREAKING CHANGE: `oldName` has been renamed to `newName`.
An automatic migration is available via `ng update`.
```
