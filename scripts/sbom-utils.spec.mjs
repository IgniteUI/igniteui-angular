import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  assertEquivalentDeliveredSboms,
  formatBuildEnvironmentDiagnostics,
  mergeBuildEnvironmentDiagnostics,
  normalizeSpdx,
} from "./sbom-utils.mjs";

const VERSION = "1.2.3";
const ARTIFACT = {
  name: `igniteui-angular-${VERSION}.tgz`,
  sha256: "a".repeat(64),
  sha512: "b".repeat(128),
};

function cycloneDx() {
  return {
    metadata: {
      component: {
        name: "igniteui-angular",
        version: VERSION,
        purl: `pkg:npm/igniteui-angular@${VERSION}`,
        "bom-ref": `pkg:npm/igniteui-angular@${VERSION}`,
        hashes: [
          { alg: "SHA-256", content: ARTIFACT.sha256 },
          { alg: "SHA-512", content: ARTIFACT.sha512 },
        ],
      },
    },
    components: [
      {
        name: "@angular/core",
        version: "22.1.4",
        purl: "pkg:npm/%40angular/core@22.1.4",
      },
    ],
    dependencies: [
      {
        ref: `pkg:npm/igniteui-angular@${VERSION}`,
        dependsOn: ["pkg:npm/%40angular/core@22.1.4"],
      },
    ],
  };
}

function rawSpdx() {
  return {
    SPDXID: "SPDXRef-DOCUMENT",
    spdxVersion: "SPDX-2.3",
    name: "artifacts/.delivered",
    documentNamespace: "https://anchore.com/syft/dir/artifacts-.delivered",
    creationInfo: {
      created: "2026-08-27T12:00:00Z",
      creators: ["Tool: syft-1.42.3"],
    },
    packages: [
      {
        SPDXID: "SPDXRef-Package-workspace",
        name: "igniteui-angular-sbom-workspace",
        versionInfo: "0.0.0",
        externalRefs: [
          {
            referenceCategory: "PACKAGE-MANAGER",
            referenceType: "purl",
            referenceLocator: "pkg:npm/igniteui-angular-sbom-workspace@0.0.0",
          },
        ],
      },
      {
        SPDXID: "SPDXRef-Package-main",
        name: "igniteui-angular",
        versionInfo: VERSION,
        externalRefs: [
          {
            referenceCategory: "PACKAGE-MANAGER",
            referenceType: "purl",
            referenceLocator: `pkg:npm/igniteui-angular@${VERSION}`,
          },
        ],
      },
      {
        SPDXID: "SPDXRef-Package-angular-core",
        name: "@angular/core",
        versionInfo: "22.1.4",
        externalRefs: [
          {
            referenceCategory: "PACKAGE-MANAGER",
            referenceType: "purl",
            referenceLocator: "pkg:npm/%40angular/core@22.1.4",
          },
        ],
      },
      {
        SPDXID: "SPDXRef-Package-action",
        name: "actions/checkout",
        versionInfo: "v6",
        externalRefs: [
          {
            referenceCategory: "PACKAGE-MANAGER",
            referenceType: "purl",
            referenceLocator: "pkg:github/actions/checkout@v6",
          },
        ],
      },
      {
        SPDXID: "SPDXRef-DocumentRoot-Directory",
        name: "artifacts/.delivered",
      },
    ],
    relationships: [
      {
        spdxElementId: "SPDXRef-DOCUMENT",
        relatedSpdxElement: "SPDXRef-DocumentRoot-Directory",
        relationshipType: "DESCRIBES",
      },
      {
        spdxElementId: "SPDXRef-Package-workspace",
        relatedSpdxElement: "SPDXRef-Package-main",
        relationshipType: "DEPENDS_ON",
      },
      {
        spdxElementId: "SPDXRef-Package-main",
        relatedSpdxElement: "SPDXRef-Package-angular-core",
        relationshipType: "DEPENDS_ON",
      },
    ],
  };
}

