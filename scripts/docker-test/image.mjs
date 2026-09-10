import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { log } from "../logger.mjs";
import { captureSync, spawnInherit } from "./proc.mjs";

export const IMAGE = "igniteui-ci-runner";
export const NM_VOLUME = "igniteui-ci-node-modules";

// Stamped on the image so we can detect a stale build without a manual
// `--rebuild` flag: whenever Dockerfile.test changes, the hash changes too.
const HASH_LABEL = "com.igniteui.ci-runner.dockerfile-hash";

/**
 * @param {string} dockerfilePath
 * @returns {string} Short content hash of the Dockerfile.
 */
function dockerfileHash(dockerfilePath) {
  return createHash("sha256")
    .update(readFileSync(dockerfilePath))
    .digest("hex")
    .slice(0, 16);
}

/**
 * @returns {string|null} The hash label stored on the current image, or
 *   null if the image doesn't exist / has no label.
 */
function currentImageHash() {
  const res = captureSync("docker", [
    "image",
    "inspect",
    IMAGE,
    "--format",
    `{{ index .Config.Labels "${HASH_LABEL}" }}`,
  ]);
  if (res.status !== 0) return null;
  const value = res.stdout.trim();
  return value.length > 0 && value !== "<no value>" ? value : null;
}

/**
 * Remove the cached node_modules volume (forces a fresh `npm ci` on next run).
 * @param {string} [volume]
 */
export function resetVolume(volume = NM_VOLUME) {
  captureSync("docker", ["volume", "rm", volume]);
}

/**
 * Remove the CI-runner image.
 * @param {string} [image]
 */
export function removeImage(image = IMAGE) {
  captureSync("docker", ["image", "rm", "-f", image]);
}

/**
 * Ensure the CI-runner image exists and matches the current Dockerfile.
 * Rebuilds automatically when missing, stale, or `force` is set; otherwise
 * a no-op, so the common path (unchanged Dockerfile) never pays a rebuild
 * cost.
 * @param {object} opts
 * @param {string} opts.projectRoot - Docker build context.
 * @param {string} opts.dockerfilePath - Path to Dockerfile.test.
 * @param {boolean} [opts.force] - Force a rebuild regardless of hash match.
 */
export async function ensureImage({ projectRoot, dockerfilePath, force = false }) {
  const hash = dockerfileHash(dockerfilePath);
  const existingHash = currentImageHash();
  const stale = existingHash !== hash;

  if (!force && !stale) {
    log("docker-test", `Using cached image '${IMAGE}' (up to date)`);
    return;
  }

  if (force) {
    log("docker-test", `Rebuilding '${IMAGE}' (forced)…`);
  } else if (existingHash === null) {
    log(
      "docker-test",
      `Building CI-equivalent image '${IMAGE}' (ubuntu:24.04 + Node 24 + Chrome)…`,
    );
  } else {
    log("docker-test", `Dockerfile.test changed — rebuilding '${IMAGE}'…`);
  }

  const code = await spawnInherit("docker", [
    "build",
    "--platform",
    "linux/amd64",
    "--load",
    "-f",
    dockerfilePath,
    "--label",
    `${HASH_LABEL}=${hash}`,
    "-t",
    IMAGE,
    projectRoot,
  ]);

  if (code !== 0) {
    throw new Error(`Docker image build failed (exit ${code})`);
  }

  if (stale || force) {
    resetVolume(NM_VOLUME);
    log("docker-test", "Cleared node_modules volume (image changed)");
  }
}
