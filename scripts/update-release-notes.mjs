import fs from "node:fs";

import { mergeBuildEnvironmentDiagnostics } from "./sbom-utils.mjs";

const [releaseNotesFile, diagnosticsFile, outputFile] = process.argv.slice(2);

if (!releaseNotesFile || !diagnosticsFile || !outputFile) {
  throw new Error("Usage: node scripts/update-release-notes.mjs <release-notes> <diagnostics> <output>");
}

const releaseNotes = fs.readFileSync(releaseNotesFile, "utf8");
const diagnostics = fs.readFileSync(diagnosticsFile, "utf8");

fs.writeFileSync(outputFile, mergeBuildEnvironmentDiagnostics(releaseNotes, diagnostics));