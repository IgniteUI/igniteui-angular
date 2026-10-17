/**
 * Build the inner (in-container) shell command for each run mode.
 *
 * Modes:
 * - "spec"    → run a single component's specs, or an explicit glob.
 * - "run"     → run an arbitrary npm script (e.g. test:lib:others).
 * - "shell"   → drop into an interactive shell.
 * - default   → CI default: test:lib + test:styles.
 */

/**
 * @param {string} componentOrGlob - Bare component name or an explicit glob
 *   (contains "/" or "*").
 * @returns {string}
 */
function specCommand(componentOrGlob) {
  const looksLikeGlob =
    componentOrGlob.includes("/") || componentOrGlob.includes("*");
  const glob = looksLikeGlob
    ? componentOrGlob
    : `**/${componentOrGlob}/**/*.spec.ts`;
  return `ng test igniteui-angular --watch=false --no-progress --include='${glob}'`;
}

/**
 * @param {string} script - npm script name, e.g. "test:lib:others".
 * @param {string[]} [extraArgs] - Extra args forwarded after `--`.
 * @returns {string}
 */
function runCommand(script, extraArgs = []) {
  // test:lib:others needs the compiled dist CSS (karma.non-grid.conf.js).
  const checkStyles =
    script === "test:lib:others"
      ? `if [ ! -f dist/igniteui-angular/styles/igniteui-angular.css ]; then
  echo '▶ Building styles (required by karma.non-grid.conf.js)…'
  npm run build:styles
fi
`
      : "";
  const extra = extraArgs.length > 0 ? ` -- ${extraArgs.join(" ")}` : "";
  return `${checkStyles}npm run ${script}${extra}`;
}

/** @returns {string} */
function defaultCommand() {
  return `echo '▶ npm run test:lib'
npm run test:lib
echo '▶ npm run test:styles'
npm run test:styles`;
}

/**
 * @param {"spec"|"run"|"default"} mode
 * @param {string} [arg] - Component/glob (spec) or npm script name (run).
 * @param {string[]} [extraArgs] - Extra args, only used by "run".
 * @returns {string} Shell command to execute inside the container.
 */
export function buildInnerCommand(mode, arg, extraArgs = []) {
  switch (mode) {
    case "spec":
      return specCommand(arg);
    case "run":
      return runCommand(arg, extraArgs);
    default:
      return defaultCommand();
  }
}
