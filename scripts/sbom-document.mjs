function componentsIn(components) {
  return components.flatMap((component) => [
    component,
    ...componentsIn(component.components ?? []),
  ]);
}

function replacePrefix(value, prefix) {
  return value?.startsWith(prefix) ? value.slice(prefix.length) : value;
}

/**
 * Replace the generated workspace root with the published package and normalize all graph refs.
 * @param {object} bom - CycloneDX document produced from the delivered workspace.
 * @param {object} options - Published package metadata.
 * @returns {object} The normalized document.
 */
export function promoteMainComponent(
  bom,
  { artifact, packageName, supplier, version },
) {
  const index = bom.components.findIndex((component) => component.name === packageName);

  if (index === -1) {
    throw new Error(`${packageName} is missing from the generated SBOM.`);
  }

  const [main] = bom.components.splice(index, 1);
  const workspaceRef = bom.metadata.component["bom-ref"];
  const workspacePrefix = `${workspaceRef}|`;
  const normalizeRef = (value) => replacePrefix(value, workspacePrefix);

  for (const component of [main, ...componentsIn(bom.components)]) {
    component["bom-ref"] = normalizeRef(component["bom-ref"]);
  }

  bom.metadata.component = {
    ...main,
    type: "library",
    purl: `pkg:npm/${packageName}@${version}`,
    supplier,
    publisher: supplier.name,
    hashes: [
      { alg: "SHA-256", content: artifact.sha256 },
      { alg: "SHA-512", content: artifact.sha512 },
    ],
    properties: [
      ...(main.properties ?? []),
      { name: "ig:artifact:fileName", value: artifact.name },
    ],
  };
  bom.metadata.supplier = supplier;
  bom.dependencies = bom.dependencies
    .filter((entry) => entry.ref !== workspaceRef)
    .map((entry) => ({
      ...entry,
      ref: normalizeRef(entry.ref),
      ...(entry.dependsOn && { dependsOn: entry.dependsOn.map(normalizeRef) }),
      ...(entry.provides && { provides: entry.provides.map(normalizeRef) }),
    }));

  return bom;
}

/**
 * Validate the identity, references and reachability of a delivered CycloneDX dependency graph.
 * @param {object} bom - Document to check.
 * @param {{ packageName: string, version: string }} expected - Expected root package metadata.
 * @returns {number} Total dependency component count, including nested components.
 */
export function assertDeliveredShape(bom, { packageName, version }) {
  const failures = [];
  const main = bom.metadata?.component;
  const components = componentsIn(bom.components ?? []);
  const componentRefs = components.map((component) => component["bom-ref"]);
  const knownRefs = new Set([main?.["bom-ref"], ...componentRefs]);
  const dependencyGraph = new Map(
    (bom.dependencies ?? []).map((entry) => [entry.ref, entry.dependsOn ?? []]),
  );

  if (main?.purl !== `pkg:npm/${packageName}@${version}`) {
    failures.push(`metadata.component.purl is "${main?.purl}"`);
  }
  if (components.length === 0) {
    failures.push("no dependency components were resolved");
  }
  if (components.some((component) => component.name === packageName)) {
    failures.push(`${packageName} is still listed as its own dependency`);
  }

  const duplicateRefs = componentRefs.filter(
    (ref, index) => componentRefs.indexOf(ref) !== index,
  );
  for (const ref of new Set(duplicateRefs)) {
    failures.push(`component bom-ref "${ref}" is duplicated`);
  }

  for (const entry of bom.dependencies ?? []) {
    if (!knownRefs.has(entry.ref)) {
      failures.push(`dependency entry references unknown component "${entry.ref}"`);
    }
    for (const ref of [...(entry.dependsOn ?? []), ...(entry.provides ?? [])]) {
      if (!knownRefs.has(ref)) {
        failures.push(`dependency entry references unknown component "${ref}"`);
      }
    }
  }

  if (!dependencyGraph.has(main?.["bom-ref"])) {
    failures.push("the main component is not the root of the dependency graph");
  } else {
    const reachable = new Set();
    const pending = [main["bom-ref"]];

    while (pending.length > 0) {
      const ref = pending.pop();
      if (reachable.has(ref)) {
        continue;
      }
      reachable.add(ref);
      pending.push(...(dependencyGraph.get(ref) ?? []));
    }

    for (const ref of componentRefs) {
      if (!reachable.has(ref)) {
        failures.push(`component "${ref}" is unreachable from the main component`);
      }
    }
  }

  if (failures.length > 0) {
    throw new Error(`SBOM validation failed:\n  - ${failures.join("\n  - ")}`);
  }

  return components.length;
}
