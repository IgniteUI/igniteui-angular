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

// document.addEventListener('DOMContentLoaded', () => {
//     let grid1 = document.querySelector('igc-grid#grid1') as any;
//     // grid1.sortHeaderIconTemplate = (context) => html`⬇(${context.$implicit.title})`;
//     grid1.emptyGridTemplate = () => html`<div>¯\(°_o)/¯ no data</div>`;
//     grid1.dropAreaTemplate = () => html`<span> 👉 Drop here 👈 </span>`;
//     grid1.querySelector('igc-column').bodyTemplate = (context) => html`PK: ${context.$implicit}`;
//     grid1.querySelector('igc-column[field="InStock"]').inlineEditorTemplate = (context) =>
//         html`
//             <input autofocus id="range" type="range"
//                 .value="${context.$implicit}"
//                 @change=${e => context.cell.editValue = e.target.nextElementSibling.value = e.target.value}
//                 />
//             <output .value="${context.$implicit}"></output>
//         `;
// });
