#!/usr/bin/env node
/**
 * CLI entry point for the CI-parity Docker test runner, invoked via `just`
 * recipes (see /justfile). Runs the library test suite inside a container
 * matching CI (ubuntu:24.04 + Node 24 + Google Chrome).
 *
 * Verbs:
 *   test [component-or-glob]   → spec mode, or CI default (test:lib + test:styles)
 *   run <npm-script> [-- args] → arbitrary `npm run <script>` in the container
 *   build                      → force rebuild the image
 *   shell                      → interactive shell in the container
 *   clean                      → remove the image + node_modules volume
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logError } from "../logger.mjs";
import { ensureImage, IMAGE, NM_VOLUME, removeImage, resetVolume } from "./image.mjs";
import { runInContainer } from "./container.mjs";
import { buildInnerCommand } from "./commands.mjs";

const PROJECT_ROOT = path.resolve(fileURLToPath(import.meta.url), "../../..");
const DOCKERFILE_PATH = path.join(PROJECT_ROOT, "Dockerfile.test");

/** @param {string[]} extraArgs */
function stripLeadingDashDash(extraArgs) {
  return extraArgs[0] === "--" ? extraArgs.slice(1) : extraArgs;
}

async function main() {
  const [verb, ...rest] = process.argv.slice(2);

  switch (verb) {
    case "build": {
      await ensureImage({
        projectRoot: PROJECT_ROOT,
        dockerfilePath: DOCKERFILE_PATH,
        force: true,
      });
      return 0;
    }

    case "clean": {
      removeImage(IMAGE);
      resetVolume(NM_VOLUME);
      return 0;
    }

    case "shell": {
      await ensureImage({ projectRoot: PROJECT_ROOT, dockerfilePath: DOCKERFILE_PATH });
      return runInContainer({
        projectRoot: PROJECT_ROOT,
        image: IMAGE,
        nmVolume: NM_VOLUME,
        innerCmd: "exec bash",
      });
    }

    case "test": {
      await ensureImage({ projectRoot: PROJECT_ROOT, dockerfilePath: DOCKERFILE_PATH });
      const [componentOrGlob] = rest;
      const innerCmd = componentOrGlob
        ? buildInnerCommand("spec", componentOrGlob)
        : buildInnerCommand("default");
      return runInContainer({
        projectRoot: PROJECT_ROOT,
        image: IMAGE,
        nmVolume: NM_VOLUME,
        innerCmd,
      });
    }

    case "run": {
      const [script, ...extraArgs] = rest;
      if (!script) {
        logError("docker-test", "Usage: just run <npm-script> [-- extra args]");
        return 1;
      }
      await ensureImage({ projectRoot: PROJECT_ROOT, dockerfilePath: DOCKERFILE_PATH });
      const innerCmd = buildInnerCommand("run", script, stripLeadingDashDash(extraArgs));
      return runInContainer({
        projectRoot: PROJECT_ROOT,
        image: IMAGE,
        nmVolume: NM_VOLUME,
        innerCmd,
      });
    }

    default: {
      logError("docker-test", `Unknown command: '${verb ?? ""}'`);
      return 1;
    }
  }
}

main()
  .then((code) => process.exit(code ?? 0))
  .catch((err) => {
    logError("docker-test", "Failed", err);
    process.exit(1);
  });
