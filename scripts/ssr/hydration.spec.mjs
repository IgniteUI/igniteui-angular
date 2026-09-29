// Guards hydration serialization of components that render detached content, such as a closed
// drop-down. Runs against dist/, so `npm run build:lib` has to have produced it.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, test, before } from "node:test";

import "@angular/compiler"; // dist ships partial declarations; JIT links them at import time
import { bootstrapApplication, provideClientHydration } from "@angular/platform-browser";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { provideServerRendering, renderApplication } from "@angular/platform-server";

const DIST = new URL("../../dist/igniteui-angular/fesm2022/", import.meta.url);

const CASES = [
  { name: "igx-combo", bundle: "igniteui-angular-combo.mjs", symbol: "IgxComboComponent" },
  { name: "igx-simple-combo", bundle: "igniteui-angular-simple-combo.mjs", symbol: "IgxSimpleComboComponent" },
];

async function renderWithHydration({ bundle, symbol, name }) {
  const { [symbol]: component } = await import(new URL(bundle, DIST));
  return renderApplication(
    (context) =>
      bootstrapApplication(
        component,
        // Noop animations because the combo injects AnimationBuilder.
        { providers: [provideServerRendering(), provideClientHydration(), provideNoopAnimations()] },
        context,
      ),
    { document: `<!DOCTYPE html><html><head></head><body><${name}></${name}></body></html>`, url: "/" },
  );
}

describe("server rendering with hydration", () => {
  before(() => {
    assert.ok(
      existsSync(new URL("igniteui-angular-combo.mjs", DIST)),
      "dist is missing - run `npm run build:lib` before this suite",
    );
  });

  for (const testCase of CASES) {
    test(`${testCase.name} serializes with a closed drop-down`, async () => {
      const html = await renderWithHydration(testCase);

      assert.match(html, /ngh="\d+"/, "expected hydration annotations on the rendered output");
      assert.match(html, /id="ng-state"/, "expected serialized hydration state");
      assert.match(html, /aria-expanded="false"/, "the drop-down should render closed on the server");
    });
  }
});
