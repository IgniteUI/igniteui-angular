import { Component, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    DefaultTreeGridMergeStrategy,
    IgxActionStripComponent,
    IgxButtonDirective,
    IgxCellTemplateDirective,
    IgxColumnComponent,
    IgxGridComponent,
    IgxGridPinningActionsComponent,
    IgxGridToolbarActionsComponent,
    IgxGridToolbarComponent,
    IgxGridToolbarHidingComponent,
    IgxGridToolbarPinningComponent,
    IgxHierarchicalGridComponent,
    IgxIconButtonDirective,
    IgxIconComponent,
    IgxInputDirective,
    IgxInputGroupComponent,
    IgxPrefixDirective,
    IgxRowIslandComponent,
    IgxSuffixDirective,
    IgxTreeGridComponent
} from 'igniteui-angular';
import { HIERARCHICAL_DATA } from '../shared/hierarchicalData';

import { HIERARCHICAL_SAMPLE_DATA } from '../shared/sample-data';
import { ByLevelTreeGridMergeStrategy } from 'igniteui-angular';
import { INVOICE_DATA } from '../shared/invoiceData';

@Component({
    selector: 'app-grid-cellMerging',
    templateUrl: 'grid-cellMerging.component.html',
    styleUrl: 'grid-cellMerging.component.scss',
    imports: [
        FormsModule,
        IgxColumnComponent,
        IgxGridComponent,
        // IgxPaginatorComponent,
        IgxActionStripComponent,
        IgxGridPinningActionsComponent,
        IgxGridToolbarComponent,
        IgxGridToolbarActionsComponent,
        IgxGridToolbarPinningComponent,
        IgxGridToolbarHidingComponent,
        IgxHierarchicalGridComponent,
        IgxRowIslandComponent,
        IgxTreeGridComponent,
        IgxInputGroupComponent,
        IgxPrefixDirective,
        IgxSuffixDirective,
        IgxIconComponent,
        IgxInputDirective,
        IgxCellTemplateDirective,
        IgxButtonDirective,
        IgxIconButtonDirective
    ]
})
export class GridCellMergingComponent implements OnDestroy {
    private readonly document = inject(DOCUMENT);
    public themeLoaded = signal(false);
    private readonly THEME_LINK_ID = 'grid-cell-merging-alternate-theme';
    public hierarchicalData = HIERARCHICAL_DATA.concat(HIERARCHICAL_DATA).concat(HIERARCHICAL_DATA);
    public treeData = HIERARCHICAL_SAMPLE_DATA;
    public treeGridMergeStrategy =  new ByLevelTreeGridMergeStrategy();
    public alignBottom = { alignItems: "flex-end", paddingBottom: "12px"};
    public alignTop= { alignItems: "flex-start", paddingTop: "12px" };
    public searchText: string ='';
    @ViewChild('grid1', { static: true }) public grid: IgxGridComponent;
    public data = INVOICE_DATA;

    constructor(){
        const allData = INVOICE_DATA
        const length = INVOICE_DATA.length;
        for (let i = 1; i <= 600_000; i++) {
            const rnd = Math.floor(Math.random() * length);
            allData.push(Object.assign({}, INVOICE_DATA[rnd]));
        }

        this.data = allData;
    }

    public ngOnDestroy(): void {
        this.document.getElementById(this.THEME_LINK_ID)?.remove();
    }

    public toggleTheme(): void {
        const existing = this.document.getElementById(this.THEME_LINK_ID);
        if (existing) {
            existing.remove();
            this.themeLoaded.set(false);
        } else {
            const link = this.document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'grid-cell-merging-alternate-theme.css';
            link.id = this.THEME_LINK_ID;
            this.document.head.appendChild(link);
            this.themeLoaded.set(true);
        }
    }

    public toggleStrategy() {
        if (this.treeGridMergeStrategy instanceof ByLevelTreeGridMergeStrategy) {
            this.treeGridMergeStrategy = new DefaultTreeGridMergeStrategy();
        } else {
            this.treeGridMergeStrategy = new ByLevelTreeGridMergeStrategy();
        }
    }

    public searchKeyDown(ev) {
        if (ev.key === 'Enter' || ev.key === 'ArrowDown' || ev.key === 'ArrowRight') {
            ev.preventDefault();
            this.grid.findNext(this.searchText, true, false);
        } else if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') {
            ev.preventDefault();
            this.grid.findPrev(this.searchText, true, false);
        }
    }

    public clearSearch() {
        this.searchText = '';
        this.grid.clearSearch();
    }
}

