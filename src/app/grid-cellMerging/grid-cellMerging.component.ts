import { Component, HostBinding, ViewChild } from '@angular/core';
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
    IgxGridToolbarExporterComponent,
    IgxGridToolbarHidingComponent,
    IgxGridToolbarPinningComponent,
    IgxHierarchicalGridComponent,
    IgxIconComponent,
    IgxInputDirective,
    IgxInputGroupComponent,
    IgxPaginatorComponent,
    IgxPrefixDirective,
    IgxRowIslandComponent,
    IgxSuffixDirective,
    IgxTreeGridComponent
} from 'igniteui-angular';
import { HIERARCHICAL_DATA } from '../shared/hierarchicalData';

import { data, dataWithoutPK } from '../shared/data';
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
        IgxCellTemplateDirective
    ]
})
export class GridCellMergingComponent {
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
            allData.push(INVOICE_DATA[rnd]);
        }

        this.data = allData;
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