describe("normalizeSpdx", () => {
  test("describes the released npm package and removes scan-only packages", () => {
    const normalized = normalizeSpdx(rawSpdx(), ARTIFACT, VERSION, "IgniteUI/igniteui-angular");

    assert.equal(normalized.name, `igniteui-angular-${VERSION}`);
    assert.match(normalized.documentNamespace, new RegExp(`${ARTIFACT.sha256}$`));
    assert.deepEqual(
      normalized.packages.map((entry) => entry.name),
      ["igniteui-angular", "@angular/core"],
    );

    const main = normalized.packages[0];
    assert.equal(main.packageFileName, ARTIFACT.name);
    assert.equal(main.supplier, "Organization: Infragistics");
    assert.deepEqual(main.checksums, [
      { algorithm: "SHA256", checksumValue: ARTIFACT.sha256 },
      { algorithm: "SHA512", checksumValue: ARTIFACT.sha512 },
    ]);
    assert.deepEqual(normalized.documentDescribes, [main.SPDXID]);
    assert.deepEqual(
      normalized.relationships.filter((entry) => entry.relationshipType === "DESCRIBES"),
      [
        {
          spdxElementId: "SPDXRef-DOCUMENT",
          relatedSpdxElement: main.SPDXID,
          relationshipType: "DESCRIBES",
        },
      ],
    );
  });
});

describe("assertEquivalentDeliveredSboms", () => {
  test("accepts matching npm inventories rooted on the exact artifact", () => {
    const spdx = normalizeSpdx(rawSpdx(), ARTIFACT, VERSION, "IgniteUI/igniteui-angular");

    assert.doesNotThrow(() => assertEquivalentDeliveredSboms(cycloneDx(), spdx, ARTIFACT, VERSION));
  });

  test("rejects mismatched or unrelated package inventories", () => {
    const spdx = normalizeSpdx(rawSpdx(), ARTIFACT, VERSION, "IgniteUI/igniteui-angular");
    spdx.packages.push({
      SPDXID: "SPDXRef-Package-action",
      name: "actions/checkout",
      versionInfo: "v6",
      externalRefs: [
        {
          referenceCategory: "PACKAGE-MANAGER",
          referenceType: "purl",
          referenceLocator: "pkg:github/actions/checkout@v6",
        },
      ],
    });

    assert.throws(
      () => assertEquivalentDeliveredSboms(cycloneDx(), spdx, ARTIFACT, VERSION),
      /non-npm packages: actions\/checkout/,
    );
  });

  test("rejects dependency-version and artifact-hash mismatches", () => {
    const spdx = normalizeSpdx(rawSpdx(), ARTIFACT, VERSION, "IgniteUI/igniteui-angular");
    const angular = spdx.packages.find((entry) => entry.name === "@angular/core");
    angular.versionInfo = "22.1.5";
    angular.externalRefs[0].referenceLocator = "pkg:npm/%40angular/core@22.1.5";

    const cycloneDxBom = cycloneDx();
    cycloneDxBom.metadata.component.hashes[0].content = "c".repeat(64);

    assert.throws(
      () => assertEquivalentDeliveredSboms(cycloneDxBom, spdx, ARTIFACT, VERSION),
      (error) => {
        assert.match(error.message, /CycloneDX root hashes do not match/);
        assert.match(error.message, /npm inventory mismatch/);
        assert.match(error.message, /@angular\/core@22\.1\.4/);
        assert.match(error.message, /@angular\/core@22\.1\.5/);
        return true;
      },
    );
  });
});

describe("formatBuildEnvironmentDiagnostics", () => {
  test("labels the inventory best-effort and includes npm dependency-tree problems", () => {
    const diagnostics = formatBuildEnvironmentDiagnostics({
      status: 1,
      problems: ["invalid: chokidar@5.0.0"],
      stderr: "npm error code ELSPROBLEMS",
    });

    assert.match(diagnostics, /best-effort/i);
    assert.match(diagnostics, /npm ls exited with status 1/);
    assert.match(diagnostics, /invalid: chokidar@5\.0\.0/);
    assert.match(diagnostics, /ELSPROBLEMS/);
  });

  test("replaces its marked GitHub release-note section without changing authored notes", () => {
    const diagnostics = formatBuildEnvironmentDiagnostics({
      status: 1,
      problems: ["invalid: chokidar@5.0.0"],
      stderr: "",
    });
    const original = "# Release 1.2.3\n\nCustomer-facing changes.";
    const first = mergeBuildEnvironmentDiagnostics(original, diagnostics);
    const second = mergeBuildEnvironmentDiagnostics(first, diagnostics);

    assert.match(first, /^# Release 1\.2\.3\n\nCustomer-facing changes\./);
    assert.equal(first, second);
    assert.equal(first.match(/Build-environment SBOM diagnostics/g)?.length, 1);
  });
});