import path from "node:path";
import { spawnInherit } from "./proc.mjs";

/**
 * Normalize a host path to forward slashes for Docker bind mounts (Docker
 * Desktop on Windows expects "/"-separated paths even for Windows hosts).
 * @param {string} p
 * @returns {string}
 */
function toDockerPath(p) {
  return p.split(path.sep).join("/");
}

/**
 * The shell script executed inside the container: sets up PATH, installs
 * dependencies on first run (cached via the node_modules volume), then runs
 * the inner command.
 * @param {string} innerCmd
 * @returns {string}
 */
function outerScript(innerCmd) {
  return `set -e
export PATH=/workspace/node_modules/.bin:$PATH

if [ ! -f node_modules/.package-lock.json ]; then
  echo '▶ npm ci (first run — installs linux/amd64 native binaries)…'
  npm ci
fi

${innerCmd}
`;
}

/**
 * Run a command inside the CI-parity container.
 * @param {object} opts
 * @param {string} opts.projectRoot - Mounted as /workspace.
 * @param {string} opts.image - Image tag to run.
 * @param {string} opts.nmVolume - Named volume for /workspace/node_modules.
 * @param {string} opts.innerCmd - Shell command to run after setup.
 * @returns {Promise<number>} Exit code of the container process.
 */
export function runInContainer({ projectRoot, image, nmVolume, innerCmd }) {
  const mountRoot = toDockerPath(path.resolve(projectRoot));
  const args = [
    "run",
    "--rm",
    ...(process.stdout.isTTY ? ["-it"] : ["-i"]),
    "--platform",
    "linux/amd64",
    "--shm-size=4g",
    "-v",
    `${mountRoot}:/workspace`,
    "-v",
    `${nmVolume}:/workspace/node_modules`,
    "-e",
    "NODE_OPTIONS=--max_old_space_size=4096 --no-experimental-strip-types",
    "-e",
    "TZ=America/New_York",
    image,
    "bash",
    "-c",
    outerScript(innerCmd),
  ];
  return spawnInherit("docker", args);
}
