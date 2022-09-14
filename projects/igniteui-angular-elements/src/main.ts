import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { html } from 'lit-html';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

// const grid1 = document.querySelector("igx-grid");
// const grid2 = document.querySelector(".grid2") as IgxGridElement;
// grid1.rowSelection = 'multiple';
// grid1.reflow() // <-- wrong, prob due to being prop-like in the interface, better WithProps TODO?
// grid2.rowSelection = 'single';

// const treeGrid = document.querySelector("igx-tree-grid");
// treeGrid.childDataKey // <-- doc w/ angular example :(
// treeGrid.reflow() // <-- wrong, better WithProps TODO?

document.addEventListener('DOMContentLoaded', () => {
    let grid1 = document.querySelector('igc-grid#grid1') as any;
    grid1.sortHeaderIconTemplate = (context) => html`⬇(${context.$implicit.title})`;
});
