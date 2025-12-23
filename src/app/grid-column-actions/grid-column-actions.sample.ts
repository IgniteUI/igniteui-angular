import { Component, OnInit } from '@angular/core';

import { IgxColumnGroupingDirective } from './custom-action-directive';
import { IColumnToggledEventArgs, IGX_GRID_DIRECTIVES } from 'igniteui-angular';
import { SAMPLE_DATA } from '../shared/sample-data';

@Component({
    providers: [],
    selector: 'app-grid-column-actions-sample',
    styleUrls: ['grid-column-actions.sample.scss'],
    templateUrl: 'grid-column-actions.sample.html',
    imports: [IgxColumnGroupingDirective, IGX_GRID_DIRECTIVES]
})
export class GridColumnActionsSampleComponent implements OnInit {
    public data: any[];
    public columns: any[];

    public columnToggled(event: IColumnToggledEventArgs) {
        console.log(event);
    }

    public ngOnInit(): void {
        this.columns = [
            { field: 'ID', width: '200px', hidden: false },
            { field: 'CompanyName', width: '200px' },
            { field: 'ContactName', width: '200px', pinned: false },
            { field: 'ContactTitle', width: '300px', pinned: false },
            { field: 'Address', width: '250px' },
            { field: 'City', width: '200px' },
            { field: 'Region', width: '300px' },
            { field: 'PostalCode', width: '150px' },
            { field: 'Phone', width: '200px' },
            { field: 'Fax', width: '200px' }
        ];

        this.data = SAMPLE_DATA;
    }
}
