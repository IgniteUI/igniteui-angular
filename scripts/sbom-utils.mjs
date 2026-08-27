const SECTION_START = "<!-- igniteui-angular:supply-chain:start -->";
const SECTION_END = "<!-- igniteui-angular:supply-chain:end -->";
const SEVERITIES = ["critical", "high", "moderate", "low", "info"];
const MAX_DIAGNOSTIC_LINES = 20;
const MAX_LISTED_PACKAGES = 25;

/**
 * Strip terminal noise, npm log prefixes and absolute paths from one diagnostic line.
 * Nothing is HTML-escaped: the result is rendered inside a fenced code block.
 * @param {string} line - Raw diagnostic line.
 * @returns {string} The cleaned line.
 */
function sanitize(line) {
  return String(line)
    .replace(/\u001b\[[0-9;]*m/g, "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/^npm (?:error|warn|notice)\s+/i, "")
    .replace(/(^|\s)(?:[A-Za-z]:)?[\\/]\S*/g, "$1")
    .replaceAll("```", "'''")
    .trim();
}

/**
 * @param {{ problems: string[], stderr: string }} npmTree - Captured npm ls result.
 * @returns {string[]} Deduplicated, bounded diagnostic lines.
 */
function diagnosticLines(npmTree) {
  return [...npmTree.problems, ...npmTree.stderr.split(/\r?\n/)]
    .map(sanitize)
    .filter((line) => line && !/complete log of this run/i.test(line))
    .filter((line, index, lines) => lines.indexOf(line) === index)
    .slice(0, MAX_DIAGNOSTIC_LINES);
}

/**
 * @param {object} audit - Delivered-closure audit result.
 * @returns {string[]} Markdown lines describing known vulnerabilities.
 */
function vulnerabilityLines(audit) {
  if (!audit.available) {
    return [`The vulnerability scan could not be completed: ${audit.reason}.`];
  }

  if (audit.counts.total === 0) {
    return ["`npm audit` reported no known vulnerabilities in the delivered dependencies."];
  }

  const packages = [...audit.packages]
    .sort(
      (left, right) =>
        SEVERITIES.indexOf(left.severity) - SEVERITIES.indexOf(right.severity) ||
        left.name.localeCompare(right.name),
    )
    .slice(0, MAX_LISTED_PACKAGES);

  return [
    `\`npm audit\` reported ${audit.counts.total} known vulnerabilities in the delivered dependencies.`,
    "",
    "| Severity | Count |",
    "|---|---|",
    ...SEVERITIES.filter((severity) => audit.counts[severity] > 0).map(
      (severity) => `| ${severity} | ${audit.counts[severity]} |`,
    ),
    "",
    "| Package | Severity | Direct | Fix available |",
    "|---|---|---|---|",
    ...packages.map(
      (entry) =>
        `| ${entry.name} | ${entry.severity} | ${entry.direct ? "yes" : "no"} | ${entry.fixAvailable ? "yes" : "no"} |`,
    ),
  ];
}

/**
 * Render the supply-chain section published to the SBOM archive and the GitHub release notes.
 * @param {{ audit: object, npmTree: { status: number, problems: string[], stderr: string } }} evidence - Collected evidence.
 * @returns {string} Markdown section.
 */
export function formatSupplyChainNotes({ audit, npmTree }) {
  const diagnostics = diagnosticLines(npmTree);
  const lines = [
    "## Supply chain",
    "",
    ...vulnerabilityLines(audit),
    "",
    "<details>",
    "<summary>Build-environment SBOM diagnostics (best-effort)</summary>",
    "",
    "The build-environment CycloneDX SBOM is a best-effort inventory of the repository toolchain. npm dependency-tree errors are tolerated there and do not affect the delivered-package SBOM.",
    "",
  ];

  if (diagnostics.length === 0) {
    lines.push("`npm ls` reported no dependency-tree problems.");
  } else {
    lines.push(`\`npm ls\` exited with status ${npmTree.status}.`, "", "```text", ...diagnostics, "```");
  }

  lines.push("", "</details>");

  return `${lines.join("\n")}\n`;
}

/**
 * Add or replace the generated section while preserving authored GitHub release notes.
 * @param {string} releaseNotes - Existing GitHub release body.
 * @param {string} notes - Generated Markdown section.
 * @returns {string} Updated release body.
 */
export function mergeSupplyChainNotes(releaseNotes, notes) {
  const section = `${SECTION_START}\n${notes.trim()}\n${SECTION_END}`;
  const start = releaseNotes.indexOf(SECTION_START);
  const end = releaseNotes.indexOf(SECTION_END, start);

  if (start >= 0 && end >= start) {
    return `${releaseNotes.slice(0, start)}${section}${releaseNotes.slice(end + SECTION_END.length)}`;
  }

  const authored = releaseNotes.trimEnd();
  return authored ? `${authored}\n\n${section}\n` : `${section}\n`;
}
