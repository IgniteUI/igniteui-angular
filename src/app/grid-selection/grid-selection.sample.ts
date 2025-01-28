import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Observable } from 'rxjs';

import { RemoteService } from '../shared/remote.service';
import { IGX_INPUT_GROUP_DIRECTIVES, IGX_SELECT_DIRECTIVES, IgxButtonDirective, IgxColumnComponent, IgxGridComponent, IgxSwitchComponent } from 'igniteui-angular';
import { data } from '../shared/data';

@Component({
    selector: 'app-grid-selection-sample',
    templateUrl: 'grid-selection.sample.html',
    styleUrls: ['grid-selection.sample.scss'],
    providers: [RemoteService],
    imports: [
        FormsModule,
        IGX_INPUT_GROUP_DIRECTIVES,
        IGX_SELECT_DIRECTIVES,
        IgxButtonDirective,
        IgxColumnComponent,
        IgxGridComponent,
        IgxSwitchComponent,
        NgFor,
    ]
})
export class GridSelectionComponent implements AfterViewInit {
    @ViewChild(IgxGridComponent, { static: true })
    protected grid1: IgxGridComponent;

    public remote: Observable<any[]>;
    public selectionModes = ['none', 'single', 'multiple'];
    public data = [];

    constructor(private remoteService: RemoteService, private cdr: ChangeDetectorRef) {
        this.remoteService.urlBuilder = () => this.remoteService.url;
     }

     public ngAfterViewInit() {
        // this.remote = this.remoteService.remoteData;
        // this.remoteService.getData(this.grid1.data);
        this.data = data;
        this.cdr.detectChanges();
    }

    protected toggleData() {
        if (this.data !== data) {
            this.data = data;
        } else {
            this.data = this.data.slice(0,10);
        }
    }

    public scrScrollTo(index: number) {
        this.grid1.verticalScrollContainer.scrollTo(index);
    }

    public handleRowSelection() {
        console.log('ONSELECTIONEVENTFIRED');
    }

    public selectCells() {
        this.grid1.selectRange({rowStart: 1, rowEnd: 3, columnStart: 0, columnEnd: 2});
    }

    public toggleCell() {
        const cell = this.grid1.getCellByColumn(1, 'ProductName');
        cell.selected = !cell.selected;
        this.grid1.cdr.detectChanges();
    }

    public toggleThirdRow() {
        const row = this.grid1.getRowByIndex(2);
        row.selected = !row.selected;
        this.grid1.cdr.detectChanges();
    }

    public toggle() {
        const rows = [1, 2, 5];
        const currentSelectionSet = new Set(this.grid1.selectedRows);
        if (rows.every(x => currentSelectionSet.has(x))) {
            this.grid1.deselectRows(rows);
            return;
        }
        this.grid1.selectRows(rows, false);
    }

    public toggleAll() {
        if ((this.grid1.selectedRows || []).length === 0) {
            this.grid1.selectAllRows();
        } else {
            this.grid1.deselectAllRows();
        }
    }

    public log(args) {
        console.log(args);
    }

    public callSelectAll() {
        this.grid1.selectAllRows();
    }

    public selectRow() {
        this.grid1.selectRows(['abc']);
    }

    public deleteSelectedRow() {
        const r = this.grid1.selectedRows[0];
        this.grid1.deleteRow(r);
    }
}
