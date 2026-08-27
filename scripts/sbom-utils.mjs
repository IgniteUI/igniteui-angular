const PACKAGE_NAME = "igniteui-angular";
const WORKSPACE_NAME = "igniteui-angular-sbom-workspace";
const DIAGNOSTICS_START = "<!-- igniteui-angular:build-sbom-diagnostics:start -->";
const DIAGNOSTICS_END = "<!-- igniteui-angular:build-sbom-diagnostics:end -->";

function spdxPurl(entry) {
  return entry.externalRefs?.find((reference) => reference.referenceType === "purl")?.referenceLocator;
}

function identityFromPurl(purl) {
  if (!purl?.startsWith("pkg:npm/")) {
    return undefined;
  }

  return decodeURIComponent(purl.slice("pkg:npm/".length).split(/[?#]/, 1)[0]);
}

function sortedDifference(left, right) {
  return [...left].filter((entry) => !right.has(entry)).sort();
}

function sanitizedDiagnostic(value) {
  return String(value)
    .replace(/\u001b\[[0-9;]*m/g, "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replaceAll("`", "'")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .slice(0, 2000);
}

/**
 * Make a Syft SPDX document describe the exact npm package artifact instead of its scan directory.
 * @param {object} spdx - SPDX 2.3 document produced from the isolated delivered workspace.
 * @param {{ name: string, sha256: string, sha512: string }} artifact - Packed release artifact.
 * @param {string} version - Released package version.
 * @param {string} repository - GitHub owner/repository name.
 * @returns {object} Normalized SPDX document.
 */
export function normalizeSpdx(spdx, artifact, version, repository) {
  const expectedPurl = `pkg:npm/${PACKAGE_NAME}@${version}`;
  const packages = (spdx.packages ?? []).filter((entry) => {
    const purl = spdxPurl(entry);
    return purl?.startsWith("pkg:npm/") && entry.name !== WORKSPACE_NAME;
  });
  const main = packages.find((entry) => spdxPurl(entry) === expectedPurl);

  if (!main) {
    throw new Error(`${expectedPurl} is missing from the SPDX document.`);
  }

  Object.assign(main, {
    name: PACKAGE_NAME,
    versionInfo: version,
    packageFileName: artifact.name,
    supplier: "Organization: Infragistics",
    checksums: [
      { algorithm: "SHA256", checksumValue: artifact.sha256 },
      { algorithm: "SHA512", checksumValue: artifact.sha512 },
    ],
  });

  const retainedIds = new Set(packages.map((entry) => entry.SPDXID));
  const relationships = (spdx.relationships ?? []).filter((entry) => {
    if (entry.relationshipType === "DESCRIBES") {
      return false;
    }

    const sourceRetained = entry.spdxElementId === "SPDXRef-DOCUMENT" || retainedIds.has(entry.spdxElementId);
    const targetRetained = entry.relatedSpdxElement === "SPDXRef-DOCUMENT" || retainedIds.has(entry.relatedSpdxElement);
    return sourceRetained && targetRetained;
  });
  relationships.push({
    spdxElementId: "SPDXRef-DOCUMENT",
    relatedSpdxElement: main.SPDXID,
    relationshipType: "DESCRIBES",
  });

  const document = { ...spdx };
  delete document.files;

  return {
    ...document,
    name: `${PACKAGE_NAME}-${version}`,
    documentNamespace: `https://github.com/${repository}/releases/${encodeURIComponent(version)}/sbom/spdx/${artifact.sha256}`,
    documentDescribes: [main.SPDXID],
    packages: [main, ...packages.filter((entry) => entry !== main)],
    relationships,
  };
}

/**
 * Require the delivered CycloneDX and SPDX documents to describe the same npm package set and artifact.
 * @param {object} cycloneDx - Delivered CycloneDX document.
 * @param {object} spdx - Normalized delivered SPDX document.
 * @param {{ name: string, sha256: string, sha512: string }} artifact - Packed release artifact.
 * @param {string} version - Released package version.
 * @returns {void}
 */
export function assertEquivalentDeliveredSboms(cycloneDx, spdx, artifact, version) {
  const failures = [];
  const expectedPurl = `pkg:npm/${PACKAGE_NAME}@${version}`;
  const cycloneDxMain = cycloneDx.metadata?.component;
  const cycloneDxEntries = [cycloneDxMain, ...(cycloneDx.components ?? [])].filter(Boolean);
  const spdxPackages = spdx.packages ?? [];
  const spdxMainPackages = spdxPackages.filter((entry) => spdxPurl(entry) === expectedPurl);
  const spdxMain = spdxMainPackages[0];
  const nonNpmPackages = spdxPackages.filter((entry) => !spdxPurl(entry)?.startsWith("pkg:npm/"));

  if (cycloneDxMain?.purl !== expectedPurl) {
    failures.push(`CycloneDX root purl is "${cycloneDxMain?.purl}"`);
  }
  if (!spdxMain) {
    failures.push(`SPDX is missing ${expectedPurl}`);
  }
  if (spdxMainPackages.length !== 1) {
    failures.push(`SPDX contains ${spdxMainPackages.length} main package entries`);
  }
  if ((cycloneDx.components ?? []).some((entry) => entry.purl === expectedPurl)) {
    failures.push("CycloneDX lists the main package as its own dependency");
  }
  if (!cycloneDx.components?.length || spdxPackages.filter((entry) => entry !== spdxMain).length === 0) {
    failures.push("a delivered dependency closure is empty");
  }
  if (!cycloneDx.dependencies?.some((entry) => entry.ref === cycloneDxMain?.["bom-ref"])) {
    failures.push("CycloneDX does not root its dependency graph on the main package");
  }
  if (!spdx.documentDescribes?.includes(spdxMain?.SPDXID)) {
    failures.push("SPDX documentDescribes does not identify the main package");
  }
  if (!(spdx.relationships ?? []).some((entry) =>
    entry.spdxElementId === "SPDXRef-DOCUMENT" &&
    entry.relatedSpdxElement === spdxMain?.SPDXID &&
    entry.relationshipType === "DESCRIBES")) {
    failures.push("SPDX has no DESCRIBES relationship to the main package");
  }

  const cycloneDxHashes = new Map((cycloneDxMain?.hashes ?? []).map((entry) => [entry.alg, entry.content]));
  const spdxHashes = new Map((spdxMain?.checksums ?? []).map((entry) => [entry.algorithm, entry.checksumValue]));
  if (cycloneDxHashes.get("SHA-256") !== artifact.sha256 || cycloneDxHashes.get("SHA-512") !== artifact.sha512) {
    failures.push("CycloneDX root hashes do not match the packed artifact");
  }
  if (spdxHashes.get("SHA256") !== artifact.sha256 || spdxHashes.get("SHA512") !== artifact.sha512) {
    failures.push("SPDX root hashes do not match the packed artifact");
  }
  if (spdxMain?.packageFileName !== artifact.name) {
    failures.push(`SPDX packageFileName is "${spdxMain?.packageFileName}"`);
  }
  if (nonNpmPackages.length) {
    failures.push(`SPDX contains non-npm packages: ${nonNpmPackages.map((entry) => entry.name).join(", ")}`);
  }

  const cycloneDxIdentities = new Set(cycloneDxEntries.map((entry) => identityFromPurl(entry.purl)).filter(Boolean));
  const spdxIdentities = new Set(spdxPackages.map((entry) => identityFromPurl(spdxPurl(entry))).filter(Boolean));
  const onlyCycloneDx = sortedDifference(cycloneDxIdentities, spdxIdentities);
  const onlySpdx = sortedDifference(spdxIdentities, cycloneDxIdentities);
  if (onlyCycloneDx.length || onlySpdx.length) {
    failures.push(`npm inventory mismatch (CycloneDX only: ${onlyCycloneDx.join(", ") || "none"}; SPDX only: ${onlySpdx.join(", ") || "none"})`);
  }

  if (failures.length) {
    throw new Error(`Delivered SBOM validation failed:\n  - ${failures.join("\n  - ")}`);
  }
}

/**
 * Render bounded npm tree diagnostics for the best-effort build-environment SBOM.
 * @param {{ status: number, problems: string[], stderr: string }} result - npm ls result.
 * @returns {string} Markdown release-note section.
 */
export function formatBuildEnvironmentDiagnostics(result) {
  const lines = [
    "## Build-environment SBOM diagnostics",
    "",
    "The build-environment CycloneDX SBOM is a best-effort inventory. Dependency-tree errors are tolerated for this supplementary document and do not affect the delivered-package SBOMs.",
    "",
  ];

  if (result.status === 0 && result.problems.length === 0 && !result.stderr.trim()) {
    lines.push("npm ls reported no dependency-tree problems.");
    return `${lines.join("\n")}\n`;
  }

  lines.push(`npm ls exited with status ${result.status}.`);
  const details = [...result.problems, ...result.stderr.split(/\r?\n/)]
    .map((entry) => sanitizedDiagnostic(entry).trim())
    .filter(Boolean)
    .filter((entry, index, entries) => entries.indexOf(entry) === index)
    .slice(0, 50);

  if (details.length) {
    lines.push("", "```text", ...details, "```");
  }

  return `${lines.join("\n")}\n`;
}

/**
 * Add or replace the generated diagnostics section while preserving authored GitHub release notes.
 * @param {string} releaseNotes - Existing GitHub release body.
 * @param {string} diagnostics - Generated Markdown diagnostics.
 * @returns {string} Updated release body.
 */
export function mergeBuildEnvironmentDiagnostics(releaseNotes, diagnostics) {
  const generatedSection = `${DIAGNOSTICS_START}\n${diagnostics.trim()}\n${DIAGNOSTICS_END}`;
  const start = releaseNotes.indexOf(DIAGNOSTICS_START);
  const end = releaseNotes.indexOf(DIAGNOSTICS_END, start);

  if (start >= 0 && end >= start) {
    return `${releaseNotes.slice(0, start)}${generatedSection}${releaseNotes.slice(end + DIAGNOSTICS_END.length)}`;
  }

  const authoredNotes = releaseNotes.trimEnd();
  return authoredNotes ? `${authoredNotes}\n\n${generatedSection}\n` : `${generatedSection}\n`;
}