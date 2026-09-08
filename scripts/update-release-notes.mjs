import fs from "node:fs";

import { mergeSupplyChainNotes } from "./sbom-utils.mjs";

const [releaseNotesFile, notesFile, outputFile] = process.argv.slice(2);

if (!releaseNotesFile || !notesFile || !outputFile) {
  throw new Error("Usage: node scripts/update-release-notes.mjs <release-notes> <supply-chain-notes> <output>");
}

const releaseNotes = fs.readFileSync(releaseNotesFile, "utf8");
const notes = fs.readFileSync(notesFile, "utf8");

fs.writeFileSync(outputFile, mergeSupplyChainNotes(releaseNotes, notes));
