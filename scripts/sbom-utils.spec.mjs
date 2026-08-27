import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { formatSupplyChainNotes, mergeSupplyChainNotes } from "./sbom-utils.mjs";

const CLEAN_TREE = { status: 0, problems: [], stderr: "" };
const NO_VULNERABILITIES = {
  available: true,
  counts: { critical: 0, high: 0, moderate: 0, low: 0, info: 0, total: 0 },
  packages: [],
};
const NOISY_TREE = {
  status: 1,
  problems: ["invalid: chokidar@5.0.0 /home/runner/work/igniteui-angular-test/node_modules/chokidar"],
  stderr: [
    "npm error code ELSPROBLEMS",
    "npm error invalid: chokidar@5.0.0 /home/runner/work/igniteui-angular-test/node_modules/chokidar",
    "npm error A complete log of this run can be found in: /home/runner/.npm/_logs/2026-08-27T16_04_30-debug-0.log",
  ].join("\n"),
};

describe("formatSupplyChainNotes", () => {
  test("reports a clean delivered closure", () => {
    const notes = formatSupplyChainNotes({ audit: NO_VULNERABILITIES, npmTree: CLEAN_TREE });

    assert.match(notes, /no known vulnerabilities/i);
    assert.doesNotMatch(notes, /critical/i);
  });

  test("summarizes vulnerabilities by severity and names the affected packages", () => {
    const notes = formatSupplyChainNotes({
      audit: {
        available: true,
        counts: { critical: 1, high: 0, moderate: 2, low: 0, info: 0, total: 3 },
        packages: [
          { name: "tar-fs", severity: "critical", direct: false, fixAvailable: true },
          { name: "postcss", severity: "moderate", direct: true, fixAvailable: false },
        ],
      },
      npmTree: CLEAN_TREE,
    });

    assert.match(notes, /critical \| 1/i);
    assert.match(notes, /moderate \| 2/i);
    assert.match(notes, /tar-fs/);
    assert.match(notes, /postcss/);
  });

  test("states when the vulnerability scan could not run", () => {
    const notes = formatSupplyChainNotes({
      audit: { available: false, reason: "registry unreachable" },
      npmTree: CLEAN_TREE,
    });

    assert.match(notes, /could not be completed/i);
    assert.match(notes, /registry unreachable/);
  });

  test("collapses best-effort build diagnostics and removes paths, prefixes and duplicates", () => {
    const notes = formatSupplyChainNotes({ audit: NO_VULNERABILITIES, npmTree: NOISY_TREE });

    assert.match(notes, /<details>/);
    assert.match(notes, /best-effort/i);
    assert.match(notes, /`npm ls` exited with status 1/);
    assert.match(notes, /invalid: chokidar@5\.0\.0/);
    assert.match(notes, /code ELSPROBLEMS/);

    assert.doesNotMatch(notes, /home\/runner/);
    assert.doesNotMatch(notes, /npm error/);
    assert.doesNotMatch(notes, /complete log of this run/);
    assert.equal(notes.match(/invalid: chokidar@5\.0\.0/g)?.length, 1);
  });

  test("does not HTML-escape diagnostics rendered inside a code fence", () => {
    const notes = formatSupplyChainNotes({
      audit: NO_VULNERABILITIES,
      npmTree: { status: 1, problems: ["invalid: pkg@<1.0.0>"], stderr: "" },
    });

    assert.match(notes, /invalid: pkg@<1\.0\.0>/);
    assert.doesNotMatch(notes, /&lt;|&gt;/);
  });
});

describe("mergeSupplyChainNotes", () => {
  test("replaces its own section without changing authored release notes", () => {
    const notes = formatSupplyChainNotes({ audit: NO_VULNERABILITIES, npmTree: CLEAN_TREE });
    const authored = "# Release 1.2.3\n\nCustomer-facing changes.";
    const first = mergeSupplyChainNotes(authored, notes);
    const second = mergeSupplyChainNotes(first, notes);

    assert.match(first, /^# Release 1\.2\.3\n\nCustomer-facing changes\./);
    assert.equal(first, second);
    assert.equal(first.match(/## Supply chain/g)?.length, 1);
  });
});
