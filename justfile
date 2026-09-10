# justfile — CI-parity test runner
#
# Runs the Ignite UI for Angular test suite inside a Docker container that
# matches CI exactly (ubuntu:24.04 + Node 24 + Google Chrome), regardless of
# host OS. All orchestration lives in scripts/docker-test/*.mjs (Node, not
# shell) so these recipes work unchanged on Windows, macOS, and Linux.
#
# Requires: docker, node. Install `just`: https://github.com/casey/just#installation
#
# Examples:
#   just test avatar              # spec suite for one component
#   just test '**/slider/**/*.spec.ts'
#   just test                     # CI default: test:lib + test:styles
#   just run test:lib:others      # any npm script, run inside the container
#   just build                    # force-rebuild the Docker image
#   just shell                    # interactive shell in the container
#   just clean                    # remove the image + node_modules volume

cli := "node scripts/docker-test/cli.mjs"

# List available recipes (default when running bare `just`)
default:
    @just --list

# Run one component's specs, an explicit glob, or the CI default suite
test COMPONENT="":
    {{ cli }} test "{{ COMPONENT }}"

# Run any npm script (e.g. test:lib, test:lib:others, test:lib:grid) in the container
run SCRIPT *ARGS:
    {{ cli }} run "{{ SCRIPT }}" {{ ARGS }}

# (Re)build the CI-parity Docker image; auto-runs anyway when Dockerfile.test changes
build:
    {{ cli }} build

# Drop into an interactive shell inside the CI-parity container
shell:
    {{ cli }} shell

# Remove the CI-parity image and cached node_modules volume
clean:
    {{ cli }} clean
