import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import getArgs from "./get-args.mjs";
import { log, logError } from "./logger.mjs";
import {
  assertDeliveredShape,
  promoteMainComponent,
} from "./sbom-document.mjs";
import { formatSupplyChainNotes } from "./sbom-utils.mjs";

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

  // The lockfile this writes is the evidence npm audit reads back from this same tree.
  npm(
    ["install", "--omit=dev", "--ignore-scripts", "--no-audit", "--no-fund"],
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
  // Not --output-reproducible: that flag drops serialNumber, which actions/attest requires
  // (alongside bomFormat and specVersion) to recognize the document as CycloneDX.
  const document = run(
    process.execPath,
    [resolveCycloneDxCli(), "--spec-version", SPEC_VERSION, "--output-format", "JSON", "--output-file", "-", "--validate", ...extraArgs],
    cwd,
  );

  return JSON.parse(document);
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
 * Capture npm's dependency-tree diagnostics without failing supplementary inventory generation.
 * @returns {{ status: number, problems: string[], stderr: string }} Structured npm diagnostics.
 */
function captureNpmTreeDiagnostics() {
  const result = spawnSync(
    process.execPath,
    [npmCli, "ls", "--json", "--all"],
    {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
      env: { ...process.env, npm_execpath: npmCli },
    },
  );
  const problems = [];

  try {
    const tree = JSON.parse(result.stdout || "{}");
    const pending = [tree];
    while (pending.length) {
      const entry = pending.pop();
      if (!entry || typeof entry !== "object") {
        continue;
      }
      if (Array.isArray(entry.problems)) {
        problems.push(...entry.problems);
      }
      pending.push(...Object.values(entry));
    }
  } catch (error) {
    problems.push(`Could not parse npm ls JSON: ${error.message}`);
  }

  return {
    status: result.status ?? 1,
    problems,
    stderr: [result.error?.message, result.stderr].filter(Boolean).join("\n"),
  };
}

/**
 * Audit the delivered closure. A nonzero exit only means findings, so it never fails the release.
 * @param {string} workspaceDir - Directory holding the installed delivered tree.
 * @returns {object} Audit summary, or an unavailable marker with the reason.
 */
function captureDeliveredAudit(workspaceDir) {
  const result = spawnSync(
    process.execPath,
    [npmCli, "audit", "--omit=dev", "--json"],
    {
      cwd: workspaceDir,
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
      env: { ...process.env, npm_execpath: npmCli },
    },
  );

  try {
    const report = JSON.parse(result.stdout || "{}");

    if (!report.metadata?.vulnerabilities) {
      throw new Error(report.error?.summary ?? result.stderr.trim() ?? "npm audit produced no report");
    }

    log(CATEGORY, `delivered audit found ${report.metadata.vulnerabilities.total} known vulnerabilities`);

    return {
      available: true,
      counts: report.metadata.vulnerabilities,
      packages: Object.values(report.vulnerabilities ?? {}).map((entry) => ({
        name: entry.name,
        severity: entry.severity,
        direct: entry.isDirect === true,
        fixAvailable: entry.fixAvailable !== false,
      })),
    };
  } catch (error) {
    return { available: false, reason: error.message };
  }
}

/**
 * Validate a written document against the official CycloneDX schema.
 * @param {string} file - Path to the written document.
 */
async function assertValidCycloneDx(file) {
  const requireFromGenerator = createRequire(path.join(cycloneDxDir, "package.json"));
  const libraryEntry = requireFromGenerator.resolve("@cyclonedx/cyclonedx-library");
  const { Validation } = await import(pathToFileURL(libraryEntry));
  const error = await new Validation.JsonValidator(SPEC_VERSION).validate(fs.readFileSync(file, "utf8"));

  if (error !== null) {
    throw new Error(
      `${path.basename(file)} is not valid CycloneDX ${SPEC_VERSION}: ${JSON.stringify(error.errors ?? error)}`,
    );
  }

  log(CATEGORY, `validated ${path.basename(file)} against CycloneDX ${SPEC_VERSION}`);
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

  return template.replace(/{{(\w+)}}/g, (match, key) => {
    if (!(key in values)) {
      throw new Error(`No value supplied for template placeholder ${match}.`);
    }

    return values[key];
  });
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
  buildEnvCycloneDxFile: `${baseName}.build-env.cdx.json`,
  supplyChainNotesFile: `${baseName}.supply-chain.md`,
};

try {
  if (args["build-env"]) {
    // The repository tree, dev dependencies included: an inventory of the toolchain, not the product.
    // Tolerates npm-ls complaints about the dev tree; the delivered document never does.
    const bom = generateCycloneDx(repoRoot, [
      "--mc-type",
      "application",
      "--ignore-npm-errors",
    ]);
    bom.metadata.supplier = SUPPLIER;

    const file = path.join(outDir, fileNames.buildEnvCycloneDxFile);
    writeBom(file, bom);
    await assertValidCycloneDx(file);
  } else {
    const artifact = packArtifact(packageDir, outDir);
    const workspaceDir = installDeliveredClosure(artifact, path.join(outDir, ".delivered"));
    const bom = promoteMainComponent(
      generateCycloneDx(workspaceDir, ["--mc-type", "library", "--omit", "dev"]),
      { artifact, packageName: PACKAGE_NAME, supplier: SUPPLIER, version },
    );
    const componentCount = assertDeliveredShape(bom, {
      packageName: PACKAGE_NAME,
      version,
    });
    log(CATEGORY, `delivered SBOM covers ${componentCount} components`);

    const deliveredFile = path.join(outDir, fileNames.deliveredCycloneDxFile);
    writeBom(deliveredFile, bom);
    await assertValidCycloneDx(deliveredFile);

    fs.writeFileSync(`${artifact.path}.sha256`, `${artifact.sha256}  ${artifact.name}\n`);
    fs.writeFileSync(`${artifact.path}.sha512`, `${artifact.sha512}  ${artifact.name}\n`);

    const supplyChainNotes = formatSupplyChainNotes({
      audit: captureDeliveredAudit(workspaceDir),
      npmTree: captureNpmTreeDiagnostics(),
    });
    fs.writeFileSync(path.join(outDir, fileNames.supplyChainNotesFile), supplyChainNotes);

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
        supplyChainNotes: supplyChainNotes.trim(),
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
