# CI-parity Docker test runner

Runs the Ignite UI for Angular test suite inside a container that matches GitHub Actions as closely as possible (`ubuntu:24.04` + Node 24 + Google Chrome), regardless of host OS. Driven by the root [`justfile`](../../justfile); see that file for the recipe list (`just test`, `just run`, `just build`, `just shell`, `just clean`).

## Keeping parity with CI

`Dockerfile.test`'s `FROM ubuntu:24.04` must match `runs-on` in [`.github/workflows/nodejs.yml`](../../.github/workflows/nodejs.yml). GitHub redefines what `ubuntu-latest` points to over time (it silently moved 22.04 → 24.04 in January 2025) — nothing enforces that this Dockerfile follows along, so re-check both files whenever GitHub announces another `ubuntu-latest` migration, or consider pinning the workflow to an explicit `ubuntu-24.04` runner instead of the floating `ubuntu-latest` label. Node major version (24) is declared independently in both files today (`actions/setup-node` in the workflow vs. NodeSource's `setup_24.x` script here) — bump both together.

Chrome cannot be pinned to an exact match: CI's runner image ships a periodically-frozen Chrome snapshot, while this Dockerfile always installs whatever apt's `stable` channel currently resolves to at build time. Treat Chrome-version parity as best-effort, not exact.

## Why Node instead of bash

All orchestration here — image lifecycle, volume management, `docker run` invocation — is plain Node (already a hard dependency of this repo), following the existing `scripts/*.mjs` conventions (`logger.mjs`, `get-args.mjs`). `just` recipes are one-line `node scripts/docker-test/cli.mjs ...` calls, which work unchanged under `sh`, `bash`, `cmd.exe`, and `powershell.exe`. The `bash -c "..."` payload passed _into_ the container is still bash — that always runs inside the Linux image, independent of the host OS.

## Modules

| File            | Responsibility                                                                      |
| --------------- | ----------------------------------------------------------------------------------- |
| `cli.mjs`       | Argument parsing and verb dispatch (`test`, `run`, `build`, `shell`, `clean`).      |
| `image.mjs`     | Image existence/staleness check (content-hash label), build, volume reset.          |
| `container.mjs` | Builds the `docker run` argv array and spawns it with inherited stdio.              |
| `commands.mjs`  | Translates a mode (`spec` / `run` / `default`) into the in-container shell command. |
| `proc.mjs`      | Small `child_process` helpers (`spawnInherit`, `captureSync`).                      |

## Image staleness detection

Rebuilding the image on every invocation is wasteful; never rebuilding risks silently testing against a stale image once `Dockerfile.test` changes. Instead, the Dockerfile's content hash is stamped on the image as a Docker label (`com.igniteui.ci-runner.dockerfile-hash`). Every `test`/`run`/`shell` invocation compares the current file hash to the image's label:

- **Missing image or hash mismatch** → rebuild automatically (no flag to remember), then reset the `node_modules` cache volume (a Node/OS bump can invalidate native bindings) and proceed.
- **Hash matches** → skip straight to `docker run`; no rebuild cost on the common path.

`just build` forces a rebuild regardless of the hash (e.g. to pull a new Chrome release baked into the same Dockerfile).

## Installing `just`

Not an npm dependency (per repo policy, nothing is added to `package.json` without explicit sign-off) — install it standalone:

- macOS: `brew install just`
- Windows: `winget install --id Casey.Just.Just` or `scoop install just`
- Linux: see <https://github.com/casey/just#installation>
