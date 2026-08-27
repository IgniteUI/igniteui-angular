import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import getArgs from "./get-args.mjs";
import { log, logError } from "./logger.mjs";

const CATEGORY = "sbom";
const SPEC_VERSION = "1.6";
const PACKAGE_NAME = "igniteui-angular";
const SUPPLIER = {
  name: "Infragistics",
  url: ["https://www.infragistics.com"],
};

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
// Resolved by path: the package's exports map deliberately hides both the CLI and its manifest.
const cycloneDxDir = path.join(repoRoot, "node_modules", "@cyclonedx", "cyclonedx-npm");

/**
 * Resolve the CycloneDX CLI from node_modules so generation never hits the network.
 * @returns {string} Absolute path to the CLI entry point.
 */
function resolveCycloneDxCli() {
  const cli = path.join(cycloneDxDir, "bin", "cyclonedx-npm-cli.js");

  if (!fs.existsSync(cli)) {
    throw new Error(`@cyclonedx/cyclonedx-npm CLI not found at ${cli}. Run "npm ci" first.`);
  }

  return cli;
}

/**
 * @returns {string} The installed version of the CycloneDX generator.
 */
function cycloneDxToolVersion() {
  return JSON.parse(fs.readFileSync(path.join(cycloneDxDir, "package.json"), "utf8")).version;
}

/**
 * Run a command without a shell, so no argument can be interpreted as shell syntax.
 * @param {string} command - Executable to run.
 * @param {string[]} args - Argument vector.
 * @param {string} cwd - Working directory.
 * @param {'pipe'|'inherit'} [stdout] - How to handle standard output.
 * @returns {string} Captured stdout when piped, otherwise an empty string.
 */
function run(command, args, cwd, stdout = "pipe") {
  return (
    execFileSync(command, args, {
      cwd,
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
      stdio: ["ignore", stdout, "inherit"],
      env: { ...process.env, npm_execpath: npmCli },
    }) ?? ""
  );
}

/**
 * Locate npm's JS entry point. Node refuses to spawn "npm.cmd" without a shell on Windows,
 * and the same path lets the CycloneDX generator reuse this exact npm via npm_execpath.
 * @returns {string} Absolute path to npm-cli.js.
 */
function resolveNpmCli() {
  const nodeDir = path.dirname(process.execPath);
  const candidates = [
    process.env.npm_execpath,
    path.join(nodeDir, "node_modules", "npm", "bin", "npm-cli.js"),
    path.join(nodeDir, "..", "lib", "node_modules", "npm", "bin", "npm-cli.js"),
  ];
  const cli = candidates.find((candidate) => candidate?.endsWith(".js") && fs.existsSync(candidate));

  if (!cli) {
    throw new Error("Could not locate npm-cli.js next to the running Node.js installation.");
  }

  return cli;
}

const npmCli = resolveNpmCli();

/**
 * @param {string[]} args - npm argument vector.
 * @param {string} cwd - Working directory.
 * @param {'pipe'|'inherit'} [stdout] - How to handle standard output.
 * @returns {string} Captured stdout when piped, otherwise an empty string.
 */
function npm(args, cwd, stdout = "pipe") {
  return run(process.execPath, [npmCli, ...args], cwd, stdout);
}

/**
 * @param {string} file - Absolute path to hash.
 * @param {string} algorithm - Node crypto hash algorithm.
 * @returns {string} Lowercase hex digest.
 */
function digest(file, algorithm) {
  return createHash(algorithm).update(fs.readFileSync(file)).digest("hex");
}

/**
 * @param {string} dir - Directory to create if missing.
 * @returns {string} The same directory.
 */
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Pack the built package so the SBOM subject is the exact artifact that gets published.
 * @param {string} packageDir - Directory holding the built package.
 * @param {string} outDir - Destination directory for the tarball.
 * @returns {{ name: string, path: string, sha256: string, sha512: string }} Artifact metadata.
 */
