import { Component, OnInit, ViewChild } from '@angular/core';
import { IgxButtonDirective, IgxColumnComponent, IgxGridComponent } from 'igniteui-angular';
import { SAMPLE_DATA } from '../shared/sample-data';

@Component({
    providers: [],
    selector: 'app-grid-column-resizing-sample',
    styleUrls: ['grid-column-resizing.sample.scss'],
    templateUrl: 'grid-column-resizing.sample.html',
    imports: [IgxGridComponent, IgxColumnComponent, IgxButtonDirective]
})
export class GridColumnResizingSampleComponent implements OnInit {
    @ViewChild('grid1', { static: true })
    public grid1: IgxGridComponent;

    public data: any[];
    public columns: any[];

    public ngOnInit(): void {
        this.columns = [
            // % width, px min/max width.
            { field: 'ID', width: '10%', resizable: true, maxWidth: 200, minWidth: 120 },
            { field: 'CompanyName', width: '300px', resizable: true },
            // % width, no min/max width.
            { field: 'ContactName', width: '20%', resizable: true },
            // % width, % min/max width.
            { field: 'ContactTitle', width: '30%', resizable: true, maxWidth: '30%'},
            // px width, % min/max width.
            { field: 'Address', width: 300, resizable: true, maxWidth: '20%', minWidth: '15%' },
            { field: 'City', width: 100, resizable: true },
            { field: 'Region', width: 100, resizable: true },
            { field: 'PostalCode', width: 100, resizable: true },
            { field: 'Phone', width: 150, resizable: true },
            { field: 'Fax', width: 150, resizable: true }
        ];
        this.data = SAMPLE_DATA;
    }

    public toggleColumn(name: string) {
        const col = this.grid1.getColumnByName(name);
        col.pinned = !col.pinned;
    }

    public scrScrollTo(index) {
        this.grid1.verticalScrollContainer.scrollTo(parseInt(index, 10));
    }

    public autoSizeAll() {
        this.grid1.columns.forEach(x => x.autosize());
    }
}
