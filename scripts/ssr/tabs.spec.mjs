// Runs against dist/, so `npm run build:lib` has to have produced it.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, test, before } from "node:test";

import "@angular/compiler"; // dist ships partial declarations; JIT links them at import time
import { Component } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { provideServerRendering, renderApplication } from "@angular/platform-server";

const BUNDLE = new URL("../../dist/igniteui-angular/fesm2022/igniteui-angular-tabs.mjs", import.meta.url);

async function renderTabs(attributes) {
  const tabs = await import(BUNDLE);
  const App = Component({
    selector: "app-root",
    imports: [tabs.IgxTabsComponent, tabs.IgxTabItemComponent, tabs.IgxTabHeaderComponent, tabs.IgxTabContentComponent],
    template: `
      <igx-tabs ${attributes}>
        <igx-tab-item>
          <igx-tab-header>One</igx-tab-header>
          <igx-tab-content>First</igx-tab-content>
        </igx-tab-item>
        <igx-tab-item>
          <igx-tab-header>Two</igx-tab-header>
          <igx-tab-content>Second</igx-tab-content>
        </igx-tab-item>
      </igx-tabs>`,
  })(class {});

  return renderApplication(
    (context) => bootstrapApplication(App, { providers: [provideServerRendering(), provideNoopAnimations()] }, context),
    { document: "<!DOCTYPE html><html><head></head><body><app-root></app-root></body></html>", url: "/" },
  );
}

describe("igx-tabs server rendering", () => {
  before(() => {
    assert.ok(existsSync(BUNDLE), "dist is missing - run `npm run build:lib` before this suite");
  });

  for (const attributes of ["", 'tabAlignment="center"', 'headerPosition="start"', 'tabAlignment="justify" [selectedIndex]="1"']) {
    test(`renders <igx-tabs ${attributes}>`, async () => {
      const html = await renderTabs(attributes);

      assert.match(html, /role="tablist"/);
      assert.match(html, /aria-selected="true"/);
    });
  }
});