function packArtifact(packageDir, outDir) {
  const output = npm(["pack", packageDir, "--pack-destination", outDir, "--json"], repoRoot);
  const name = JSON.parse(output)[0].filename;
  const tarball = path.join(outDir, name);

  log(CATEGORY, `packed ${name}`);

  return {
    name,
    path: tarball,
    sha256: digest(tarball, "sha256"),
    sha512: digest(tarball, "sha512"),
  };
}

/**
 * Install the packed tarball in isolation, producing the dependency closure a consumer resolves.
 * @param {{ name: string, path: string }} artifact - The packed tarball.
 * @param {string} workspaceDir - Directory to materialize the install tree in.
 * @returns {string} The workspace directory.
 */
function installDeliveredClosure(artifact, workspaceDir) {
  fs.rmSync(workspaceDir, { recursive: true, force: true });
  ensureDir(workspaceDir);
  fs.copyFileSync(artifact.path, path.join(workspaceDir, artifact.name));

  fs.writeFileSync(
    path.join(workspaceDir, "package.json"),
    `${JSON.stringify(
      {
        name: "igniteui-angular-sbom-workspace",
        version: "0.0.0",
        private: true,
        dependencies: { [PACKAGE_NAME]: `file:./${artifact.name}` },
      },
      null,
      2,
    )}\n`,
  );

  npm(
    ["install", "--omit=dev", "--ignore-scripts", "--no-audit", "--no-fund", "--no-package-lock"],
    workspaceDir,
    "inherit",
  );

  log(CATEGORY, "installed delivered dependency closure");
  return workspaceDir;
}

/**
 * @param {string} cwd - Project directory to describe.
 * @param {string[]} extraArgs - Additional CycloneDX CLI arguments.
 * @returns {object} The generated CycloneDX document.
 */
function generateCycloneDx(cwd, extraArgs) {
  const document = run(
    process.execPath,
    [
      resolveCycloneDxCli(),
      "--spec-version",
      SPEC_VERSION,
      "--output-format",
      "JSON",
      "--output-file",
      "-",
      "--validate",
      "--output-reproducible",
      ...extraArgs,
    ],
    cwd,
  );

  return JSON.parse(document);
}

/**
 * Re-root the document on the published package instead of the throwaway install workspace.
 * @param {object} bom - CycloneDX document produced from the delivered workspace.
 * @param {{ name: string, sha256: string, sha512: string }} artifact - The packed tarball.
 * @param {string} version - The released version.
 * @returns {object} The normalized document.
 */
function promoteMainComponent(bom, artifact, version) {
  const purl = `pkg:npm/${PACKAGE_NAME}@${version}`;
  const index = bom.components.findIndex((component) => component.name === PACKAGE_NAME);

  if (index === -1) {
    throw new Error(`${PACKAGE_NAME} is missing from the generated SBOM.`);
  }

  const [main] = bom.components.splice(index, 1);
  const workspaceRef = bom.metadata.component["bom-ref"];

  bom.metadata.component = {
    ...main,
    type: "library",
    purl,
    supplier: SUPPLIER,
    publisher: SUPPLIER.name,
    hashes: [
      { alg: "SHA-256", content: artifact.sha256 },
      { alg: "SHA-512", content: artifact.sha512 },
    ],
    properties: [
      ...(main.properties ?? []),
      { name: "ig:artifact:fileName", value: artifact.name },
    ],
  };

  bom.metadata.supplier = SUPPLIER;
  bom.dependencies = bom.dependencies.filter((entry) => entry.ref !== workspaceRef);

  return bom;
}

/**
 * @param {object} bom - Document to check.
 * @param {string} version - Expected version of the main component.
 */
