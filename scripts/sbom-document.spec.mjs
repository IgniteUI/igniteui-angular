import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  assertDeliveredShape,
  promoteMainComponent,
} from "./sbom-document.mjs";

const PACKAGE_NAME = "igniteui-angular";
const VERSION = "1.2.3";
const WORKSPACE_REF = "igniteui-angular-sbom-workspace@0.0.0";
const SUPPLIER = { name: "Infragistics", url: ["https://www.infragistics.com"] };

function generatedBom() {
  const mainRef = `${WORKSPACE_REF}|${PACKAGE_NAME}@${VERSION}`;
  const dependencyRef = `${WORKSPACE_REF}|dependency@2.0.0`;
  const nestedRef = `${dependencyRef}|nested@3.0.0`;

  return {
    metadata: {
      component: { name: "igniteui-angular-sbom-workspace", "bom-ref": WORKSPACE_REF },
    },
    components: [
      { name: PACKAGE_NAME, version: VERSION, "bom-ref": mainRef },
      {
        name: "dependency",
        version: "2.0.0",
        "bom-ref": dependencyRef,
        components: [{ name: "nested", version: "3.0.0", "bom-ref": nestedRef }],
      },
    ],
    dependencies: [
      { ref: WORKSPACE_REF, dependsOn: [mainRef] },
      { ref: mainRef, dependsOn: [dependencyRef] },
      { ref: dependencyRef, dependsOn: [nestedRef] },
      { ref: nestedRef, dependsOn: [] },
    ],
  };
}

describe("delivered CycloneDX document", () => {
  test("re-roots every component and dependency reference on the published package", () => {
    const bom = promoteMainComponent(generatedBom(), {
      artifact: { name: `${PACKAGE_NAME}-${VERSION}.tgz`, sha256: "a".repeat(64), sha512: "b".repeat(128) },
      packageName: PACKAGE_NAME,
      supplier: SUPPLIER,
      version: VERSION,
    });

    assert.equal(assertDeliveredShape(bom, { packageName: PACKAGE_NAME, version: VERSION }), 2);
    assert.equal(bom.metadata.component["bom-ref"], `${PACKAGE_NAME}@${VERSION}`);
    assert.doesNotMatch(JSON.stringify(bom), /igniteui-angular-sbom-workspace/);
    assert.deepEqual(
      bom.dependencies.map((entry) => entry.ref),
      [`${PACKAGE_NAME}@${VERSION}`, "dependency@2.0.0", "dependency@2.0.0|nested@3.0.0"],
    );
  });

  test("rejects dependency references that do not identify a component", () => {
    const bom = promoteMainComponent(generatedBom(), {
      artifact: { name: `${PACKAGE_NAME}-${VERSION}.tgz`, sha256: "a".repeat(64), sha512: "b".repeat(128) },
      packageName: PACKAGE_NAME,
      supplier: SUPPLIER,
      version: VERSION,
    });
    bom.dependencies[0].dependsOn.push("missing@1.0.0");

    assert.throws(
      () => assertDeliveredShape(bom, { packageName: PACKAGE_NAME, version: VERSION }),
      /unknown component "missing@1\.0\.0"/,
    );
  });

  test("rejects components that are unreachable from the published package", () => {
    const bom = promoteMainComponent(generatedBom(), {
      artifact: { name: `${PACKAGE_NAME}-${VERSION}.tgz`, sha256: "a".repeat(64), sha512: "b".repeat(128) },
      packageName: PACKAGE_NAME,
      supplier: SUPPLIER,
      version: VERSION,
    });
    bom.components.push({ name: "orphan", version: "4.0.0", "bom-ref": "orphan@4.0.0" });
    bom.dependencies.push({ ref: "orphan@4.0.0", dependsOn: [] });

    assert.throws(
      () => assertDeliveredShape(bom, { packageName: PACKAGE_NAME, version: VERSION }),
      /component "orphan@4\.0\.0" is unreachable/,
    );
  });
});
