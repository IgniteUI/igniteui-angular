import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColumnPinningPosition, GridSelectionMode, IPinningConfig, IgxButtonDirective, IgxColumnComponent, IgxGridComponent, IgxGridToolbarActionsComponent, IgxGridToolbarComponent, IgxGridToolbarPinningComponent, IgxGridToolbarTitleComponent, IgxSwitchComponent, RowPinningPosition, RowType } from 'igniteui-angular';
import { SAMPLE_DATA } from '../shared/sample-data';



@Component({
    providers: [],
    selector: 'app-grid-column-pinning-sample',
    styleUrls: ['grid-column-pinning.sample.scss'],
    templateUrl: 'grid-column-pinning.sample.html',
    imports: [IgxButtonDirective, IgxGridComponent, IgxGridToolbarComponent, IgxGridToolbarTitleComponent, IgxGridToolbarActionsComponent, IgxGridToolbarPinningComponent, IgxColumnComponent, IgxSwitchComponent, FormsModule]
})
export class GridColumnPinningSampleComponent implements OnInit {
    @ViewChild('grid1', { static: true })
    private grid1: IgxGridComponent;

    public pinningConfig: IPinningConfig = { columns: ColumnPinningPosition.End };
    public selectionMode;
    public data: any[];
    public columns: any[];
    public showToolbar: true;
    public pinningEnabled: true;

    public get rightPinning() {
        return (this.pinningConfig.columns === ColumnPinningPosition.End);
    }
    public set rightPinning(rightPinning) {
        if (this.pinningConfig.columns === ColumnPinningPosition.End) {
            this.pinningConfig.columns = ColumnPinningPosition.Start;
        } else {
            this.pinningConfig.columns = ColumnPinningPosition.End;
        }
    }

    public onChange() {
        if (this.pinningConfig.columns === ColumnPinningPosition.End) {
            this.pinningConfig = { columns: ColumnPinningPosition.Start, rows: this.pinningConfig.rows };
        } else {
            this.pinningConfig = { columns: ColumnPinningPosition.End, rows: this.pinningConfig.rows  };
        }
    }

    public onRowChange() {
        if (this.pinningConfig.rows === RowPinningPosition.Bottom) {
            this.pinningConfig = { columns: this.pinningConfig.columns, rows: RowPinningPosition.Top };
        } else {
            this.pinningConfig = { columns: this.pinningConfig.columns, rows: RowPinningPosition.Bottom };
        }
    }

    public ngOnInit(): void {
        this.columns = [
            { field: 'ID', width: '200px', hidden: false },
            { field: 'CompanyName', width: '200px' },
            { field: 'ContactName', width: '200px', pinned: true, pinningPosition: ColumnPinningPosition.Start },
            { field: 'ContactTitle', width: '300px', pinned: true, pinningPosition: ColumnPinningPosition.End },
            { field: 'Address', width: '250px' },
            { field: 'City', width: '200px' },
            { field: 'Region', width: '300px' },
            { field: 'PostalCode', width: '150px' },
            { field: 'Phone', width: '200px' },
            { field: 'Fax', width: '200px' }
        ];

        this.data = SAMPLE_DATA;
        this.selectionMode = GridSelectionMode.none;
    }

    public toggleColumn(name: string) {
        const col = this.grid1.getColumnByName(name);
        col.pinned = !col.pinned;
    }

    public toggleVisibility(name: string) {
        const col = this.grid1.getColumnByName(name);
        col.hidden = !col.hidden;
    }

    public togglePinRow(index) {
        const rec = this.data[index];
        if (this.grid1.isRecordPinned(rec)) {
            this.grid1.unpinRow(rec);
        } else {
            this.grid1.pinRow(rec);
        }
    }

    public onSelectionModeChange() {
        this.selectionMode = this.selectionMode === GridSelectionMode.none ? GridSelectionMode.multiple : GridSelectionMode.none;
    }

    public doSomeAction(row?: RowType) {
        if (this.grid1.isRecordPinned(row.data)) {
            this.grid1.unpinRow(row.data);
        } else {
            this.grid1.pinRow(row.data);
        }
    }

}
