## Description
Sometimes tests from the `igniteui-angular` project fail when run as part of the full suite, even though they pass when executed in isolation.
The reason is that some tests pollute the testing environment (e.g. by leaving behind global state or async handles), which causes later tests to behave incorrectly.

With a suite of ~200 test files and more than 5000 tests, it’s not feasible to manually track down the culprit file.

This PR introduces a polluter-bisect script that streamlines the process of identifying polluting tests by:
- Allowing you to specify a sentinel test file (the test known to fail in polluted environments).
- Running a binary search over the rest of the suite to narrow down the minimal set of files that trigger the sentinel failure.
- Supporting two modes:
  - `before` - only considers tests that run before the sentinel. (default)
  - `all` - considers all tests in the suite and runs the sentinel last.
- Providing a flag to optionally skip the initial full-set scan if you already know the sentinel fails in the suite.
- Generating a temporary polluter-runner spec file to enforce deterministic execution order (bypassing Karma’s automatic sorting).

This makes it possible to isolate polluting test files much faster than running the entire suite repeatedly.
The script is not intended to run in CI; it’s a developer tool to aid in diagnosing flaky tests.

## Usage
From the root of the repo, run:

```bash
# Default: search only in files before the sentinel
npm run polluter:bisect -- sentinel-file.spec.ts before

# Search across all test files, with sentinel always last
npm run polluter:bisect -- sentinel-file.spec.ts all

# Skip the initial full-set scan (faster if you already know the sentinel fails in the suite)
npm run polluter:bisect -- sentinel-file.spec.ts before --skip-initial
```
The script will iteratively run subsets of tests until it identifies the polluting test file that causes the sentinel to fail.

>NOTE:
> In order for the script to work correctly you should set only a single test executor in `projects/igniteui-angular/karma.conf.js` under `parallelOptions`.
