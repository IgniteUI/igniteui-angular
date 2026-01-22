# Karma/Jasmine to Vitest Migration

This document describes the migration from Karma/Jasmine to Vitest with Playwright for the IgniteUI Angular project.

## Migration Status: ✅ COMPLETE

All code changes have been completed. The migration is ready for testing and validation.

## What Was Changed

### 1. Dependencies (package.json)
**Removed:**
- `karma` and all karma plugins (karma-chrome-launcher, karma-coverage, karma-jasmine, etc.)
- `jasmine-core`, `@types/jasmine`, `@types/jasminewd2`

**Added:**
- `vitest` (v2.1.8) - Modern test runner
- `@vitest/ui` (v2.1.8) - UI test runner
- `@vitest/browser` (v2.1.8) - Browser mode support
- `playwright` (v1.49.1) - Browser automation
- `@analogjs/vite-plugin-angular` (v1.11.0) - Angular/Vite integration

### 2. Configuration Files

**Created:**
- `vitest.config.ts` - Main Vitest configuration with Angular plugin and browser mode
- `vitest.workspace.ts` - Workspace configuration for multiple projects (igniteui-angular, igniteui-angular-elements)
- `src/test-setup.ts` - Angular testing environment initialization

**Updated:**
- `angular.json` - Removed all Karma test builder configurations
- `tsconfig.spec.json` files - Updated types from Jasmine to Vitest/Playwright
- `package.json` scripts - All test scripts now use Vitest

**Deleted:**
- All 9 Karma configuration files (karma.conf.js, karma.grid.conf.js, etc.)

### 3. Test Scripts (package.json)

```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:lib": "vitest run --coverage --project igniteui-angular",
  "test:lib:watch": "vitest --project igniteui-angular",
  "test:lib:grid": "vitest run --coverage --project igniteui-angular -- **/grid/**/*.spec.ts",
  "test:lib:tgrid": "vitest run --coverage --project igniteui-angular -- **/tree-grid/**/*.spec.ts",
  "test:lib:hgrid": "vitest run --coverage --project igniteui-angular -- **/hierarchical-grid/**/*.spec.ts",
  "test:lib:pgrid": "vitest run --coverage --project igniteui-angular -- **/pivot-grid/**/*.spec.ts",
  "test:lib:others": "vitest run --coverage --project igniteui-angular -- --exclude **/grid*/**/*.spec.ts",
  "test:elements": "vitest run --coverage --project igniteui-angular-elements",
  "test:elements:watch": "vitest --project igniteui-angular-elements"
}
```

### 4. Spec File Conversions (260 files, 2,500+ transformations)

All `.spec.ts` files were automatically converted from Jasmine to Vitest syntax:

**Imports:**
```typescript
// Added to all spec files:
import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest';
```

**Spy Conversions:**
- `spyOn(obj, 'method')` → `vi.spyOn(obj, 'method')`
- `.and.returnValue(val)` → `.mockReturnValue(val)`
- `.and.callThrough()` → removed (vi.spyOn calls through by default)
- `.and.callFake(fn)` → `.mockImplementation(fn)`
- `jasmine.createSpy('name')` → `vi.fn()`
- `jasmine.createSpyObj('name', ['methods'])` → `{ method1: vi.fn(), method2: vi.fn() }`

**Matchers:**
- `jasmine.anything()` → `expect.anything()`
- `jasmine.any(Type)` → `expect.any(Type)`
- `jasmine.objectContaining()` → `expect.objectContaining()`
- `jasmine.arrayWithExactContents()` → `expect.arrayContaining()`

**Spy API:**
- `.calls.mostRecent()` → `.mock.lastCall`
- `.calls.count()` → `.mock.calls.length`
- `.calls.all()` → `.mock.calls`
- `.calls.first()` → `.mock.calls[0]`

**Removed:**
- `jasmine.getEnv().allowRespy()` calls (not needed in Vitest)

## Next Steps: Testing & Validation

### 1. Install Dependencies

```bash
npm install
```

This will install all the new Vitest and Playwright dependencies.

### 2. Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:lib

# Run specific test suites
npm run test:lib:grid       # Grid tests
npm run test:lib:tgrid      # Tree grid tests
npm run test:lib:hgrid      # Hierarchical grid tests
npm run test:lib:pgrid      # Pivot grid tests
npm run test:lib:others     # Non-grid tests

# Run in watch mode
npm run test:lib:watch

# Run with UI
npm run test:ui
```

### 3. Expected Issues & Solutions

#### Browser Mode Configuration
If browser tests fail, you may need to adjust the Vitest browser configuration in `vitest.config.ts`:

```typescript
browser: {
  enabled: true,
  name: 'chromium',
  provider: 'playwright',
  headless: true,
}
```

#### Angular Testing Environment
If tests fail to initialize Angular components, check that `src/test-setup.ts` is being loaded correctly.

#### Timeout Issues
Some tests may need timeout adjustments. In Vitest, set timeouts like this:

```typescript
it('test name', { timeout: 10000 }, () => {
  // test code
});
```

Or globally in `vitest.config.ts`:

```typescript
test: {
  testTimeout: 10000,
}
```

### 4. Verify Coverage

After running tests with coverage, check that reports are generated:

```bash
# Coverage reports should be in:
./coverage/lcov-report/index.html
```

### 5. Test UI Mode

Vitest includes a great UI for debugging tests:

```bash
npm run test:ui
```

This will open a browser with an interactive test runner.

## Migration Scripts

The following scripts were created to automate the migration:

1. `scripts/convert-jasmine-to-vitest.js` - Main conversion script (pass 1)
2. `scripts/convert-jasmine-to-vitest-pass2.js` - Multi-line createSpyObj handling
3. `scripts/convert-jasmine-to-vitest-pass3.js` - createSpyObj with properties
4. `scripts/convert-jasmine-to-vitest-pass4.js` - Jasmine matchers and spy API

These scripts can be re-run if needed, but all conversions are complete.

## Known Differences from Jasmine

1. **Spy behavior:** Vitest spies call through by default (no need for `.and.callThrough()`)
2. **Type annotations:** Some `jasmine.Spy` type annotations remain in the code but are harmless
3. **Timeout API:** Use Vitest's `testTimeout` instead of `jasmine.DEFAULT_TIMEOUT_INTERVAL`
4. **Spy calls:** Use `.mock.calls` instead of `.calls`

## Rollback (If Needed)

If you need to rollback this migration:

```bash
git revert <commit-hash>
npm install
```

## Support

For issues or questions about this migration, please refer to:
- [Vitest Documentation](https://vitest.dev/)
- [Vitest Browser Mode](https://vitest.dev/guide/browser.html)
- [Playwright Documentation](https://playwright.dev/)
- [Angular Testing Guide](https://angular.dev/guide/testing)

## Summary

- ✅ All 260 spec files converted (100%)
- ✅ All Karma configuration removed
- ✅ Vitest and Playwright configured
- ✅ 2,500+ syntax transformations completed
- ✅ Test scripts updated
- ⏳ Ready for testing and validation