function assertDeliveredShape(bom, version) {
  const failures = [];
  const main = bom.metadata?.component;

  if (main?.purl !== `pkg:npm/${PACKAGE_NAME}@${version}`) {
    failures.push(`metadata.component.purl is "${main?.purl}"`);
  }
  if (!bom.components?.length) {
    failures.push("no dependency components were resolved");
  }
  if (!bom.dependencies?.some((entry) => entry.ref === main?.["bom-ref"])) {
    failures.push("the main component is not the root of the dependency graph");
  }
  if (bom.components?.some((component) => component.name === PACKAGE_NAME)) {
    failures.push(`${PACKAGE_NAME} is still listed as its own dependency`);
  }

  if (failures.length) {
    throw new Error(`SBOM validation failed:\n  - ${failures.join("\n  - ")}`);
  }

  log(CATEGORY, `delivered SBOM covers ${bom.components.length} components`);
}

/**
 * @param {string} file - Destination path.
 * @param {object} bom - Document to write.
 */
function writeBom(file, bom) {
  fs.writeFileSync(file, `${JSON.stringify(bom, null, 2)}\n`);
  log(CATEGORY, `wrote ${path.relative(repoRoot, file)}`);
}

/**
 * @param {Record<string, string>} values - Template replacements.
 * @returns {string} The rendered note document.
 */
function renderNote(values) {
  const template = fs.readFileSync(
    path.join(scriptDir, "templates", "sbom-readme.md"),
    "utf8",
  );

  return template.replace(/{{(\w+)}}/g, (match, key) => values[key] ?? match);
}

const args = getArgs();
const packageDir = path.resolve(repoRoot, args["package-dir"] ?? "dist/igniteui-angular");
const outDir = ensureDir(path.resolve(repoRoot, args.out ?? "dist/sbom"));
const version =
  args.version === true || !args.version
    ? JSON.parse(fs.readFileSync(path.join(packageDir, "package.json"), "utf8")).version
    : args.version;
const baseName = `infragistics-angular-${version}`;
const fileNames = {
  deliveredCycloneDxFile: `${baseName}.cdx.json`,
  deliveredSpdxFile: `${baseName}.spdx.json`,
  buildEnvCycloneDxFile: `${baseName}.build-env.cdx.json`,
};

try {
  if (args["build-env"]) {
    // The repository tree, dev dependencies included: provenance of the toolchain, not of the product.
    // Tolerates npm-ls complaints about the dev tree; the delivered document below never does.
    const bom = generateCycloneDx(repoRoot, [
      "--mc-type",
      "application",
      "--ignore-npm-errors",
    ]);
    bom.metadata.supplier = SUPPLIER;
    writeBom(path.join(outDir, fileNames.buildEnvCycloneDxFile), bom);
  } else {
    const artifact = packArtifact(packageDir, outDir);
    const workspaceDir = installDeliveredClosure(artifact, path.join(outDir, ".delivered"));
    const bom = promoteMainComponent(
      generateCycloneDx(workspaceDir, ["--mc-type", "library", "--omit", "dev"]),
      artifact,
      version,
    );

    assertDeliveredShape(bom, version);
    writeBom(path.join(outDir, fileNames.deliveredCycloneDxFile), bom);

    fs.writeFileSync(`${artifact.path}.sha256`, `${artifact.sha256}  ${artifact.name}\n`);
    fs.writeFileSync(`${artifact.path}.sha512`, `${artifact.sha512}  ${artifact.name}\n`);

    fs.writeFileSync(
      path.join(outDir, `${baseName}.sbom.README.md`),
      renderNote({
        ...fileNames,
        version,
        generatedAt: new Date().toISOString().slice(0, 10),
        tarballName: artifact.name,
        sha256: artifact.sha256,
        sha512: artifact.sha512,
        cycloneDxToolVersion: cycloneDxToolVersion(),
        nodeVersion: process.version,
        repository: process.env.GITHUB_REPOSITORY ?? "IgniteUI/igniteui-angular",
        workflow: process.env.GITHUB_WORKFLOW ?? "a local build",
      }),
    );

    if (!args.keep) {
      fs.rmSync(workspaceDir, { recursive: true, force: true });
    }
  }
} catch (error) {
  logError(CATEGORY, "SBOM generation failed", error);
  process.exitCode = 1;
}
