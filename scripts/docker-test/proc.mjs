import { spawn, spawnSync } from "node:child_process";

/**
 * Spawn a process with inherited stdio (interactive-friendly) and resolve
 * with its exit code instead of throwing, so callers can propagate it as-is.
 * @param {string} cmd - Executable to run.
 * @param {string[]} args - Arguments.
 * @returns {Promise<number>} Exit code (1 if the process could not be spawned).
 */
export function spawnInherit(cmd, args) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: "inherit" });
    child.on("exit", (code, signal) => resolve(code ?? (signal ? 1 : 0)));
    child.on("error", () => resolve(1));
  });
}

/**
 * Run a quick, non-interactive command and capture its result.
 * @param {string} cmd - Executable to run.
 * @param {string[]} args - Arguments.
 * @returns {{status: number|null, stdout: string, stderr: string}}
 */
export function captureSync(cmd, args) {
  const res = spawnSync(cmd, args, { encoding: "utf8" });
  return {
    status: res.status,
    stdout: res.stdout ?? "",
    stderr: res.stderr ?? "",
  };
}
